import * as vscode from "vscode";
import child_process = require("child_process");
import * as path from "path";

import { Test, TestState, cache, Level } from "./extension";
import * as TestOpener from "./test-opener";
import { getTests } from "./test-repository";
import { refreshTreeView } from "./test-lister";
import { rootDirectory } from "./util";

async function cliRunTest(test: Test, token: vscode.CancellationToken): Promise<boolean> {
	return new Promise((resolve) => {
		const jest = path.join("node_modules", ".bin", "jest");
		const process = child_process
			.exec(
				`${jest} --testNamePattern="${test.number} " --testPathPattern="tests/${test.level.number}"`, 
				{cwd: rootDirectory().fsPath}
			)
			.on("close", failed => resolve(!failed));
		token.onCancellationRequested(() => process.kill());
	});
}

export async function runTest(tests: Test[]): Promise<void> {
	tests.forEach(t => cache().update(`${t.level.number}-${t.number}`, undefined));
	refreshTreeView();

	let testIsOpen = false;
	tests.forEach(t => {
		if (TestOpener.testOpened(t)) {
			testIsOpen = true;
		}
	});
	if (testIsOpen) {
		TestOpener.postMessage({command: "setTestState", value: "in-progress"});
	}
	
	vscode.window.withProgress({
		cancellable: true,
		location: vscode.ProgressLocation.Notification,
		title: `Running test ${test.name}`
	}, (progress, token) => new Promise(resolve => {			
		let testsFinished = 0;
		progress.report({increment: 0});

		Promise
			.all(tests.map(async t => {
				const result = await cliRunTest(t, token);
				cache().update(`${t.level.number}-${t.number}`, result ? TestState.PASSED : TestState.FAILED);
				
				testsFinished++;
				progress.report({
					increment: Math.floor(100 * testsFinished / tests.length)
				});

				refreshTreeView();
				if (TestOpener.testOpened(t)) {
					TestOpener.postMessage({
						command: "setTestState",
						value: result ? "passed" : "failed"
					});
				}
			}))
			.then(resolve);
	}));
}
