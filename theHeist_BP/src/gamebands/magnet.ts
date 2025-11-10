import { EffectTypes, Player } from "@minecraft/server";
import DataManager from "../managers/DataManager";
import Utilities from "../Utilities";
import Vector from "../Vector";
import GamebandManager from "./GamebandManager";
import { GamebandInfo, InventoryTracker, LevelInformation, PlayerEnergyTracker } from "../TypeDefinitions";

export const magnetModeInfo: GamebandInfo = {
	1: {
		"cost": 1.6
	}
};

export function toggleMagnetMode(player: Player, lvl: number) {
    let levelInformation = DataManager.getData(player, "levelInformation")!;
	let inventoryTracker = DataManager.getData(player, "inventoryTracker")!;
    if (playerIsInMagnetMode(levelInformation)) endMagnetMode(player, levelInformation, inventoryTracker);
    else tryStartMagnetMode(player, lvl, levelInformation, inventoryTracker);
}

function tryStartMagnetMode(player: Player, lvl: number, levelInformation: LevelInformation, inventoryTracker: InventoryTracker) {
    GamebandManager.cancelMode(player, levelInformation.currentMode);
    levelInformation = DataManager.getData(player, "levelInformation")!;

    var costPerSecond = magnetModeInfo[lvl].cost;
    var costPerTick = costPerSecond / 20;
    var energyTracker = DataManager.getData(player, "playerEnergyTracker")!;
    if (energyTracker.energyUnits < costPerTick) {
        player.sendMessage("§cNot enough energy!");
        return;
    }

    var magnetBlock = Utilities.dimensions.overworld.getBlock(new Vector(player.location.x, Utilities.magnetModeMagnetBlocksHeight, player.location.z));
    if (!magnetBlock) return;
    if (magnetBlock.typeId != "minecraft:iron_block") {
        player.sendMessage("§cNothing to grab onto!");
        return;
    }
	
    levelInformation.currentMode = { "mode": "magnet", "level": lvl };
    DataManager.setData(player, levelInformation);

    inventoryTracker.slots = inventoryTracker.slots.filter((s) => (s.slot != 4));
    inventoryTracker.slots.push({ "slot": 4, "typeId": `theheist:magnet_mode_lvl_${lvl}_enchanted`, "lockMode": "slot" });
    Utilities.reloadPlayerInv(player, inventoryTracker);
	DataManager.setData(player, inventoryTracker);
}

function endMagnetMode(player: Player, levelInformation: LevelInformation, inventoryTracker: InventoryTracker) {
    if (!playerIsInMagnetMode(levelInformation)) return;
    var magnetModeData = levelInformation.currentMode!;
    player.removeEffect(EffectTypes.get("levitation")!);
    levelInformation.currentMode = null;
    DataManager.setData(player, levelInformation);

    inventoryTracker.slots = inventoryTracker.slots.filter((x) => x.slot != 4);
    inventoryTracker.slots.push({ "slot": 4, "typeId": `theheist:magnet_mode_lvl_${magnetModeData.level}`, "lockMode": "slot" });
    Utilities.reloadPlayerInv(player, inventoryTracker);
}

export function magnetTick(player: Player, levelInformation: LevelInformation, energyTracker: PlayerEnergyTracker, inventoryTracker: InventoryTracker) {
    if (!playerIsInMagnetMode(levelInformation)) return;
    var magnetModeData = levelInformation.currentMode!;
    // Player is currently in magnet mode
    var costPerSecond = magnetModeInfo[magnetModeData.level].cost;
    var costPerTick = costPerSecond / 20;
    energyTracker.energyUnits -= costPerTick;
    if (energyTracker.energyUnits <= 0) {
        // Player can no longer afford magnet mode
        energyTracker.energyUnits = 0;
        endMagnetMode(player, levelInformation, inventoryTracker);
        DataManager.setData(player, energyTracker);
        return;
    }
    DataManager.setData(player, energyTracker);

    var magnetBlock = Utilities.dimensions.overworld.getBlock(new Vector(player.location.x, Utilities.magnetModeMagnetBlocksHeight, player.location.z));
    if (!magnetBlock || magnetBlock.typeId == "minecraft:air") {
        endMagnetMode(player, levelInformation, inventoryTracker);
        return;
    }

    player.addEffect(EffectTypes.get("levitation")!, 10, { 'amplifier': 10, 'showParticles': false });
}

export function playerIsInMagnetMode(levelInformation: LevelInformation) {
    return levelInformation.currentMode?.mode == "magnet";
}