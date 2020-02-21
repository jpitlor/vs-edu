import * as vscode from "vscode";
import { Test } from "./extension";
import { TestDescriptionPanel } from "./readme-webview";

export async function runTest(cache: vscode.Memento, test: Test): Promise<void> {
	TestDescriptionPanel.postMessage({command: "setTestState", value: "in-progress"});
	vscode.window.showInformationMessage(`Running test ${test.testName}`);
	// (await testList(test)).forEach(t => {
		// run test according to test runner
		// update cache
		// give ui update - some spinner in the bottom bar or something
		// update test tree
		// update webview
	// });
}
