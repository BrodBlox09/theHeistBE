import Vector from "../Vector";
import VectorXZ from "../VectorXZ";
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
"startPlayerLoc": new Vector(5887, Utilities.levelPlayingHeight, 105),
"startingItems": [{ "slot": 0, "typeId": 'theheist:recharge_mode_lvl_2', "lockMode": "slot" }, { "slot": 1, "typeId": 'theheist:hacking_mode_lvl_2', "lockMode": "slot" }, { "slot": 2, "typeId": 'theheist:sensor_mode_lvl_2', "lockMode": "slot" }, { "slot": 3, "typeId": 'theheist:xray_mode_lvl_1', "lockMode": "slot" }, { "slot": 4, "typeId": 'theheist:magnet_mode_lvl_1', "lockMode": "slot" }, { "slot": 5, "typeId": 'theheist:stealth_mode_lvl_1', "lockMode": "slot" }],
"rechargeLevel": 2,
"startObjectives": [{ "name": "Access next level", "sortOrder": 4 }, { "name": "Get Stun mode", "sortOrder": 3 }, { "name": "Get Recharge upgrade", "sortOrder": 2 }, { "name": "Get Xray upgrade", "sortOrder": 1 }],
setup: () => {

{
    LevelConstructor.staticCamera(new VectorXZ(5891.5, 118.5), 142);
    LevelConstructor.dynamicCamera(new VectorXZ(5889.5, 133.5), [1, 100, 250]);
    LevelConstructor.sonar(new VectorXZ(5923.5, 130.5), 80);
    LevelConstructor.sonar(new VectorXZ(5925.5, 132.5), 15);
    LevelConstructor.cameraRobot(new VectorXZ(5922.5, 131.5), 90);
} // Entry Hallway

{
    LevelConstructor.keypad(new VectorXZ(5910.5, 119.5), 3, BlockRotation.SOUTH, []);
    LevelConstructor.keypad(new VectorXZ(5910.5, 129.5), 3, BlockRotation.NORTH, []);
    LevelConstructor.computer(new VectorXZ(5911.5, 125.5), "Clear alarm status", BlockRotation.WEST, [
        {
            "type": "set_alarm_level", "do": { "value": 0 }, "delay": 40
        }
    ]);
    LevelConstructor.rechargeStation(new VectorXZ(5914.5, 124.5), BlockRotation.EAST);

    Utilities.setBlock(new Vector(5911, Utilities.ventHeight, 131), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "north"});
    Utilities.setBlock(new Vector(5911, Utilities.ventHeight, 124), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "east"});
} // Security Office

{
    Utilities.setBlock(new Vector(5906, Utilities.levelPlayingHeight, 134), "theheist:custom_door_2_bottom", { "minecraft:cardinal_direction": "south", "theheist:unlocked": false });
    LevelConstructor.keypad(new VectorXZ(5907.5, 133.5), 2, BlockRotation.SOUTH, [
        {
            "type": "set_block", "do": { 'x': 5906, 'y': Utilities.levelPlayingHeight, 'z': 134, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "south" } }, "delay": 40
        }
    ]);
    LevelConstructor.computer(new VectorXZ(5898.5, 139.5), "Research info", BlockRotation.WEST, [
        {
            "type": "display_research", "do": { "researchID": 400 }, "delay": 40
        }
    ]);

    LevelConstructor.sonar(new VectorXZ(5905.5, 144.5), 90);
} // Sonar Camera Development

{
    Utilities.setBlock(new Vector(5921, Utilities.levelPlayingHeight, 138), "theheist:custom_door_3_bottom", { "minecraft:cardinal_direction": "west", "theheist:unlocked": false });
    Utilities.setBlock(new Vector(5920, Utilities.levelPlayingHeight, 138), "theheist:custom_door_3_bottom", { "minecraft:cardinal_direction": "east", "theheist:unlocked": false });
    LevelConstructor.keycardReader(new VectorXZ(5922.5, 136.5), "red", [
        {
            "type": "set_block", "do": { "x": 5921, "y": Utilities.levelPlayingHeight, "z": 138, "block": "theheist:custom_door_3_bottom", "permutations": { "minecraft:cardinal_direction": "west", "theheist:open": true } }
        },
        {
            "type": "set_block", "do": { "x": 5920, "y": Utilities.levelPlayingHeight, "z": 138, "block": "theheist:custom_door_3_bottom", "permutations": { "minecraft:cardinal_direction": "east", "theheist:open": true } }
        },
        {
            "type": "play_sound", "do": { "soundID": "random.door_open" }
        }
    ]);
    LevelConstructor.keycardReader(new VectorXZ(5919.5, 140.5), "red", [
        {
            "type": "set_block", "do": { "x": 5921, "y": Utilities.levelPlayingHeight, "z": 138, "block": "theheist:custom_door_3_bottom", "permutations": { "minecraft:cardinal_direction": "west", "theheist:open": true } }
        },
        {
            "type": "set_block", "do": { "x": 5920, "y": Utilities.levelPlayingHeight, "z": 138, "block": "theheist:custom_door_3_bottom", "permutations": { "minecraft:cardinal_direction": "east", "theheist:open": true } }
        },
        {
            "type": "play_sound", "do": { "soundID": "random.door_open" }
        }
    ]);
    LevelConstructor.keycardDrawer(new VectorXZ(5910, 138), "red");
    LevelConstructor.computer(new VectorXZ(5910.5, 136.5), "Research info", BlockRotation.WEST, [{
        "type": "display_research", "do": { "researchID": 401 }, "delay": 40
    }]);
    LevelConstructor.computer(new VectorXZ(5918.5, 135.5), "Disable all sonars", BlockRotation.NORTH, [{
        "type": "disable_camera", "do": { "cameraID": 6 }, "delay": 40
    },
    {
        "type": "disable_camera", "do": { "cameraID": 3, "noMessage": true }, "delay": 40
    },
    {
        "type": "disable_camera", "do": { "cameraID": 2, "noMessage": true }, "delay": 40
    }]);
    LevelConstructor.rechargeStation(new VectorXZ(5910.5, 140.5), BlockRotation.WEST);
    LevelConstructor.gamebandUpgrade(new VectorXZ(5912.5, 143.5), "recharge", "§l§1Recharge Lvl. 3", 3, 0, BlockRotation.SOUTH, []);

    LevelConstructor.sonar360(new VectorXZ(5916.5, 140.5));

    Utilities.setBlock(new Vector(5924, Utilities.ventHeight, 141), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "west"});
    Utilities.setBlock(new Vector(5914, Utilities.ventHeight, 141), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "north"});
} // Recharge Lvl. 3 Research

{
    Utilities.setBlock(new Vector(5924, Utilities.levelPlayingHeight, 151), "theheist:custom_door_2_bottom", { "minecraft:cardinal_direction": "south", "theheist:unlocked": false });
    LevelConstructor.keypad(new VectorXZ(5925.5, 150.5), 2, BlockRotation.SOUTH, [
        {
            "type": "set_block", "do": { 'x': 5924, 'y': Utilities.levelPlayingHeight, 'z': 151, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "south" } }, "delay": 40
        }
    ]);
    LevelConstructor.computer(new VectorXZ(5920.5, 157.5), "Mail", BlockRotation.SOUTH, [
        {
            "type": "display_mail", "do": { "mailID": 402 }, "delay": 40
        }
    ]);
    Utilities.setBlock(new Vector(5925, Utilities.levelPlayingHeight, 158), "minecraft:wooden_door", {"direction":1});

    LevelConstructor.rechargeStation(new VectorXZ(5893.5, 175.5), BlockRotation.WEST);
    LevelConstructor.rechargeStation(new VectorXZ(5899.5, 179.5), BlockRotation.NORTH);
    LevelConstructor.keycardDrawer(new VectorXZ(5893.5, 179.5), "yellow");
    LevelConstructor.computer(new VectorXZ(5893.5, 180.5), "Research Info", BlockRotation.WEST, [
        {
            "type": "display_research", "do": { "researchID": 403 }, "delay": 40
        }
    ]);
    LevelConstructor.newGameband(new VectorXZ(5897.5, 176.5), "stun", "§l§eStun", 6, BlockRotation.NORTH, []);

    LevelConstructor.cameraRobot(new VectorXZ(5925.5, 160.5), 0);
    LevelConstructor.cameraRobot(new VectorXZ(5920.5, 164.5), 0);
    LevelConstructor.cameraRobot(new VectorXZ(5916.5, 171.5), 180);
    LevelConstructor.sonarRobot(new VectorXZ(5899.5, 163.5), 90);
    LevelConstructor.sonarRobot(new VectorXZ(5897.5, 171.5), 270);
} // Stun Research

{
    LevelConstructor.computer(new VectorXZ(5894.5, 122.5), "Mail", BlockRotation.EAST, [{
        "type": "display_mail", "do": { "mailID": 404 }, "delay": 40
    }]);

    Utilities.setBlock(new Vector(5889, Utilities.ventHeight, 124), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "north"});
    Utilities.setBlock(new Vector(5889, Utilities.ventHeight, 131), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "west"});
} // Accounting

{
    LevelConstructor.dynamicCamera(new VectorXZ(5896.5, 146.5), [1, 105, 155]);

    Utilities.setBlock(new Vector(5889, Utilities.ventHeight, 144), "theheist:white_trapdoor", {"minecraft:cardinal_direction": "east"});
} // Public Relations Department

{
    LevelConstructor.rechargeStation(new VectorXZ(5855.5, 103.5), BlockRotation.WEST);
    
    LevelConstructor.staticCamera(new VectorXZ(5868.5, 123.5), -70);
} // Conference Room

{
    Utilities.setBlock(new Vector(5890, Utilities.levelPlayingHeight, 167), "theheist:custom_door_2_bottom", { "minecraft:cardinal_direction": "south", "theheist:unlocked": false });
    LevelConstructor.keypad(new VectorXZ(5889.5, 166.5), 2, BlockRotation.SOUTH, [{
        "type": "set_block", "do": { 'x': 5890, 'y': Utilities.levelPlayingHeight, 'z': 167, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "south" } }, "delay": 40
    }]);
    Utilities.spawnEntity(new Vector(5889.5, -59, 174.5), "theheist:sonar_robot").setRotation({'x': 0, 'y': 180});
    Utilities.spawnEntity(new Vector(5887.5, -59, 176.5), "theheist:sonar_robot").setRotation({'x': 0, 'y': 180});
    Utilities.spawnEntity(new Vector(5885.5, -59, 178.5), "theheist:sonar_robot").setRotation({'x': 0, 'y': 180});
    LevelConstructor.computer(new VectorXZ(5879.5, 172.5), "Mail", BlockRotation.WEST, [
        {
            "type": "display_mail", "do": { "mailID": 405 }, "delay": 40
        },
        {
            "type": "voice_says", "do": { "soundID": 502 }, "delay": 40
        }
    ]);
} // Sonar Robotics

{
    Utilities.setBlock(new Vector(5878, Utilities.levelPlayingHeight, 177), "theheist:custom_door_2_bottom", { "minecraft:cardinal_direction": "west", "theheist:unlocked": false });
    LevelConstructor.keycardReader(new VectorXZ(5879.5, 179.5), "red", [{
        "type": "set_block", "do": { 'x': 5878, 'y': Utilities.levelPlayingHeight, 'z': 177, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "west", "theheist:open": true } }
    },
    {
        "type": "play_sound", "do": { "soundID": "random.door_open" }
    }]);
    LevelConstructor.computer(new VectorXZ(5871.5, 173.5), "Research info", BlockRotation.SOUTH, [{
        "type": "display_research", "do": { "researchID": 406 }, "delay": 40
    }]);
    LevelConstructor.rechargeStation(new VectorXZ(5877.5, 171.5), BlockRotation.EAST)
    LevelConstructor.gamebandUpgrade(new VectorXZ(5871.5, 175.5), "xray", "§4§lXRay Lvl. 2", 2, 3, BlockRotation.WEST, [{
        "type": "voice_says", "do": { "soundID": 503 }
    }]);
} // X-Ray Lvl. 2 Research

{
    // Women's
    Utilities.setBlock(new Vector(5882, Utilities.levelPlayingHeight, 137), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.NORTH });
    Utilities.setBlock(new Vector(5886, Utilities.levelPlayingHeight, 135), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.SOUTH });
    Utilities.setBlock(new Vector(5886, Utilities.levelPlayingHeight, 137), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.SOUTH });
    Utilities.setBlock(new Vector(5886, Utilities.levelPlayingHeight, 139), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.SOUTH });
    Utilities.setBlock(new Vector(5885, Utilities.ventHeight, 137), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.EAST });
    // Men's
    Utilities.setBlock(new Vector(5876, Utilities.levelPlayingHeight, 137), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.SOUTH });
    Utilities.setBlock(new Vector(5872, Utilities.levelPlayingHeight, 135), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.NORTH });
    Utilities.setBlock(new Vector(5873, Utilities.ventHeight, 137), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.SOUTH });
} // Bathrooms

{
    LevelConstructor.keypad(new VectorXZ(5877.5, 139.5), 3, BlockRotation.WEST, []);
    LevelConstructor.keypad(new VectorXZ(5875.5, 145.5), 3, BlockRotation.SOUTH, []);

    LevelConstructor.staticCamera(new VectorXZ(5863.5, 141.5), -75);
    LevelConstructor.sonarRobot(new VectorXZ(5858.5, 142.5), 0);
    LevelConstructor.sonarRobot(new VectorXZ(5874.5, 144.5), 180);
} // End Level Hallway

{
    Utilities.setBlock(new Vector(5853, Utilities.levelPlayingHeight, 143), "theheist:custom_door_4_bottom_l", { "minecraft:cardinal_direction": "west", "theheist:unlocked": false });
    Utilities.setBlock(new Vector(5853, Utilities.levelPlayingHeight, 142), "theheist:custom_door_4_bottom_r", { "minecraft:cardinal_direction": "west", "theheist:unlocked": false });
    LevelConstructor.keycardReader(new VectorXZ(5854.5, 145.5), "yellow", [
        {
            "type": "set_block", "do": { "x": 5853, "y": Utilities.levelPlayingHeight, "z": 143, "block": "theheist:custom_door_4_bottom_l", "permutations": { "minecraft:cardinal_direction": "west", "theheist:open": true } }
        },
        {
            "type": "set_block", "do": { "x": 5853, "y": Utilities.levelPlayingHeight, "z": 142, "block": "theheist:custom_door_4_bottom_r", "permutations": { "minecraft:cardinal_direction": "west", "theheist:open": true } }
        },
        {
            "type": "play_sound", "do": { "soundID": "random.door_open" }
        },
        {
            "type": "manage_objective", "do": { "manageType": 2, "objective": "Access next level" }
        }
    ]);
    Utilities.setBlock(new Vector(5847, Utilities.consoleDisplayHeight, 142), "minecraft:lever", { "lever_direction": "east" });
    LevelConstructor.rechargeStation(new VectorXZ(5851.5, 141.5), BlockRotation.NORTH);
} // End Level Elevator

}
};

export default level;