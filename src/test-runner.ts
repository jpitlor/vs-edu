import * as vscode from "vscode";
import child_process = require("child_process");
import * as path from "path";

import { Test } from "./extension";
import * as TestOpener from "./test-opener";
import { getTests } from "./test-repository";
import { refreshTreeView } from "./test-lister";
import { rootDirectory } from "./util";

function testList(test: Test): Test[] {
	return test.testNumber ? [test] : getTests(test.levelNumber);
}

async function cliRunTest(test: Test, token: vscode.CancellationToken): Promise<boolean> {
	return new Promise((resolve) => {
		const jest = path.join("node_modules", ".bin", "jest");
		const process = child_process
			.exec(
				`${jest} --testNamePattern="${test.testNumber} " --testPathPattern="tests/${test.levelNumber}"`, 
				{cwd: rootDirectory().fsPath}
			)
			.on("close", failed => resolve(!failed));
		token.onCancellationRequested(() => process.kill());
	});
}

export async function runTest(cache: vscode.Memento, test: Test): Promise<void> {
	TestOpener.postMessage({command: "setTestState", value: "in-progress"});
	vscode.window.withProgress({
		cancellable: true,
		location: vscode.ProgressLocation.Notification,
		title: `Running test ${test.testName || test.levelName}`
	}, (progress, token) => new Promise(resolve => {			
		let testsFinished = 0;
		progress.report({increment: 0});

		Promise
			.all(testList(test).map(async t => {
				const result = await cliRunTest(t, token);
				cache.update(`${t.levelNumber}-${t.testNumber}`, result);
				
				testsFinished++;
				progress.report({
					increment: Math.floor(100 * testsFinished / testList.length)
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
