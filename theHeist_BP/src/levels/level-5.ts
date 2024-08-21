import { ItemStack, Player, system, world, DisplaySlotId, BlockInventoryComponent, BlockPermutation, Container, ItemLockMode } from "@minecraft/server";
import Vector from "../Vector";
import DataManager from "../DataManager";
import Utilities from "../Utilities";
import LevelConstructor from "./LevelConstructor";
import VoiceOverManager from "../VoiceOverManager";

const level: ILevel = {
"levelID": "-5-1",
"loadElevatorLoc": new Vector(6912, -49, 162),
"startPlayerLoc": new Vector(6912, -60, 162),
"startingItems": [{ "slot": 0, "typeId": 'theheist:recharge_mode_lvl_3', "lockMode": "slot" }, { "slot": 1, "typeId": 'theheist:hacking_mode_lvl_3', "lockMode": "slot" }, { "slot": 2, "typeId": 'theheist:sensor_mode_lvl_2', "lockMode": "slot" }, { "slot": 3, "typeId": 'theheist:xray_mode_lvl_2', "lockMode": "slot" }, { "slot": 4, "typeId": 'theheist:magnet_mode_lvl_1', "lockMode": "slot" }, { "slot": 5, "typeId": 'theheist:stealth_mode_lvl_1', "lockMode": "slot" }, { "slot": 6, "typeId": 'theheist:stun_mode_lvl_1', "lockMode": "slot" }],
"rechargeLevel": 2,
"startObjectives": [{ "name": "Access next level", "sortOrder": 4 }, { "name": "Get Drill mode", "sortOrder": 3 }, { "name": "Get Hacking upgrade", "sortOrder": 2 }, { "name": "Get Stealth upgrade", "sortOrder": 1 }],
setup: () => {

{
    Utilities.setBlock(new Vector(6915, -60, 141), "theheist:custom_door_3_bottom", {"theheist:unlocked": false, "theheist:rotation": 5});
    LevelConstructor.keycardReader(new Vector(6914.5, -60, 143.5), "green", [
        {
            "type": "set_block", "do": { "x": 6915, "y": -60, "z": 141, "block": "theheist:custom_door_3_bottom", "permutations": { "theheist:rotation": 5, "theheist:open": true } }
        },
        {
            "type": "play_sound", "do": { "soundID": "random.door_open" }
        }
    ]);
    LevelConstructor.keycardDrawer(new Vector(6924, -60, 140), "green");
    LevelConstructor.computer(new Vector(6919.5, -59, 140.5), "Mail", 4, [{
        "type": "display_mail", "do": { "mailID": 508 }, "delay": 40
    }]);
} // Chief of Technology

{
    LevelConstructor.sonar360(new Vector(6912.5, -58, 124.5));
    LevelConstructor.rechargeStation(new Vector(6906.5, -60, 118.5), 4);
    // Starting/South Wing:
    LevelConstructor.cameraRobot(new Vector(6911.5, -59.25, 137.5), 0);
    // Right Wing:
    LevelConstructor.sonar(new Vector(6932.5, -58, 137.5), 225);
    LevelConstructor.sonarRobot(new Vector(6934.5, -59.25, 128.5), 0);
    // Left Wing:
    LevelConstructor.sonarRobot(new Vector(6897.5, -59.25, 122.5), 180);
} // Main Hub

{
    Utilities.setBlock(new Vector(6924, -60, 121), "theheist:custom_door_3_bottom", {"theheist:unlocked": false, "theheist:rotation": 2});
    Utilities.setBlock(new Vector(6924, -60, 120), "theheist:custom_door_3_bottom", {"theheist:unlocked": false, "theheist:rotation": 3});
    LevelConstructor.keypad(new Vector(6923.5, -59, 122.5), 3, 2, [{
        "type": "set_block", "do": { "x": 6924, "y": -60, "z": 121, "block": "theheist:custom_door_3_bottom", "permutations": { "theheist:rotation": 2 } }, "delay": 40
    },
    {
        "type": "hack_console", "do": { "x": 6923, "z": 119 }
    }]);
    LevelConstructor.keypad(new Vector(6923.5, -59, 119.5), 3, 3, [{
        "type": "set_block", "do": { "x": 6924, "y": -60, "z": 120, "block": "theheist:custom_door_3_bottom", "permutations": { "theheist:rotation": 3 } }, "delay": 40
    },
    {
        "type": "hack_console", "do": { "x": 6923, "z": 122 }
    }]);
    LevelConstructor.computer(new Vector(6925.5, -59, 115.5), "Disable 360 sonar", 5, [{
        "type": "disable_camera", "do": { "cameraID": 0 }, "delay": 40
    }]);
    LevelConstructor.computer(new Vector(6921.5, -59, 113.5), "Mail", 4, [{
        "type": "display_mail", "do": { "mailID": 506 }, "delay": 40
    }]);
    LevelConstructor.computer(new Vector(6916.5, -59, 113.5), "Clear alarm status", 4, [{
        "type": "set_alarm_level", "do": { "value": 0 }, "delay": 40
    }]);
    LevelConstructor.rechargeStation(new Vector(6920.5, -60, 119.5), 3);
    LevelConstructor.rechargeStation(new Vector(6919.5, -60, 118.5), 4);
} // Security Office

{
    LevelConstructor.computer(new Vector(6936.5, -59, 114.5), "Mail", 4, [{
        "type": "display_mail", "do": { "mailID": 505 }, "delay": 40
    }]);

    LevelConstructor.dynamicCamera(new Vector(6931.5, -58, 106.5), [1, -20, 120]);
    LevelConstructor.cameraRobot(new Vector(6922.5, -59.25, 107.5), 270);
} // Software Development

{

} // Chief of Engineering

{

} // Chief of Research

{

} // Electromagnetic Field Research

{

} // Administrative Office

{

} // Excavation Technology Research

{
    LevelConstructor.dynamicCamera(new Vector(6881.5, -58, 137.5), [2, 0, 0]); // Spins clockwise forever
} // Power Station Nuclear Core

}
};

export default level;