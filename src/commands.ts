import * as vscode from "vscode";
import { Test } from "./extension";
import * as TestRunner from "./test-runner";
import { refreshTreeView } from "./tree-view-data-provider";
import { TestDescriptionPanel } from "./readme-webview";

let extensionPath: string;
let workspaceState: vscode.Memento; 

export function init(context: vscode.ExtensionContext) {
    extensionPath = context.extensionPath;
    workspaceState = context.workspaceState;
}

export function openTest(test: Test) {
    TestDescriptionPanel.createOrShow(extensionPath, test);
}

export function runTest(test: Test) {
    TestDescriptionPanel.postMessage({command: "setTestState", value: "in-progress"});
    TestRunner.runTest(workspaceState, test);
}

export function refresh() {
    refreshTreeView();
}
