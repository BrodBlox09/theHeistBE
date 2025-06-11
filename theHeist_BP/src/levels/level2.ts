import { Player } from "@minecraft/server";
import BlockRotation from "../BlockRotation";
import Vector from "../Vector";
import Utilities from "../Utilities";
import ActionListBuilder from "../ActionListBuilder";
import { ManageObjectiveAction, ObjectiveManagementType, SlideshowAction } from "../actionDefinitions";
import LevelConstructor from "./LevelConstructor";

const level: ILevel = {
"levelID": "2",
"loadElevatorLoc": new Vector(0, 0, 0),
"startPlayerLoc": new Vector(-22.5, -59, 61.5),
"startPlayerRot": -90,
"startingItems": [{ "slot": 0, "typeId": 'theheist:recharge_mode_lvl_1', "lockMode": "slot" }, { "slot": 1, "typeId": 'theheist:hacking_mode_lvl_1', "lockMode": "slot" }],
"rechargeLevel": 1,
"startEnergyUnits": 0.0,
"startObjectives": [{ "name": "Recharge Gameband", "sortOrder": 1 }, { "name": "Activate Slideshow", "sortOrder": 0 }],
"customLoadingArea": {
    "waitForLoadLevel": false,
    "playerLoadingLocation": new Vector(0, 0, 0)
},
"customTitle": "",
setup: () => {
    LevelConstructor.rechargeStation(new Vector(-21.5, -59, 62.5), BlockRotation.EAST, 21.0, new ActionListBuilder()
        .add(new ManageObjectiveAction(ObjectiveManagementType.COMPLETE_OBJECTIVE, "Recharge Gameband", 1))
        .build());
    LevelConstructor.computer(new Vector(-21.5, -58, 58.5), "Start slideshow", BlockRotation.EAST, new ActionListBuilder()
        .add(new ManageObjectiveAction(ObjectiveManagementType.COMPLETE_OBJECTIVE, "Activate Slideshow", 0))
        .add(new SlideshowAction(1), 44)
        .build());
}
};

export default level;