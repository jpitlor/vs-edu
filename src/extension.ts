import * as vscode from "vscode";

import { treeViewDataProvider, refreshTreeView } from "./test-lister";
import { TestReopener } from "./test-reopener";
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
	filePath?: string;
	state: TestState;
}

export enum Env {
	TEST_DIRECTORY = "testDirectory",
	COURSE_DIRECTORY = "courseDirectory"
}

let _extensionPath: string;
let _cache: vscode.Memento;

export function extensionPath(): string {
	return _extensionPath;
}

export function cache(): vscode.Memento {
	return _cache;
}

export async function activate(context: vscode.ExtensionContext) {
	_extensionPath = context.extensionPath;
	_cache = context.workspaceState;

	vscode.window.registerTreeDataProvider("eduTests", treeViewDataProvider);
	vscode.window.registerWebviewPanelSerializer("eduTest", TestReopener);
	context.subscriptions.push(
		vscode.commands.registerCommand("vsEdu.openTest", Commands.openTest),
		vscode.commands.registerCommand("vsEdu.runTest", Commands.runTest),
		vscode.commands.registerCommand("vsEdu.refresh", Commands.refresh)
	);

	await refreshTreeView();
}
