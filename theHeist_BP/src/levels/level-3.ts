import { ItemStack, Player, system, world, DisplaySlotId, BlockInventoryComponent, BlockPermutation, Container, ItemLockMode } from "@minecraft/server";
import Vector from "../Vector";
import DataManager from "../DataManager";
import Utilities from "../Utilities";
import LevelConstructor from "./LevelConstructor";

const level: ILevel = {
"levelID": "-3-1",
"loadElevatorLoc": new Vector(5022, -49, 130),
"startPlayerLoc": new Vector(5022, -60, 130),
"tickingAreas": [],
"startingItems": [{ "slot": 0, "typeId": 'theheist:recharge_mode_lvl_2', "lockMode": "slot" }, { "slot": 1, "typeId": 'theheist:hacking_mode_lvl_2', "lockMode": "slot" }, { "slot": 2, "typeId": 'theheist:sensor_mode_lvl_2', "lockMode": "slot" }, { "slot": 3, "typeId": 'theheist:xray_mode_lvl_1', "lockMode": "slot" }],
"rechargeLevel": 2,
"startObjectives": [{ "name": "Access next level", "sortOrder": 5 }],
setup: () => {

{
    Utilities.dimensions.overworld.fillBlocks(new Vector(5010, -60, 139), new Vector(5010, -60, 142), "minecraft:iron_block");
    Utilities.setBlock(new Vector(5010, -60, 142), "minecraft:redstone_block");
    Utilities.setBlock(new Vector(5009, -60, 127), "theheist:custom_door_2_bottom", { "theheist:rotation": 2, "theheist:unlocked": false });
    LevelConstructor.keypad(new Vector(5008.5, -59, 128.5), 2, 2, [{
        "type": "set_block", "do": { 'x': 5009, 'y': -60, 'z': 127, "block": "theheist:custom_door_2_bottom", "permutations": { "theheist:rotation": 2 } }, "delay": 40
    }]);
    LevelConstructor.computer(new Vector(5004.5, -59, 125.5), "Mail", 4, [{
        "type": "display_mail", "do": { "mailID": 300 }, "delay": 40
    }]);
} // Laser Lab

{
    Utilities.setBlock(new Vector(4985, -60, 122), "theheist:custom_door_2_bottom", { "theheist:rotation": 5, "theheist:unlocked": false });
    LevelConstructor.keypad(new Vector(4984.5, -59, 121.5), 2, 5, [{
        "type": "set_block", "do": { "x": 4985, "y": -60, "z": 122, "block": "theheist:custom_door_2_bottom", "permutations": { "theheist:rotation": 5 } }, "delay": 40
    }]);
    LevelConstructor.computer(new Vector(4990.5, -59, 116.5), "Research info", 2, [{
        "type": "display_research", "do": { "researchID": 302 }, "delay": 40
    }]);
    LevelConstructor.rechargeStation(new Vector(4990.5, -60, 123.5), 3);
} // Magnet Research

}
};

export default level;