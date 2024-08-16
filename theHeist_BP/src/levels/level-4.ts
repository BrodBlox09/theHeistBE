import { ItemStack, Player, system, world, DisplaySlotId, BlockInventoryComponent, BlockPermutation, Container, ItemLockMode } from "@minecraft/server";
import Vector from "../Vector";
import DataManager from "../DataManager";
import Utilities from "../Utilities";
import LevelConstructor from "./LevelConstructor";
import VoiceOverManager from "../VoiceOverManager";

// SONAR PING SOUND: /playsound note.pling @s ~~~ 0.4 2

const level: ILevel = {
"levelID": "-4-1",
"loadElevatorLoc": new Vector(5896, -50, 143),
"startPlayerLoc": new Vector(5887, -60, 105),
"tickingAreas": [],
"startingItems": [{ "slot": 0, "typeId": 'theheist:recharge_mode_lvl_2', "lockMode": "slot" }, { "slot": 1, "typeId": 'theheist:hacking_mode_lvl_2', "lockMode": "slot" }, { "slot": 2, "typeId": 'theheist:sensor_mode_lvl_2', "lockMode": "slot" }, { "slot": 3, "typeId": 'theheist:xray_mode_lvl_1', "lockMode": "slot" }, { "slot": 4, "typeId": 'theheist:magnet_mode_lvl_1', "lockMode": "slot" }, { "slot": 5, "typeId": 'theheist:stealth_mode_lvl_1', "lockMode": "slot" }],
"rechargeLevel": 2,
"startObjectives": [{ "name": "Access next level", "sortOrder": 4 }, { "name": "Get Stun mode", "sortOrder": 3 }, { "name": "Get Recharge upgrade", "sortOrder": 2 }, { "name": "Get Xray upgrade", "sortOrder": 1 }],
setup: () => {

{
    LevelConstructor.staticCamera(new Vector(5891.5, -58, 118.5), 142);
    LevelConstructor.dynamicCamera(new Vector(5889.5, -58, 133.5), [1, 100, 250]);
    // Sonar camera here
    // Sonar camera here
    LevelConstructor.cameraRobot(new Vector(5922.5, -59.25, 131.5), 90);
} // Entry Hallway

{
    LevelConstructor.keypad(new Vector(5910.5, -59, 119.5), 3, 3, []);
    LevelConstructor.keypad(new Vector(5910.5, -59, 129.5), 3, 2, []);
    LevelConstructor.computer(new Vector(5911.5, -59, 125.5), "Clear alarm status", 4, [
        {
            "type": "set_alarm_level", "do": { "value": 0 }, "delay": 40
        }
    ]);
    LevelConstructor.rechargeStation(new Vector(5914.5, -60, 124.5), 5);
} // Security Office

{
    Utilities.setBlock(new Vector(5906, -60, 134), "theheist:custom_door_2_bottom", { "theheist:rotation": 3, "theheist:unlocked": false });
    LevelConstructor.keypad(new Vector(5907.5, -59, 133.5), 2, 3, [
        {
            "type": "set_block", "do": { 'x': 5906, 'y': -60, 'z': 134, "block": "theheist:custom_door_2_bottom", "permutations": { "theheist:rotation": 3 } }, "delay": 40
        }
    ]);
    LevelConstructor.computer(new Vector(5898.5, -59, 139.5), "Research info", 4, [
        {
            "type": "display_research", "do": { "researchID": 400 }, "delay": 40
        }
    ]);

    // Sonar camera here
} // Sonar Camera Development

{
    Utilities.setBlock(new Vector(5921, -60, 138), "theheist:custom_door_3_bottom", { "theheist:rotation": 4, "theheist:unlocked": false });
    Utilities.setBlock(new Vector(5920, -60, 138), "theheist:custom_door_3_bottom", { "theheist:rotation": 5, "theheist:unlocked": false });
    LevelConstructor.keycardReader(new Vector(5922.5, -59, 136.5), "red", [
        {
            "type": "set_block", "do": { "x": 5921, "y": -60, "z": 138, "block": "theheist:custom_door_3_bottom", "permutations": { "theheist:rotation": 4, "theheist:open": true } }
        },
        {
            "type": "set_block", "do": { "x": 5920, "y": -60, "z": 138, "block": "theheist:custom_door_3_bottom", "permutations": { "theheist:rotation": 5, "theheist:open": true } }
        },
        {
            "type": "play_sound", "do": { "soundID": "random.door_open" }
        }
    ]);
    LevelConstructor.keycardReader(new Vector(5919.5, -59, 140.5), "red", [
        {
            "type": "set_block", "do": { "x": 5921, "y": -60, "z": 138, "block": "theheist:custom_door_3_bottom", "permutations": { "theheist:rotation": 4, "theheist:open": true } }
        },
        {
            "type": "set_block", "do": { "x": 5920, "y": -60, "z": 138, "block": "theheist:custom_door_3_bottom", "permutations": { "theheist:rotation": 5, "theheist:open": true } }
        },
        {
            "type": "play_sound", "do": { "soundID": "random.door_open" }
        }
    ]);
    LevelConstructor.keycardDrawer(new Vector(5910, -60, 138), "red");
    LevelConstructor.computer(new Vector(5910.5, -59, 136.5), "Research info", 4, [{
        "type": "display_research", "do": { "researchID": 401 }, "delay": 40
    }]);
    LevelConstructor.computer(new Vector(5918.5, -59, 135.5), "Disable all sonars", 2, [{
        "type": "run_command", "do": { "command": "say NOOOOOT REEEADDYY" }
    }]);
    LevelConstructor.rechargeStation(new Vector(5910.5, -60, 140.5), 4);
    LevelConstructor.gamebandUpgrade(new Vector(5912.5, -59, 143.5), "recharge", "§l§1recharge", 3, 0, 3, []);

    // 360 sonar here
} // Recharge Lvl. 3 Research

{
    Utilities.setBlock(new Vector(5924, -60, 151), "theheist:custom_door_2_bottom", { "theheist:rotation": 3, "theheist:unlocked": false });
    LevelConstructor.keypad(new Vector(5925.5, -59, 150.5), 2, 3, [
        {
            "type": "set_block", "do": { 'x': 5924, 'y': -60, 'z': 151, "block": "theheist:custom_door_2_bottom", "permutations": { "theheist:rotation": 3 } }, "delay": 40
        }
    ]);
    LevelConstructor.computer(new Vector(5920.5, -59, 157.5), "Mail", 3, [
        {
            "type": "display_mail", "do": { "mailID": 402 }, "delay": 40
        }
    ]);

    LevelConstructor.rechargeStation(new Vector(5893.5, -60, 175.5), 4);
    LevelConstructor.rechargeStation(new Vector(5899.5, -60, 179.5), 2);
    LevelConstructor.keycardDrawer(new Vector(5893.5, -60, 179.5), "yellow");
    LevelConstructor.computer(new Vector(5893.5, -59, 180.5), "Research Info", 4, [
        {
            "type": "display_research", "do": { "researchID": 403 }, "delay": 40
        }
    ]);
    LevelConstructor.newGameband(new Vector(5897.5, -59, 176.5), "stun", "§l§eStun", 6, 2, []);

    LevelConstructor.cameraRobot(new Vector(5925.5, -59.25, 160.5), 0);
    LevelConstructor.cameraRobot(new Vector(5920.5, -59.25, 164.5), 0);
    LevelConstructor.cameraRobot(new Vector(5916.5, -59.25, 171.5), 180);
    // +2 SONAR ROBOTS
} // Stun Research

{
    LevelConstructor.computer(new Vector(5894.5, -59, 122.5), "Mail", 5, [{
        "type": "display_mail", "do": { "mailID": 404 }, "delay": 40
    }]);
} // Accounting

{
    // Rotating camera here
} // Public Relations Department

{
    LevelConstructor.rechargeStation(new Vector(5855.5, -60, 103.5), 4);
    
    LevelConstructor.staticCamera(new Vector(5868.5, -58, 123.5), -70);
} // Conference Room

{
    Utilities.setBlock(new Vector(5890, -60, 167), "theheist:custom_door_2_bottom", { "theheist:rotation": 3, "theheist:unlocked": false });
    LevelConstructor.keypad(new Vector(5889.5, -59, 166.5), 2, 3, [{
        "type": "set_block", "do": { 'x': 5890, 'y': -60, 'z': 167, "block": "theheist:custom_door_2_bottom", "permutations": { "theheist:rotation": 3 } }, "delay": 40
    }]);
    Utilities.dimensions.overworld.spawnEntity("theheist:sonar_robot", new Vector(5889.5, -59, 174.5)).setRotation({'x': 0, 'y': 180});
    Utilities.dimensions.overworld.spawnEntity("theheist:sonar_robot", new Vector(5887.5, -59, 176.5)).setRotation({'x': 0, 'y': 180});
    Utilities.dimensions.overworld.spawnEntity("theheist:sonar_robot", new Vector(5885.5, -59, 178.5)).setRotation({'x': 0, 'y': 180});
    LevelConstructor.computer(new Vector(5879.5, -59, 172.5), "Mail", 4, [
        {
            "type": "display_mail", "do": { "mailID": 405 }, "delay": 40
        },
        {
            "type": "voice_says", "do": { "soundID": 502 }, "delay": 40
        }
    ]);
} // Sonar Robotics

{
    Utilities.setBlock(new Vector(5878, -60, 177), "theheist:custom_door_2_bottom", { "theheist:rotation": 4, "theheist:unlocked": false });
    LevelConstructor.keycardReader(new Vector(5879.5, -59, 179.5), "red", [{
        "type": "set_block", "do": { 'x': 5878, 'y': -60, 'z': 177, "block": "theheist:custom_door_2_bottom", "permutations": { "theheist:rotation": 4, "theheist:open": true } }
    },
    {
        "type": "play_sound", "do": { "soundID": "random.door_open" }
    }]);
    LevelConstructor.computer(new Vector(5871.5, -59, 173.5), "Research info", 3, [{
        "type": "display_research", "do": { "researchID": 406 }, "delay": 40
    }]);
    LevelConstructor.gamebandUpgrade(new Vector(5871.5, -59, 175.5), "xray", "§4§lXRay", 2, 3, 4, [{
        "type": "voice_says", "do": { "soundID": 503 }
    }]);
} // X-Ray Lvl. 2 Research

{
    LevelConstructor.keypad(new Vector(5877.5, -59, 139.5), 3, 4, []);
    LevelConstructor.keypad(new Vector(5875.5, -59, 145.5), 3, 3, []);

    LevelConstructor.staticCamera(new Vector(5863.5, -58, 141.5), -75);
    // Sonar robot here
    // Sonar robot here
} // End Level Hallway

{
    /**
    LevelConstructor.keypad(new Vector(0, 0, 0), 0, 0, []);
    LevelConstructor.keypad(new Vector(0, 0, 0), 0, 0, []);
    Utilities.setBlock(new Vector(0, 0, 0), "theheist:custom_door_4_bottom_l", { "theheist:rotation": 0, "theheist:unlocked": false });
    Utilities.setBlock(new Vector(0, 0, 0), "theheist:custom_door_4_bottom_r", { "theheist:rotation": 0, "theheist:unlocked": false });
    LevelConstructor.keycardReader(new Vector(0, 0, 0), "COLOR", [
        {
            "type": "set_block", "do": { "x": 0, "y": 0, "z": 0, "block": "theheist:custom_door_4_bottom_l", "permutations": { "theheist:rotation": 0, "theheist:open": true } }, "delay": 40
        },
        {
            "type": "set_block", "do": { "x": 0, "y": 0, "z": 0, "block": "theheist:custom_door_4_bottom_r", "permutations": { "theheist:rotation": 0, "theheist:open": true } }, "delay": 40
        },
        {
            "type": "play_sound", "do": { "soundID": "random.door_open" }, "delay": 40
        },
        {
            "type": "manage_objectives", "do": { "manageType": 2, "objective": "Access next level" }, "delay": 40
        }
    ]);
    Utilities.setBlock(new Vector(0, 0, 0), "minecraft:lever", { "lever_direction": "north" });
    */
    LevelConstructor.rechargeStation(new Vector(5851.5, -60, 141.5), 2);
} // End Level Elevator

}
};

export default level;