import Vector from "../Vector";
import VectorXZ from "../VectorXZ";
import Utilities from "../Utilities";
import LevelConstructor from "./LevelConstructor";
import { ILevel, BlockRotation } from "../TypeDefinitions";

// Check security office to update cameraID for camera disable console

const level: ILevel = {
"levelId": "-3",
"levelCloneInfo": {
	"startX": 4963,
	"startZ": 89,
	"endX": 5031,
	"endZ": 182,
	"prisonLoc": new Vector(5011.5, -59, 151.5),
	"mapLoc": new Vector(4986, -55, 131)
},
"loadElevatorLoc": new Vector(5022, -49, 130),
"startPlayerLoc": new Vector(5022, Utilities.levelPlayingHeight, 130),
"startingItems": [{ "slot": 0, "typeId": 'theheist:recharge_mode_lvl_2', "lockMode": "slot" }, { "slot": 1, "typeId": 'theheist:hacking_mode_lvl_2', "lockMode": "slot" }, { "slot": 2, "typeId": 'theheist:sensor_mode_lvl_2', "lockMode": "slot" }, { "slot": 3, "typeId": 'theheist:xray_mode_lvl_1', "lockMode": "slot" }],
"rechargeLevel": 2,
"startObjectives": [{ "name": "Access next level", "sortOrder": 3 }, { "name": "Get Magnet mode", "sortOrder": 2 }, { "name": "Get Stealth mode", "sortOrder": 1 }],
setup: () => {

{
    Utilities.fillBlocks(new Vector(5010, Utilities.levelPlayingHeight, 139), new Vector(5010, Utilities.levelPlayingHeight, 142), "minecraft:iron_block");
    Utilities.setBlock(new Vector(5010, Utilities.levelPlayingHeight, 142), "minecraft:redstone_block");
    Utilities.setBlock(new Vector(5009, Utilities.levelPlayingHeight, 127), "theheist:custom_door_2_bottom", { "minecraft:cardinal_direction": "north", "theheist:unlocked": false });
    LevelConstructor.keypad(new VectorXZ(5008.5, 128.5), 2, BlockRotation.NORTH, [{
        "type": "set_block", "do": { 'x': 5009, 'y': Utilities.levelPlayingHeight, 'z': 127, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "north" } }, "delay": 40
    }]);
    LevelConstructor.computer(new VectorXZ(5004.5, 125.5), "Mail", BlockRotation.WEST, [{
        "type": "display_mail", "do": { "mailID": 300 }, "delay": 40
    }]);
} // Laser Lab

{
    Utilities.setBlock(new Vector(4985, Utilities.levelPlayingHeight, 122), "theheist:custom_door_2_bottom", { "minecraft:cardinal_direction": "east", "theheist:unlocked": false });
    LevelConstructor.keypad(new VectorXZ(4984.5, 121.5), 2, BlockRotation.EAST, [{
        "type": "set_block", "do": { "x": 4985, "y": Utilities.levelPlayingHeight, "z": 122, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "east" } }, "delay": 40
    }]);
    LevelConstructor.computer(new VectorXZ(4990.5, 116.5), "Research info", BlockRotation.NORTH, [{
        "type": "display_research", "do": { "researchID": 302 }, "delay": 40
    }]);
    LevelConstructor.rechargeStation(new VectorXZ(4990.5, 123.5), BlockRotation.SOUTH);
    LevelConstructor.newGameband(new VectorXZ(4994.5, 121.5), "magnet", "§5§lMagnet", 4, BlockRotation.EAST, []);
    Utilities.setBlock(new Vector(4991, Utilities.ventHeight, 119), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.SOUTH });
} // Magnet Research

{
    LevelConstructor.keypad(new VectorXZ(4998.5, 126.5), 3, BlockRotation.WEST, []);
    LevelConstructor.computer(new VectorXZ(4986.5, 125.5), "Clear alarm status", BlockRotation.NORTH, [
        {
            "type": "set_alarm_level", "do": { "value": 0 }, "delay": 40
        }
    ]);
    LevelConstructor.computer(new VectorXZ(4990.5, 128.5), "Mail", BlockRotation.SOUTH, [
        {
            "type": "display_mail", "do": { "mailID": 303 }, "delay": 40
        }
    ]);
    LevelConstructor.computer(new VectorXZ(4996.5, 131.5), "Disable nearby camera", BlockRotation.EAST, [{
        "type": "disable_camera", "do": { "cameraID": 0 }, "delay": 40
    }]);
    LevelConstructor.rechargeStation(new VectorXZ(4996.5, 125.5), BlockRotation.EAST);
    Utilities.setBlock(new Vector(4991, Utilities.ventHeight, 128), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.EAST });
} // Security Office

{
    LevelConstructor.keypad(new VectorXZ(5004.5, 95.5), 3, BlockRotation.SOUTH, []);
    LevelConstructor.keypad(new VectorXZ(5005.5, 103.5), 3, BlockRotation.SOUTH, []);
    LevelConstructor.newGameband(new VectorXZ(5004.5, 108.5), "stealth", "§f§lStealth", 5, BlockRotation.SOUTH, []);
    LevelConstructor.computer(new VectorXZ(5001.5, 100.5), "Research info", BlockRotation.WEST, [{
        "type": "display_research", "do": { "researchID": 301 }, "delay": 40
    }]);
    LevelConstructor.rechargeStation(new VectorXZ(5007.5, 97.5), BlockRotation.NORTH);
    Utilities.setBlock(new Vector(5011, Utilities.ventHeight, 99), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.NORTH });
    Utilities.setBlock(new Vector(5004, -55, 102), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.NORTH });
    Utilities.setBlock(new Vector(5004, -55, 108), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.WEST });
} // Stealth Research

{
    LevelConstructor.computer(new VectorXZ(4999.5, 101.5), "Mail", BlockRotation.EAST, [{
        "type": "display_mail", "do": { "mailID": 304 }, "delay": 40
    },
    {
        "type": "manage_objective", "do" : { "manageType": 1, "objective": "Find Green Keycard", "sortOrder": 0 }, "delay": 40
    }]);
} // Gameband Assembly Factory

{
    Utilities.setBlock(new Vector(4970, Utilities.levelPlayingHeight, 103), "theheist:custom_door_2_bottom", { "minecraft:cardinal_direction": "east", "theheist:unlocked": false });
    LevelConstructor.keypad(new VectorXZ(4969.5, 102.5), 2, BlockRotation.EAST, [{
        "type": "set_block", "do": { "x": 4970, "y": Utilities.levelPlayingHeight, "z": 103, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "east", "theheist:unlocked": true } }, "delay": 40
    }]);
    LevelConstructor.rechargeStation(new VectorXZ(4978.5, 111.5), BlockRotation.SOUTH);
    LevelConstructor.keycardDrawer(new VectorXZ(4978.5, 108.5), "green");
} // Gameband Assembly Control Room

{
    LevelConstructor.dynamicCamera(new VectorXZ(4991.5, 133.5), [1, -80, 80]);
    LevelConstructor.dynamicCamera(new VectorXZ(5029.5, 105.5), [1, 45, 130]);
    LevelConstructor.dynamicCamera(new VectorXZ(4991.5, 91.5), [1, Utilities.levelPlayingHeight, 45]);
    LevelConstructor.dynamicCamera(new VectorXZ(4980.5, 102.5), [1, -140, -25]);
    LevelConstructor.staticCamera(new VectorXZ(4997.5, 153.5), 90);
    LevelConstructor.staticCamera(new VectorXZ(4997.5, 161.5), 90);

    LevelConstructor.staticCameraRobot(new VectorXZ(4967.5, 107.5), 0);
    LevelConstructor.cameraRobot(new VectorXZ(5017.5, 113.5), 0);
    LevelConstructor.cameraRobot(new VectorXZ(4984.5, 93.5), 0);
    LevelConstructor.cameraRobot(new VectorXZ(4984.5, 135.5), 0);
    LevelConstructor.cameraRobot(new VectorXZ(4992.5, 168.5), 0);
} // Security Stuffs

{
    // Men's
    Utilities.setBlock(new Vector(5014, Utilities.levelPlayingHeight, 109), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.SOUTH });
    Utilities.setBlock(new Vector(5010, Utilities.levelPlayingHeight, 108), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.NORTH });
    Utilities.setBlock(new Vector(5011, Utilities.ventHeight, 109), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.WEST });
    // Women's
    Utilities.setBlock(new Vector(5014, Utilities.levelPlayingHeight, 105), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.SOUTH });
    Utilities.setBlock(new Vector(5010, Utilities.levelPlayingHeight, 106), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.NORTH });
    Utilities.setBlock(new Vector(5010, Utilities.levelPlayingHeight, 104), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.NORTH });
    Utilities.setBlock(new Vector(5011, Utilities.ventHeight, 105), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.WEST });
} // Restrooms

{
    Utilities.setBlock(new Vector(4991, Utilities.ventHeight, 153), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.EAST });
    Utilities.setBlock(new Vector(4991, Utilities.ventHeight, 145), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.EAST });
    Utilities.setBlock(new Vector(4991, Utilities.ventHeight, 135), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.EAST });
} // Final hallway

{
    LevelConstructor.keypad(new VectorXZ(4989.5, 138.5), 3, BlockRotation.WEST, []);
    LevelConstructor.keypad(new VectorXZ(4993.5, 140.5), 3, BlockRotation.EAST, []);
    Utilities.setBlock(new Vector(4992, Utilities.levelPlayingHeight, 173), "theheist:custom_door_4_bottom_l", { "minecraft:cardinal_direction": "south", "theheist:unlocked": false });
    Utilities.setBlock(new Vector(4991, Utilities.levelPlayingHeight, 173), "theheist:custom_door_4_bottom_r", { "minecraft:cardinal_direction": "south", "theheist:unlocked": false });
    LevelConstructor.keycardReader(new VectorXZ(4989.5, 172.5), "green", [
        {
            "type": "set_block", "do": { "x": 4992, "y": Utilities.levelPlayingHeight, "z": 173, "block": "theheist:custom_door_4_bottom_l", "permutations": { "minecraft:cardinal_direction": "south", "theheist:open": true } }
        },
        {
            "type": "set_block", "do": { "x": 4991, "y": Utilities.levelPlayingHeight, "z": 173, "block": "theheist:custom_door_4_bottom_r", "permutations": { "minecraft:cardinal_direction": "south", "theheist:open": true } }
        },
        {
            "type": "play_sound", "do": { "soundID": "random.door_open" }
        },
        {
            "type": "manage_objective", "do": { "manageType": 2, "objective": "Access next level" }
        },
        {
            "type": "voice_says", "do": { "soundID": 404 }
        }
    ]);
    Utilities.setBlock(new Vector(4991.5, -59, 179.5), "minecraft:lever", { "lever_direction": "north" });
    LevelConstructor.rechargeStation(new VectorXZ(4990.5, 175.5), BlockRotation.WEST);
} // Elevator

}
};

export default level;