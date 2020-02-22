import * as vscode from "vscode";
import { Test } from "./extension";
import * as TestRunner from "./test-runner";
import { refreshTreeView } from "./test-lister";
import * as TestOpener from "./test-opener";

let extensionPath: string;
let workspaceState: vscode.Memento; 

export function init(context: vscode.ExtensionContext) {
    extensionPath = context.extensionPath;
    workspaceState = context.workspaceState;
}

export function openTest(test: Test) {
    TestOpener.openTest(extensionPath, test);
}

export function runTest(test: Test) {
    TestOpener.postMessage({command: "setTestState", value: "in-progress"});
    TestRunner.runTest(workspaceState, test);
}

export function refresh() {
    refreshTreeView();
}
