import * as vscode from "vscode";
import {openTest} from "./test-opener";

async function deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
    const {test} = state;
    openTest(test, webviewPanel);
}

export const TestReopener: vscode.WebviewPanelSerializer = {
    deserializeWebviewPanel
};
