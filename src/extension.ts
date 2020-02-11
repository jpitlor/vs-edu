import * as vscode from "vscode";

import { TestDataProvider } from "./tree-data-provider";
import { TestDescriptionPanel } from "./test-description-panel";
import { runTest } from "./test-runner";

export interface Test {
	levelName: string;
	levelNumber: string;
	testName?: string;
	testNumber?: string;
	filePath?: vscode.Uri;
}

export enum Env {
	TEST_DIRECTORY = "testDirectory"
}

export function activate(context: vscode.ExtensionContext) {
	const testDataProvider = new TestDataProvider();
	vscode.window.registerTreeDataProvider("eduTests", testDataProvider);
	vscode.commands.registerCommand("vsEdu.refresh", () => testDataProvider.refresh());
	vscode.commands.registerCommand("vsEdu.runTest", (test: Test) => runTest(context.workspaceState, test));

	context.subscriptions.push(
		vscode.commands.registerCommand("vsEdu.openTest", (test: Test) => {
			TestDescriptionPanel.createOrShow(context.extensionPath, test);
		})
	);
}
