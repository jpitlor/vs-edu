import * as vscode from "vscode";
import {Event, EventEmitter, TreeItem, TreeDataProvider, ThemeIcon} from "vscode";
import { Test, TestState, Level, Folder, File, Type } from "./extension";
import * as TestRepository from "./test-repository";

type TreeItemType = Test | Level | Folder | File;

const _onDidChangeTreeData: EventEmitter<TreeItemType | undefined> = 
	new EventEmitter<TreeItemType | undefined>();
const onDidChangeTreeData: Event<TreeItemType | undefined> =
	_onDidChangeTreeData.event;

export async function refreshTreeView() {
	await TestRepository.refresh();
	_onDidChangeTreeData.fire(undefined);
}

async function getChildren(element?: TreeItemType): Promise<TreeItemType[]> {
	// If element is root, return the levels
	if (!element) {
		return TestRepository.getLevels();
	}

	switch (element.type) {
		case Type.FILE:
			return [];
		case Type.FOLDER:
			return element.files;
		case Type.TEST:
			return element.files;
		case Type.LEVEL:
			return TestRepository.getTests(element.number);
	}
}

function getTreeItem(element: TreeItemType): TreeItem {
	const isLeaf = element.type === Type.FILE || 
		(element.type === Type.TEST && 
			element.files.length === 1 && 
			element.files[0].type === Type.FILE &&
			element.files[0].uri.path.endsWith("index.js"));

	let icon;
	switch (element.type) {
		case Type.LEVEL:
			icon = ThemeIcon.Folder;
			break;
		case Type.TEST:
			switch(element.state) {
				case TestState.FAILED:
					icon = new ThemeIcon("close");
					break;
				case TestState.PASSED: 
					icon = new ThemeIcon("check");
					break;
				case TestState.UNKNOWN:
					icon = new ThemeIcon("loading");
					break;
			}
			break;
		case Type.FILE:
			icon = ThemeIcon.File;
			break;
		case Type.FOLDER:
			icon = ThemeIcon.Folder;
	}

	return {
		label: element.name,
		collapsibleState: isLeaf
			? vscode.TreeItemCollapsibleState.None
			: vscode.TreeItemCollapsibleState.Collapsed,
		command: isLeaf
			? { command: "vsEdu.openTest", title: "Open Test", arguments: [element] }
			: undefined,
		contextValue: element.type === Type.LEVEL || element.type === Type.TEST ? "test": "file",
		iconPath: icon,
	};
}

export const treeViewDataProvider: TreeDataProvider<TreeItemType> = {
	getChildren,
	getTreeItem,
	onDidChangeTreeData
};
