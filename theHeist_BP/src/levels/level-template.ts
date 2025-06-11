import BlockRotation from "../BlockRotation";
import Vector from "../Vector";
import Utilities from "../Utilities";
import LevelConstructor from "./LevelConstructor";

const level: ILevel = {
"levelID": "X",
"loadElevatorLoc": new Vector(0, 0, 0),
"startPlayerLoc": new Vector(0, 0, 0),
"startingItems": [],
"rechargeLevel": 1,
"startObjectives": [{ "name": "Access next level", "sortOrder": 1 }],
setup: () => {

{
    LevelConstructor.door4(new Vector(0, 0, 0), new Vector(0, 0, 0), BlockRotation.NORTH);
    LevelConstructor.keycardReader(new Vector(0, 0, 0), "COLOR", [
        {
            "type": "set_block", "do": { "x": 0, "y": 0, "z": 0, "block": "theheist:custom_door_4_bottom_l", "permutations": { "minecraft:cardinal_direction": "north", "theheist:open": true } }, "delay": 40
        },
        {
            "type": "set_block", "do": { "x": 0, "y": 0, "z": 0, "block": "theheist:custom_door_4_bottom_r", "permutations": { "minecraft:cardinal_direction": "north", "theheist:open": true } }, "delay": 40
        },
        {
            "type": "play_sound", "do": { "soundID": "random.door_open" }, "delay": 40
        },
        {
            "type": "manage_objectives", "do": { "manageType": 2, "objective": "Access next level" }, "delay": 40
        }
    ]);
    Utilities.setBlock(new Vector(0, 0, 0), "minecraft:lever", { "lever_direction": "north" });
    LevelConstructor.rechargeStation(new Vector(0, 0, 0), BlockRotation.NORTH);
} // End Level Elevator

}
};

export default level;