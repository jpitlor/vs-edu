import * as vscode from "vscode";

import { treeViewDataProvider, refreshTreeView } from "./test-lister";
import { TestReopener } from "./test-reopener";
import * as Commands from "./commands";

export const enum TestState {
	IN_PROGRESS = 3,
	PASSED = 2,
	FAILED = 1,
	UNKNOWN = 0
}

export const enum Type {
	LEVEL = 3,
	TEST = 2,
	FOLDER = 1,
	FILE = 0
}

export interface Level {
	type: Type.LEVEL;
	name: string;
	number: string;
}

export interface Folder {
	type: Type.FOLDER;
	name: string;
	files: (File | Folder)[];
}

export interface File {
	type: Type.FILE;
	name: string;
	uri: vscode.Uri;
}

export interface Test {
	type: Type.TEST;
	level: Level;
	name: string;
	number: string;
	state: TestState;

	// Files does not include readme or vsedu.config.json, but it does
	// include the index.
	files: (File | Folder)[];
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

export function setTestState(test: Test, state: TestState) {
	_cache.update(`${test.level.number}-${test.number}`, state);
}

export function getTestState(test: Test): TestState {
	return _cache.get(`${test.level.number}-${test.number}`) ?? TestState.UNKNOWN;
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
