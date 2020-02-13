import * as vscode from "vscode";
import * as path from "path";
import { rootDirectory, get, readDirectory } from "./util";
import { Env, Test } from "./extension";

interface Level {
    [levelNumber: string]: Test[];
}

interface TestFiles {
    [levelDashTestNumber: string]: Test[];
}

interface Repo {
    levels: Test[];
    tests: Level;
    files: TestFiles
}

export class TestRepository {
    private static _repo: Repo = {levels: [], tests: {}, files: {}};

    static async refresh() {
        const levels = await readDirectory(get(Env.TEST_DIRECTORY));
        
    }

    static getLevels(): Test[] {
        return this._repo.levels;
    }

    static getTests(levelNumber: string): Test[] {
        return this._repo.tests[levelNumber];
    }

    static getFiles(levelNumber: string, testNumber: string): Test[] {
        return this._repo.files[`${levelNumber}-${testNumber}`];
    }
}
