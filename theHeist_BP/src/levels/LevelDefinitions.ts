import level2 from './level2';
import level1 from './level1';
import level0 from './level0';
import levelN1 from './level-1';
import levelN2 from './level-2';
import levelN3 from './level-3';
import levelN4 from './level-4';
import levelN5 from './level-5';
import levelN6 from './level-6';
import { ILevel } from '../TypeDefinitions';

let levels: Record<string, ILevel> = {};

export default class LevelDefinitions {
	static registerLevel(level: ILevel) {
		let id = level.levelId;
		if (levels[id]) throw new LevelOverwriteAttemptedError(`Level ID '${id}' has already been registered.`);
		levels[id] = level;
	}

    /**
     * Retrieves the level definition of the desired level
     * @param { string } id The ID of the level desired
     * @throws If the level definition is not found, throws LevelNotFoundError
     */
    static getLevelDefinitionByID(id: string): ILevel | undefined {
        var selectedLevelDef = levels[id];
        if (!selectedLevelDef) throw new LevelNotFoundError(`No level of such ID '${id}' exists.`);
        return selectedLevelDef;
    }
}

export class LevelNotFoundError implements Error {
    name: string = "Level Not Found Error";

    constructor(public message: string) {
        console.warn(message);
    }
}

export class LevelOverwriteAttemptedError implements Error {
	name: string = "Level Overwrite Attempted Error";

	constructor(public message: string) {
		console.warn(message);
	}
}

LevelDefinitions.registerLevel(level2);
LevelDefinitions.registerLevel(level1);
LevelDefinitions.registerLevel(level0);
LevelDefinitions.registerLevel(levelN1);
LevelDefinitions.registerLevel(levelN2);
LevelDefinitions.registerLevel(levelN3);
LevelDefinitions.registerLevel(levelN4);
LevelDefinitions.registerLevel(levelN5);
LevelDefinitions.registerLevel(levelN6);