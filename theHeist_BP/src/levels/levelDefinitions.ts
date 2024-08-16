import levelN2 from './level-2';
import levelN3 from './level-3';
import levelN4 from './level-4';

const levels: ILevel[] = [ levelN2, levelN3, levelN4 ];

export default class LevelDefinitions {
    /**
     * @description Retrieves the LevelDefintion of the desired level
     * @param { string } id The ID of the level desired
     * @throws If the level definition is not found, throws Error
     */
    static getLevelDefinitionByID(id: string): ILevel | undefined {
        var selectedLevelDef = levels.find((levelDef) => levelDef.levelID == id);
        if (!selectedLevelDef) throw new LevelNotFoundError(`No level of such ID '${id}' exists.`);
        return selectedLevelDef;
    }
}

class LevelNotFoundError implements Error {
    name: string = "Level Not Found Error";
    message: string;

    constructor(_message: string) {
        this.message = _message;
        console.warn(_message);
    }
}