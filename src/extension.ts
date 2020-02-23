import * as vscode from "vscode";

import { treeViewDataProvider, initTreeView } from "./test-lister";
import * as Commands from "./commands";

export const enum TestState {
	PASSED = 2,
	FAILED = 1,
	UNKNOWN = 0
}

export interface Test {
	levelName: string;
	levelNumber: string;
	testName?: string;
	testNumber?: string;
	filePath?: vscode.Uri;
	state: TestState;
}

export enum Env {
	TEST_DIRECTORY = "testDirectory",
	COURSE_DIRECTORY = "courseDirectory"
}

export async function activate(context: vscode.ExtensionContext) {
	await initTreeView(context);
	Commands.init(context);

	vscode.window.registerTreeDataProvider("eduTests", treeViewDataProvider);
	context.subscriptions.push(
		vscode.commands.registerCommand("vsEdu.openTest", Commands.openTest),
		vscode.commands.registerCommand("vsEdu.runTest", Commands.runTest),
		vscode.commands.registerCommand("vsEdu.refresh", Commands.refresh)
	);
}
