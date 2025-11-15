import { BlockRotation, CameraSwivelMode, ILevel } from "../TypeDefinitions";
import Vector from "../Vector";
import Utilities from "../Utilities";
import LevelConstructor from "./LevelConstructor";
import VectorXZ from "../VectorXZ";
import ActionListBuilder from "../actions/ActionListBuilder";
import { DisplayResearchAction, SetBlockAction, VoiceSaysAction } from "../actions/ActionDefinitions";
import VoiceOverManager from "../managers/VoiceOverManager";

const level: ILevel = {
"levelId": "-6",
// 5 minute time limit
"timeLimit": 300,
"levelCloneInfo": {
	"startX": 7872,
	"startZ": 63,
	"endX": 7999,
	"endZ": 191,
	"prisonLoc": new Vector(7916.5, 61, 94.5),
	"mapLoc": new Vector(7940, 66, 99)
},
"loadElevatorLoc": new Vector(7938, 70, 84),
"startPlayerLoc": new Vector(7938, Utilities.levelPlayingHeight, 84),
"startingItems": [{ "slot": 0, "typeId": 'theheist:recharge_mode_lvl_3', "lockMode": "slot" }, { "slot": 1, "typeId": 'theheist:hacking_mode_lvl_3', "lockMode": "slot" }, { "slot": 2, "typeId": 'theheist:sensor_mode_lvl_2', "lockMode": "slot" }, { "slot": 3, "typeId": 'theheist:xray_mode_lvl_2', "lockMode": "slot" }, { "slot": 4, "typeId": 'theheist:magnet_mode_lvl_1', "lockMode": "slot" }, { "slot": 5, "typeId": 'theheist:stealth_mode_lvl_2', "lockMode": "slot" }, { "slot": 6, "typeId": 'theheist:stun_mode_lvl_1', "lockMode": "slot" }, { "slot": 7, "typeId": 'theheist:drill_mode_lvl_1', "lockMode": "slot" }],
"rechargeLevel": 3,
"startObjectives": [{ "name": "Get out!", "sortOrder": 1 }],
"initialAdditionalLoadWaitTime": 41,
"onInitialLoadStart": (player) => {
	VoiceOverManager.play(player, "700"); // 41 seconds long
},
"setup": () => {

{ // Entry Hall
	LevelConstructor.sonarRobot(new VectorXZ(7941.5, 105.5), 90);
}

{ // Horizontal Hall
	LevelConstructor.cameraRobot(new VectorXZ(7927.5, 126.5), -90);
	LevelConstructor.cameraRobot(new VectorXZ(7931.5, 124.5), 90);

	LevelConstructor.staticCamera(new VectorXZ(7922.5, 120.5), 90);

	LevelConstructor.door4(new VectorXZ(7915, 121), new VectorXZ(7915, 120), BlockRotation.WEST, false);
	LevelConstructor.keypad(new VectorXZ(7916.5, 119.5), 3, BlockRotation.WEST, new ActionListBuilder()
		.add(new SetBlockAction(new Vector(7915, Utilities.levelPlayingHeight, 121), "theheist:custom_door_4_bottom_l", { "minecraft:cardinal_direction": BlockRotation.WEST }))
		.add(new SetBlockAction(new Vector(7915, Utilities.levelPlayingHeight, 120), "theheist:custom_door_4_bottom_r", { "minecraft:cardinal_direction": BlockRotation.WEST }))
		.build());
}

{ // Recharge Hall
	LevelConstructor.staticCamera(new VectorXZ(7909.5, 125.5), 25);
	LevelConstructor.sonar(new VectorXZ(7905.5, 125.5), -25);

	LevelConstructor.rechargeStation(new VectorXZ(7911, 132), BlockRotation.WEST);
}

{ // 6-Camera Matrix Hall
	// 0 | 1 - 2 | 3
	// Second row, 0
	LevelConstructor.dynamicCamera(new VectorXZ(7922.5, 129.5), [CameraSwivelMode.Decrease, 40, 285]);
	// Second row, 2
	LevelConstructor.dynamicCamera(new VectorXZ(7922.5, 141.5), [CameraSwivelMode.Decrease, -55, 195]);
	// Third row, 3
	LevelConstructor.dynamicCamera(new VectorXZ(7929.5, 145.5), [CameraSwivelMode.Increase, 110, 250]);
	// Between fourth and fifth row, 1
	LevelConstructor.dynamicCamera(new VectorXZ(7936.5, 134.5), [CameraSwivelMode.Increase, 90, 275]);
	// Between sixth and seventh row, 0
	LevelConstructor.dynamicCamera(new VectorXZ(7946.5, 132.5), [CameraSwivelMode.Increase, 65, 100]);
	// Seventh row, 3
	LevelConstructor.dynamicCamera(new VectorXZ(7950.5, 145.5), [CameraSwivelMode.Increase, 105, 160]);
}

{ // Double Static Robot Hall
	LevelConstructor.staticCameraRobot(new VectorXZ(7955.5, 151.5), 0);
	LevelConstructor.staticSonarRobot(new VectorXZ(7953.5, 151.5), 0);

	LevelConstructor.door4(new VectorXZ(7954, 158), new VectorXZ(7953, 158), BlockRotation.SOUTH, false);
	LevelConstructor.keypad(new VectorXZ(7955, 157), 3, BlockRotation.SOUTH, new ActionListBuilder()
		.add(new SetBlockAction(new Vector(7954, Utilities.levelPlayingHeight, 158), "theheist:custom_door_4_bottom_l", { "minecraft:cardinal_direction": BlockRotation.SOUTH }))
		.add(new SetBlockAction(new Vector(7953, Utilities.levelPlayingHeight, 158), "theheist:custom_door_4_bottom_r", { "minecraft:cardinal_direction": BlockRotation.SOUTH }))
		.build());
}

{ // Camera + Laser Hall
	LevelConstructor.dynamicCamera(new VectorXZ(7949.5, 167.5), [CameraSwivelMode.Increase, 110, 210]);
}

{ // 3 Camera Room
	LevelConstructor.staticCamera(new VectorXZ(7934.5, 167.5), 255);
	LevelConstructor.staticCamera(new VectorXZ(7934.5, 165.5), 115);
	LevelConstructor.staticCamera(new VectorXZ(7933.5, 166.5), 175);

	LevelConstructor.door4(new VectorXZ(7932, 158), new VectorXZ(7933, 158), BlockRotation.NORTH, true);
	LevelConstructor.door4(new VectorXZ(7933, 157), new VectorXZ(7932, 157), BlockRotation.SOUTH, true);
}

{ // Old Research Room
	LevelConstructor.rechargeStation(new VectorXZ(7928.5, 148.5), BlockRotation.NORTH);
}

{ // Teleportation Research
	LevelConstructor.rechargeStation(new VectorXZ(7926.5, 164.5), BlockRotation.EAST);
	LevelConstructor.rechargeStation(new VectorXZ(7926.5, 165.5), BlockRotation.EAST);
	LevelConstructor.rechargeStation(new VectorXZ(7926.5, 166.5), BlockRotation.EAST);
	LevelConstructor.rechargeStation(new VectorXZ(7926.5, 167.5), BlockRotation.EAST);

	LevelConstructor.computer(new VectorXZ(7920.5, 170.5), "Research info", BlockRotation.SOUTH, new ActionListBuilder()
		.add(new DisplayResearchAction(600))
		.build());
	LevelConstructor.newGameband(new VectorXZ(7908.5, 164.5), "teleportation", "§r§dTeleportation", 8, BlockRotation.EAST, new ActionListBuilder()
		.add(new VoiceSaysAction(703))
		.build());
}

}
}

export default level;