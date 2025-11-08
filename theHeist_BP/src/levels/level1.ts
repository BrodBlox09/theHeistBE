import { Player } from "@minecraft/server";
import Vector from "../Vector";
import Utilities from "../Utilities";
import LevelConstructor from "./LevelConstructor";
import { ILevel } from "../TypeDefinitions";

const level: ILevel = {
"levelId": "1",
"levelCloneInfo": {
	"startX": 985,
	"startZ": 53,
	"endX": 1040,
	"endZ": 118,
	"mapLoc": Vector.zero,
	"prisonLoc": Vector.zero
},
"loadElevatorLoc": new Vector(0, 0, 0),
"startPlayerLoc": new Vector(1000.5, -59, 57.5),
"startPlayerRot": 90,
"startingItems": [{ "slot": 0, "typeId": 'theheist:recharge_mode_lvl_1', "lockMode": "slot" }, { "slot": 1, "typeId": 'theheist:hacking_mode_lvl_1', "lockMode": "slot" }],
"rechargeLevel": 1,
"noAutoCleanup": true,
"startObjectives": [{ "name": "Get into the building", "sortOrder": 0 }],
"customTitle": "§o§7Outside the HQ",
"customLoadingArea": {
    "waitForLoadLevel": false,
    "playerLoadingLocation": new Vector(0, 0, 0)
},
setup: () => {},
onLoadStart: (player: Player) => { player.camera.clear(); }
};

export default level;