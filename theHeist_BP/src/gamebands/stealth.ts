import { Player } from "@minecraft/server";
import DataManager from "../managers/DataManager";
import Utilities from "../Utilities";
import Vector from "../Vector";
import GamebandManager from "./GamebandManager";
import { GamebandInfo, GamebandTracker, InventoryTracker } from "../TypeDefinitions";

export const stealthModeInfo: GamebandInfo = {
	1: {
		"cost": 40
	},
	2: {
		"cost": 10
	}
};

export function toggleStealthMode(player: Player, lvl: number) {
    let gamebandTracker = DataManager.getData(player, "gamebandTracker")!;
    let inventoryTracker = DataManager.getData(player, "inventoryTracker")!;
    if (playerIsInStealthMode(gamebandTracker)) endStealthMode(player, gamebandTracker, inventoryTracker);
    else tryStartStealthMode(player, lvl, gamebandTracker, inventoryTracker);
}

function tryStartStealthMode(player: Player, lvl: number, gamebandTracker: GamebandTracker, inventoryTracker: InventoryTracker) {
    GamebandManager.cancelMode(player, gamebandTracker.currentMode);
    gamebandTracker = DataManager.getData(player, "gamebandTracker")!;
    
    var costPerSecond = stealthModeInfo[lvl].cost;
    var costPerTick = costPerSecond / 20;
    if (gamebandTracker.energy < costPerTick) {
        player.sendMessage("§cNot enough energy!");
        return;
    }

    gamebandTracker.currentMode = { "mode": "stealth", "level": lvl };
    inventoryTracker.slots = inventoryTracker.slots.filter((s) => (s.slot != 5));
    inventoryTracker.slots.push({ "slot": 5, "typeId": `theheist:stealth_mode_lvl_${lvl}_enchanted`, "lockMode": "slot" });
    DataManager.setData(player, gamebandTracker);
    DataManager.setData(player, inventoryTracker);
    Utilities.reloadPlayerInv(player, inventoryTracker);
    player.playSound("mob.zombie.unfect", { "pitch": 1 });
}

function endStealthMode(player: Player, gamebandTracker: GamebandTracker, inventoryTracker: InventoryTracker) {
    if (!playerIsInStealthMode(gamebandTracker)) return;
    var stealthModeData = gamebandTracker.currentMode!;
    gamebandTracker.currentMode = null;
    inventoryTracker.slots = inventoryTracker.slots.filter((x) => x.slot != 5);
    inventoryTracker.slots.push({ "slot": 5, "typeId": `theheist:stealth_mode_lvl_${stealthModeData.level}`, "lockMode": "slot" });
    DataManager.setData(player, gamebandTracker);
    DataManager.setData(player, inventoryTracker);
    Utilities.reloadPlayerInv(player, inventoryTracker);
    player.playSound("mob.zombie.unfect", { "pitch": 2 });
}

export function stealthTick(player: Player, gamebandTracker: GamebandTracker, inventoryTracker: InventoryTracker) {
    if (!playerIsInStealthMode(gamebandTracker)) return;
    var stealthModeData = gamebandTracker.currentMode!;
    // Player is currently in stealth mode
    var costPerSecond = stealthModeInfo[stealthModeData.level].cost;
    var costPerTick = costPerSecond / 20;
    gamebandTracker.energy -= costPerTick;
    if (gamebandTracker.energy <= 0) {
        // Player can no longer afford stealth mode
        gamebandTracker.energy = 0;
        endStealthMode(player, gamebandTracker, inventoryTracker);
        DataManager.setData(player, gamebandTracker);
        return;
    }
    DataManager.setData(player, gamebandTracker);
    player.addEffect("invisibility", 5, { "showParticles": false });
}

export function playerIsInStealthMode(gamebandTracker: GamebandTracker) {
    return gamebandTracker.currentMode?.mode == "stealth";
}