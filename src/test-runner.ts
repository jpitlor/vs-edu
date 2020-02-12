import * as vscode from "vscode";
import { Test } from "./extension";
import { readDirectory, getTestsInLevel } from "./util";
import { TestDescriptionPanel } from "./test-description-panel";

async function testList(test: Test): Promise<Test[]> {
	if (test.testName) {
		return [test];
	}
	return await getTestsInLevel(test.levelNumber);
}

export async function runTest(cache: vscode.Memento, test: Test): Promise<void> {
	vscode.window.showInformationMessage(`Running test ${test.testName}`);
	TestDescriptionPanel.postMessage({command: "setTestState", value: "success"});
	(await testList(test)).forEach(t => {
		// run test according to test runner
		// update cache
		// give ui update - some spinner in the bottom bar or something
		// update test tree
		// update webview
	});
}
