import Vector from "../Vector";
import VectorXZ from "../VectorXZ";
import Utilities from "../Utilities";
import LevelConstructor from "./LevelConstructor";
import { ILevel, BlockRotation } from "../TypeDefinitions";

const level: ILevel = {
"levelId": "-2",
"levelCloneInfo": {
	"startX": 4060,
	"startZ": 91,
	"endX": 4133,
	"endZ": 159,
	"prisonLoc": new Vector(4075.5, -59, 151.5),
	"mapLoc": new Vector(4098, -55, 115)
},
"loadElevatorLoc": new Vector(4101, -49, 123),
"startPlayerLoc": new Vector(4101, Utilities.levelPlayingHeight, 123),
"startingItems": [{ "slot": 0, "typeId": 'theheist:recharge_mode_lvl_2', "lockMode": "slot" }, { "slot": 1, "typeId": 'theheist:hacking_mode_lvl_2', "lockMode": "slot" }, { "slot": 2, "typeId": 'theheist:sensor_mode_lvl_1', "lockMode": "slot" }],
"rechargeLevel": 2,
"startObjectives": [{ "name": "Access next level", "sortOrder": 5 }, { "name": "Get Xray mode", "sortOrder": 4 }, { "name": "Get Sensor upgrade", "sortOrder": 3 }],
setup: () => {

{
    Utilities.setBlock(new Vector(4081, Utilities.levelPlayingHeight, 102), "theheist:custom_door_1_bottom", { "minecraft:cardinal_direction": "east", "theheist:unlocked": false });
    LevelConstructor.keypad(new VectorXZ(4080.5, 103.5), 1, BlockRotation.EAST, [
        {
            "type": "set_block", "do": { "x": 4081, "y": Utilities.levelPlayingHeight, "z": 102, "block": "theheist:custom_door_1_bottom", "permutations": { "minecraft:cardinal_direction": "east", "theheist:unlocked": true } }, "delay": 40
        }
    ]);
    LevelConstructor.rechargeStation(new VectorXZ(4084.5, 104.5), BlockRotation.SOUTH);
    LevelConstructor.rechargeStation(new VectorXZ(4086.5, 104.5), BlockRotation.SOUTH);
    LevelConstructor.rechargeStation(new VectorXZ(4088.5, 101.5), BlockRotation.EAST);
    LevelConstructor.rechargeStation(new VectorXZ(4088.5, 99.5), BlockRotation.EAST);
    Utilities.setBlock(new Vector(4085, -57, 101), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.SOUTH });
} // Engineering Workshop

{
    LevelConstructor.keypad(new VectorXZ(4096.5, 96.5), 3, BlockRotation.SOUTH, []);
} // Head of Research

{
    LevelConstructor.keypad(new VectorXZ(4108.5, 101.5), 3, BlockRotation.NORTH, []);
    LevelConstructor.keycardDrawer(new VectorXZ(4109, 94), "green");
    LevelConstructor.computer(new VectorXZ(4113.5, 97.5), "Clear alarm status", BlockRotation.EAST, [
        {
            "type": "set_alarm_level", "do": { "value": 0 }, "delay": 40
        }
    ]);
} // Security Office

{
    Utilities.setBlock(new Vector(4110.5, Utilities.levelPlayingHeight, 112.5), "theheist:custom_door_2_bottom", { "minecraft:cardinal_direction": "north", "theheist:unlocked": false });
    LevelConstructor.keycardReader(new VectorXZ(4108.5, 113.5), "red", [
        {
            "type": "set_block", "do": { "x": 4110, "y": Utilities.levelPlayingHeight, "z": 112, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "north", "theheist:unlocked": true, "theheist:open": true  } }
        },
        {
            "type": "play_sound", "do": { "soundID": "random.door_open" }
        }
    ]);
    Utilities.setBlock(new Vector(4111, -56, 118), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.NORTH });
} // Ventilation Pump Room

{
    Utilities.setBlock(new Vector(4112, -57, 130), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.EAST });
} // Boiler Room

{
    LevelConstructor.computer(new VectorXZ(4088.5, 130.5), "Mail", BlockRotation.NORTH, [
        {
            "type": "display_mail", "do": { "mailID": 200 }, "delay": 40
        },
        {
            "type": "manage_objective", "do": { "manageType": 1, "objective": "Find Red Keycard", "sortOrder": 2 }, "delay": 40
        }
    ]);
    Utilities.setBlock(new Vector(4091, -57, 134), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.EAST });
} // Server Room

{
    LevelConstructor.computer(new VectorXZ(4078.5, 134.5), "Mail", BlockRotation.WEST, [
        {
            "type": "display_mail", "do": { "mailID": 201 }, "delay": 40
        },
        {
            "type": "manage_objective", "do": { "manageType": 1, "objective": "Read elevator code", "sortOrder": 0 }, "delay": 40
        }
    ]);
    LevelConstructor.computer(new VectorXZ(4076.5, 132.5), "Mail", BlockRotation.EAST, [
        {
            "type": "display_mail", "do": { "mailID": 202 }, "delay": 40
        }
    ]);
    Utilities.setBlock(new Vector(4077, -57, 129), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.WEST });
} // Web Development

{
    Utilities.setBlock(new Vector(4068,  Utilities.levelPlayingHeight, 138), "theheist:custom_door_2_bottom", { "minecraft:cardinal_direction": "west", "theheist:unlocked": false });
    LevelConstructor.keypad(new VectorXZ(4069.5, 137.5), 2, BlockRotation.WEST, [{
        "type": "set_block", "do": { "x": 4068, "y": Utilities.levelPlayingHeight, "z": 138, "block": "theheist:custom_door_2_bottom", "permutations": { "minecraft:cardinal_direction": "west", "theheist:unlocked": true } }, "delay": 40
    }]);
    LevelConstructor.computer(new VectorXZ(4067.5, 132.5), "Research info", BlockRotation.EAST, [{
        "type": "display_research", "do": { "researchID": 204 }, "delay": 40
    }]);
    LevelConstructor.gamebandUpgrade(new VectorXZ(4062.5, 133.5), "sensor", "§6§lSensor Lvl. 2", 2, 2, BlockRotation.WEST, []);
    Utilities.setBlock(new Vector(4064, -57, 135), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.SOUTH });
} // Sensor Lvl.2 Research

{
    LevelConstructor.computer(new VectorXZ(4091.5, 158.5), "Mail", BlockRotation.SOUTH, [{
        "type": "display_mail", "do": { "mailID": 206 }, "delay": 40
    }]);
    LevelConstructor.computer(new VectorXZ(4103.5, 145.5), "Mail", BlockRotation.NORTH, [{
        "type": "display_mail", "do": { "mailID": 205 }, "delay": 40
    },
    {
        "type": "manage_objective", "do": { "manageType": 1, "objective": "Find Green Keycard", "sortOrder": 1 }, "delay": 40
    }]);
    LevelConstructor.keycardDrawer(new VectorXZ(4104, 158), "red");
    Utilities.setBlock(new Vector(4103, -57, 152), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.NORTH });
    Utilities.setBlock(new Vector(4092, -57, 152), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.NORTH });
} // Customer Service

{
    Utilities.setBlock(new Vector(4121, Utilities.levelPlayingHeight, 142), "theheist:custom_door_3_bottom", { "minecraft:cardinal_direction": "east", "theheist:unlocked": false });
    LevelConstructor.keycardReader(new VectorXZ(4120, 144), "green", [
        {
            "type": "set_block", "do": { "x": 4121, "y": Utilities.levelPlayingHeight, "z": 142, "block": "theheist:custom_door_3_bottom", "permutations": { "minecraft:cardinal_direction": "east", "theheist:unlocked": true, "theheist:open": true  } }
        },
        {
            "type": "play_sound", "do": { "soundID": "random.door_open" }
        }
    ]);
    LevelConstructor.computer(new VectorXZ(4123.5, 150.5), "Research info", BlockRotation.SOUTH, [
        {
            "type": "display_research", "do": { "researchID": 203 }, "delay": 40
        }
    ]);
    LevelConstructor.rechargeStation(new VectorXZ(4122.5, 146.5), BlockRotation.WEST);
    LevelConstructor.newGameband(new VectorXZ(4131.5, 146.5), "xray", "§4§lXRay", 3, BlockRotation.EAST, []);
    Utilities.setBlock(new Vector(4127, -57, 145), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.SOUTH });
    Utilities.setBlock(new Vector(4127, Utilities.levelPlayingHeight, 140), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.WEST });
    Utilities.setBlock(new Vector(4126, -57, 136), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.SOUTH });
} // Xray Research

{
    LevelConstructor.staticCamera(new VectorXZ(4100.5, 114.5), 70);
    LevelConstructor.staticCamera(new VectorXZ(4102.5, 140.5), 70);
    LevelConstructor.dynamicCamera(new VectorXZ(4079.5, 118.5), [1, 115, 245]);
    LevelConstructor.dynamicCamera(new VectorXZ(4120.5, 144.5), [1, 40, 160]);

    LevelConstructor.cameraRobot(new VectorXZ(4113.5, 111.5), 0);
    LevelConstructor.cameraRobot(new VectorXZ(4084.5, 150.5), 0);
    LevelConstructor.cameraRobot(new VectorXZ(4119.5, 129.5), 0);
    LevelConstructor.cameraRobot(new VectorXZ(4072.5, 116.5), 0);
} // Security Stuffs

{
    Utilities.setBlock(new Vector(4085, -57, 109), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.EAST });
} // Bar

{
    // Women's
    Utilities.setBlock(new Vector(4086, Utilities.levelPlayingHeight, 122), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.NORTH });
    Utilities.setBlock(new Vector(4087, Utilities.levelPlayingHeight, 121), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.EAST });
    Utilities.setBlock(new Vector(4089, Utilities.levelPlayingHeight, 121), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.EAST });
    Utilities.setBlock(new Vector(4091, Utilities.levelPlayingHeight, 121), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.EAST, "door_hinge_bit": true });
    Utilities.setBlock(new Vector(4089, -57, 122), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.SOUTH });
    // Men's
    Utilities.setBlock(new Vector(4086, Utilities.levelPlayingHeight, 126), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.NORTH });
    Utilities.setBlock(new Vector(4090, Utilities.levelPlayingHeight, 125), "minecraft:wooden_door", { "minecraft:cardinal_direction": BlockRotation.SOUTH });
    Utilities.setBlock(new Vector(4088, -57, 126), "theheist:white_trapdoor", { "minecraft:cardinal_direction": BlockRotation.EAST });
} // Restrooms

{
    Utilities.setBlock(new Vector(4081, Utilities.levelPlayingHeight, 123), "theheist:custom_door_4_bottom_l", { "minecraft:cardinal_direction": "west", "theheist:unlocked": false });
    Utilities.setBlock(new Vector(4081, Utilities.levelPlayingHeight, 122), "theheist:custom_door_4_bottom_r", { "minecraft:cardinal_direction": "west", "theheist:unlocked": false });
    LevelConstructor.keypadWithPrereq(new VectorXZ(4082.5, 125.5), 0, BlockRotation.WEST, [
        {
            "type": "set_block", "do": { "x": 4081, "y": Utilities.levelPlayingHeight, "z": 123, "block": "theheist:custom_door_4_bottom_l", "permutations": { "minecraft:cardinal_direction": "west", "theheist:open": true } }, "delay": 40
        },
        {
            "type": "set_block", "do": { "x": 4081, "y": Utilities.levelPlayingHeight, "z": 122, "block": "theheist:custom_door_4_bottom_r", "permutations": { "minecraft:cardinal_direction": "west", "theheist:open": true } }, "delay": 40
        },
        {
            "type": "play_sound", "do": { "soundID": "random.door_open" }, "delay": 40
        },
        {
            "type": "manage_objective", "do": { "manageType": 2, "objective": "Access next level" }, "delay": 40
        }
    ], { "objectives": ["Read elevator code"] });
    Utilities.setBlock(new Vector(4076.5, -59, 122.5), "lever", { "lever_direction": "east" });
} // Elevator

}
};

export default level;