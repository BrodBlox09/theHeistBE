import { MolangVariableMap, BlockPermutation, EffectTypes, Vector3, world, system, Player, EntityInventoryComponent, EffectType, DisplaySlotId, ScoreboardObjective, Container, ItemStack, ItemLockMode, Entity, Dimension, ItemUseAfterEvent } from "@minecraft/server";
import DataManager from "../DataManager";
import Utilities from "../Utilities";
import Vector from "../Vector";

const overworld = Utilities.dimensions.overworld;

export function tryDrillMode(player: Player, lvl: number) {
    let playerRot = player.getRotation().y;
	if (playerRot < 0) playerRot = 360 + playerRot;
    playerRot = Math.round(playerRot / 90) * 90;
    let facingBlockLoc = new Vector(player.location.x - Utilities.sin(playerRot), player.location.y, player.location.z + Utilities.cos(playerRot));
    let facingBlockLocTID = overworld.getBlock(facingBlockLoc)!.typeId;
    let facingBlockLocAbove = facingBlockLoc.add(Vector.up);
    let facingBlockLocAboveTID = overworld.getBlock(facingBlockLocAbove)!.typeId;
    if (facingBlockLocTID != "minecraft:hardened_clay" || facingBlockLocAboveTID != "minecraft:hardened_clay") {
        player.sendMessage("§cCan't drill here!");
        return;
    }
    
    var cost = Utilities.gamebandInfo.drillMode[lvl].cost;
    let energyTracker = DataManager.getData(player, "energyTracker")!;
    if (energyTracker.energyUnits < cost) {
        player.sendMessage("§cNot enough energy!");
        return;
    }
    energyTracker.energyUnits -= cost;
    DataManager.setData(player, energyTracker);

    overworld.runCommand(`clone ${facingBlockLoc.x} ${facingBlockLoc.y} ${facingBlockLoc.z} ${facingBlockLocAbove.x} ${facingBlockLocAbove.y} ${facingBlockLocAbove.z} ${facingBlockLoc.x} ${Utilities.drilledBlocksHeight} ${facingBlockLoc.z}`);
    overworld.runCommand(`fill ${facingBlockLoc.x} ${facingBlockLoc.y} ${facingBlockLoc.z} ${facingBlockLocAbove.x} ${facingBlockLocAbove.y} ${facingBlockLocAbove.z} air destroy`);
}