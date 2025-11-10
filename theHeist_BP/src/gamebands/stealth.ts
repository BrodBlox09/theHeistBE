import { Player } from "@minecraft/server";
import DataManager from "../managers/DataManager";
import Utilities from "../Utilities";
import Vector from "../Vector";
import GamebandManager from "./GamebandManager";
import { GamebandInfo, InventoryTracker, LevelInformation, PlayerEnergyTracker } from "../TypeDefinitions";

export const stealthModeInfo: GamebandInfo = {
	1: {
		"cost": 40
	},
	2: {
		"cost": 10
	}
};

export function toggleStealthMode(player: Player, lvl: number) {
    let levelInformation = DataManager.getData(player, "levelInformation")!;
    let inventoryTracker = DataManager.getData(player, "inventoryTracker")!;
    if (playerIsInStealthMode(levelInformation)) endStealthMode(player, levelInformation, inventoryTracker);
    else tryStartStealthMode(player, lvl, levelInformation, inventoryTracker);
}

function tryStartStealthMode(player: Player, lvl: number, levelInformation: LevelInformation, inventoryTracker: InventoryTracker) {
    GamebandManager.cancelMode(player, levelInformation.currentMode);
    levelInformation = DataManager.getData(player, "levelInformation")!;
    
    var costPerSecond = stealthModeInfo[lvl].cost;
    var costPerTick = costPerSecond / 20;
    var energyTracker = DataManager.getData(player, "playerEnergyTracker")!;
    if (energyTracker.energyUnits < costPerTick) {
        player.sendMessage("§cNot enough energy!");
        return;
    }

    levelInformation.currentMode = { "mode": "stealth", "level": lvl };
    inventoryTracker.slots = inventoryTracker.slots.filter((s) => (s.slot != 5));
    inventoryTracker.slots.push({ "slot": 5, "typeId": `theheist:stealth_mode_lvl_${lvl}_enchanted`, "lockMode": "slot" });
    DataManager.setData(player, levelInformation);
    DataManager.setData(player, inventoryTracker);
    Utilities.reloadPlayerInv(player, inventoryTracker);
    player.playSound("mob.zombie.unfect", { "pitch": 1 });
}

function endStealthMode(player: Player, levelInformation: LevelInformation, inventoryTracker: InventoryTracker) {
    if (!playerIsInStealthMode(levelInformation)) return;
    var stealthModeData = levelInformation.currentMode!;
    levelInformation.currentMode = null;
    inventoryTracker.slots = inventoryTracker.slots.filter((x) => x.slot != 5);
    inventoryTracker.slots.push({ "slot": 5, "typeId": `theheist:stealth_mode_lvl_${stealthModeData.level}`, "lockMode": "slot" });
    DataManager.setData(player, levelInformation);
    DataManager.setData(player, inventoryTracker);
    Utilities.reloadPlayerInv(player, inventoryTracker);
    player.playSound("mob.zombie.unfect", { "pitch": 2 });
}

export function stealthTick(player: Player, levelInformation: LevelInformation, energyTracker: PlayerEnergyTracker, inventoryTracker: InventoryTracker) {
    if (!playerIsInStealthMode(levelInformation)) return;
    var stealthModeData = levelInformation.currentMode!;
    // Player is currently in stealth mode
    var costPerSecond = stealthModeInfo[stealthModeData.level].cost;
    var costPerTick = costPerSecond / 20;
    energyTracker.energyUnits -= costPerTick;
    if (energyTracker.energyUnits <= 0) {
        // Player can no longer afford stealth mode
        energyTracker.energyUnits = 0;
        endStealthMode(player, levelInformation, inventoryTracker);
        DataManager.setData(player, energyTracker);
        return;
    }
    DataManager.setData(player, energyTracker);
    player.addEffect("invisibility", 5, { "showParticles": false });
}

export function playerIsInStealthMode(levelInformation: LevelInformation) {
    return levelInformation.currentMode?.mode == "stealth";
}