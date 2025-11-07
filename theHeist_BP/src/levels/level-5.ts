import Vector from "../Vector";
import Utilities from "../Utilities";
import LevelConstructor from "./LevelConstructor";
import { ILevel, BlockRotation } from "../TypeDefinitions";

const level: ILevel = {
"levelID": "-5",
"loadElevatorLoc": new Vector(6912, -49, 162),
"startPlayerLoc": new Vector(6912, -60, 162),
"startingItems": [{ "slot": 0, "typeId": 'theheist:recharge_mode_lvl_3', "lockMode": "slot" }, { "slot": 1, "typeId": 'theheist:hacking_mode_lvl_2', "lockMode": "slot" }, { "slot": 2, "typeId": 'theheist:sensor_mode_lvl_2', "lockMode": "slot" }, { "slot": 3, "typeId": 'theheist:xray_mode_lvl_2', "lockMode": "slot" }, { "slot": 4, "typeId": 'theheist:magnet_mode_lvl_1', "lockMode": "slot" }, { "slot": 5, "typeId": 'theheist:stealth_mode_lvl_1', "lockMode": "slot" }, { "slot": 6, "typeId": 'theheist:stun_mode_lvl_1', "lockMode": "slot" }],
"rechargeLevel": 3, // Objectives: Green -2, Yellow 0, Red -1
"startObjectives": [{ "name": "Access next level", "sortOrder": 4 }, { "name": "Get Drill mode", "sortOrder": 3 }, { "name": "Get Hacking upgrade", "sortOrder": 2 }, { "name": "Get Stealth upgrade", "sortOrder": 1 }],
setup: () => {

{
    Utilities.setBlock(new Vector(6915, -60, 141), "theheist:custom_door_3_bottom", {"theheist:unlocked": false, "minecraft:cardinal_direction": "east"});
    LevelConstructor.keycardReader(new Vector(6914.5, -60, 143.5), "green", [
        {
            "type": "set_block", "do": { "x": 6915, "y": -60, "z": 141, "block": "theheist:custom_door_3_bottom", "permutations": { "minecraft:cardinal_direction": "east", "theheist:open": true } }
        },
        {
            "type": "play_sound", "do": { "soundID": "random.door_open" }
        }
    ]);
    LevelConstructor.keycardDrawer(new Vector(6924, -60, 140), "green");
    LevelConstructor.computer(new Vector(6919.5, -59, 140.5), "Mail", BlockRotation.WEST, [{
        "type": "display_mail", "do": { "mailID": 508 }, "delay": 40
    },
    {
        "type": "manage_objective", "do": { "manageType": 1, "objective": "Find Green Keycard", "sortOrder": -2 }, "delay": 40
    }]);
} // Chief of Technology

{
    LevelConstructor.sonar360(new Vector(6912.5, -58, 124.5));
    LevelConstructor.rechargeStation(new Vector(6906.5, -60, 118.5), BlockRotation.WEST);
    // Starting/South Wing:
    LevelConstructor.cameraRobot(new Vector(6911.5, -59.25, 137.5), 0);

    Utilities.setBlock(new Vector(6912, -57, 140), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "north"});
    Utilities.setBlock(new Vector(6905, -57, 140), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "east"});
    // Right Wing:
    Utilities.fillBlocks(new Vector(6933, -60, 130), new Vector(6933, -58, 130), "theheist:laser_end", {"minecraft:cardinal_direction": "west"});
    Utilities.fillBlocks(new Vector(6934, -60, 130), new Vector(6936, -58, 130), "theheist:laser", {"minecraft:cardinal_direction": "south"});
    Utilities.fillBlocks(new Vector(6937, -60, 130), new Vector(6937, -58, 130), "theheist:laser_end", {"minecraft:cardinal_direction": "east"});
    LevelConstructor.keypad(new Vector(6937.5, -59, 129.5), 3, BlockRotation.EAST, [{
        "type": "fill_blocks", "do": { "x1": 6933, "y1": -60, "z1": 130, "x2": 6933, "y2": -58, "z2": 130, "block": "theheist:laser_end", "permutations": {"minecraft:cardinal_direction": "west","theheist:connect":false} }, "delay": 40
    },
    {
        "type": "fill_blocks", "do": { "x1": 6934, "y1": -60, "z1": 130, "x2": 6936, "y2": -58, "z2": 130, "block": "air", "permutations": {} }, "delay": 40
    },
    {
        "type": "fill_blocks", "do": { "x1": 6937, "y1": -60, "z1": 130, "x2": 6937, "y2": -58, "z2": 130, "block": "theheist:laser_end", "permutations": {"minecraft:cardinal_direction": "east","theheist:connect":false} }, "delay": 40
    },
    {
        "type": "hack_console", "do": { "x": 6937, "z": 131 }
    }]);
    LevelConstructor.keypad(new Vector(6937.5, -59, 131.5), 3, BlockRotation.EAST, [{
        "type": "hack_console", "do": { "x": 6937, "z": 129 }
    }]);

    LevelConstructor.sonar(new Vector(6932.5, -58, 137.5), 225);
    LevelConstructor.sonarRobot(new Vector(6934.5, -59.25, 128.5), 0);

    Utilities.setBlock(new Vector(6933, -57, 125), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "north"});
    // Left Wing:
    Utilities.fillBlocks(new Vector(6886, -60, 122), new Vector(6886, -58, 122), "theheist:laser_end", {"minecraft:cardinal_direction": "north"});
    Utilities.fillBlocks(new Vector(6886, -60, 123), new Vector(6886, -58, 125), "theheist:laser", {"minecraft:cardinal_direction": "west"});
    Utilities.fillBlocks(new Vector(6886, -60, 126), new Vector(6886, -58, 126), "theheist:laser_end", {"minecraft:cardinal_direction": "south"});
    LevelConstructor.keypad(new Vector(6887.5, -59, 122.5), 3, BlockRotation.NORTH, [{
        "type": "fill_blocks", "do": { "x1": 6886, "y1": -60, "z1": 122, "x2": 6886, "y2": -58, "z2": 122, "block": "theheist:laser_end", "permutations": {"minecraft:cardinal_direction": "north","theheist:connect":false} }, "delay": 40
    },
    {
        "type": "fill_blocks", "do": { "x1": 6886, "y1": -60, "z1": 123, "x2": 6886, "y2": -58, "z2": 125, "block": "air", "permutations": {} }, "delay": 40
    },
    {
        "type": "fill_blocks", "do": { "x1": 6886, "y1": -60, "z1": 126, "x2": 6886, "y2": -58, "z2": 126, "block": "theheist:laser_end", "permutations": {"minecraft:cardinal_direction": "south","theheist:connect":false} }, "delay": 40
    }]);

    LevelConstructor.sonarRobot(new Vector(6897.5, -59.25, 122.5), 180);

    Utilities.setBlock(new Vector(6902, -57, 118), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "west"});
    Utilities.setBlock(new Vector(6894, -57, 126), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "west"});
    // North Wing:
    Utilities.fillBlocks(new Vector(6910, -60, 91), new Vector(6910, -58, 91), "theheist:laser_end", {"minecraft:cardinal_direction": "west"});
    Utilities.fillBlocks(new Vector(6911, -60, 91), new Vector(6913, -58, 91), "theheist:laser", {"minecraft:cardinal_direction": "north"});
    Utilities.fillBlocks(new Vector(6914, -60, 91), new Vector(6914, -58, 91), "theheist:laser_end", {"minecraft:cardinal_direction": "east"});
    LevelConstructor.keypad(new Vector(6914.5, -59, 90.5), 3, BlockRotation.EAST, [{
        "type": "fill_blocks", "do": { "x1": 6910, "y1": -60, "z1": 91, "x2": 6910, "y2": -58, "z2": 91, "block": "theheist:laser_end", "permutations": {"minecraft:cardinal_direction": "west","theheist:connect":false} }, "delay": 40
    },
    {
        "type": "fill_blocks", "do": { "x1": 6911, "y1": -60, "z1": 91, "x2": 6913, "y2": -58, "z2": 91, "block": "air", "permutations": {} }, "delay": 40
    },
    {
        "type": "fill_blocks", "do": { "x1": 6914, "y1": -60, "z1": 91, "x2": 6914, "y2": -58, "z2": 91, "block": "theheist:laser_end", "permutations": {"minecraft:cardinal_direction": "east","theheist:connect":false} }, "delay": 40
    },
    {
        "type": "hack_console", "do": { "x": 6914, "z": 92 }
    }]);
    LevelConstructor.keypad(new Vector(6914.5, -59, 92.5), 3, BlockRotation.EAST, [{
        "type": "hack_console", "do": { "x": 6914, "z": 90 }
    }]);
    LevelConstructor.rechargeStation(new Vector(6908.5, -60, 96.5), BlockRotation.WEST);

    Utilities.setBlock(new Vector(6906, -57, 114), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "north"});
} // Main Hub

{
    Utilities.setBlock(new Vector(6924, -60, 121), "theheist:custom_door_3_bottom", {"theheist:unlocked": false, "minecraft:cardinal_direction": "north"});
    Utilities.setBlock(new Vector(6924, -60, 120), "theheist:custom_door_3_bottom", {"theheist:unlocked": false, "minecraft:cardinal_direction": "south"});
    LevelConstructor.keypad(new Vector(6923.5, -59, 122.5), 3, BlockRotation.NORTH, [{
        "type": "set_block", "do": { "x": 6924, "y": -60, "z": 121, "block": "theheist:custom_door_3_bottom", "permutations": { "minecraft:cardinal_direction": "north" } }, "delay": 40
    },
    {
        "type": "hack_console", "do": { "x": 6923, "z": 119 }
    }]);
    LevelConstructor.keypad(new Vector(6923.5, -59, 119.5), 3, BlockRotation.SOUTH, [{
        "type": "set_block", "do": { "x": 6924, "y": -60, "z": 120, "block": "theheist:custom_door_3_bottom", "permutations": { "minecraft:cardinal_direction": "south" } }, "delay": 40
    },
    {
        "type": "hack_console", "do": { "x": 6923, "z": 122 }
    }]);
    LevelConstructor.computer(new Vector(6925.5, -59, 115.5), "Disable 360 sonar", BlockRotation.EAST, [{
        "type": "disable_camera", "do": { "cameraID": 0 }, "delay": 40
    }]);
    LevelConstructor.computer(new Vector(6921.5, -59, 113.5), "Mail", BlockRotation.WEST, [{
        "type": "display_mail", "do": { "mailID": 506 }, "delay": 40
    }]);
    LevelConstructor.computer(new Vector(6916.5, -59, 113.5), "Clear alarm status", BlockRotation.WEST, [{
        "type": "set_alarm_level", "do": { "value": 0 }, "delay": 40
    }]);
    LevelConstructor.rechargeStation(new Vector(6920.5, -60, 119.5), BlockRotation.SOUTH);
    LevelConstructor.rechargeStation(new Vector(6919.5, -60, 118.5), BlockRotation.WEST);
    
    Utilities.setBlock(new Vector(6923, -57, 117), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "south"});
} // Security Office

{
    LevelConstructor.computer(new Vector(6936.5, -59, 114.5), "Mail", BlockRotation.WEST, [{
        "type": "display_mail", "do": { "mailID": 505 }, "delay": 40
    }]);

    LevelConstructor.dynamicCamera(new Vector(6931.5, -58, 106.5), [1, -20, 120]);
    LevelConstructor.cameraRobot(new Vector(6922.5, -59.25, 107.5), 270);

    Utilities.setBlock(new Vector(6937, -57, 114), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "east"});
    Utilities.setBlock(new Vector(6922, -57, 105), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "west"});
} // Software Development

{
    Utilities.setBlock(new Vector(6938, -60, 126), "theheist:custom_door_2_bottom", {"minecraft:cardinal_direction": "east","theheist:unlocked":false});
    LevelConstructor.keypad(new Vector(6937.5, -59, 125.5), 2, BlockRotation.EAST, [{
        "type": "set_block", "do": { 'x': 6938, 'y': -60, 'z': 126, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "east" } }, "delay": 40
    }]);
    LevelConstructor.keycardDrawer(new Vector(6943, -60, 127), "yellow");
    LevelConstructor.computer(new Vector(6943.5, -59, 126.5), "Mail", BlockRotation.WEST, [{
        "type": "display_mail", "do": { "mailID": 500 }, "delay": 40
    },
    {
        "type": "manage_objective", "do": { "manageType": 1, "objective": "Find Yellow Keycard", "sortOrder": 0 }, "delay": 40
    }]);

    Utilities.setBlock(new Vector(6942, -57, 125), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "east"});
} // Chief of Engineering

{
    Utilities.setBlock(new Vector(6932, -60, 132), "theheist:custom_door_2_bottom", {"minecraft:cardinal_direction": "west","theheist:unlocked":false});
    LevelConstructor.keypad(new Vector(6933.5, -59, 133.5), 2, BlockRotation.WEST, [{
        "type": "set_block", "do": { 'x': 6932, 'y': -60, 'z': 132, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "west" } }, "delay": 40
    },
    {
        "type": "hack_console", "do": { "x": 6930, "z": 133 }
    }]);
    Utilities.setBlock(new Vector(6931, -60, 132), "theheist:custom_door_2_bottom", {"minecraft:cardinal_direction": "east","theheist:unlocked":false});
    LevelConstructor.keypad(new Vector(6930.5, -59, 133.5), 2, BlockRotation.EAST, [{
        "type": "set_block", "do": { 'x': 6931, 'y': -60, 'z': 132, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "east" } }, "delay": 40
    },
    {
        "type": "hack_console", "do": { "x": 6933, "z": 133 }
    }]);
    LevelConstructor.computer(new Vector(6925.5, -59, 135.5), "Mail", BlockRotation.SOUTH, [{
        "type": "display_mail", "do": { "mailID": 507 }, "delay": 40
    }]);

    Utilities.setBlock(new Vector(6923, -57, 131), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "west"});
} // Chief of Research

{
    Utilities.setBlock(new Vector(6928, -60, 144), "theheist:custom_door_3_bottom", {"theheist:unlocked": false, "minecraft:cardinal_direction": "south"});
    LevelConstructor.keycardReader(new Vector(6926.5, -60, 143.5), "red", [
        {
            "type": "set_block", "do": { "x": 6928, "y": -60, "z": 144, "block": "theheist:custom_door_3_bottom", "permutations": { "minecraft:cardinal_direction": "south", "theheist:open": true } }
        },
        {
            "type": "play_sound", "do": { "soundID": "random.door_open" }
        }
    ]);
    LevelConstructor.rechargeStation(new Vector(6931.5, -60, 145.5), BlockRotation.NORTH);
    LevelConstructor.rechargeStation(new Vector(6932.5, -60, 146.5), BlockRotation.EAST);
    LevelConstructor.computer(new Vector(6930.5, -59, 155.5), "Research info", BlockRotation.SOUTH, [{
        "type": "display_research", "do": { "researchID": 503 }, "delay": 40
    }]);
    Utilities.setBlock(new Vector(6935, -60, 150), "theheist:custom_door_3_bottom", {"minecraft:cardinal_direction": "east","theheist:unlocked":false});
    LevelConstructor.keypad(new Vector(6934.5, -59, 151.5), 3, BlockRotation.EAST, [{
        "type": "set_block", "do": { 'x': 6935, 'y': -60, 'z': 150, "block": "theheist:custom_door_3_bottom", "permutations": { "minecraft:cardinal_direction": "east" } }, "delay": 40
    }]);
    LevelConstructor.gamebandUpgrade(new Vector(6938.5, -59, 150.5), "stealth", "§f§lStealth Lvl. 2", 2, 5, BlockRotation.EAST, []);

    Utilities.setBlock(new Vector(6930, -57, 150), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "west"});
    Utilities.spawnEntity(new Vector(6923.5, -59, 150.5), "minecraft:sheep").nameTag = "jeb_";
} // Electromagnetic Field Research

{
    LevelConstructor.computer(new Vector(6890.5, -59, 113.5), "Mail", BlockRotation.WEST, [{
        "type": "display_mail", "do": { "mailID": 504 }, "delay": 40
    },
    {
        "type": "manage_objective", "do": { "manageType": 1, "objective": "Find Red Keycard", "sortOrder": -1 }, "delay": 40
    }]);

    Utilities.setBlock(new Vector(6894, -57, 116), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "west"});
} // Administrative Office

{
    Utilities.setBlock(new Vector(6880, -60, 121), "theheist:custom_door_2_bottom", {"minecraft:cardinal_direction": "north","theheist:unlocked":false});
    LevelConstructor.keycardReader(new Vector(6878.5, -59, 122.5), "yellow", [{
        "type": "set_block", "do": { 'x': 6880, 'y': -60, 'z': 121, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "north", "theheist:open": true } }
    },
    {
        "type": "play_sound", "do": { "soundID": "random.door_open" }
    }]);
    LevelConstructor.computer(new Vector(6885.5, -59, 116.5), "Research info", BlockRotation.EAST, [{
        "type": "display_research", "do": { "researchID": 501 }, "delay": 40
    }]);

    Utilities.setBlock(new Vector(6878, -60, 113), "theheist:custom_door_2_bottom", {"minecraft:cardinal_direction": "west"});
    Utilities.setBlock(new Vector(6882, -57, 116), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "north"});

    // Gameband Pedestal Room
    Utilities.setBlock(new Vector(6882, -60, 111), "theheist:custom_door_3_bottom", {"minecraft:cardinal_direction": "north","theheist:unlocked":false});
    LevelConstructor.keypad(new Vector(6883.5, -59, 112.5), 3, BlockRotation.NORTH, [{
        "type": "set_block", "do": { 'x': 6882, 'y': -60, 'z': 111, "block": "theheist:custom_door_3_bottom", "permutations": { "minecraft:cardinal_direction": "north" } }, "delay": 40
    }]);
    LevelConstructor.rechargeStation(new Vector(6885.5, -60, 105.5), BlockRotation.EAST);
    LevelConstructor.rechargeStation(new Vector(6885.5, -60, 107.5), BlockRotation.EAST);
    LevelConstructor.newGameband(new Vector(6882.5, -59, 104.5), "drill", "§3§lDrill", 7, BlockRotation.NORTH, []);

    LevelConstructor.sonar(new Vector(6885.5, -58, 110.5), 135);

    Utilities.setBlock(new Vector(6882, -57, 107), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "east"});

    // Secret Room
    LevelConstructor.rechargeStation(new Vector(6875.5, -55, 120.5), BlockRotation.SOUTH);
    LevelConstructor.rechargeStation(new Vector(6873.5, -55, 120.5), BlockRotation.SOUTH);
    LevelConstructor.rechargeStation(new Vector(6871.5, -55, 120.5), BlockRotation.SOUTH);
} // Excavation Technology Research

{
    LevelConstructor.dynamicCamera(new Vector(6881.5, -58, 137.5), [2, 0, 0]); // Spins to the right forever
    LevelConstructor.rechargeStation(new Vector(6896.5, -60, 140.5), BlockRotation.SOUTH);
    LevelConstructor.rechargeStation(new Vector(6866.5, -60, 140.5), BlockRotation.SOUTH);
    Utilities.fillBlocks(new Vector(6880, -61, 142), new Vector(6882, -61, 151), "minecraft:air");
    Utilities.fillBlocks(new Vector(6880, 18, 142), new Vector(6882, 18, 151), "minecraft:air");
    LevelConstructor.keycardReader(new Vector(6896.5, -59, 137.5), "yellow", [{
        "type": "fill_blocks", "do": { "x1": 6880, "y1": 18, "z1": 147, "x2": 6882, "y2": 18, "z2": 151, "block": "theheist:forcefield_bridge", "permutations": {} }
    },
    {
        "type": "fill_blocks", "do": { "x1": 6880, "y1": -61, "z1": 147, "x2": 6882, "y2": -61, "z2": 151, "block": "theheist:forcefield_bridge", "permutations": {} }
    },
    {
        "type": "display_text", "do": { "text": "§l§7Bridge A activated" }
    }]);
    LevelConstructor.keycardReader(new Vector(6866.5, -59, 137.5), "red", [{
        "type": "fill_blocks", "do": { "x1": 6880, "y1": 18, "z1": 142, "x2": 6882, "y2": 18, "z2": 146, "block": "theheist:forcefield_bridge", "permutations": {} }
    },
    {
        "type": "fill_blocks", "do": { "x1": 6880, "y1": -61, "z1": 142, "x2": 6882, "y2": -61, "z2": 146, "block": "theheist:forcefield_bridge", "permutations": {} }
    },
    {
        "type": "display_text", "do": { "text": "§l§7Bridge B activated" }
    }]);
} // Power Station Nuclear Core

{
    Utilities.setBlock(new Vector(6909, -60, 103), "theheist:custom_door_3_bottom", {"minecraft:cardinal_direction": "west","theheist:unlocked":false});
    LevelConstructor.keypad(new Vector(6910.5, -59, 102.5), 3, BlockRotation.WEST, [{
        "type": "set_block", "do": { 'x': 6909, 'y': -60, 'z': 103, "block": "theheist:custom_door_3_bottom", "permutations": { "minecraft:cardinal_direction": "west" } }, "delay": 40
    },
    {
        "type": "hack_console", "do": { "x": 6907, "z": 102 }
    }]);
    Utilities.setBlock(new Vector(6908, -60, 103), "theheist:custom_door_3_bottom", {"minecraft:cardinal_direction": "east","theheist:unlocked":false});
    LevelConstructor.keypad(new Vector(6907.5, -59, 102.5), 3, BlockRotation.EAST, [{
        "type": "set_block", "do": { 'x': 6908, 'y': -60, 'z': 103, "block": "theheist:custom_door_3_bottom", "permutations": { "minecraft:cardinal_direction": "east" } }, "delay": 40
    },
    {
        "type": "hack_console", "do": { "x": 6910, "z": 102 }
    }]);
    LevelConstructor.keycardDrawer(new Vector(6900, -59, 110), "red");

    Utilities.setBlock(new Vector(6902, -60, 110), "minecraft:wooden_door", {"direction":2});
} // Chief of Staff

{
    Utilities.setBlock(new Vector(6912, -60, 86), "theheist:custom_door_2_bottom", {"minecraft:cardinal_direction": "north","theheist:unlocked":false});
    LevelConstructor.keycardReader(new Vector(6914.5, -59, 87.5), "green", [{
        "type": "set_block", "do": { 'x': 6912, 'y': -60, 'z': 86, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "north", "theheist:open": true } }
    },
    {
        "type": "play_sound", "do": { "soundID": "random.door_open" }
    }]);
    LevelConstructor.computer(new Vector(6916.5, -59, 80.5), "Research info", BlockRotation.WEST, [{
        "type": "display_research", "do": { "researchID": 502 }, "delay": 40
    }]);
    Utilities.setBlock(new Vector(6912, -60, 74), "theheist:custom_door_3_bottom", {"minecraft:cardinal_direction": "north","theheist:unlocked":false});
    LevelConstructor.keypad(new Vector(6911.5, -59, 75.5), 3, BlockRotation.NORTH, [{
        "type": "set_block", "do": { 'x': 6912, 'y': -60, 'z': 74, "block": "theheist:custom_door_3_bottom", "permutations": { "minecraft:cardinal_direction": "north" } }, "delay": 40
    }]);
    LevelConstructor.gamebandUpgrade(new Vector(6912.5, -59, 71.5), "hacking", "§2§lHacking Lvl. 3", 3, 1, BlockRotation.NORTH, []);
} // Advanced Cryptography

{
    // Men's
    Utilities.setBlock(new Vector(6902, -60, 121), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.WEST });
    Utilities.setBlock(new Vector(6901, -60, 117), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.EAST });
    // Women's
    Utilities.setBlock(new Vector(6909, -60, 114), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.SOUTH });
    Utilities.setBlock(new Vector(6905, -60, 115), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.NORTH });
    Utilities.setBlock(new Vector(6905, -60, 113), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.NORTH });
} // Bathrooms

{
    Utilities.setBlock(new Vector(6878, -60, 156), "theheist:custom_door_4_bottom_l", { "minecraft:cardinal_direction": "west", "theheist:unlocked": false });
    Utilities.setBlock(new Vector(6878, -60, 155), "theheist:custom_door_4_bottom_r", { "minecraft:cardinal_direction": "west", "theheist:unlocked": false });
    LevelConstructor.keycardReader(new Vector(6879.5, -59, 153.5), "green", [
        {
            "type": "set_block", "do": { "x": 6878, "y": -60, "z": 156, "block": "theheist:custom_door_4_bottom_l", "permutations": { "minecraft:cardinal_direction": "west", "theheist:open": true } }
        },
        {
            "type": "set_block", "do": { "x": 6878, "y": -60, "z": 155, "block": "theheist:custom_door_4_bottom_r", "permutations": { "minecraft:cardinal_direction": "west", "theheist:open": true } }
        },
        {
            "type": "play_sound", "do": { "soundID": "random.door_open" }
        },
        {
            "type": "manage_objective", "do": { "manageType": 2, "objective": "Access next level" }
        }
    ]);
    Utilities.setBlock(new Vector(6873, -59, 155), "minecraft:lever", { "lever_direction": "east" });
    LevelConstructor.rechargeStation(new Vector(6876.5, -60, 154.5), BlockRotation.NORTH);
} // End Level Elevator

}
};

export default level;