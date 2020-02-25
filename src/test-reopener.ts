import * as vscode from "vscode";
import {openTest} from "./test-opener";

let extensionPath: string;
export function initTestReopener(context: vscode.ExtensionContext) {
    extensionPath = context.extensionPath;
}

async function deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
    const {test} = state;
    openTest(extensionPath, test, webviewPanel);
}

export const TestReopener: vscode.WebviewPanelSerializer = {
    deserializeWebviewPanel
};
