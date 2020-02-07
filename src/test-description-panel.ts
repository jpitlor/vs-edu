import * as vscode from 'vscode';
import * as path from 'path';

export class TestDescriptionPanel {
    constructor(public readonly context: vscode.ExtensionContext) {

    }

    public static currentPanel: TestDescriptionPanel | undefined;

    public static readonly viewType = 'catCoding';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionPath: string;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionPath: string) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (TestDescriptionPanel.currentPanel) {
            TestDescriptionPanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            TestDescriptionPanel.viewType,
            'Cat Coding',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'media'))]
            }
        );

        TestDescriptionPanel.currentPanel = new TestDescriptionPanel(panel, extensionPath);
    }

    public static revive(panel: vscode.WebviewPanel, extensionPath: string) {
        TestDescriptionPanel.currentPanel = new TestDescriptionPanel(panel, extensionPath);
    }

    private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
        
    }

    public doRefactor() {
        // Send a message to the webview webview.
        // You can send any JSON serializable data.
        this._panel.webview.postMessage({ command: 'refactor' });
    }

    public dispose() {
        TestDescriptionPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update() {
        const webview = this._panel.webview;

        // Vary the webview's content based on where it is located in the editor.
        switch (this._panel.viewColumn) {
            case vscode.ViewColumn.Two:
                this._updateForCat(webview, 'Compiling Cat');
                return;

            case vscode.ViewColumn.Three:
                this._updateForCat(webview, 'Testing Cat');
                return;

            case vscode.ViewColumn.One:
            default:
                this._updateForCat(webview, 'Coding Cat');
                return;
        }
    }

    private _updateForCat(webview: vscode.Webview, catName: keyof typeof cats) {
        this._panel.title = catName;
        this._panel.webview.html = this._getHtmlForWebview(webview, cats[catName]);
    }

    private _getHtmlForWebview(webview: vscode.Webview, catGifPath: string) {
        // Local path to main script run in the webview
        const scriptPathOnDisk = vscode.Uri.file(
            path.join(this._extensionPath, 'media', 'main.js')
        );

        // And the uri we use to load this script in the webview
        const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

        // Use a nonce to whitelist which scripts can be run
        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">

                <!--
                Use a content security policy to only allow loading images from https or from our extension directory,
                and only allow scripts that have a specific nonce.
                -->
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">

                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cat Coding</title>
            </head>
            <body>
                <img src="${catGifPath}" width="300" />
                <h1 id="lines-of-code-counter">0</h1>

                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}