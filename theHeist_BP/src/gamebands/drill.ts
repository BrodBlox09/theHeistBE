import { Player } from "@minecraft/server";
import DataManager from "../managers/DataManager";
import Utilities from "../Utilities";
import Vector from "../Vector";
import GamebandManager from "./GamebandManager";
import { GamebandInfo } from "../TypeDefinitions";

export const drillModeInfo: GamebandInfo = {
	1: {
		"cost": 30
	}
};

export function tryDrillMode(player: Player, lvl: number) {
    let gamebandTracker = DataManager.getData(player, "gamebandTracker")!;
    GamebandManager.cancelMode(player, gamebandTracker.currentMode);
    gamebandTracker = DataManager.getData(player, "gamebandTracker")!;
    
    let playerRot = player.getRotation().y;
	if (playerRot < 0) playerRot = 360 + playerRot;
    playerRot = Math.round(playerRot / 90) * 90;
    let facingBlockLoc = new Vector(player.location.x - Utilities.sin(playerRot), player.location.y, player.location.z + Utilities.cos(playerRot));
    let facingBlockLocTID = Utilities.dimensions.overworld.getBlock(facingBlockLoc)!.typeId;
    let facingBlockLocAbove = facingBlockLoc.add(Vector.up);
    let facingBlockLocAboveTID = Utilities.dimensions.overworld.getBlock(facingBlockLocAbove)!.typeId;
    if (facingBlockLocTID != "minecraft:hardened_clay" || facingBlockLocAboveTID != "minecraft:hardened_clay") {
        player.sendMessage("§cCan't drill here!");
        return;
    }
    
    var cost = drillModeInfo[lvl].cost;
    if (gamebandTracker.energy < cost) {
        player.sendMessage("§cNot enough energy!");
        return;
    }
    gamebandTracker.energy -= cost;
    DataManager.setData(player, gamebandTracker);

    Utilities.dimensions.overworld.runCommand(`clone ${facingBlockLoc.x} ${facingBlockLoc.y} ${facingBlockLoc.z} ${facingBlockLocAbove.x} ${facingBlockLocAbove.y} ${facingBlockLocAbove.z} ${facingBlockLoc.x} ${Utilities.drilledBlocksHeight} ${facingBlockLoc.z}`);
    Utilities.dimensions.overworld.runCommand(`fill ${facingBlockLoc.x} ${facingBlockLoc.y} ${facingBlockLoc.z} ${facingBlockLocAbove.x} ${facingBlockLocAbove.y} ${facingBlockLocAbove.z} air destroy`);
}