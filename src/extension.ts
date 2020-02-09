import * as vscode from "vscode";

import { TestDataProvider } from "./tree-data-provider";
import { TestDescriptionPanel } from "./test-description-panel";

export interface Test {
	levelName: string;
	levelNumber: string;
	testName?: string;
	testNumber?: string;
	filePath?: vscode.Uri;
}

export function activate(context: vscode.ExtensionContext) {
	const testDataProvider = new TestDataProvider();
	vscode.window.registerTreeDataProvider("eduTests", testDataProvider);
	vscode.commands.registerCommand("vsEdu.refresh", () => testDataProvider.refresh());

	context.subscriptions.push(
		vscode.commands.registerCommand("vsEdu.openTest", (test: Test) => {
			TestDescriptionPanel.createOrShow(context.extensionPath, test);
		})
	);
}
