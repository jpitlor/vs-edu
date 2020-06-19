import * as vscode from "vscode";
import child_process = require("child_process");
import * as path from "path";

import { Test, TestState, setTestState } from "./extension";
import * as TestOpener from "./test-opener";
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

export async function runTest(test: Test): Promise<void> {
	setTestState(test, TestState.IN_PROGRESS);
	refreshTreeView();

	if (TestOpener.testOpened(test)) {
		TestOpener.postMessage({command: "setTestState", value: "in-progress"});
	}
	
	vscode.window.withProgress({
		cancellable: true,
		location: vscode.ProgressLocation.Notification,
		title: `Running test ${test.name}`
	}, (progress, token) => new Promise(resolve => {
		progress.report({increment: 0});
		cliRunTest(test, token)
			.then(result => {
				setTestState(test, result ? TestState.PASSED : TestState.FAILED);
				progress.report({increment: 100});
				refreshTreeView();
				if (TestOpener.testOpened(test)) {
					TestOpener.postMessage({
						command: "setTestState",
						value: result ? "passed" : "failed"
					});
				}
				resolve();
			});
	}));
}
