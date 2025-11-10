import { EffectTypes, Player } from "@minecraft/server";
import DataManager from "../managers/DataManager";
import Utilities from "../Utilities";
import Vector from "../Vector";
import GamebandManager from "./GamebandManager";
import { GamebandInfo, GamebandTracker, InventoryTracker } from "../TypeDefinitions";

export const magnetModeInfo: GamebandInfo = {
	1: {
		"cost": 1.6
	}
};

export function toggleMagnetMode(player: Player, lvl: number) {
    let gamebandTracker = DataManager.getData(player, "gamebandTracker")!;
	let inventoryTracker = DataManager.getData(player, "inventoryTracker")!;
    if (playerIsInMagnetMode(gamebandTracker)) endMagnetMode(player, gamebandTracker, inventoryTracker);
    else tryStartMagnetMode(player, lvl, gamebandTracker, inventoryTracker);
}

function tryStartMagnetMode(player: Player, lvl: number, gamebandTracker: GamebandTracker, inventoryTracker: InventoryTracker) {
    GamebandManager.cancelMode(player, gamebandTracker.currentMode);

    var costPerSecond = magnetModeInfo[lvl].cost;
    var costPerTick = costPerSecond / 20;
    if (gamebandTracker.energy < costPerTick) {
        player.sendMessage("§cNot enough energy!");
        return;
    }

    var magnetBlock = Utilities.dimensions.overworld.getBlock(new Vector(player.location.x, Utilities.magnetModeMagnetBlocksHeight, player.location.z));
    if (!magnetBlock) return;
    if (magnetBlock.typeId != "minecraft:iron_block") {
        player.sendMessage("§cNothing to grab onto!");
        return;
    }
	
    gamebandTracker.currentMode = { "mode": "magnet", "level": lvl };
    DataManager.setData(player, gamebandTracker);

    inventoryTracker.slots = inventoryTracker.slots.filter((s) => (s.slot != 4));
    inventoryTracker.slots.push({ "slot": 4, "typeId": `theheist:magnet_mode_lvl_${lvl}_enchanted`, "lockMode": "slot" });
    Utilities.reloadPlayerInv(player, inventoryTracker);
	DataManager.setData(player, inventoryTracker);
}

function endMagnetMode(player: Player, gamebandTracker: GamebandTracker, inventoryTracker: InventoryTracker) {
    if (!playerIsInMagnetMode(gamebandTracker)) return;
    var magnetModeData = gamebandTracker.currentMode!;
    player.removeEffect(EffectTypes.get("levitation")!);
    gamebandTracker.currentMode = null;
    DataManager.setData(player, gamebandTracker);

    inventoryTracker.slots = inventoryTracker.slots.filter((x) => x.slot != 4);
    inventoryTracker.slots.push({ "slot": 4, "typeId": `theheist:magnet_mode_lvl_${magnetModeData.level}`, "lockMode": "slot" });
    Utilities.reloadPlayerInv(player, inventoryTracker);
}

export function magnetTick(player: Player, gamebandTracker: GamebandTracker, inventoryTracker: InventoryTracker) {
    if (!playerIsInMagnetMode(gamebandTracker)) return;
    var magnetModeData = gamebandTracker.currentMode!;
    // Player is currently in magnet mode
    var costPerSecond = magnetModeInfo[magnetModeData.level].cost;
    var costPerTick = costPerSecond / 20;
    gamebandTracker.energy -= costPerTick;
    if (gamebandTracker.energy <= 0) {
        // Player can no longer afford magnet mode
        gamebandTracker.energy = 0;
        endMagnetMode(player, gamebandTracker, inventoryTracker);
        DataManager.setData(player, gamebandTracker);
        return;
    }
    DataManager.setData(player, gamebandTracker);

    var magnetBlock = Utilities.dimensions.overworld.getBlock(new Vector(player.location.x, Utilities.magnetModeMagnetBlocksHeight, player.location.z));
    if (!magnetBlock || magnetBlock.typeId == "minecraft:air") {
        endMagnetMode(player, gamebandTracker, inventoryTracker);
        return;
    }

    player.addEffect(EffectTypes.get("levitation")!, 10, { 'amplifier': 10, 'showParticles': false });
}

export function playerIsInMagnetMode(gamebandTracker: GamebandTracker) {
    return gamebandTracker.currentMode?.mode == "magnet";
}