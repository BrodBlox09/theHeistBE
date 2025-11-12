import Vector from "../Vector";
import VectorXZ from "../VectorXZ";
import Utilities from "../Utilities";
import LevelConstructor from "./LevelConstructor";
import { ILevel, BlockRotation } from "../TypeDefinitions";

const level: ILevel = {
"levelId": "-1",
"levelCloneInfo": {
	"startX": 3028,
	"startZ": 97,
	"endX": 3109,
	"endZ": 161,
	"prisonLoc": new Vector(3109.5, -59, 91.5),
	"mapLoc": new Vector(3109, -55, 91)
},
"loadElevatorLoc": new Vector(3099, -58, 109),
"startPlayerLoc": new Vector(3086, -60, 110),
"startingItems": [{ "slot": 0, "typeId": 'theheist:recharge_mode_lvl_1', "lockMode": "slot" }, { "slot": 1, "typeId": 'theheist:hacking_mode_lvl_1', "lockMode": "slot" }],
"rechargeLevel": 1,
"startObjectives": [{ "name": "Access next level", "sortOrder": 5 }, { "name": "Get Sensor mode", "sortOrder": 4 }, { "name": "Get Hacking upgrade", "sortOrder": 3 }, { "name": "Get Recharge upgrade", "sortOrder": 2 }],
setup: () => {

LevelConstructor.staticCamera(new VectorXZ(3066.5, 105.5), 180);
LevelConstructor.dynamicCamera(new VectorXZ(3061.5, 147.5), [1, -85, 85]);
LevelConstructor.dynamicCamera(new VectorXZ(3080.5, 127.5), [0, 30, 150]);
LevelConstructor.dynamicCamera(new VectorXZ(3064.5, 127.5), [0, -150, -30]);
LevelConstructor.staticCamera(new VectorXZ(3081.5, 135.5), -105);
LevelConstructor.dynamicCamera(new VectorXZ(3108.5, 129.5), [1, 15, 75]);
LevelConstructor.dynamicCamera(new VectorXZ(3045.5, 115.5), [1, -62, -16]);

LevelConstructor.cameraRobot(new VectorXZ(3088.5, 134.5), -90);
LevelConstructor.cameraRobot(new VectorXZ(3055.5, 124.5), -180);

LevelConstructor.keypad(new VectorXZ(3079.5, 107.5), 1, BlockRotation.NORTH, [{
    "type": "set_block", "do": { "x": 3078, "y": -60, "z": 106, "block": "theheist:custom_door_1_bottom", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": true } }, "delay": 40
}]);
LevelConstructor.computer(new VectorXZ(3072.5, 105.5), "Research info", BlockRotation.SOUTH, [{
    "type": "display_research", "do": { "researchID": 100 }, "delay": 40
}]);
LevelConstructor.newGameband(new VectorXZ(3074.5, 100.5), "sensor", "§6§lSensor", 2, BlockRotation.NORTH, []);
LevelConstructor.keypad(new VectorXZ(3074.5, 116.5), 3, BlockRotation.EAST, []);
LevelConstructor.keypad(new VectorXZ(3052.5, 115.5), 1, BlockRotation.NORTH, [{
    "type": "set_block", "do": { "x": 3051, "y": -60, "z": 114, "block": "theheist:custom_door_1_bottom", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": true } }, "delay": 40
}]);
LevelConstructor.computer(new VectorXZ(3045.5, 111.5), "Mail", BlockRotation.WEST, [{
    "type": "display_mail", "do": { "mailID": 103 }, "delay": 40
}]);
LevelConstructor.keypad(new VectorXZ(3074.5, 139.5), 1, BlockRotation.EAST, [{
    "type": "set_block", "do": { "x": 3075, "y": -60, "z": 140, "block": "theheist:custom_door_1_bottom", "permutations": { "minecraft:cardinal_direction": "east", "theheist:unlocked": true } }, "delay": 40
}]);
LevelConstructor.computer(new VectorXZ(3080.5, 142.5), "Clear alarm status", BlockRotation.SOUTH, [{
    "type": "set_alarm_level", "do": { "value": 0 }, "delay": 40
}]);
LevelConstructor.computer(new VectorXZ(3082.5, 118.5), "Mail", BlockRotation.EAST, [{
    "type": "display_mail", "do": { "mailID": 104 }, "delay": 40
},
{
    "type": "manage_objective", "do": { "manageType": 1, "objective": "Find Yellow Keycard", "sortOrder": 1 }, "delay": 40
},
{
    "type": "manage_objective", "do": { "manageType": 1, "objective": "Find Green Keycard", "sortOrder": 0 }, "delay": 40
}]);
LevelConstructor.keypad(new VectorXZ(3104.5, 116.5), 2, BlockRotation.WEST, [{
    "type": "set_block", "do": { "x": 3103, "y": -60, "z": 115, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "west", "theheist:unlocked": true } }, "delay": 40
},
{
    "type": "hack_console", "do": { "x": 3097, "z": 123 }, "delay": 40
}]);
LevelConstructor.keypad(new VectorXZ(3097.5, 123.5), 2, BlockRotation.NORTH, [{
    "type": "set_block", "do": { "x": 3096, "y": -60, "z": 122, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": true } }, "delay": 40
},
{
    "type": "hack_console", "do": { "x": 3104, "z": 116 }, "delay": 40
}]);
LevelConstructor.computer(new VectorXZ(3097.5, 114.5), "Research info", BlockRotation.NORTH, [{
    "type": "display_research", "do": { "researchID": 101 }, "delay": 40
}]);
LevelConstructor.gamebandUpgrade(new VectorXZ(3106.5, 117.5), "hacking", "§2§lHacking Lvl. 2", 2, 1, BlockRotation.EAST, []);
LevelConstructor.keypad(new VectorXZ(3062.5, 150.5), 2, BlockRotation.SOUTH, [{
    "type": "set_block", "do": { "x": 3061, "y": -60, "z": 151, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "south", "theheist:unlocked": true } }, "delay": 40
}]);
LevelConstructor.computer(new VectorXZ(3058.5, 156.5), "Research info", BlockRotation.WEST, [{
    "type": "display_research", "do": { "researchID": 102 }, "delay": 40
}]);
LevelConstructor.gamebandUpgrade(new VectorXZ(3063.5, 159.5), "recharge", "§1§lRecharge Lvl. 2", 2, 0, BlockRotation.SOUTH, []);
LevelConstructor.keycardReader(new VectorXZ(3039.5, 129.5), "yellow", [{
    "type": "set_block", "do": { "x": 3038, "y": -60, "z": 131, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "west", "theheist:unlocked": true, "theheist:open": true } }
},
{
    "type": "play_sound", "do": { "soundID": "random.door_open" }
}]);
LevelConstructor.keycardReader(new VectorXZ(3087.5, 131.5), "green", [{
    "type": "set_block", "do": { "x": 3089, "y": -60, "z": 130, "block": "theheist:custom_door_4_bottom_l", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": true, "theheist:open": true } }
},
{
    "type": "set_block", "do": { "x": 3090, "y": -60, "z": 130, "block": "theheist:custom_door_4_bottom_r", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": true, "theheist:open": true  } }
},
{
    "type": "play_sound", "do": { "soundID": "random.door_open" }
},
{
    "type": "manage_objective", "do": { "manageType": 2, "objective": "Access next level" }
},
{
    "type": "voice_says", "do": { "soundID": 204 }
}]);
LevelConstructor.computer(new VectorXZ(3081.5, 137.5), "Disable nearby camera", BlockRotation.NORTH, [{
    "type": "disable_camera", "do": { "cameraID": 4 }, "delay": 40
}]);

LevelConstructor.door1(new VectorXZ(3078, 106), BlockRotation.NORTH);
LevelConstructor.door1(new VectorXZ(3051, 114), BlockRotation.NORTH);
LevelConstructor.door1(new VectorXZ(3075, 140), BlockRotation.EAST);
LevelConstructor.door2(new VectorXZ(3103, 115), BlockRotation.WEST);
LevelConstructor.door2(new VectorXZ(3096, 122), BlockRotation.NORTH);
LevelConstructor.door2(new VectorXZ(3061, 151), BlockRotation.SOUTH);
LevelConstructor.door2(new VectorXZ(3038, 131), BlockRotation.WEST);
LevelConstructor.door4(new VectorXZ(3089, 130), new VectorXZ(3090, 130), BlockRotation.NORTH);

LevelConstructor.rechargeStation(new VectorXZ(3070.5, 110.5), BlockRotation.WEST);
LevelConstructor.rechargeStation(new VectorXZ(3100.5, 121.5), BlockRotation.SOUTH);
LevelConstructor.rechargeStation(new VectorXZ(3061.5, 138.5), BlockRotation.NORTH);
LevelConstructor.rechargeStation(new VectorXZ(3077.5, 119.5), BlockRotation.SOUTH);
LevelConstructor.rechargeStation(new VectorXZ(3091.5, 128.5), BlockRotation.EAST);

LevelConstructor.keycardDrawer(new VectorXZ(3058, 157), "yellow");
LevelConstructor.keycardDrawer(new VectorXZ(3033, 130), "green");

Utilities.setBlock(new Vector(3066, -60, 118), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.WEST });
Utilities.setBlock(new Vector(3065, -60, 114), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.EAST });
Utilities.setBlock(new Vector(3067, -60, 114), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.EAST });
Utilities.setBlock(new Vector(3062, -60, 118), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.WEST });
Utilities.setBlock(new Vector(3059, -60, 114), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.EAST });
Utilities.setBlock(new Vector(3061, -60, 114), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.EAST });
Utilities.setBlock(new Vector(3063, -60, 114), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.EAST, "door_hinge_bit": true });
Utilities.setBlock(new Vector(3079, -57, 139), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.SOUTH });
Utilities.setBlock(new Vector(3107, -60, 125), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.WEST });
Utilities.setBlock(new Vector(3107, -57, 119), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.SOUTH });
LevelConstructor.door1(new VectorXZ(3079, 114), BlockRotation.WEST, true);
LevelConstructor.door1(new VectorXZ(3080, 114), BlockRotation.EAST, true);
LevelConstructor.door1(new VectorXZ(3081, 114), BlockRotation.WEST, true);
LevelConstructor.door1(new VectorXZ(3082, 114), BlockRotation.SOUTH, true);

Utilities.dimensions.overworld.setBlockType(new Vector(3073, -55, 127), "minecraft:redstone_block");
Utilities.setBlock(new Vector(3090, -59, 124), "minecraft:lever", { "lever_direction": "south" });
Utilities.spawnEntity(new Vector(3053.5, -59, 110.5), "theheist:camera_robot").setRotation({ "x": 0, "y": 180 });
[new Vector(3034.5, -59, 141.5), new Vector(3035.5, -59, 141.5), new Vector(3036.5, -59, 141.5)].forEach(vector => {
    const decorativeCamera = Utilities.spawnEntity(vector, "theheist:camera");
    decorativeCamera.setRotation({ "x": 0, "y": 180 });
    decorativeCamera.triggerEvent("theheist:disable");
});
}
};

export default level;