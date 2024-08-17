import { ItemStack, Player, system, world, DisplaySlotId, BlockInventoryComponent, BlockPermutation, Container, ItemLockMode } from "@minecraft/server";
import Vector from "../Vector";
import DataManager from "../DataManager";
import Utilities from "../Utilities";
import LevelConstructor from "./LevelConstructor";

const level: ILevel = {
"levelID": "-2-1",
"loadElevatorLoc": new Vector(4101, -49, 123),
"startPlayerLoc": new Vector(4101, -60, 123),
"startingItems": [{ "slot": 0, "typeId": 'theheist:recharge_mode_lvl_2', "lockMode": "slot" }, { "slot": 1, "typeId": 'theheist:hacking_mode_lvl_2', "lockMode": "slot" }, { "slot": 2, "typeId": 'theheist:sensor_mode_lvl_1', "lockMode": "slot" }],
"rechargeLevel": 2,
"startObjectives": [{ "name": "Access next level", "sortOrder": 5 }, { "name": "Get Xray mode", "sortOrder": 4 }, { "name": "Get Sensor upgrade", "sortOrder": 3 }],
setup: () => {

{
    Utilities.setBlock(new Vector(4081, -60, 102), "theheist:custom_door_1_bottom", { "theheist:rotation": 5, "theheist:unlocked": false });
    LevelConstructor.keypad(new Vector(4080.5, -59, 103.5), 1, 5, [
        {
            "type": "set_block", "do": { "x": 4081, "y": -60, "z": 102, "block": "theheist:custom_door_1_bottom", "permutations": { "theheist:rotation": 5, "theheist:unlocked": true } }, "delay": 40
        }
    ]);
    LevelConstructor.rechargeStation(new Vector(4084.5, -60, 104.5), 3);
    LevelConstructor.rechargeStation(new Vector(4086.5, -60, 104.5), 3);
    LevelConstructor.rechargeStation(new Vector(4088.5, -60, 101.5), 5);
    LevelConstructor.rechargeStation(new Vector(4088.5, -60, 99.5), 5);
} // Engineering Workshop

{
    LevelConstructor.keypad(new Vector(4096.5, -59, 96.5), 3, 3, []);
} // Head of Research

{
    LevelConstructor.keypad(new Vector(4108.5, -59, 101.5), 3, 2, []);
    LevelConstructor.keycardDrawer(new Vector(4109, -60, 94), "green");
    LevelConstructor.computer(new Vector(4113.5, -59, 97.5), "Clear alarm status", 5, [
        {
            "type": "set_alarm_level", "do": { "value": 0 }, "delay": 40
        }
    ]);
    //
} // Security Office

{
    Utilities.setBlock(new Vector(4110.5, -60, 112.5), "theheist:custom_door_2_bottom", { "theheist:rotation": 2, "theheist:unlocked": false });
    LevelConstructor.keycardReader(new Vector(4108.5, -59, 113.5), "red", [
        {
            "type": "set_block", "do": { "x": 4110, "y": -60, "z": 112, "block": "theheist:custom_door_2_bottom", "permutations": { "theheist:rotation": 2, "theheist:unlocked": true, "theheist:open": true  } }
        },
        {
            "type": "play_sound", "do": { "soundID": "random.door_open" }
        }
    ]);
} // Ventilation Pump Room

{
    LevelConstructor.computer(new Vector(4088.5, -59, 130.5), "Mail", 2, [
        {
            "type": "display_mail", "do": { "mailID": 200 }, "delay": 40
        },
        {
            "type": "manage_objectives", "do": { "manageType": 1, "objective": "Find Red Keycard", "sortOrder": 2 }, "delay": 40
        }
    ])
} // Server Room

{
    LevelConstructor.computer(new Vector(4078.5, -59, 134.5), "Mail", 4, [
        {
            "type": "display_mail", "do": { "mailID": 201 }, "delay": 40
        },
        {
            "type": "manage_objectives", "do": { "manageType": 1, "objective": "Read elevator code", "sortOrder": 0 }, "delay": 40
        }
    ]);
    LevelConstructor.computer(new Vector(4076.5, -59, 132.5), "Mail", 5, [
        {
            "type": "display_mail", "do": { "mailID": 202 }, "delay": 40
        }
    ]);
} // Web Development

{
    Utilities.setBlock(new Vector(4068,  -60, 138), "theheist:custom_door_2_bottom", { "theheist:rotation": 4, "theheist:unlocked": false });
    LevelConstructor.keypad(new Vector(4069.5, -59, 137.5), 2, 4, [{
        "type": "set_block", "do": { "x": 4068, "y": -60, "z": 138, "block": "theheist:custom_door_2_bottom", "permutations": { "theheist:rotation": 4, "theheist:unlocked": true } }, "delay": 40
    }]);
    LevelConstructor.computer(new Vector(4067.5, -59, 132.5), "Research info", 5, [{
        "type": "display_research", "do": { "researchID": 204 }, "delay": 40
    }]);
    LevelConstructor.gamebandUpgrade(new Vector(4062.5, -59, 133.5), "sensor", "§6§lSensor Lvl. 2", 2, 2, 4, []);
} // Sensor Lvl.2 Research

{
    LevelConstructor.computer(new Vector(4091.5, -59, 158.5), "Mail", 3, [{
        "type": "display_mail", "do": { "mailID": 206 }, "delay": 40
    }]);
    LevelConstructor.computer(new Vector(4103.5, -59, 145.5), "Mail", 2, [{
        "type": "display_mail", "do": { "mailID": 205 }, "delay": 40
    },
    {
        "type": "manage_objectives", "do": { "manageType": 1, "objective": "Find Green Keycard", "sortOrder": 1 }, "delay": 40
    }]);
    LevelConstructor.keycardDrawer(new Vector(4104, -60, 158), "red");
} // Customer Service

{
    Utilities.setBlock(new Vector(4121, -60, 142), "theheist:custom_door_3_bottom", { "theheist:rotation": 5, "theheist:unlocked": false });
    LevelConstructor.keycardReader(new Vector(4120, -59, 144), "green", [
        {
            "type": "set_block", "do": { "x": 4121, "y": -60, "z": 142, "block": "theheist:custom_door_3_bottom", "permutations": { "theheist:rotation": 5, "theheist:unlocked": true, "theheist:open": true  } }
        },
        {
            "type": "play_sound", "do": { "soundID": "random.door_open" }
        }
    ]);
    LevelConstructor.computer(new Vector(4123.5, -59, 150.5), "Research info", 3, [
        {
            "type": "display_research", "do": { "researchID": 203 }, "delay": 40
        }
    ]);
    LevelConstructor.rechargeStation(new Vector(4122.5, -60, 146.5), 4);
    LevelConstructor.newGameband(new Vector(4131.5, -59, 146.5), "xray", "§4§lXRay Lvl. 1", 3, 5, []);
} // Xray Research

{
    LevelConstructor.staticCamera(new Vector(4100.5, -58, 114.5), 70);
    LevelConstructor.staticCamera(new Vector(4102.5, -58, 140.5), 70);
    LevelConstructor.dynamicCamera(new Vector(4079.5, -58, 118.5), [1, 115, 245]);
    LevelConstructor.dynamicCamera(new Vector(4120.5, -58, 144.5), [1, 40, 160]);

    LevelConstructor.cameraRobot(new Vector(4113.5, -59.25, 111.5), 0);
    LevelConstructor.cameraRobot(new Vector(4084.5, -59.25, 150.5), 0);
    LevelConstructor.cameraRobot(new Vector(4119.5, -59.25, 129.5), 0);
    LevelConstructor.cameraRobot(new Vector(4072.5, -59.25, 116.5), 0);
} // Security Stuffs

{
    Utilities.setBlock(new Vector(4081, -60, 123), "theheist:custom_door_4_bottom_l", { "theheist:rotation": 4, "theheist:unlocked": false });
    Utilities.setBlock(new Vector(4081, -60, 122), "theheist:custom_door_4_bottom_r", { "theheist:rotation": 4, "theheist:unlocked": false });
    LevelConstructor.keypadWithPrereq(new Vector(4082.5, -59, 125.5), 0, 4, [
        {
            "type": "set_block", "do": { "x": 4081, "y": -60, "z": 123, "block": "theheist:custom_door_4_bottom_l", "permutations": { "theheist:rotation": 4, "theheist:open": true } }, "delay": 40
        },
        {
            "type": "set_block", "do": { "x": 4081, "y": -60, "z": 122, "block": "theheist:custom_door_4_bottom_r", "permutations": { "theheist:rotation": 4, "theheist:open": true } }, "delay": 40
        },
        {
            "type": "play_sound", "do": { "soundID": "random.door_open" }, "delay": 40
        },
        {
            "type": "manage_objectives", "do": { "manageType": 2, "objective": "Access next level" }, "delay": 40
        }
    ], { "reqObj": "Read elevator code" });
    Utilities.setBlock(new Vector(4076.5, -59, 122.5), "lever", { "lever_direction": "east" });
} // Elevator

}
};

export default level;