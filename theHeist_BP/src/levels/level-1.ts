import BlockRotation from "../BlockRotation";
import Vector from "../Vector";
import Utilities from "../Utilities";
import LevelConstructor from "./LevelConstructor";

const level: ILevel = {
"levelID": "-1",
"loadElevatorLoc": new Vector(3099, -59, 109),
"startPlayerLoc": new Vector(3086, -60, 110),
"startingItems": [{ "slot": 0, "typeId": 'theheist:recharge_mode_lvl_1', "lockMode": "slot" }, { "slot": 1, "typeId": 'theheist:hacking_mode_lvl_1', "lockMode": "slot" }],
"rechargeLevel": 1,
"startObjectives": [{ "name": "Access next level", "sortOrder": 5 }, { "name": "Get Sensor mode", "sortOrder": 4 }, { "name": "Get Hacking upgrade", "sortOrder": 3 }, { "name": "Get Recharge upgrade", "sortOrder": 2 }],
setup: () => {

LevelConstructor.staticCamera(new Vector(3066.5, -58, 105.5), 180);
LevelConstructor.dynamicCamera(new Vector(3061.5, -58, 147.5), [1, -85, 85]);
LevelConstructor.dynamicCamera(new Vector(3080.5, -58, 127.5), [0, 30, 150]);
LevelConstructor.dynamicCamera(new Vector(3064.5, -58, 127.5), [0, -150, -30]);
LevelConstructor.staticCamera(new Vector(3081.5, -58, 135.5), -105);
LevelConstructor.dynamicCamera(new Vector(3108.5, -58, 129.5), [1, 15, 75]);
LevelConstructor.dynamicCamera(new Vector(3045.5, -58, 115.5), [1, -62, -16]);

LevelConstructor.cameraRobot(new Vector(3088.5, -59.25, 134.5), -90);
LevelConstructor.cameraRobot(new Vector(3055.5, -59.25, 124.5), -180);

LevelConstructor.keypad(new Vector(3079.5, -59, 107.5), 1, BlockRotation.NORTH, [{
    "type": "set_block", "do": { "x": 3078, "y": -60, "z": 106, "block": "theheist:custom_door_1_bottom", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": true } }, "delay": 40
}]);
LevelConstructor.computer(new Vector(3072.5, -59, 105.5), "Research info", BlockRotation.SOUTH, [{
    "type": "display_research", "do": { "researchID": 100 }, "delay": 40
}]);
LevelConstructor.newGameband(new Vector(3074.5, -59, 100.5), "sensor", "§6§lSensor", 2, BlockRotation.NORTH, []);
LevelConstructor.keypad(new Vector(3074.5, -59, 116.5), 3, BlockRotation.EAST, []);
LevelConstructor.keypad(new Vector(3052.5, -59, 115.5), 1, BlockRotation.NORTH, [{
    "type": "set_block", "do": { "x": 3051, "y": -60, "z": 114, "block": "theheist:custom_door_1_bottom", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": true } }, "delay": 40
}]);
LevelConstructor.computer(new Vector(3045.5, -59, 111.5), "Mail", BlockRotation.WEST, [{
    "type": "display_mail", "do": { "mailID": 103 }, "delay": 40
}]);
LevelConstructor.keypad(new Vector(3074.5, -59, 139.5), 1, BlockRotation.EAST, [{
    "type": "set_block", "do": { "x": 3075, "y": -60, "z": 140, "block": "theheist:custom_door_1_bottom", "permutations": { "minecraft:cardinal_direction": "east", "theheist:unlocked": true } }, "delay": 40
}]);
LevelConstructor.computer(new Vector(3080.5, -59, 142.5), "Clear alarm status", BlockRotation.SOUTH, [{
    "type": "set_alarm_level", "do": { "value": 0 }, "delay": 40
}]);
LevelConstructor.computer(new Vector(3082.5, -59, 118.5), "Mail", BlockRotation.EAST, [{
    "type": "display_mail", "do": { "mailID": 104 }, "delay": 40
},
{
    "type": "manage_objectives", "do": { "manageType": 1, "objective": "Find Yellow Keycard", "sortOrder": 1 }, "delay": 40
},
{
    "type": "manage_objectives", "do": { "manageType": 1, "objective": "Find Green Keycard", "sortOrder": 0 }, "delay": 40
}]);
LevelConstructor.keypad(new Vector(3104.5, -59, 116.5), 2, BlockRotation.WEST, [{
    "type": "set_block", "do": { "x": 3103, "y": -60, "z": 115, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "west", "theheist:unlocked": true } }, "delay": 40
},
{
    "type": "hack_console", "do": { "x": 3097, "z": 123 }, "delay": 40
}]);
LevelConstructor.keypad(new Vector(3097.5, -59, 123.5), 2, BlockRotation.NORTH, [{
    "type": "set_block", "do": { "x": 3096, "y": -60, "z": 122, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": true } }, "delay": 40
},
{
    "type": "hack_console", "do": { "x": 3104, "z": 116 }, "delay": 40
}]);
LevelConstructor.computer(new Vector(3097.5, -59, 114.5), "Research info", BlockRotation.NORTH, [{
    "type": "display_research", "do": { "researchID": 101 }, "delay": 40
}]);
LevelConstructor.gamebandUpgrade(new Vector(3106.5, -59, 117.5), "hacking", "§2§lHacking Lvl. 2", 2, 1, BlockRotation.EAST, []);
LevelConstructor.keypad(new Vector(3062.5, -59, 150.5), 2, BlockRotation.SOUTH, [{
    "type": "set_block", "do": { "x": 3061, "y": -60, "z": 151, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "south", "theheist:unlocked": true } }, "delay": 40
}]);
LevelConstructor.computer(new Vector(3058.5, -59, 156.5), "Research info", BlockRotation.WEST, [{
    "type": "display_research", "do": { "researchID": 102 }, "delay": 40
}]);
LevelConstructor.gamebandUpgrade(new Vector(3063.5, -59, 159.5), "recharge", "§1§lRecharge Lvl. 2", 2, 0, BlockRotation.SOUTH, []);
LevelConstructor.keycardReader(new Vector(3039.5, -59, 129.5), "yellow", [{
    "type": "set_block", "do": { "x": 3038, "y": -60, "z": 131, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "west", "theheist:unlocked": true, "theheist:open": true } }
},
{
    "type": "play_sound", "do": { "soundID": "random.door_open" }
}]);
LevelConstructor.keycardReader(new Vector(3087.5, -59, 131.5), "green", [{
    "type": "set_block", "do": { "x": 3089, "y": -60, "z": 130, "block": "theheist:custom_door_4_bottom_l", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": true, "theheist:open": true } }
},
{
    "type": "set_block", "do": { "x": 3090, "y": -60, "z": 130, "block": "theheist:custom_door_4_bottom_r", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": true, "theheist:open": true  } }
},
{
    "type": "play_sound", "do": { "soundID": "random.door_open" }
},
{
    "type": "manage_objectives", "do": { "manageType": 2, "objective": "Access next level" }
},
{
    "type": "voice_says", "do": { "soundID": 204 }
}]);
LevelConstructor.computer(new Vector(3081.5, -59, 137.5), "Disable nearby camera", BlockRotation.NORTH, [{
    "type": "disable_camera", "do": { "cameraID": 4 }, "delay": 40
}]);

LevelConstructor.door1(new Vector(3078, -60, 106), BlockRotation.NORTH);
LevelConstructor.door1(new Vector(3051, -60, 114), BlockRotation.NORTH);
LevelConstructor.door1(new Vector(3075, -60, 140), BlockRotation.EAST);
LevelConstructor.door2(new Vector(3103, -60, 115), BlockRotation.WEST);
LevelConstructor.door2(new Vector(3096, -60, 122), BlockRotation.NORTH);
LevelConstructor.door2(new Vector(3061, -60, 151), BlockRotation.SOUTH);
LevelConstructor.door2(new Vector(3038, -60, 131), BlockRotation.WEST);
LevelConstructor.door4(new Vector(3089, -60, 130), new Vector(3090, -60, 130), BlockRotation.NORTH);

LevelConstructor.rechargeStation(new Vector(3070.5, -60, 110.5), BlockRotation.WEST);
LevelConstructor.rechargeStation(new Vector(3100.5, -60, 121.5), BlockRotation.SOUTH);
LevelConstructor.rechargeStation(new Vector(3061.5, -60, 138.5), BlockRotation.NORTH);
LevelConstructor.rechargeStation(new Vector(3077.5, -60, 119.5), BlockRotation.SOUTH);
LevelConstructor.rechargeStation(new Vector(3091.5, -60, 128.5), BlockRotation.EAST);

LevelConstructor.keycardDrawer(new Vector(3058, -60, 157), "yellow")
LevelConstructor.keycardDrawer(new Vector(3033, -60, 130), "green")

Utilities.dimensions.overworld.setBlockType(new Vector(3073, -55, 127), "minecraft:redstone_block");
Utilities.setBlock(new Vector(3090, -59, 124), "minecraft:lever", { "lever_direction": "south" });
Utilities.dimensions.overworld.spawnEntity("theheist:camera_robot", new Vector(3053.5, -59, 110.5)).setRotation({ "x": 0, "y": 180 });
const decorativeCamera0 = Utilities.dimensions.overworld.spawnEntity("theheist:camera", new Vector(3034.5, -59, 141.5));
decorativeCamera0.setRotation({ "x": 0, "y": 180 });
decorativeCamera0.triggerEvent("theheist:disable");
const decorativeCamera1 = Utilities.dimensions.overworld.spawnEntity("theheist:camera", new Vector(3035.5, -59, 141.5));
decorativeCamera1.setRotation({ "x": 0, "y": 180 });
decorativeCamera1.triggerEvent("theheist:disable");
const decorativeCamera2 = Utilities.dimensions.overworld.spawnEntity("theheist:camera", new Vector(3036.5, -59, 141.5));
decorativeCamera2.setRotation({ "x": 0, "y": 180 });
decorativeCamera2.triggerEvent("theheist:disable");

}
};

export default level;

// In case a mistake was made in the transcription process:

// // case "-1-1": {
//     case "-1-1-impossible-challenge-to-do-haha": {
//         // Load level -1 (the second level)
//         // Clear all data on player
//         DataManager.clearData(player);
//         // Previous level made use of tags, clear them here
//         player.getTags().forEach((x) => { if (!persistentTags.includes(x)) player.removeTag(x); });
//         // Add energyTracker data
//         const playerEnergyTrackerDataNode: EnergyTracker = { "name": "playerEnergyTracker", "energyUnits": 100.0, "recharging": false, "usingRechargerID": -1, "rechargeLevel": 1 };
//         DataManager.setData(player, playerEnergyTrackerDataNode);

//         if (!bustedCounterObjective.hasParticipant(player)) {
//             bustedCounterObjective.setScore(player, 0);
//         }
//         const playerLevelInformationDataNode: LevelInformation = { "name": "levelInformation", "currentModes": [], "information": [{ "name": "alarmLevel", "level": 0, "sonarTimeout": 0 }, { "name": "gameLevel", "level": -1 }, { "name": "playerInv", "inventory": [{ "slot": 0, "typeId": 'theheist:recharge_mode_lvl_1', "lockMode": "slot" }, { "slot": 1, "typeId": 'theheist:hacking_mode_lvl_1', "lockMode": "slot" }] }] };
        
//         DataManager.setData(player, playerLevelInformationDataNode);

//         Utilities.reloadPlayerInv(player, playerLevelInformationDataNode);

//         player.onScreenDisplay.setTitle("§o§7Level -1", { "fadeInDuration": 20, "fadeOutDuration": 20, "stayDuration": 160 });
//         clearObjectives();
//         addUnfinishedObjective("Access next level", 5);
//         addUnfinishedObjective("Get Sensor mode", 4);
//         addUnfinishedObjective("Get Hacking upgrade", 3);
//         addUnfinishedObjective("Get Recharge upgrade", 2);
//         reloadSidebarDisplay();

//         player.teleport({ 'x': 3099.0, 'y': -56, 'z': 109.0 }, { 'dimension': overworld, 'rotation': { 'x': 0, 'y': -90 } });
//         var elevatorInterval =  runElelevatorAnimation(new Vector(3099.0, -60, 109.0));

//         // Ensure parts far away are loaded
//         overworld.runCommand('tickingarea remove_all');
//         overworld.runCommand('tickingarea add 3032 -61 128 3040 -14 133 "t1" true');

//         system.runTimeout(() => { // After 10 seconds bring the player out of the elevator and end the interval
//             overworld.runCommand('tickingarea remove_all');
//             system.clearRun(elevatorInterval);
//             player.teleport({ "x": 3086.0, "y": -60, "z": 110.0 }, { 'dimension': overworld, 'rotation': { 'x': 0, 'y': 90 } });
//             player.removeTag('loadingLevel');
//         }, SECOND * 10);
//         system.runTimeout(() => { // After 7.5 seconds load the level objects
//             // Kill all entities
//             const entities = overworld.getEntities();
//             for (const entity of entities) {
//                 if (!persistentEntities.includes(entity.typeId) && !entity.hasTag("persistent")) entity.remove();
//             }
//             // Clear sensor residue
//             const levelCloneInfo = Utilities.levelCloneInfo[`level_-1`];
//             Utilities.fillBlocks(new Vector(levelCloneInfo.startX, Utilities.cameraMappingHeight - 4, levelCloneInfo.startZ), new Vector(levelCloneInfo.endX, Utilities.cameraMappingHeight - 4, levelCloneInfo.endZ), "air");
//             overworld.runCommand(`fill ${levelCloneInfo.startX} ${Utilities.levelHeight} ${levelCloneInfo.startZ} ${levelCloneInfo.endX} ${Utilities.levelHeight} ${levelCloneInfo.endZ} air replace theheist:robot_path`);
//             overworld.runCommand(`clone ${levelCloneInfo.startX} ${Utilities.floorCloneHeight} ${levelCloneInfo.startZ} ${levelCloneInfo.endX} ${Utilities.floorCloneHeight} ${levelCloneInfo.endZ} ${levelCloneInfo.startX} ${Utilities.levelHeight - 1} ${levelCloneInfo.startZ}`);

//             // // Camera 0
//             // const camera0 = overworld.spawnEntity("armor_stand", { "x": 3066.5, "y": cameraHeight, "z": 105.5 });
//             // camera0.setRotation({ "x": 0, "y": 180 });
//             // overworld.spawnEntity("theheist:camera", { "x": 3066.5, "y": -58, "z": 105.5 }).setRotation({ "x": 0, "y": 180 });
//             // const camera0DataNode = {
//             // 	"name": "cameraTracker",
//             // 	"isRobot": false,
//             // 	"rotation": 180,
//             // 	"disabled": false,
//             // 	"cameraID": 0,
//             // 	"type": "camera"
//             // };
//             // DataManager.setData(camera0, camera0DataNode);
//             // // Camera 1
//             // const camera1 = overworld.spawnEntity("armor_stand", { "x": 3061.5, "y": cameraHeight, "z": 147.5 });
//             // camera1.setRotation({ "x": 0, "y": -85 });
//             // overworld.spawnEntity("theheist:camera", { "x": 3061.5, "y": -58, "z": 147.5 }).setRotation({ "x": 0, "y": -85 });
//             // const camera1DataNode = {
//             // 	"name": "cameraTracker",
//             // 	"isRobot": false,
//             // 	"rotation": 20,
//             // 	"swivel": [1, -85, 85],
//             // 	"disabled": false,
//             // 	"cameraID": 1,
//             // 	"type": "camera"
//             // };
//             // DataManager.setData(camera1, camera1DataNode);
//             // // Camera 2
//             // const camera2 = overworld.spawnEntity("armor_stand", { "x": 3080.5, "y": cameraHeight, "z": 127.5 });
//             // camera2.setRotation({ "x": 0, "y": 150 });
//             // overworld.spawnEntity("theheist:camera", { "x": 3080.5, "y": -58, "z": 127.5 }).setRotation({ "x": 0, "y": 150 });
//             // const camera2DataNode = {
//             // 	"name": "cameraTracker",
//             // 	"isRobot": false,
//             // 	"rotation": 150,
//             // 	"swivel": [0, 30, 150],
//             // 	"disabled": false,
//             // 	"cameraID": 2,
//             // 	"type": "camera"
//             // };
//             // DataManager.setData(camera2, camera2DataNode);
//             // // Camera 3
//             // const camera3 = overworld.spawnEntity("armor_stand", { "x": 3064.5, "y": cameraHeight, "z": 127.5 });
//             // camera3.setRotation({ "x": 0, "y": -30 });
//             // overworld.spawnEntity("theheist:camera", { "x": 3064.5, "y": -58, "z": 127.5 }).setRotation({ "x": 0, "y": -30 });
//             // const camera3DataNode = {
//             // 	"name": "cameraTracker",
//             // 	"isRobot": false,
//             // 	"rotation": -30,
//             // 	"swivel": [0, -150, -30],
//             // 	"disabled": false,
//             // 	"cameraID": 3,
//             // 	"type": "camera"
//             // };
//             // DataManager.setData(camera3, camera3DataNode);
//             // // Camera 4
//             // const camera4 = overworld.spawnEntity("armor_stand", { "x": 3081.5, "y": cameraHeight, "z": 135.5 });
//             // camera4.setRotation({ "x": 0, "y": -105 });
//             // overworld.spawnEntity("theheist:camera", { "x": 3081.5, "y": -58, "z": 135.5 }).setRotation({ "x": 0, "y": -105 });
//             // const camera4DataNode = {
//             // 	"name": "cameraTracker",
//             // 	"isRobot": false,
//             // 	"rotation": -105,
//             // 	"disabled": false,
//             // 	"cameraID": 4,
//             // 	"type": "camera"
//             // };
//             // DataManager.setData(camera4, camera4DataNode);
//             // // Camera 5
//             // const camera5 = overworld.spawnEntity("armor_stand", { "x": 3108.5, "y": cameraHeight, "z": 129.5 });
//             // camera5.setRotation({ "x": 0, "y": 15 });
//             // overworld.spawnEntity("theheist:camera", { "x": 3108.5, "y": -58, "z": 129.5 }).setRotation({ "x": 0, "y": 15 });
//             // const camera5DataNode = {
//             // 	"name": "cameraTracker",
//             // 	"isRobot": false,
//             // 	"rotation": 15,
//             // 	"swivel": [1, 15, 75],
//             // 	"disabled": false,
//             // 	"cameraID": 5,
//             // 	"type": "camera"
//             // };
//             // DataManager.setData(camera5, camera5DataNode);
//             // // Camera 6
//             // const camera6 = overworld.spawnEntity("armor_stand", { "x": 3045.5, "y": cameraHeight, "z": 115.5 });
//             // camera6.setRotation({ "x": 0, "y": -62 });
//             // overworld.spawnEntity("theheist:camera", { "x": 3045.5, "y": -58, "z": 115.5 }).setRotation({ "x": 0, "y": -62 });
//             // const camera6DataNode = {
//             // 	"name": "cameraTracker",
//             // 	"isRobot": false,
//             // 	"rotation": -62,
//             // 	"swivel": [1, -62, -16],
//             // 	"disabled": false,
//             // 	"cameraID": 6,
//             // 	"type": "camera"
//             // };
//             // DataManager.setData(camera6, camera6DataNode);

//             // // Robot 0
//             // const robot0 = overworld.spawnEntity("armor_stand", { "x": 3088.5, "y": cameraHeight, "z": 134.5 });
//             // robot0.setRotation({ "x": 0, "y": -90 });
//             // overworld.spawnEntity("theheist:camera_robot", { "x": 3088.5, "y": -59.25, "z": 134.5 }).setRotation({ "x": 0, "y": -90 });
//             // const robot0DataNode = {
//             // 	"name": "cameraTracker",
//             // 	"isRobot": true,
//             // 	"isStunned": false,
//             // 	"rotation": -90,
//             // 	"disabled": false,
//             // 	"cameraID": 6,
//             // 	"type": "camera"
//             // };
//             // DataManager.setData(robot0, robot0DataNode);
//             // // Robot 1
//             // const robot1 = overworld.spawnEntity("armor_stand", { "x": 3055.5, "y": cameraHeight, "z": 124.5 });
//             // robot1.setRotation({ "x": 0, "y": 180 });
//             // overworld.spawnEntity("theheist:camera_robot", { "x": 3055.5, "y": -59.25, "z": 124.5 }).setRotation({ "x": 0, "y": 180 });
//             // const robot1DataNode = {
//             // 	"name": "cameraTracker",
//             // 	"isRobot": true,
//             // 	"isStunned": false,
//             // 	"rotation": 180,
//             // 	"disabled": false,
//             // 	"cameraID": 7,
//             // 	"type": "camera"
//             // };
//             // DataManager.setData(robot1, robot1DataNode);

//             // Consoles 0-9
//             {
//             // // Console 0 (Type: Keypad)
//             // const console0 = overworld.spawnEntity("armor_stand", { "x": 3079.5, "y": consolesHeight, "z": 107.5 });
//             // Utilities.setBlock({ x: 3079, y: -59, z: 107 }, "theheist:keypad", { "minecraft:cardinal_direction": "north" });
//             // overworld.spawnEntity("theheist:hover_text", { x: 3079.5, y: -59, z: 107.5 }).nameTag = "Lvl. 1";
//             // Utilities.setBlock({ x: 3078, y: -60, z: 106 }, "theheist:custom_door_1_bottom", { "minecraft:cardinal_direction": "north", "theheist:unlocked": false });
//             // const console0ActionTracker = {
//             // 	"name": "actionTracker",
//             // 	"used": false,
//             // 	"level": 1,
//             // 	"actions": [
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3079, "y": -59, "z": 107, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": 1 } }
//             // 		},
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3079, "y": -59, "z": 107, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": 2 } }, "delay": 40
//             // 		},
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3078, "y": -60, "z": 106, "block": "theheist:custom_door_1_bottom", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": true } }, "delay": 40
//             // 		}
//             // 	]
//             // };
//             // DataManager.setData(console0, console0ActionTracker);
//             // // Console 1 (Type: Computer)
//             // const console1 = overworld.spawnEntity("armor_stand", { "x": 3072.5, "y": consolesHeight, "z": 105.5 });
//             // Utilities.setBlock({ x: 3072, y: -59, z: 105 }, "theheist:computer", { "minecraft:cardinal_direction": "south" });
//             // overworld.spawnEntity("theheist:hover_text", { x: 3072.5, y: -59, z: 105.5 }).nameTag = "Research info";
//             // const console1ActionTracker = {
//             // 	"name": "actionTracker",
//             // 	"used": false,
//             // 	"level": 1,
//             // 	"actions": [
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3072, "y": -59, "z": 105, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": "south", "theheist:unlocked": 1 } }
//             // 		},
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3072, "y": -59, "z": 105, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": "south", "theheist:unlocked": 2 } }, "delay": 40
//             // 		},
//             // 		{
//             // 			"type": "display_research", "do": { "researchID": 100 }, "delay": 40
//             // 		}
//             // 	]
//             // };
//             // DataManager.setData(console1, console1ActionTracker);
//             // // Console 2 (Type: New Gameband)
//             // const console2 = overworld.spawnEntity("armor_stand", { "x": 3074.5, "y": consolesHeight, "z": 100.5 });
//             // Utilities.setBlock({ x: 3074, y: -59, z: 100 }, "theheist:sensor_mode_display", { "minecraft:cardinal_direction": "north" });
//             // const console2ActionTracker = {
//             // 	"name": "actionTracker",
//             // 	"used": false,
//             // 	"level": 0,
//             // 	"actions": [
//             // 		{
//             // 			"type": "new_gameband", "do": {
//             // 				"displayBlock": { "x": 3074, "y": -59, "z": 100 },
//             // 				"mode": "sensor",
//             // 				"modeText": "§6§lSensor",
//             // 				"level": 1,
//             // 				"slot": 2
//             // 			}
//             // 		},
//             // 		{
//             // 			"type": "manage_objectives", "do": { "manageType": 2, "objective": "Get Sensor mode" }
//             // 		}
//             // 	]
//             // };
//             // DataManager.setData(console2, console2ActionTracker);
//             // // Console 3 (Type: Keypad)
//             // const console3 = overworld.spawnEntity("armor_stand", { "x": 3074.5, "y": consolesHeight, "z": 116.5 });
//             // Utilities.setBlock({ x: 3074, y: -59, z: 116 }, "theheist:keypad", { "minecraft:cardinal_direction": "east" });
//             // overworld.spawnEntity("theheist:hover_text", { x: 3074.5, y: -59, z: 116.5 }).nameTag = "Lvl. 3";
//             // const console3ActionTracker = {
//             // 	"name": "actionTracker",
//             // 	"used": false,
//             // 	"level": 3,
//             // 	"actions": []
//             // };
//             // DataManager.setData(console3, console3ActionTracker);
//             // // Console 4 (Type: Keypad)
//             // const console4 = overworld.spawnEntity("armor_stand", { "x": 3052.5, "y": consolesHeight, "z": 115.5 });
//             // Utilities.setBlock({ x: 3052, y: -59, z: 115 }, "theheist:keypad", { "minecraft:cardinal_direction": "north" });
//             // overworld.spawnEntity("theheist:hover_text", { x: 3052.5, y: -59, z: 115.5 }).nameTag = "Lvl. 1";
//             // Utilities.setBlock({ x: 3051, y: -60, z: 114 }, "theheist:custom_door_1_bottom", { "minecraft:cardinal_direction": "north", "theheist:unlocked": false });
//             // const console4ActionTracker = {
//             // 	"name": "actionTracker",
//             // 	"used": false,
//             // 	"level": 1,
//             // 	"actions": [
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3052, "y": -59, "z": 115, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": 1 } }
//             // 		},
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3052, "y": -59, "z": 115, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": 2 } }, "delay": 40
//             // 		},
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3051, "y": -60, "z": 114, "block": "theheist:custom_door_1_bottom", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": true } }, "delay": 40
//             // 		}
//             // 	]
//             // };
//             // DataManager.setData(console4, console4ActionTracker);
//             // // Console 5 (Type: Computer)
//             // const console5 = overworld.spawnEntity("armor_stand", { "x": 3045.5, "y": consolesHeight, "z": 111.5 });
//             // Utilities.setBlock({ x: 3045, y: -59, z: 111 }, "theheist:computer", { "minecraft:cardinal_direction": "west" });
//             // overworld.spawnEntity("theheist:hover_text", { x: 3045.5, y: -59, z: 111.5 }).nameTag = "Mail";
//             // const console5ActionTracker = {
//             // 	"name": "actionTracker",
//             // 	"used": false,
//             // 	"level": 1,
//             // 	"actions": [
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3045, "y": -59, "z": 111, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": "west", "theheist:unlocked": 1 } }
//             // 		},
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3045, "y": -59, "z": 111, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": "west", "theheist:unlocked": 2 } }, "delay": 40
//             // 		},
//             // 		{
//             // 			"type": "display_mail", "do": { "mailID": 103 }, "delay": 40
//             // 		}
//             // 	]
//             // };
//             // DataManager.setData(console5, console5ActionTracker);
//             // // Console 6 (Type: Keypad)
//             // const console6 = overworld.spawnEntity("armor_stand", { "x": 3074.5, "y": consolesHeight, "z": 139.5 });
//             // Utilities.setBlock({ x: 3074, y: -59, z: 139 }, "theheist:keypad", { "minecraft:cardinal_direction": "east" });
//             // overworld.spawnEntity("theheist:hover_text", { x: 3074.5, y: -59, z: 139.5 }).nameTag = "Lvl. 1";
//             // Utilities.setBlock({ x: 3075, y: -60, z: 140 }, "theheist:custom_door_1_bottom", { "minecraft:cardinal_direction": "east", "theheist:unlocked": false });
//             // const console6ActionTracker = {
//             // 	"name": "actionTracker",
//             // 	"used": false,
//             // 	"level": 1,
//             // 	"actions": [
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3074, "y": -59, "z": 139, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": "east", "theheist:unlocked": 1 } }
//             // 		},
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3074, "y": -59, "z": 139, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": "east", "theheist:unlocked": 2 } }, "delay": 40
//             // 		},
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3075, "y": -60, "z": 140, "block": "theheist:custom_door_1_bottom", "permutations": { "minecraft:cardinal_direction": "east", "theheist:unlocked": true } }, "delay": 40
//             // 		}
//             // 	]
//             // };
//             // DataManager.setData(console6, console6ActionTracker);
//             // // Console 7 (Type: Computer)
//             // const console7 = overworld.spawnEntity("armor_stand", { "x": 3080.5, "y": consolesHeight, "z": 142.5 });
//             // Utilities.setBlock({ x: 3080, y: -59, z: 142 }, "theheist:computer", { "minecraft:cardinal_direction": "south" });
//             // overworld.spawnEntity("theheist:hover_text", { x: 3080.5, y: -59, z: 142.5 }).nameTag = "Clear alarm status";
//             // const console7ActionTracker = {
//             // 	"name": "actionTracker",
//             // 	"used": false,
//             // 	"level": 1,
//             // 	"actions": [
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3080, "y": -59, "z": 142, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": "south", "theheist:unlocked": 1 } }
//             // 		},
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3080, "y": -59, "z": 142, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": "south", "theheist:unlocked": 2 } }, "delay": 40
//             // 		},
//             // 		{
//             // 			"type": "set_alarm_level", "do": { "value": 0 }, "delay": 40
//             // 		}
//             // 	]
//             // };
//             // DataManager.setData(console7, console7ActionTracker);
//             // // Console 8 (Type: Computer)
//             // const console8 = overworld.spawnEntity("armor_stand", { "x": 3082.5, "y": consolesHeight, "z": 118.5 });
//             // Utilities.setBlock({ x: 3082, y: -59, z: 118 }, "theheist:computer", { "minecraft:cardinal_direction": "east" });
//             // overworld.spawnEntity("theheist:hover_text", { x: 3082.5, y: -59, z: 118.5 }).nameTag = "Mail";
//             // const console8ActionTracker = {
//             // 	"name": "actionTracker",
//             // 	"used": false,
//             // 	"level": 1,
//             // 	"actions": [
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3082, "y": -59, "z": 118, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": "east", "theheist:unlocked": 1 } }
//             // 		},
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3082, "y": -59, "z": 118, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": "east", "theheist:unlocked": 2 } }, "delay": 40
//             // 		},
//             // 		{
//             // 			"type": "display_mail", "do": { "mailID": 104 }, "delay": 40
//             // 		},
//             // 		{
//             // 			"type": "manage_objectives", "do": { "manageType": 1, "objective": "Find Yellow Keycard", "sortOrder": 1 }, "delay": 40
//             // 		},
//             // 		{
//             // 			"type": "manage_objectives", "do": { "manageType": 1, "objective": "Find Green Keycard", "sortOrder": 0 }, "delay": 40
//             // 		}
//             // 	]
//             // };
//             // DataManager.setData(console8, console8ActionTracker);
//             // // Console 9 (Type: Keypad)
//             // const console9 = overworld.spawnEntity("armor_stand", { "x": 3104.5, "y": consolesHeight, "z": 116.5 });
//             // Utilities.setBlock({ x: 3104, y: -59, z: 116 }, "theheist:keypad", { "minecraft:cardinal_direction": "west" });
//             // overworld.spawnEntity("theheist:hover_text", { x: 3104.5, y: -59, z: 116.5 }).nameTag = "Lvl. 2";
//             // Utilities.setBlock({ x: 3103, y: -60, z: 115 }, "theheist:custom_door_2_bottom", { "minecraft:cardinal_direction": "west", "theheist:unlocked": false });
//             // const console9ActionTracker = {
//             // 	"name": "actionTracker",
//             // 	"used": false,
//             // 	"level": 2,
//             // 	"actions": [
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3104, "y": -59, "z": 116, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": "west", "theheist:unlocked": 1 } }
//             // 		},
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3104, "y": -59, "z": 116, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": "west", "theheist:unlocked": 2 } }, "delay": 40
//             // 		},
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3103, "y": -60, "z": 115, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "west", "theheist:unlocked": true } }, "delay": 40
//             // 		},
//             // 		{
//             // 			"type": "hack_console", "do": { "x": 3097, "z": 123 }, "delay": 40
//             // 		}
//             // 	]
//             // };
//             // DataManager.setData(console9, console9ActionTracker);
//             }
//             // // Console 10 (Type: Keypad)
//             // const console10 = overworld.spawnEntity("armor_stand", { "x": 3097.5, "y": consolesHeight, "z": 123.5 });
//             // Utilities.setBlock({ x: 3097, y: -59, z: 123 }, "theheist:keypad", { "minecraft:cardinal_direction": "north" });
//             // overworld.spawnEntity("theheist:hover_text", { x: 3097.5, y: -59, z: 123.5 }).nameTag = "Lvl. 2";
//             // Utilities.setBlock({ x: 3096, y: -60, z: 122 }, "theheist:custom_door_2_bottom", { "minecraft:cardinal_direction": "north", "theheist:unlocked": false });
//             // const console10ActionTracker = {
//             // 	"name": "actionTracker",
//             // 	"used": false,
//             // 	"level": 2,
//             // 	"actions": [
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3097, "y": -59, "z": 123, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": 1 } }
//             // 		},
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3097, "y": -59, "z": 123, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": 2 } }, "delay": 40
//             // 		},
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3096, "y": -60, "z": 122, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": true } }, "delay": 40
//             // 		},
//             // 		{
//             // 			"type": "hack_console", "do": { "x": 3104, "z": 116 }, "delay": 40
//             // 		}
//             // 	]
//             // };
//             // DataManager.setData(console10, console10ActionTracker);
//             // // Console 11 (Type: Computer)
//             // const console11 = overworld.spawnEntity("armor_stand", { "x": 3097.5, "y": consolesHeight, "z": 114.5 });
//             // Utilities.setBlock({ x: 3097, y: -59, z: 114 }, "theheist:computer", { "minecraft:cardinal_direction": "north" });
//             // overworld.spawnEntity("theheist:hover_text", { x: 3097.5, y: -59, z: 114.5 }).nameTag = "Research info";
//             // const console11ActionTracker = {
//             // 	"name": "actionTracker",
//             // 	"used": false,
//             // 	"level": 1,
//             // 	"actions": [
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3097, "y": -59, "z": 114, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": 1 } }
//             // 		},
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3097, "y": -59, "z": 114, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": 2 } }, "delay": 40
//             // 		},
//             // 		{
//             // 			"type": "display_research", "do": { "researchID": 101 }, "delay": 40
//             // 		}
//             // 	]
//             // };
//             // DataManager.setData(console11, console11ActionTracker);
//             // // Console 12 (Type: Gameband Upgrade)
//             // const console12 = overworld.spawnEntity("armor_stand", { "x": 3105.5, "y": consolesHeight, "z": 117.5 });
//             // Utilities.setBlock({ x: 3106, y: -59, z: 117 }, "theheist:hacking_mode_display", { "minecraft:cardinal_direction": "east" });
//             // const console12ActionTracker = {
//             // 	"name": "actionTracker",
//             // 	"used": false,
//             // 	"level": 0,
//             // 	"actions": [
//             // 		{
//             // 			"type": "upgrade_gameband", "do": {
//             // 				"displayBlock": { "x": 3106, "y": -59, "z": 117 },
//             // 				"mode": "hacking",
//             // 				"modeText": "§2§lHacking Lvl. 2",
//             // 				"level": 2,
//             // 				"slot": 1
//             // 			}
//             // 		},
//             // 		{
//             // 			"type": "manage_objectives", "do": { "manageType": 2, "objective": "Get Hacking upgrade" }
//             // 		}
//             // 	]
//             // };
//             // DataManager.setData(console12, console12ActionTracker);
//             // // Console 13 (Type: Keypad)
//             // const console13 = overworld.spawnEntity("armor_stand", { "x": 3062.5, "y": consolesHeight, "z": 150.5 });
//             // Utilities.setBlock({ x: 3062, y: -59, z: 150 }, "theheist:keypad", { "minecraft:cardinal_direction": "south" });
//             // overworld.spawnEntity("theheist:hover_text", { x: 3062.5, y: -59, z: 150.5 }).nameTag = "Lvl. 2";
//             // Utilities.setBlock({ x: 3061, y: -60, z: 151 }, "theheist:custom_door_2_bottom", { "minecraft:cardinal_direction": "south", "theheist:unlocked": false });
//             // const console13ActionTracker = {
//             // 	"name": "actionTracker",
//             // 	"used": false,
//             // 	"level": 2,
//             // 	"actions": [
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3062, "y": -59, "z": 150, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": "south", "theheist:unlocked": 1 } }
//             // 		},
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3062, "y": -59, "z": 150, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": "south", "theheist:unlocked": 2 } }, "delay": 40
//             // 		},
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3061, "y": -60, "z": 151, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "south", "theheist:unlocked": true } }, "delay": 40
//             // 		}
//             // 	]
//             // };
//             // DataManager.setData(console13, console13ActionTracker);
//             // // Console 14 (Type: Computer)
//             // const console14 = overworld.spawnEntity("armor_stand", { "x": 3058.5, "y": consolesHeight, "z": 156.5 });
//             // Utilities.setBlock({ x: 3058, y: -59, z: 156 }, "theheist:computer", { "minecraft:cardinal_direction": "west" });
//             // overworld.spawnEntity("theheist:hover_text", { x: 3058.5, y: -59, z: 156.5 }).nameTag = "Research info";
//             // const console14ActionTracker = {
//             // 	"name": "actionTracker",
//             // 	"used": false,
//             // 	"level": 1,
//             // 	"actions": [
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3058, "y": -59, "z": 156, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": "west", "theheist:unlocked": 1 } }
//             // 		},
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3058, "y": -59, "z": 156, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": "west", "theheist:unlocked": 2 } }, "delay": 40
//             // 		},
//             // 		{
//             // 			"type": "display_research", "do": { "researchID": 102 }, "delay": 40
//             // 		}
//             // 	]
//             // };
//             // DataManager.setData(console14, console14ActionTracker);
//             // // Console 15 (Type: Gameband Upgrade)
//             // const console15 = overworld.spawnEntity("armor_stand", { "x": 3063.5, "y": consolesHeight, "z": 159.5 });
//             // Utilities.setBlock({ x: 3063, y: -59, z: 159 }, "theheist:recharge_mode_display", { "minecraft:cardinal_direction": "south" });
//             // const console15ActionTracker = {
//             // 	"name": "actionTracker",
//             // 	"used": false,
//             // 	"level": 0,
//             // 	"actions": [
//             // 		{
//             // 			"type": "upgrade_gameband", "do": {
//             // 				"displayBlock": { "x": 3063, "y": -59, "z": 159 },
//             // 				"mode": "recharge",
//             // 				"modeText": "§1§lRecharge Lvl. 2",
//             // 				"level": 2,
//             // 				"slot": 0
//             // 			}
//             // 		},
//             // 		{
//             // 			"type": "manage_objectives", "do": { "manageType": 2, "objective": "Get Recharge upgrade" }
//             // 		}
//             // 	]
//             // };
//             // DataManager.setData(console15, console15ActionTracker);
//             // // Console 16 (Type: Keycard Reader)
//             // const console16 = overworld.spawnEntity("armor_stand", { "x": 3039.5, "y": consolesHeight, "z": 129.5 });
//             // Utilities.setBlock({ x: 3038, y: -60, z: 131 }, "theheist:custom_door_2_bottom", { "minecraft:cardinal_direction": "west", "theheist:unlocked": false });
//             // const console16ActionTracker = {
//             // 	"name": "actionTracker",
//             // 	"used": false,
//             // 	"isKeycardReader": true,
//             // 	"keycardType": "yellow",
//             // 	"actions": [
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3038, "y": -60, "z": 131, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "west", "theheist:unlocked": true, "theheist:open": true } }
//             // 		},
//             // 		{
//             // 			"type": "play_sound", "do": { "soundID": "random.door_open" }
//             // 		}
//             // 	]
//             // };
//             // DataManager.setData(console16, console16ActionTracker);
//             // // Console 17 (Type: Keycard Reader)
//             // const console17 = overworld.spawnEntity("armor_stand", { "x": 3087.5, "y": consolesHeight, "z": 131.5 });
//             // Utilities.setBlock(new Vector(3089, -60, 130), "theheist:custom_door_4_bottom_l", { "minecraft:cardinal_direction": "north", "theheist:unlocked": false });
//             // Utilities.setBlock(new Vector(3090, -60, 130), "theheist:custom_door_4_bottom_r", { "minecraft:cardinal_direction": "north", "theheist:unlocked": false });
//             // const console17ActionTracker = {
//             // 	"name": "actionTracker",
//             // 	"used": false,
//             // 	"isKeycardReader": true,
//             // 	"keycardType": "green",
//             // 	"actions": [
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3089, "y": -60, "z": 130, "block": "theheist:custom_door_4_bottom_l", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": true, "theheist:open": true } }
//             // 		},
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3090, "y": -60, "z": 130, "block": "theheist:custom_door_4_bottom_r", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": true, "theheist:open": true  } }
//             // 		},
//             // 		{
//             // 			"type": "play_sound", "do": { "soundID": "random.door_open" }
//             // 		},
//             // 		{
//             // 			"type": "manage_objectives", "do": { "manageType": 2, "objective": "Access next level" }
//             // 		},
//             // 		{
//             // 			"type": "voice_says", "do": { "soundID": 204 }
//             // 		}
//             // 	]
//             // };
//             // DataManager.setData(console17, console17ActionTracker);
//             // // Console 18 (Type: Computer)
//             // const console18 = overworld.spawnEntity("armor_stand", { "x": 3081.5, "y": consolesHeight, "z": 137.5 });
//             // Utilities.setBlock({ x: 3081, y: -59, z: 137 }, "theheist:computer", { "minecraft:cardinal_direction": "north" });
//             // overworld.spawnEntity("theheist:hover_text", { x: 3081.5, y: -59, z: 137.5 }).nameTag = "Disable nearby camera";
//             // const console18ActionTracker = {
//             // 	"name": "actionTracker",
//             // 	"used": false,
//             // 	"level": 1,
//             // 	"actions": [
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3081, "y": -59, "z": 137, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": 1 } }
//             // 		},
//             // 		{
//             // 			"type": "set_block", "do": { "x": 3081, "y": -59, "z": 137, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": 2 } }, "delay": 40
//             // 		},
//             // 		{
//             // 			"type": "disable_camera", "do": { "cameraID": 4 }, "delay": 40
//             // 		}
//             // 	]
//             // };
//             // DataManager.setData(console18, console18ActionTracker);

//             // // Recharge Station 0
//             // const recharge0 = overworld.spawnEntity("minecraft:armor_stand", new Vector(3070.5, rechargeHeight, 110.5));
//             // Utilities.setBlock({ x: 3070, y: -60, z: 110 }, "theheist:recharge_station", { "minecraft:cardinal_direction": "west" });
//             // const recharge0DataNode = {
//             // 	"name": "energyTracker",
//             // 	"rechargerID": 0,
//             // 	"energyUnits": 100.0,
//             // 	"block": { "x": 3070, "y": -60, "z": 110, "rotation": 4 }
//             // };
//             // DataManager.setData(recharge0, recharge0DataNode);
//             // // Recharge Station 1
//             // const recharge1 = overworld.spawnEntity("minecraft:armor_stand", new Vector(3100.5, rechargeHeight, 121.5));
//             // Utilities.setBlock({ x: 3100, y: -60, z: 121 }, "theheist:recharge_station", { "minecraft:cardinal_direction": "south" });
//             // const recharge1DataNode = {
//             // 	"name": "energyTracker",
//             // 	"rechargerID": 1,
//             // 	"energyUnits": 100.0,
//             // 	"block": { "x": 3100, "y": -60, "z": 121, "rotation": 3 }
//             // };
//             // DataManager.setData(recharge1, recharge1DataNode);
//             // // Recharge Station 2
//             // const recharge2 = overworld.spawnEntity("minecraft:armor_stand", new Vector(3061.5, rechargeHeight, 138.5));
//             // Utilities.setBlock({ x: 3061, y: -60, z: 138 }, "theheist:recharge_station", { "minecraft:cardinal_direction": "north" });
//             // const recharge2DataNode = {
//             // 	"name": "energyTracker",
//             // 	"rechargerID": 2,
//             // 	"energyUnits": 100.0,
//             // 	"block": { "x": 3061, "y": -60, "z": 138, "rotation": 2 }
//             // };
//             // DataManager.setData(recharge2, recharge2DataNode);
//             // // Recharge Station 3
//             // const recharge3 = overworld.spawnEntity("minecraft:armor_stand", new Vector(3077.5, rechargeHeight, 119.5));
//             // Utilities.setBlock({ x: 3077, y: -60, z: 119 }, "theheist:recharge_station", { "minecraft:cardinal_direction": "south" });
//             // const recharge3DataNode = {
//             // 	"name": "energyTracker",
//             // 	"rechargerID": 3,
//             // 	"energyUnits": 100.0,
//             // 	"block": { "x": 3077, "y": -60, "z": 119, "rotation": 3 }
//             // };
//             // DataManager.setData(recharge3, recharge3DataNode);
//             // // Recharge Station 4
//             // const recharge4 = overworld.spawnEntity("minecraft:armor_stand", new Vector(3091.5, rechargeHeight, 128.5));
//             // Utilities.setBlock({ x: 3091, y: -60, z: 128 }, "theheist:recharge_station", { "minecraft:cardinal_direction": "east" });
//             // const recharge4DataNode = {
//             // 	"name": "energyTracker",
//             // 	"rechargerID": 4,
//             // 	"energyUnits": 100.0,
//             // 	"block": { "x": 3091, "y": -60, "z": 128, "rotation": "east" }
//             // };
//             // DataManager.setData(recharge4, recharge4DataNode);

//             // // Decorations & Miscellaneous
//             // Utilities.dimensions.overworld.setBlockType(new Vector(3073, -55, 127), "minecraft:redstone_block");
//             // Utilities.setBlock(new Vector(3090, -59, 124), "minecraft:lever", { "lever_direction": "south" });
//             // Utilities.dimensions.overworld.spawnEntity("theheist:camera_robot", new Vector(3053.5, -59, 110.5)).setRotation({ "x": 0, "y": 180 });
//             // const decorativeCamera0 = Utilities.dimensions.overworld.spawnEntity("theheist:camera", new Vector(3034.5, -59, 141.5));
//             // decorativeCamera0.setRotation({ "x": 0, "y": 180 });
//             // decorativeCamera0.triggerEvent("theheist:disable");
//             // const decorativeCamera1 = Utilities.dimensions.overworld.spawnEntity("theheist:camera", new Vector(3035.5, -59, 141.5));
//             // decorativeCamera1.setRotation({ "x": 0, "y": 180 });
//             // decorativeCamera1.triggerEvent("theheist:disable");
//             // const decorativeCamera2 = Utilities.dimensions.overworld.spawnEntity("theheist:camera", new Vector(3036.5, -59, 141.5));
//             // decorativeCamera2.setRotation({ "x": 0, "y": 180 });
//             // decorativeCamera2.triggerEvent("theheist:disable");
            
//             // // Fill drawers
//             // const drawer0InventoryContainer = overworld.getBlock(new Vector(3058, -60, 157))?.getComponent("inventory")!.container as Container;
//             // drawer0InventoryContainer.clearAll();
//             // drawer0InventoryContainer.setItem(4, new ItemStack("minecraft:yellow_dye"));
//             // const drawer1InventoryContainer = overworld.getBlock(new Vector(3033, -60, 130))?.getComponent("inventory")!.container as Container;
//             // drawer1InventoryContainer.clearAll();
//             // drawer1InventoryContainer.setItem(4, new ItemStack("minecraft:green_dye"));

//         }, SECOND * 7.5);
//         break;
//     }