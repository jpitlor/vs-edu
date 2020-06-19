import { Test } from "./extension";
import * as TestRunner from "./test-runner";
import { refreshTreeView } from "./test-lister";
import * as TestOpener from "./test-opener";

export function openTest(test: Test) {
    TestOpener.openTest(test);
}

export function runTest(test: Test) {
    TestOpener.postMessage({command: "setTestState", value: "in-progress"});
    TestRunner.runTest(test);
}

export function refresh() {
    refreshTreeView();
}
