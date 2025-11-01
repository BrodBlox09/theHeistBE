import { ItemStack, Player, system, world, DisplaySlotId, BlockInventoryComponent, BlockPermutation, Container, ItemLockMode } from "@minecraft/server";
import Vector from "../Vector";
import DataManager from "../DataManager";
import Utilities from "../Utilities";
import LevelConstructor from "./LevelConstructor";
import VoiceOverManager from "../VoiceOverManager";

const level: ILevel = {
"levelID": "0",
"loadElevatorLoc": new Vector(0, 0, 0),
"customLoadingArea": {
    "waitForLoadLevel": true,
    "playerLoadingLocation": new Vector(2013.5, -53, 53.5)
},
"startPlayerLoc": new Vector(2013.5, -52, 56.5),
"startingItems": [{ "slot": 0, "typeId": 'theheist:recharge_mode_lvl_1', "lockMode": "slot" }, { "slot": 1, "typeId": 'theheist:hacking_mode_lvl_1', "lockMode": "slot" }],
"rechargeLevel": 1,
"startObjectives": [],
setup: () => {

var cameraHeight = Utilities.cameraHeight;
var consolesHeight = Utilities.consolesHeight;
var rechargeHeight = Utilities.rechargeHeight;

// Camera 0
const camera0 = Utilities.spawnEntity({ "x": 2014.5, "y": cameraHeight, "z": 51.5 }, "minecraft:armor_stand");
camera0.setRotation({ "x": 0, "y": 13 });
Utilities.spawnEntity({ "x": 2014.5, "y": -58, "z": 51.5 }, "theheist:camera").setRotation({ "x": 0, "y": 10 });
const camera0DataNode = {
    "name": "cameraTracker",
    "isRobot": false,
    "rotation": 10,
    "disabled": false,
    "cameraID": 0,
    "type": "camera"
};
DataManager.setData(camera0, camera0DataNode);
// Camera 1
const camera1 = Utilities.spawnEntity({ "x": 2005.5, "y": cameraHeight, "z": 52.5 }, "armor_stand");
camera1.setRotation({ "x": 0, "y": 150 });
Utilities.spawnEntity({ "x": 2005.5, "y": -58, "z": 52.5 }, "theheist:camera").setRotation({ "x": 0, "y": 150 });
const camera1DataNode = {
    "name": "cameraTracker",
    "isRobot": false,
    "rotation": 150,
    "disabled": false,
    "cameraID": 1,
    "type": "camera"
};
DataManager.setData(camera1, camera1DataNode);
// Camera 2
const camera2 = Utilities.spawnEntity({ "x": 1991.5, "y": cameraHeight, "z": 52.5 }, "armor_stand");
camera2.setRotation({ "x": 0, "y": 210 });
Utilities.spawnEntity({ "x": 1991.5, "y": -58, "z": 52.5 }, "theheist:camera").setRotation({ "x": 0, "y": 210 });
const camera2DataNode = {
    "name": "cameraTracker",
    "isRobot": false,
    "rotation": 210,
    "disabled": false,
    "cameraID": 2,
    "type": "camera"
};
DataManager.setData(camera2, camera2DataNode);
// Camera 3
const camera3 = Utilities.spawnEntity({ "x": 2014.5, "y": cameraHeight, "z": 67.5 }, "armor_stand");
camera3.setRotation({ "x": 0, "y": 100 });
Utilities.spawnEntity({ "x": 2014.5, "y": -58, "z": 67.5 }, "theheist:camera").setRotation({ "x": 0, "y": 100 });
const camera3DataNode = {
    "name": "cameraTracker",
    "isRobot": false,
    "rotation": 100,
    "disabled": false,
    "cameraID": 3,
    "type": "camera"
};
DataManager.setData(camera3, camera3DataNode);
// Camera 4
const camera4 = Utilities.spawnEntity({ "x": 2010.5, "y": cameraHeight, "z": 76.5 }, "armor_stand");
camera4.setRotation({ "x": 4, "y": 190 });
Utilities.spawnEntity({ "x": 2010.5, "y": -58, "z": 76.5 }, "theheist:camera").setRotation({ "x": 0, "y": 190 });
const camera4DataNode = {
    "name": "cameraTracker",
    "isRobot": false,
    "rotation": 190,
    "disabled": false,
    "cameraID": 4,
    "type": "camera"
};
DataManager.setData(camera4, camera4DataNode);
// Camera 5
const camera5 = Utilities.spawnEntity({ "x": 1992.5, "y": cameraHeight, "z": 59.5 }, "armor_stand");
camera5.setRotation({ "x": 0, "y": 20 });
Utilities.spawnEntity({ "x": 1992.5, "y": -58, "z": 59.5 }, "theheist:camera").setRotation({ "x": 0, "y": 20 });
const camera5DataNode = {
    "name": "cameraTracker",
    "isRobot": false,
    "rotation": 20,
    "swivel": [1, 20, 140],
    "disabled": false,
    "cameraID": 5,
    "type": "camera"
};
DataManager.setData(camera5, camera5DataNode);
// Console 0 (Type: Computer)
const console0 = Utilities.spawnEntity({ "x": 2020.5, "y": consolesHeight, "z": 54.5 }, "armor_stand");
Utilities.setBlock({ x: 2020, y: -59, z: 54 }, "theheist:computer", { "minecraft:cardinal_direction": "east" });
Utilities.spawnEntity({ x: 2020.5, y: -59, z: 54.5 }, "theheist:hover_text").nameTag = "Disable nearby camera";
const console0ActionTracker = {
    "name": "actionTracker",
    "used": false,
    "level": 1,
    "actions": [
        {
            "type": "set_block", "do": { "x": 2020, "y": -59, "z": 54, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": "east", "theheist:unlocked": 1 } }
        },
        {
            "type": "set_block", "do": { "x": 2020, "y": -59, "z": 54, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": "east", "theheist:unlocked": 2 } }, "delay": 40
        },
        {
            "type": "disable_camera", "do": { "cameraID": 0 }, "delay": 40
        },
        {
            "type": "voice_says", "do": { "soundID": "103" }, "delay": 40
        },
        {
            "type": "manage_objective", "do": { "manageType": 1, "objective": "Break into Director's office", "sortOrder": 0 }, "delay": 40
        }
    ]
};
DataManager.setData(console0, console0ActionTracker);
// Console 1 (Type: Computer)
const console1 = Utilities.spawnEntity({ "x": 2017.5, "y": consolesHeight, "z": 52.5 }, "armor_stand");
Utilities.setBlock({ x: 2017, y: -59, z: 52 }, "theheist:computer", { "minecraft:cardinal_direction": "north" });
Utilities.spawnEntity({ x: 2017.5, y: -59, z: 52.5 }, "theheist:hover_text").nameTag = "Clear alarm status";
const console1ActionTracker = {
    "name": "actionTracker",
    "used": false,
    "level": 1,
    "actions": [
        {
            "type": "set_block", "do": { "x": 2017, "y": -59, "z": 52, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": 1 } }
        },
        {
            "type": "set_block", "do": { "x": 2017, "y": -59, "z": 52, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": 2 } }, "delay": 40
        },
        {
            "type": "set_alarm_level", "do": { "value": 0 }, "delay": 40
        }
    ]
};
DataManager.setData(console1, console1ActionTracker);
// Console 2 (Type: Keypad)
const console2 = Utilities.spawnEntity({ "x": 2014.5, "y": consolesHeight, "z": 60.5 }, "armor_stand");
Utilities.setBlock({ x: 2014, y: -59, z: 60 }, "theheist:keypad", { "minecraft:cardinal_direction": "east" });
Utilities.spawnEntity({ x: 2014.5, y: -59, z: 60.5 }, "theheist:hover_text").nameTag = "Lvl. 1";
Utilities.setBlock({ x: 2015, y: -60, z: 61 }, "theheist:custom_door_1_bottom", { "minecraft:cardinal_direction": "east", "theheist:unlocked": false });
const console2ActionTracker = {
    "name": "actionTracker",
    "used": false,
    "level": 1,
    "actions": [
        {
            "type": "set_block", "do": { "x": 2014, "y": -59, "z": 60, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": "east", "theheist:unlocked": 1 } }
        },
        {
            "type": "set_block", "do": { "x": 2014, "y": -59, "z": 60, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": "east", "theheist:unlocked": 2 } }, "delay": 40
        },
        {
            "type": "set_block", "do": { "x": 2015, "y": -60, "z": 61, "block": "theheist:custom_door_1_bottom", "permutations": { "minecraft:cardinal_direction": "east", "theheist:unlocked": true } }, "delay": 40
        },
        {
            "type": "manage_objective", "do": { "manageType": 2, "objective": "Break into Director's office", "sortOrder": 0 }, "delay": 40
        }
    ]
};
DataManager.setData(console2, console2ActionTracker);
// Console 3 (Type: Computer)
const console3 = Utilities.spawnEntity({ "x": 2018.5, "y": consolesHeight, "z": 65.5 }, "armor_stand");
Utilities.setBlock({ x: 2018, y: -59, z: 65 }, "theheist:computer", { "minecraft:cardinal_direction": "north" });
Utilities.spawnEntity({ x: 2018.5, y: -59, z: 65.5 }, "theheist:hover_text").nameTag = "Mail";
const console3ActionTracker = {
    "name": "actionTracker",
    "used": false,
    "level": 1,
    "actions": [
        {
            "type": "set_block", "do": { "x": 2018, "y": -59, "z": 65, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": 1 } }
        },
        {
            "type": "set_block", "do": { "x": 2018, "y": -59, "z": 65, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": 2 } }, "delay": 40
        },
        {
            "type": "display_mail", "do": { "mailID": "003" }, "delay": 40
        },
        {
            "type": "voice_says", "do": { "soundID": "104" }, "delay": 40
        },
        {
            "type": "manage_objective", "do": { "manageType": 1, "objective": "Access the elevator", "sortOrder": 1 }, "delay": 40
        }
    ]
};
DataManager.setData(console3, console3ActionTracker);
// Console 4 (Type: Keypad)
const console4 = Utilities.spawnEntity({ "x": 1996.5, "y": consolesHeight, "z": 55.5 }, "armor_stand");
Utilities.setBlock({ x: 1996, y: -59, z: 55 }, "theheist:keypad", { "minecraft:cardinal_direction": "south" });
Utilities.spawnEntity({ x: 1996.5, y: -59, z: 55.5 }, "theheist:hover_text").nameTag = "Lvl. 1";
Utilities.setBlock({ x: 1995, y: -60, z: 56 }, "theheist:custom_door_1_bottom", { "minecraft:cardinal_direction": "south", "theheist:unlocked": false });
const console4ActionTracker = {
    "name": "actionTracker",
    "used": false,
    "level": 1,
    "actions": [
        {
            "type": "set_block", "do": { "x": 1996, "y": -59, "z": 55, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": "south", "theheist:unlocked": 1 } }
        },
        {
            "type": "set_block", "do": { "x": 1996, "y": -59, "z": 55, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": "south", "theheist:unlocked": 2 } }, "delay": 40
        },
        {
            "type": "set_block", "do": { "x": 1995, "y": -60, "z": 56, "block": "theheist:custom_door_1_bottom", "permutations": { "minecraft:cardinal_direction": "south", "theheist:unlocked": true } }, "delay": 40
        },
        {
            // Hack other keypad
            "type": "hack_console", "do": { "x": 1992, "z": 62 }
        }
    ]
};
DataManager.setData(console4, console4ActionTracker);
// Console 5 (Type: Keypad)
const console5 = Utilities.spawnEntity({ "x": 1992.5, "y": consolesHeight, "z": 62.5 }, "minecraft:armor_stand");
Utilities.setBlock({ x: 1992, y: -59, z: 62 }, "theheist:keypad", { "minecraft:cardinal_direction": "east" });
Utilities.spawnEntity({ x: 1992.5, y: -59, z: 62.5 }, "theheist:hover_text").nameTag = "Lvl. 1";
Utilities.setBlock({ x: 1993, y: -60, z: 61 }, "theheist:custom_door_1_bottom", { "minecraft:cardinal_direction": "east", "theheist:unlocked": false });
const console5ActionTracker = {
    "name": "actionTracker",
    "used": false,
    "level": 1,
    "actions": [
        {
            "type": "set_block", "do": { "x": 1992, "y": -59, "z": 62, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": "east", "theheist:unlocked": 1 } }
        },
        {
            "type": "set_block", "do": { "x": 1992, "y": -59, "z": 62, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": "east", "theheist:unlocked": 2 } }, "delay": 40
        },
        {
            "type": "set_block", "do": { "x": 1993, "y": -60, "z": 61, "block": "theheist:custom_door_1_bottom", "permutations": { "minecraft:cardinal_direction": "east", "theheist:unlocked": true } }, "delay": 40
        },
        {
            // Hack other keypad
            "type": "hack_console", "do": { "x": 1996, "z": 56 }
        }
    ]
};
DataManager.setData(console5, console5ActionTracker);
// Console 6 (Type: Computer)
const console6 = Utilities.spawnEntity({ "x": 1978.5, "y": consolesHeight, "z": 64.5 }, "minecraft:armor_stand");
Utilities.setBlock({ x: 1978, y: -59, z: 64 }, "theheist:computer", { "minecraft:cardinal_direction": "south" });
Utilities.spawnEntity({ x: 1978.5, y: -59, z: 64.5 }, "theheist:hover_text").nameTag = "Mail";
const console6ActionTracker = {
    "name": "actionTracker",
    "used": false,
    "level": 1,
    "actions": [
        {
            "type": "set_block", "do": { "x": 1978, "y": -59, "z": 64, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": "south", "theheist:unlocked": 1 } }
        },
        {
            "type": "set_block", "do": { "x": 1978, "y": -59, "z": 64, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": "south", "theheist:unlocked": 2 } }, "delay": 40
        },
        {
            "type": "display_mail", "do": { "mailID": "002" }, "delay": 40
        },
        {
            "type": "voice_says", "do": { "soundID": "107" }, "delay": 40
        }
    ]
};
DataManager.setData(console6, console6ActionTracker);
// Console 7 (Type: Computer)
const console7 = Utilities.spawnEntity({ "x": 1978.5, "y": consolesHeight, "z": 56.5 }, "minecraft:armor_stand");
Utilities.setBlock({ x: 1978, y: -59, z: 56 }, "theheist:computer", { "minecraft:cardinal_direction": "north" });
Utilities.spawnEntity({ x: 1978.5, y: -59, z: 56.5 }, "theheist:hover_text").nameTag = "Mail";
const console7ActionTracker = {
    "name": "actionTracker",
    "used": false,
    "level": 1,
    "actions": [
        {
            "type": "set_block", "do": { "x": 1978, "y": -59, "z": 56, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": 1 } }
        },
        {
            "type": "set_block", "do": { "x": 1978, "y": -59, "z": 56, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": 2 } }, "delay": 40
        },
        {
            "type": "display_mail", "do": { "mailID": "001" }, "delay": 40
        },
        {
            "type": "manage_objective", "do": { "manageType": 1, "objective": "Find Yellow Keycard", "sortOrder": -1 }, "delay": 40
        }
    ]
};
DataManager.setData(console7, console7ActionTracker);
// Console 8 (Type: Keycard Reader)
const console8 = Utilities.spawnEntity({ "x": 1990.5, "y": consolesHeight, "z": 67.5 }, "minecraft:armor_stand");
const console8ActionTracker = {
    "name": "actionTracker",
    "used": false,
    "isKeycardReader": true,
    "keycardType": "yellow",
    "actions": [
        {
            "type": "set_block", "do": { "x": 1988, "y": -60, "z": 68, "block": "theheist:custom_door_4_bottom_l", "permutations": { "minecraft:cardinal_direction": "south", "theheist:unlocked": true, "theheist:open": true } }
        },
        {
            "type": "set_block", "do": { "x": 1987, "y": -60, "z": 68, "block": "theheist:custom_door_4_bottom_r", "permutations": { "minecraft:cardinal_direction": "south", "theheist:unlocked": true, "theheist:open": true  } }
        },
        {
            "type": "voice_says", "do": { "soundID": "109" }
        },
        {
            "type": "manage_objective", "do": { "manageType": 2, "objective": "Access the elevator", "sortOrder": 1 }
        }
    ]
};
DataManager.setData(console8, console8ActionTracker);

// Recharge Station 0
const recharge0 = Utilities.spawnEntity(new Vector(1998.5, rechargeHeight, 72.5), "minecraft:armor_stand");
Utilities.setBlock({ x: 1998, y: -60, z: 72 }, "theheist:recharge_station", { "minecraft:cardinal_direction": "east" });
const recharge0DataNode = {
    "name": "energyTracker",
    "rechargerID": 0,
    "energyUnits": 100.0,
    "block": { "x": 1998, "y": -60, "z": 72, "rotation": "east" }
};
DataManager.setData(recharge0, recharge0DataNode);
// Recharge Station 1
const recharge1 = Utilities.spawnEntity(new Vector(1986.5, rechargeHeight, 70.5), "minecraft:armor_stand");
Utilities.setBlock({ x: 1986, y: -60, z: 70 }, "theheist:recharge_station", { "minecraft:cardinal_direction": "west" });
const recharge1DataNode = {
    "name": "energyTracker",
    "rechargerID": 0,
    "energyUnits": 100.0,
    "block": { "x": 1986, "y": -60, "z": 70, "rotation": "west" }
};
DataManager.setData(recharge1, recharge1DataNode);
// Fill drawers
const drawer0InventoryContainer = Utilities.dimensions.overworld.getBlock({ "x": 2002.5, "y": -60, "z": 75.5 })!.getComponent("inventory")!.container!;
drawer0InventoryContainer.clearAll();
drawer0InventoryContainer.setItem(4, new ItemStack("yellow_dye"));
// Set doors and trapdoors
Utilities.setBlock(new Vector(2007, -57, 56), "theheist:white_trapdoor", { "minecraft:cardinal_direction": "north" });
Utilities.setBlock(new Vector(2006, -60, 57), "minecraft:wooden_door", { "minecraft:cardinal_direction": "north" });
Utilities.setBlock(new Vector(2006, -60, 55), "minecraft:wooden_door", { "minecraft:cardinal_direction": "north" });
Utilities.setBlock(new Vector(2010, -60, 56), "minecraft:wooden_door", { "minecraft:cardinal_direction": "south" });
Utilities.setBlock(new Vector(2015, -60, 56), "minecraft:wooden_door", { "minecraft:cardinal_direction": "south" });
Utilities.setBlock(new Vector(2010, -60, 60), "minecraft:wooden_door", { "minecraft:cardinal_direction": "south" });
Utilities.setBlock(new Vector(2006, -60, 62), "minecraft:wooden_door", { "minecraft:cardinal_direction": "north" });
Utilities.setBlock(new Vector(2007, -57, 60), "theheist:white_trapdoor", { "minecraft:cardinal_direction": "west" });
Utilities.setBlock(new Vector(1985, -60, 51), "minecraft:wooden_door", { "minecraft:cardinal_direction": "south" });
Utilities.setBlock(new Vector(2002, -57, 60), "theheist:white_trapdoor", { "minecraft:cardinal_direction": "west" });

// Reset end level doors
Utilities.setBlock(new Vector(1988, -60, 68), "theheist:custom_door_4_bottom_l", { "minecraft:cardinal_direction": "south", "theheist:unlocked": false });
Utilities.setBlock(new Vector(1987, -60, 68), "theheist:custom_door_4_bottom_r", { "minecraft:cardinal_direction": "south", "theheist:unlocked": false });
Utilities.setBlock(new Vector(1987, -59, 73), "minecraft:lever", { "lever_direction": "north" });

},
onStart: (player: Player) => {

VoiceOverManager.play(player, '004');

},
onLoadStart: (player: Player) => {

VoiceOverManager.play(player, "003");

}
};

export default level;