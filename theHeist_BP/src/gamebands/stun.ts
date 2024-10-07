import { MolangVariableMap, BlockPermutation, EffectTypes, Vector3, world, system, Player, EntityInventoryComponent, EffectType, DisplaySlotId, ScoreboardObjective, Container, ItemStack, ItemLockMode, Entity, Dimension, ItemUseAfterEvent } from "@minecraft/server";
import DataManager from "../DataManager";
import Utilities from "../Utilities";
import Vector from "../Vector";

const overworld = Utilities.dimensions.overworld;
const range = 2;

export function tryStunMode(player: Player, lvl: number) {
    let robots = overworld.getEntities({
        "location": new Vector(player.location.x, Utilities.cameraHeight, player.location.z),
        "maxDistance": range,
        "tags": ["robot"]
    });
    if (robots.length == 0) return;

    var cost = Utilities.gamebandInfo.stunMode[lvl].cost;
    var energyTracker = DataManager.getData(player, "energyTracker");
    if (energyTracker.energyUnits < cost) {
        player.sendMessage("§cNot enough energy!");
        return;
    }
    energyTracker.energyUnits -= cost;
    DataManager.setData(player, energyTracker);
    player.playSound("map.shock", { "pitch": 1 });

    robots.forEach(robot => {
        var cameraTracker = DataManager.getData(robot, "cameraTracker");
        cameraTracker.isStunned = true;
        cameraTracker.stunTimer = 200;
        DataManager.setData(robot, cameraTracker);
    });
}