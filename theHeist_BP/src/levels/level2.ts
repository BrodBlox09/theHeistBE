import Vector from "../Vector";
import LevelConstructor from "./LevelConstructor";
import ActionListBuilder from "../actions/ActionListBuilder";
import { ManageObjectiveAction, ObjectiveManagementType, SlideshowAction } from "../actions/ActionDefinitions";
import { ILevel, BlockRotation } from "../TypeDefinitions";

const level: ILevel = {
"levelId": "2",
"noAutoCleanup": true,
"noRunSecurity": true,
"levelCloneInfo": {
	"startX": -25,
	"startZ": 56,
	"endX": -20,
	"endZ": 65,
	"mapLoc": Vector.zero,
	"prisonLoc": Vector.zero
},
"loadElevatorLoc": Vector.zero,
"startPlayerLoc": new Vector(-22.5, 60, 61.5),
"startPlayerRot": -90,
"startingItems": [{ "slot": 0, "typeId": 'theheist:recharge_mode_lvl_1', "lockMode": "slot" }, { "slot": 1, "typeId": 'theheist:hacking_mode_lvl_1', "lockMode": "slot" }],
"rechargeLevel": 1,
"startEnergyUnits": 0.0,
"startObjectives": [{ "name": "Recharge Gameband", "sortOrder": 1 }, { "name": "Activate Slideshow", "sortOrder": 0 }],
"customLoadingArea": {
    "waitForLoadLevel": false,
    "playerLoadingLocation": Vector.zero
},
"customTitle": "",
setup: () => {
    LevelConstructor.rechargeStation(new Vector(-21.5, 60, 62.5), BlockRotation.EAST, 21.0, new ActionListBuilder(0)
        .add(new ManageObjectiveAction(ObjectiveManagementType.COMPLETE_OBJECTIVE, "Recharge Gameband", 1))
        .build());
    LevelConstructor.computer(new Vector(-21.5, 61, 58.5), "Start slideshow", BlockRotation.EAST, new ActionListBuilder()
        .add(new ManageObjectiveAction(ObjectiveManagementType.COMPLETE_OBJECTIVE, "Activate Slideshow", 0))
        .add(new SlideshowAction(1), 44)
        .build());
}
};

export default level;