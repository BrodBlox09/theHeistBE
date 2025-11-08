import Vector from "../Vector";
import Utilities from "../Utilities";
import LevelConstructor from "./LevelConstructor";
import { ILevel, BlockRotation } from "../TypeDefinitions";

const level: ILevel = {
"levelId": "-4",
"levelCloneInfo": {
	"startX": 5843,
	"startZ": 99,
	"endX": 5928,
	"endZ": 183,
	"prisonLoc": new Vector(5916.5, -59, 99.5),
	"mapLoc": new Vector(5906, -55, 141)
},
"loadElevatorLoc": new Vector(5887, -50, 105),
"startPlayerLoc": new Vector(5887, -60, 105),
"startingItems": [{ "slot": 0, "typeId": 'theheist:recharge_mode_lvl_2', "lockMode": "slot" }, { "slot": 1, "typeId": 'theheist:hacking_mode_lvl_2', "lockMode": "slot" }, { "slot": 2, "typeId": 'theheist:sensor_mode_lvl_2', "lockMode": "slot" }, { "slot": 3, "typeId": 'theheist:xray_mode_lvl_1', "lockMode": "slot" }, { "slot": 4, "typeId": 'theheist:magnet_mode_lvl_1', "lockMode": "slot" }, { "slot": 5, "typeId": 'theheist:stealth_mode_lvl_1', "lockMode": "slot" }],
"rechargeLevel": 2,
"startObjectives": [{ "name": "Access next level", "sortOrder": 4 }, { "name": "Get Stun mode", "sortOrder": 3 }, { "name": "Get Recharge upgrade", "sortOrder": 2 }, { "name": "Get Xray upgrade", "sortOrder": 1 }],
setup: () => {

{
    LevelConstructor.staticCamera(new Vector(5891.5, -58, 118.5), 142);
    LevelConstructor.dynamicCamera(new Vector(5889.5, -58, 133.5), [1, 100, 250]);
    LevelConstructor.sonar(new Vector(5923.5, -58, 130.5), 80);
    LevelConstructor.sonar(new Vector(5925.5, -58, 132.5), 15);
    LevelConstructor.cameraRobot(new Vector(5922.5, -59.25, 131.5), 90);
} // Entry Hallway

{
    LevelConstructor.keypad(new Vector(5910.5, -59, 119.5), 3, BlockRotation.SOUTH, []);
    LevelConstructor.keypad(new Vector(5910.5, -59, 129.5), 3, BlockRotation.NORTH, []);
    LevelConstructor.computer(new Vector(5911.5, -59, 125.5), "Clear alarm status", BlockRotation.WEST, [
        {
            "type": "set_alarm_level", "do": { "value": 0 }, "delay": 40
        }
    ]);
    LevelConstructor.rechargeStation(new Vector(5914.5, -60, 124.5), BlockRotation.EAST);

    Utilities.setBlock(new Vector(5911, -57, 131), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "north"});
    Utilities.setBlock(new Vector(5911, -57, 124), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "east"});
} // Security Office

{
    Utilities.setBlock(new Vector(5906, -60, 134), "theheist:custom_door_2_bottom", { "minecraft:cardinal_direction": "south", "theheist:unlocked": false });
    LevelConstructor.keypad(new Vector(5907.5, -59, 133.5), 2, BlockRotation.SOUTH, [
        {
            "type": "set_block", "do": { 'x': 5906, 'y': -60, 'z': 134, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "south" } }, "delay": 40
        }
    ]);
    LevelConstructor.computer(new Vector(5898.5, -59, 139.5), "Research info", BlockRotation.WEST, [
        {
            "type": "display_research", "do": { "researchID": 400 }, "delay": 40
        }
    ]);

    LevelConstructor.sonar(new Vector(5905.5, -58, 144.5), 90);
} // Sonar Camera Development

{
    Utilities.setBlock(new Vector(5921, -60, 138), "theheist:custom_door_3_bottom", { "minecraft:cardinal_direction": "west", "theheist:unlocked": false });
    Utilities.setBlock(new Vector(5920, -60, 138), "theheist:custom_door_3_bottom", { "minecraft:cardinal_direction": "east", "theheist:unlocked": false });
    LevelConstructor.keycardReader(new Vector(5922.5, -59, 136.5), "red", [
        {
            "type": "set_block", "do": { "x": 5921, "y": -60, "z": 138, "block": "theheist:custom_door_3_bottom", "permutations": { "minecraft:cardinal_direction": "west", "theheist:open": true } }
        },
        {
            "type": "set_block", "do": { "x": 5920, "y": -60, "z": 138, "block": "theheist:custom_door_3_bottom", "permutations": { "minecraft:cardinal_direction": "east", "theheist:open": true } }
        },
        {
            "type": "play_sound", "do": { "soundID": "random.door_open" }
        }
    ]);
    LevelConstructor.keycardReader(new Vector(5919.5, -59, 140.5), "red", [
        {
            "type": "set_block", "do": { "x": 5921, "y": -60, "z": 138, "block": "theheist:custom_door_3_bottom", "permutations": { "minecraft:cardinal_direction": "west", "theheist:open": true } }
        },
        {
            "type": "set_block", "do": { "x": 5920, "y": -60, "z": 138, "block": "theheist:custom_door_3_bottom", "permutations": { "minecraft:cardinal_direction": "east", "theheist:open": true } }
        },
        {
            "type": "play_sound", "do": { "soundID": "random.door_open" }
        }
    ]);
    LevelConstructor.keycardDrawer(new Vector(5910, -60, 138), "red");
    LevelConstructor.computer(new Vector(5910.5, -59, 136.5), "Research info", BlockRotation.WEST, [{
        "type": "display_research", "do": { "researchID": 401 }, "delay": 40
    }]);
    LevelConstructor.computer(new Vector(5918.5, -59, 135.5), "Disable all sonars", BlockRotation.NORTH, [{
        "type": "disable_camera", "do": { "cameraID": 6 }, "delay": 40
    },
    {
        "type": "disable_camera", "do": { "cameraID": 3, "noMessage": true }, "delay": 40
    },
    {
        "type": "disable_camera", "do": { "cameraID": 2, "noMessage": true }, "delay": 40
    }]);
    LevelConstructor.rechargeStation(new Vector(5910.5, -60, 140.5), BlockRotation.WEST);
    LevelConstructor.gamebandUpgrade(new Vector(5912.5, -59, 143.5), "recharge", "§l§1Recharge Lvl. 3", 3, 0, BlockRotation.SOUTH, []);

    LevelConstructor.sonar360(new Vector(5916.5, -58, 140.5));

    Utilities.setBlock(new Vector(5924, -57, 141), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "west"});
    Utilities.setBlock(new Vector(5914, -57, 141), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "north"});
} // Recharge Lvl. 3 Research

{
    Utilities.setBlock(new Vector(5924, -60, 151), "theheist:custom_door_2_bottom", { "minecraft:cardinal_direction": "south", "theheist:unlocked": false });
    LevelConstructor.keypad(new Vector(5925.5, -59, 150.5), 2, BlockRotation.SOUTH, [
        {
            "type": "set_block", "do": { 'x': 5924, 'y': -60, 'z': 151, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "south" } }, "delay": 40
        }
    ]);
    LevelConstructor.computer(new Vector(5920.5, -59, 157.5), "Mail", BlockRotation.SOUTH, [
        {
            "type": "display_mail", "do": { "mailID": 402 }, "delay": 40
        }
    ]);
    Utilities.setBlock(new Vector(5925, -60, 158), "minecraft:wooden_door", {"direction":1});

    LevelConstructor.rechargeStation(new Vector(5893.5, -60, 175.5), BlockRotation.WEST);
    LevelConstructor.rechargeStation(new Vector(5899.5, -60, 179.5), BlockRotation.NORTH);
    LevelConstructor.keycardDrawer(new Vector(5893.5, -60, 179.5), "yellow");
    LevelConstructor.computer(new Vector(5893.5, -59, 180.5), "Research Info", BlockRotation.WEST, [
        {
            "type": "display_research", "do": { "researchID": 403 }, "delay": 40
        }
    ]);
    LevelConstructor.newGameband(new Vector(5897.5, -59, 176.5), "stun", "§l§eStun", 6, BlockRotation.NORTH, []);

    LevelConstructor.cameraRobot(new Vector(5925.5, -59.25, 160.5), 0);
    LevelConstructor.cameraRobot(new Vector(5920.5, -59.25, 164.5), 0);
    LevelConstructor.cameraRobot(new Vector(5916.5, -59.25, 171.5), 180);
    LevelConstructor.sonarRobot(new Vector(5899.5, -59.25, 163.5), 90);
    LevelConstructor.sonarRobot(new Vector(5897.5, -59.25, 171.5), 270);
} // Stun Research

{
    LevelConstructor.computer(new Vector(5894.5, -59, 122.5), "Mail", BlockRotation.EAST, [{
        "type": "display_mail", "do": { "mailID": 404 }, "delay": 40
    }]);

    Utilities.setBlock(new Vector(5889, -57, 124), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "north"});
} // Accounting

{
    LevelConstructor.dynamicCamera(new Vector(5896.5, -58, 146.5), [1, 105, 155]);

    Utilities.setBlock(new Vector(5889, -57, 144), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "east"});
} // Public Relations Department

{
    LevelConstructor.rechargeStation(new Vector(5855.5, -60, 103.5), BlockRotation.WEST);
    
    LevelConstructor.staticCamera(new Vector(5868.5, -58, 123.5), -70);
} // Conference Room

{
    Utilities.setBlock(new Vector(5890, -60, 167), "theheist:custom_door_2_bottom", { "minecraft:cardinal_direction": "south", "theheist:unlocked": false });
    LevelConstructor.keypad(new Vector(5889.5, -59, 166.5), 2, BlockRotation.SOUTH, [{
        "type": "set_block", "do": { 'x': 5890, 'y': -60, 'z': 167, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "south" } }, "delay": 40
    }]);
    Utilities.spawnEntity(new Vector(5889.5, -59, 174.5), "theheist:sonar_robot").setRotation({'x': 0, 'y': 180});
    Utilities.spawnEntity(new Vector(5887.5, -59, 176.5), "theheist:sonar_robot").setRotation({'x': 0, 'y': 180});
    Utilities.spawnEntity(new Vector(5885.5, -59, 178.5), "theheist:sonar_robot").setRotation({'x': 0, 'y': 180});
    LevelConstructor.computer(new Vector(5879.5, -59, 172.5), "Mail", BlockRotation.WEST, [
        {
            "type": "display_mail", "do": { "mailID": 405 }, "delay": 40
        },
        {
            "type": "voice_says", "do": { "soundID": 502 }, "delay": 40
        }
    ]);
} // Sonar Robotics

{
    Utilities.setBlock(new Vector(5878, -60, 177), "theheist:custom_door_2_bottom", { "minecraft:cardinal_direction": "west", "theheist:unlocked": false });
    LevelConstructor.keycardReader(new Vector(5879.5, -59, 179.5), "red", [{
        "type": "set_block", "do": { 'x': 5878, 'y': -60, 'z': 177, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "west", "theheist:open": true } }
    },
    {
        "type": "play_sound", "do": { "soundID": "random.door_open" }
    }]);
    LevelConstructor.computer(new Vector(5871.5, -59, 173.5), "Research info", BlockRotation.SOUTH, [{
        "type": "display_research", "do": { "researchID": 406 }, "delay": 40
    }]);
    LevelConstructor.rechargeStation(new Vector(5877.5, -60, 171.5), BlockRotation.EAST)
    LevelConstructor.gamebandUpgrade(new Vector(5871.5, -59, 175.5), "xray", "§4§lXRay Lvl. 2", 2, 3, BlockRotation.WEST, [{
        "type": "voice_says", "do": { "soundID": 503 }
    }]);
} // X-Ray Lvl. 2 Research

{
    // Women's
    Utilities.setBlock(new Vector(5882, -60, 137), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.NORTH });
    Utilities.setBlock(new Vector(5886, -60, 135), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.SOUTH });
    Utilities.setBlock(new Vector(5886, -60, 137), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.SOUTH });
    Utilities.setBlock(new Vector(5886, -60, 139), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.SOUTH });
    Utilities.setBlock(new Vector(5885, -57, 137), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.EAST });
    // Men's
    Utilities.setBlock(new Vector(5876, -60, 137), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.SOUTH });
    Utilities.setBlock(new Vector(5872, -60, 135), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.NORTH });
    Utilities.setBlock(new Vector(5873, -57, 137), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.SOUTH });
} // Bathrooms

{
    LevelConstructor.keypad(new Vector(5877.5, -59, 139.5), 3, BlockRotation.WEST, []);
    LevelConstructor.keypad(new Vector(5875.5, -59, 145.5), 3, BlockRotation.SOUTH, []);

    LevelConstructor.staticCamera(new Vector(5863.5, -58, 141.5), -75);
    LevelConstructor.sonarRobot(new Vector(5858.5, -59.25, 142.5), 0);
    LevelConstructor.sonarRobot(new Vector(5874.5, -59.25, 144.5), 180);
} // End Level Hallway

{
    Utilities.setBlock(new Vector(5853, -60, 143), "theheist:custom_door_4_bottom_l", { "minecraft:cardinal_direction": "west", "theheist:unlocked": false });
    Utilities.setBlock(new Vector(5853, -60, 142), "theheist:custom_door_4_bottom_r", { "minecraft:cardinal_direction": "west", "theheist:unlocked": false });
    LevelConstructor.keycardReader(new Vector(5854.5, -59, 145.5), "yellow", [
        {
            "type": "set_block", "do": { "x": 5853, "y": -60, "z": 143, "block": "theheist:custom_door_4_bottom_l", "permutations": { "minecraft:cardinal_direction": "west", "theheist:open": true } }
        },
        {
            "type": "set_block", "do": { "x": 5853, "y": -60, "z": 142, "block": "theheist:custom_door_4_bottom_r", "permutations": { "minecraft:cardinal_direction": "west", "theheist:open": true } }
        },
        {
            "type": "play_sound", "do": { "soundID": "random.door_open" }
        },
        {
            "type": "manage_objective", "do": { "manageType": 2, "objective": "Access next level" }
        }
    ]);
    Utilities.setBlock(new Vector(5847, -59, 142), "minecraft:lever", { "lever_direction": "east" });
    LevelConstructor.rechargeStation(new Vector(5851.5, -60, 141.5), BlockRotation.NORTH);
} // End Level Elevator

}
};

export default level;