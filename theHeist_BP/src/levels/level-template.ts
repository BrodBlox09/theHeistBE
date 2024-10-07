import { ItemStack, Player, system, world, DisplaySlotId, BlockInventoryComponent, BlockPermutation, Container, ItemLockMode } from "@minecraft/server";
import Vector from "../Vector";
import DataManager from "../DataManager";
import Utilities from "../Utilities";
import LevelConstructor from "./LevelConstructor";
import VoiceOverManager from "../VoiceOverManager";

const level: ILevel = {
"levelID": "-X-1",
"loadElevatorLoc": new Vector(0, 0, 0),
"startPlayerLoc": new Vector(0, 0, 0),
"startingItems": [],
"rechargeLevel": 1,
"startObjectives": [{ "name": "Access next level", "sortOrder": 1 }],
setup: () => {

{
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
    LevelConstructor.rechargeStation(new Vector(0, 0, 0), 0);
} // End Level Elevator

}
};

export default level;