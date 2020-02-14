import * as vscode from "vscode";

import { TreeViewDataProvider } from "./tree-view-data-provider";
import { TestDescriptionPanel } from "./readme-webview";
import { runTest } from "./test-runner";

export interface Test {
	levelName: string;
	levelNumber: string;
	testName?: string;
	testNumber?: string;
	filePath?: vscode.Uri;
}

export enum Env {
	TEST_DIRECTORY = "testDirectory",
	COURSE_DIRECTORY = "courseDirectory"
}

function refresh() {

}

export function activate(context: vscode.ExtensionContext) {
	const testDataProvider = new TreeViewDataProvider(context.extensionPath);
	vscode.window.registerTreeDataProvider("eduTests", testDataProvider);
	vscode.commands.registerCommand("vsEdu.refresh", () =>
		testDataProvider.refresh()
	);
	vscode.commands.registerCommand("vsEdu.runTest", (test: Test) =>
		runTest(context.workspaceState, test)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("vsEdu.openTest", (test: Test) => {
			TestDescriptionPanel.createOrShow(context.extensionPath, test);
		})
	);
}
