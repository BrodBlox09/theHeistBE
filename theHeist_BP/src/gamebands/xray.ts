import { BlockPermutation, system, Player } from "@minecraft/server";
import DataManager from "../managers/DataManager";
import Utilities from "../Utilities";
import Vector from "../Vector";
import GamebandManager from "./GamebandManager";
import { GamebandInfo, InventoryTracker, LevelInformation, PlayerEnergyTracker } from "../TypeDefinitions";

const viewRange = 2;
const clearRange = 4;

export const solidToTransparent = [
    { "solid": "minecraft:cyan_terracotta", "transparent": "minecraft:gray_stained_glass" },
    { "solid": "minecraft:hardened_clay", "transparent": "minecraft:brown_stained_glass" },
    { "solid": "minecraft:polished_andesite", "transparent": "minecraft:light_gray_stained_glass", "minLevel": 2 }
];

export const xrayModeInfo: GamebandInfo = {
	1: {
		"cost": 1.33
	},
	2: {
		"cost": 0.67
	}
};

export function toggleXRayMode(player: Player, lvl: number) {
    let levelInformation = DataManager.getData(player, "levelInformation")!;
	let inventoryTracker = DataManager.getData(player, "inventoryTracker")!;
    if (playerIsInXRayMode(levelInformation)) endXRayMode(player, levelInformation, inventoryTracker);
    else tryStartXRayMode(player, lvl, levelInformation, inventoryTracker);
}

function tryStartXRayMode(player: Player, lvl: number, levelInformation: LevelInformation, inventoryTracker: InventoryTracker) {
    GamebandManager.cancelMode(player, levelInformation.currentMode);
    levelInformation = DataManager.getData(player, "levelInformation")!;
    
    var costPerSecond = xrayModeInfo[lvl].cost;
    var costPerTick = costPerSecond / 20;
    var energyTracker = DataManager.getData(player, "playerEnergyTracker")!;
    if (energyTracker.energyUnits < costPerTick) {
        player.sendMessage("§cNot enough energy!");
        return;
    }

    levelInformation.currentMode = { "mode": "xray", "level": lvl };
    inventoryTracker.slots = inventoryTracker.slots.filter((s) => (s.slot != 3));
    inventoryTracker.slots.push({ "slot": 3, "typeId": `theheist:xray_mode_lvl_${lvl}_enchanted`, "lockMode": "slot" });
    DataManager.setData(player, levelInformation);
    DataManager.setData(player, inventoryTracker);
    Utilities.reloadPlayerInv(player, inventoryTracker);
    player.playSound("mob.spider.step", { "pitch": 1.5 });
    updateXRayDisplay(player, levelInformation, lvl);
}

function endXRayMode(player: Player, levelInformation: LevelInformation, inventoryTracker: InventoryTracker) {
    if (!playerIsInXRayMode(levelInformation)) return;
    var xrayModeData = levelInformation.currentMode!;
    levelInformation.currentMode = null;
    inventoryTracker.slots = inventoryTracker.slots.filter((x) => x.slot != 3);
    inventoryTracker.slots.push({ "slot": 3, "typeId": `theheist:xray_mode_lvl_${xrayModeData!.level}`, "lockMode": "slot" });
    DataManager.setData(player, levelInformation);
    DataManager.setData(player, inventoryTracker);
    Utilities.reloadPlayerInv(player, inventoryTracker);
    player.playSound("mob.spider.step", { "pitch": 1.25 });
    clearXRayDisplay(player, levelInformation);
    system.runTimeout(() => clearXRayDisplay(player, levelInformation), 5); // Ensure everything actually gets cleared
}

export function xrayTick(player: Player, levelInformation: LevelInformation, energyTracker: PlayerEnergyTracker, inventoryTracker: InventoryTracker) {
    if (!playerIsInXRayMode(levelInformation)) return;
    var xrayModeData = levelInformation.currentMode!;
    // Player is currently in xray mode
    var costPerSecond = xrayModeInfo[xrayModeData.level].cost;
    var costPerTick = costPerSecond / 20;
    energyTracker.energyUnits -= costPerTick;
    if (energyTracker.energyUnits <= 0) {
        // Player can no longer afford xray mode
        energyTracker.energyUnits = 0;
        endXRayMode(player, levelInformation, inventoryTracker);
        DataManager.setData(player, energyTracker);
        return;
    }
    DataManager.setData(player, energyTracker);
    updateXRayDisplay(player, levelInformation, xrayModeData.level);
}

export function updateXRayDisplay(player: Player, levelInformation: LevelInformation, lvl: number) {
    // Update ground to show where the camera sight blocks are
    if (!playerIsInXRayMode(levelInformation)) return; // Player is not in xray mode
    clearXRayDisplay(player, levelInformation);
    var loc = Vector.from(player.location);
    var corner1 = loc.subtract(new Vector(viewRange, viewRange, viewRange));
    var corner2 = loc.add(new Vector(viewRange, viewRange, viewRange));
    solidToTransparent.forEach((x) => {
        if (x.minLevel && x.minLevel > lvl) return;
        Utilities.fillBlocksWithOptions(corner1, corner2, x.transparent, {
            "blockFilter": {
                "includePermutations": [BlockPermutation.resolve(x.solid)]
            }
        });
    });
}

function clearXRayDisplay(player: Player, levelInformation: LevelInformation) {
    var loc = Vector.from(player.location);
    loc.y = Utilities.levelHeight; // Ensure xray does not go below the level
    var corner1 = loc.subtract(new Vector(clearRange, clearRange, clearRange));
    var corner2 = loc.add(new Vector(clearRange, clearRange, clearRange));
    solidToTransparent.forEach((x) => {
        Utilities.fillBlocksWithOptions(corner1, corner2, x.solid, {
            "blockFilter": {
                "includePermutations": [BlockPermutation.resolve(x.transparent)]
            }
        });
    });
}

export function playerIsInXRayMode(levelInformation: LevelInformation) {
    return levelInformation.currentMode?.mode == "xray";
}