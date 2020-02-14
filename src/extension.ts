import * as vscode from "vscode";

import { treeViewDataProvider, refreshTreeView, initTreeView } from "./tree-view-data-provider";
import { TestDescriptionPanel } from "./readme-webview";
import { runTest } from "./test-runner";
import * as Commands from "./commands";

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

export async function activate(context: vscode.ExtensionContext) {
	await initTreeView(context.extensionPath);
	Commands.init(context);

	vscode.window.registerTreeDataProvider("eduTests", treeViewDataProvider);
	vscode.commands.registerCommand("vsEdu.runTest", Commands.runTest);
	vscode.commands.registerCommand("vsEdu.refresh", Commands.refresh);
	context.subscriptions.push(
		// This one is special because it involves the webview
		vscode.commands.registerCommand("vsEdu.openTest", Commands.openTest)
	);
}
