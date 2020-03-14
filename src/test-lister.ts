import * as vscode from "vscode";
import * as path from "path";
import { Test, TestState, extensionPath, Level, Folder, File } from "./extension";
import * as TestRepository from "./test-repository";

const _onDidChangeTreeData: vscode.EventEmitter<
	Test | undefined
> = new vscode.EventEmitter<Test | undefined>();
const onDidChangeTreeData: vscode.Event<Test | undefined> =
	_onDidChangeTreeData.event;
const TestStatusIcons = {
	[TestState.UNKNOWN]: "question.svg",
	[TestState.PASSED]: "check.svg",
	[TestState.FAILED]: "times.svg"
};

export async function refreshTreeView() {
	await TestRepository.refresh();
	_onDidChangeTreeData.fire();
}

async function getChildren(element?: Test | Level | Folder | File): Promise<Test[]> {
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
	const tests = TestRepository.getTests(element.levelNumber);
	tests.sort((a, b) => {
		if ((a.testNumber || 0) > (b.testNumber || 0)) {
			return 1;
		} else if (a.testNumber === b.testNumber) {
			return 0;
		} else {
			return -1;
		}
	});
	return tests;
}

function getTreeItem(element: Test | Level | Folder | File): vscode.TreeItem {
	const isLeaf =
		element.filePath ||
		TestRepository.getFiles(element.levelNumber, element.testNumber).length ===
			2;
	const icon = TestStatusIcons[element.state];

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
					light: path.resolve(extensionPath(), "media", "light", icon),
					dark: path.resolve(extensionPath(), "media", "dark", icon)
			  }
			: undefined
	};
}

function getParent(element: Test): Test | Level | Folder | File | null {
	if (element.filePath) {
		return {
			levelName: element.levelName,
			levelNumber: element.levelNumber,
			testName: element.testName,
			testNumber: element.testNumber,
			state: TestState.UNKNOWN
		};
	} else if (element.testNumber) {
		return {
			levelName: element.levelName,
			levelNumber: element.levelNumber,
			state: TestState.UNKNOWN
		};
	} else {
		return null;
	}
}

export const treeViewDataProvider: vscode.TreeDataProvider<Test> = {
	getChildren,
	getTreeItem,
	getParent,
	onDidChangeTreeData
};
