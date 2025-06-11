export class SetBlockAction implements IAction {
	type = "set_block";
	do: Record<string, any>;

	constructor(location: IVector3, blockType: string, permutations: Record<string, any>) {
		this.do = { "x": location.x, "y": location.y, "z": location.z, "block": blockType, "permutations": permutations };
	}
}

export class FillBlocksAction implements IAction {
    type = "fill_blocks";
    do: Record<string, any>;

    constructor(loc1: IVector3, loc2: IVector3, blockType: string, permutations?: Record<string, any>) {
        this.do = { "x1": loc1.x, "y1": loc1.y, "z1": loc1.z, "x2": loc2.x, "y2": loc2.y, "z2": loc2.z, "block": blockType, "permutations": permutations };
    }
}

export class PlaySoundAction implements IAction {
    type = "play_sound";
    do: Record<string, any>;

    constructor(sound: string) {
        this.do = { "soundID": sound };
    }
}

export class VoiceSaysAction implements IAction {
    type = "voice_says";
    do: Record<string, any>;

    constructor(soundId: string) {
        this.do = { "soundID": soundId };
    }
}

export class RunCommandAction implements IAction {
    type = "run_command";
    do: Record<string, any>;

    constructor(command: string) {
        this.do = { "command": command };
    }
}

export enum ObjectiveManagementType {
    ADD_OBJECTIVE = 1,
    COMPLETE_OBJECTIVE = 2,
    REMOVE_OBJECTIVE = 3
}

export class ManageObjectiveAction implements IAction {
    type = "manage_objective";
    do: Record<string, any>;

    constructor(objectiveManagementType: ObjectiveManagementType, objective: string, sortOrder?: number) {
        this.do = { "manageType": objectiveManagementType, "objective": objective };
        if (sortOrder) this.do.sortOrder = sortOrder;
    }
}

export class SlideshowAction implements IAction {
    type = "slideshow";
    do: Record<string, any>;

    constructor(slideshowId: number) {
        this.do = { "slideshowID": slideshowId };
    }
}

export class DisableCameraAction implements IAction {
    type = "disable_camera";
    do: Record<string, any>;
    
    constructor(cameraId: number, sendMessage: boolean = true) {
        this.do = { "cameraID": cameraId };
        if (!sendMessage) this.do.noMessage = true;
    }
}

export class DisplayMailAction implements IAction {
    type = "display_mail";
    do: Record<string, any>;

    constructor(mailId: number) {
        this.do = { "mailID": mailId };
    }
}

export class DisplayResearchAction implements IAction {
    type = "display_research";
    do: Record<string, any>;

    constructor(researchId: number) {
        this.do = { "researchID": researchId };
    }
}

export class DisplayTextAction implements IAction {
    type = "display_text";
    do: Record<string, any>;

    constructor(text: string) {
        this.do = { "text": text };
    }
}

export class SetAlarmLevelAction implements IAction {
    type = "set_alarm_level";
    do: Record<string, any>;

    constructor(value: number) {
        this.do = { "value": value };
    }
}

export class NewGamebandAction implements IAction {
    type = "new_gameband";
    do: Record<string, any>;

    constructor(displayBlockLocation: IVector3, mode: string, modeText: string, slot: number) {
        this.do = {
            "displayBlock": { "x": displayBlockLocation.x, "y": displayBlockLocation.y, "z": displayBlockLocation.z },
            "mode": mode.toLowerCase(),
            "modeText": modeText,
            "level": 1,
            "slot": slot
        };
    }
}