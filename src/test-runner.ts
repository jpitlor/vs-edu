import * as vscode from "vscode";
import { Test } from "./extension";
import * as TestOpener from "./test-opener";

export async function runTest(cache: vscode.Memento, test: Test): Promise<void> {
	TestOpener.postMessage({command: "setTestState", value: "in-progress"});
	vscode.window.showInformationMessage(`Running test ${test.testName}`);
	// (await testList(test)).forEach(t => {
		// run test according to test runner
		// update cache
		// give ui update - some spinner in the bottom bar or something
		// update test tree
		// update webview
	// });
}
