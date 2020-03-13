import * as vscode from "vscode";
import * as path from "path";
import * as _ from "lodash";
import { getEnv } from "./util";
import { Env, Test, TestState, cache, Level } from "./extension";

interface Repo {
	levels: Level[];
	tests: Record<string, Test[]>;
}

function fileToTest(file: vscode.Uri): Test {
	const [, levelNumber, levelName, testNumber, testName, filePath] =
		/(\d+) ([^/]+)\/(\d+) ([^/]+)\/(.*)/.exec(file.path) || [];
	const level: Level = { name: levelName, number: levelNumber };
	return { level, name: testName, number: testNumber, filePath, state: TestState.UNKNOWN };
}

let _repo: Repo = { levels: [], tests: {} };

export async function refresh() {
	const courseDirectory = getEnv(Env.COURSE_DIRECTORY);
	const files = _.groupBy(
		await vscode.workspace.findFiles(`${courseDirectory}/**/*`),
		f => {
			const [, levelNumber, testNumber] = /g/.exec(f.path) || [];
			return `${levelNumber}-${testNumber}`;
		}
	);
	
	const tests = Object.entries(files).map(([level, files]) => ({
		level: {
			name: 
		}
	}));
	const levels = _.uniqBy(Object.values(tests).flatMap(t => t), "number");

	_repo = {tests, levels};
}

export function getLevels(): Level[] {
	return _repo.levels;
}

export function getTests(levelNumber: string): Test[] {
	return _repo.tests[levelNumber];
}

