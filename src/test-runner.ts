import * as vscode from "vscode";
import { Test } from "./extension";
import { TestDescriptionPanel } from "./readme-webview";

export async function runTest(cache: vscode.Memento, test: Test): Promise<void> {
	vscode.window.showInformationMessage(`Running test ${test.testName}`);
	TestDescriptionPanel.postMessage({command: "setTestState", value: "success"});
	// (await testList(test)).forEach(t => {
		// run test according to test runner
		// update cache
		// give ui update - some spinner in the bottom bar or something
		// update test tree
		// update webview
	// });
}
