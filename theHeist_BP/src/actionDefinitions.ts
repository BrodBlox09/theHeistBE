class SetBlockAction implements IAction {
	type = "set_block";
	do: { "x": number, "y": number, "z": number, "block": string, "permutations"?: Record<string, any> };

	constructor(location: IVector3, blockType: string, permutations: Record<string, any>) {
		this.do = { "x": location.x, "y": location.y, "z": location.z, "block": blockType, "permutations": permutations };
	}
}

class FillBlocksAction implements IAction {
    type = "fill_blocks";
    do: { "x1": number, "y1": number, "z1": number, "x2": number, "y2": number, "z2": number, "block": string, "permutations"?: Record<string, any> };

    constructor(loc1: IVector3, loc2: IVector3, blockType: string, permutations?: Record<string, any>) {
        this.do = { "x1": loc1.x, "y1": loc1.y, "z1": loc1.z, "x2": loc2.x, "y2": loc2.y, "z2": loc2.z, "block": blockType, "permutations": permutations };
    }
}

class PlaySoundAction implements IAction {
    type = "play_sound";
    do: { "soundID": string };

    constructor(sound: string) {
        this.do = { "soundID": sound };
    }
}

class VoiceSaysAction implements IAction {
    type = "voice_says";
    do: { "soundID": string };

    constructor(soundId: string) {
        this.do = { "soundID": soundId };
    }
}

class RunCommandAction implements IAction {
    type = "run_command";
    do: { "command": string };

    constructor(command: string) {
        this.do = { "command": command };
    }
}

enum ObjectiveManagementType {
    ADD_OBJECTIVE = 1,
    COMPLETE_OBJECTIVE = 2,
    REMOVE_OBJECTIVE = 3
}

class ManageObjectiveAction implements IAction {
    type = "manage_objective";
    do: { "manageType": ObjectiveManagementType, "objective": string, "sortOrder"?: number };

    constructor(objectiveManagementType: ObjectiveManagementType, objective: string, sortOrder?: number) {
        this.do = { "manageType": objectiveManagementType, "objective": objective };
        if (sortOrder) this.do.sortOrder = sortOrder;
    }
}

class SlideshowAction implements IAction {
    type = "slideshow";
    do: { "slideshowID": number };

    constructor(slideshowId: number) {
        this.do = { "slideshowID": slideshowId };
    }
}

class DisableCameraAction implements IAction {
    type = "disable_camera";
    do: { "cameraID": number, "noMessage"?: boolean };
    
    constructor(cameraId: number, sendMessage: boolean = true) {
        this.do = { "cameraID": cameraId };
        if (!sendMessage) this.do.noMessage = true;
    }
}

class DisplayMailAction implements IAction {
    type = "display_mail";
    do: { "mailID": number };

    constructor(mailId: number) {
        this.do = { "mailID": mailId };
    }
}

class DisplayResearchAction implements IAction {
    type = "display_research";
    do: { "researchID": number };

    constructor(researchId: number) {
        this.do = { "researchID": researchId };
    }
}

class DisplayTextAction implements IAction {
    type = "display_text";
    do: { "text": string };

    constructor(text: string) {
        this.do = { "text": text };
    }
}

class SetAlarmLevelAction implements IAction {
    type = "set_alarm_level";
    do: { "value": number };

    constructor(value: number) {
        this.do = { "value": value };
    }
}

class NewGamebandAction implements IAction {
    type = "new_gameband";
    do: { "displayBlock": IVector3, "mode": string, "modeText": string, "slot": number };

    constructor(displayBlockLocation: IVector3, mode: string, modeText: string, slot: number) {
        this.do = {
            "displayBlock": displayBlockLocation,
            "mode": mode.toLowerCase(),
            "modeText": modeText,
            "slot": slot
        };
    }
}

class UpgradeGamebandAction implements IAction {
    type = "upgrade_gameband";
    do: { "displayBlock": IVector3, "mode": string, "modeText": string, "level": number, "slot": number };

    constructor(displayBlockLocation: IVector3, mode: string, modeText: string, slot: number, level: number) {
        this.do = {
            "displayBlock": displayBlockLocation,
            "mode": mode.toLowerCase(),
            "modeText": modeText,
            "level": level,
            "slot": slot
        };
    }
}