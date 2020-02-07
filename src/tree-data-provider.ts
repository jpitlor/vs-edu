import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

interface Test {
	levelName: string;
	levelNumber: string;
	testName?: string;
	testNumber?: string;
}

function getChildren(element?: Test): Test[] {
	// TODO: Make paths configurable in options
	const courseFolder = 'courses';
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders) {
		return [];
	}

	if (element === null || element === undefined) {
		return fs
			.readdirSync(path.join(workspaceFolders[0].uri.fsPath, courseFolder))
			.map(c => /(\d+) (.+)/.exec(c))
			.filter(<T>(x: T | null): x is T => x !== null)
			.map(([, levelNumber, levelName]) => ({levelName, levelNumber}));
	} else {
		if (element.testName) {
			return [];
		}
		
		return fs
			.readdirSync(path.join(workspaceFolders[0].uri.fsPath, courseFolder, `${element.levelNumber} ${element.levelName}`))
			.map(c => /(\d+) (.+)/.exec(c))
			.filter(<T>(x: T | null): x is T => x !== null)
			.map(([, testNumber, testName]) => ({
				levelName: element.levelName,
				levelNumber: element.levelNumber, 
				testName, 
				testNumber,
			}));
	}
}

function getTreeItem(element: Test): vscode.TreeItem {
	const collapsibleState = getChildren(element).length > 0 
		? vscode.TreeItemCollapsibleState.Collapsed 
		: vscode.TreeItemCollapsibleState.None;
	return new vscode.TreeItem(element.testName || element.levelName, collapsibleState);
}

function getParent(element: Test): Test {
	return {
		levelName: element.levelName,
		levelNumber: element.levelNumber,
	};
}


export const treeDataProvider: vscode.TreeDataProvider<Test> = {
	getChildren,
	getTreeItem,
	getParent,
};
