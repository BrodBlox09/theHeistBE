import { BlockPermutation, system, Player } from "@minecraft/server";
import DataManager from "../managers/DataManager";
import Utilities from "../Utilities";
import Vector from "../Vector";
import GamebandManager from "./GamebandManager";
import { GamebandInfo, GamebandTracker, InventoryTracker } from "../TypeDefinitions";

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
    let gamebandTracker = DataManager.getData(player, "gamebandTracker")!;
	let inventoryTracker = DataManager.getData(player, "inventoryTracker")!;
    if (playerIsInXRayMode(gamebandTracker)) endXRayMode(player, gamebandTracker, inventoryTracker);
    else tryStartXRayMode(player, lvl, gamebandTracker, inventoryTracker);
}

function tryStartXRayMode(player: Player, lvl: number, gamebandTracker: GamebandTracker, inventoryTracker: InventoryTracker) {
    GamebandManager.cancelMode(player, gamebandTracker.currentMode);
    gamebandTracker = DataManager.getData(player, "gamebandTracker")!;
    
    var costPerSecond = xrayModeInfo[lvl].cost;
    var costPerTick = costPerSecond / 20;
    if (gamebandTracker.energy < costPerTick) {
        player.sendMessage("§cNot enough energy!");
        return;
    }

    gamebandTracker.currentMode = { "mode": "xray", "level": lvl };
    inventoryTracker.slots = inventoryTracker.slots.filter((s) => (s.slot != 3));
    inventoryTracker.slots.push({ "slot": 3, "typeId": `theheist:xray_mode_lvl_${lvl}_enchanted`, "lockMode": "slot" });
    DataManager.setData(player, gamebandTracker);
    DataManager.setData(player, inventoryTracker);
    Utilities.reloadPlayerInv(player, inventoryTracker);
    player.playSound("mob.spider.step", { "pitch": 1.5 });
    updateXRayDisplay(player, gamebandTracker, lvl);
}

function endXRayMode(player: Player, gamebandTracker: GamebandTracker, inventoryTracker: InventoryTracker) {
    if (!playerIsInXRayMode(gamebandTracker)) return;
    var xrayModeData = gamebandTracker.currentMode!;
    gamebandTracker.currentMode = null;
    inventoryTracker.slots = inventoryTracker.slots.filter((x) => x.slot != 3);
    inventoryTracker.slots.push({ "slot": 3, "typeId": `theheist:xray_mode_lvl_${xrayModeData!.level}`, "lockMode": "slot" });
    DataManager.setData(player, gamebandTracker);
    DataManager.setData(player, inventoryTracker);
    Utilities.reloadPlayerInv(player, inventoryTracker);
    player.playSound("mob.spider.step", { "pitch": 1.25 });
    clearXRayDisplay(player);
    system.runTimeout(() => clearXRayDisplay(player), 5); // Ensure everything actually gets cleared
}

export function xrayTick(player: Player, gamebandTracker: GamebandTracker, inventoryTracker: InventoryTracker) {
    if (!playerIsInXRayMode(gamebandTracker)) return;
    var xrayModeData = gamebandTracker.currentMode!;
    // Player is currently in xray mode
    var costPerSecond = xrayModeInfo[xrayModeData.level].cost;
    var costPerTick = costPerSecond / 20;
    gamebandTracker.energy -= costPerTick;
    if (gamebandTracker.energy <= 0) {
        // Player can no longer afford xray mode
        gamebandTracker.energy = 0;
        endXRayMode(player, gamebandTracker, inventoryTracker);
        DataManager.setData(player, gamebandTracker);
        return;
    }
    DataManager.setData(player, gamebandTracker);
    updateXRayDisplay(player, gamebandTracker, xrayModeData.level);
}

export function updateXRayDisplay(player: Player, gamebandTracker: GamebandTracker, lvl: number) {
    // Update ground to show where the camera sight blocks are
    if (!playerIsInXRayMode(gamebandTracker)) return; // Player is not in xray mode
    clearXRayDisplay(player);
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

function clearXRayDisplay(player: Player) {
    var loc = Vector.from(player.location);
    loc.y = Utilities.levelFloorHeight; // Ensure xray does not go below the level
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

export function playerIsInXRayMode(gamebandTracker: GamebandTracker) {
    return gamebandTracker.currentMode?.mode == "xray";
}