import * as vscode from "vscode";
import * as path from "path";
import { Test } from "./extension";
import { TestRepository } from "./test-repository";

const _onDidChangeTreeData: vscode.EventEmitter<Test | undefined> = new vscode.EventEmitter<Test | undefined>();
const onDidChangeTreeData: vscode.Event<Test | undefined> = _onDidChangeTreeData.event;

let _extensionPath = "";
export async function initTreeView(extensionPath: string) {
	await TestRepository.refresh();
	_extensionPath = extensionPath;
}

export async function refreshTreeView() {
	await TestRepository.refresh();
	_onDidChangeTreeData.fire();
}

async function getChildren(element?: Test): Promise<Test[]> {
	// If element is root, return the levels
	if (element === null || element === undefined) {
		return TestRepository.getLevels();
	}

	// All files are leaves
	if (element.filePath) {
		return [];
	}

	// If element is a test, return the files
	if (element.testNumber) {
		return TestRepository.getFiles(element.levelNumber, element.testNumber);
	}

	// If element is a level, return the tests
	return TestRepository.getTests(element.levelNumber);
}

function getTreeItem(element: Test): vscode.TreeItem {
	const isLeaf = element.filePath || TestRepository.getFiles(element.levelNumber, element.testNumber).length === 2;

	return {
		label: element.testName || element.levelName,
		collapsibleState: isLeaf
			? vscode.TreeItemCollapsibleState.None
			: vscode.TreeItemCollapsibleState.Collapsed,
		command: isLeaf
			? { command: "vsEdu.openTest", title: "Open Test", arguments: [element] }
			: undefined,
		contextValue: element.filePath ? "file" : "test",
		iconPath: isLeaf
			? {
				light: path.resolve(_extensionPath, "media", "light", "question.svg"),
				dark: path.resolve(_extensionPath, "media", "dark", "question.svg")
			}
			: undefined,
	};
}

function getParent(element: Test): Test | null {
	if (element.filePath) {
		return {
			levelName: element.levelName,
			levelNumber: element.levelNumber,
			testName: element.testName,
			testNumber: element.testNumber
		};
	} else if (element.testNumber) {
		return {
			levelName: element.levelName,
			levelNumber: element.levelNumber
		};
	} else {
		return null;
	}
}

export const treeViewDataProvider: vscode.TreeDataProvider<Test> = {
	getChildren, getTreeItem, getParent, onDidChangeTreeData
};
