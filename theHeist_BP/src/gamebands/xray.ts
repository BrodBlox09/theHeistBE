import { MolangVariableMap, BlockPermutation, EffectTypes, Vector3, world, system, Player, EntityInventoryComponent, EffectType, DisplaySlotId, ScoreboardObjective, Container, ItemStack, ItemLockMode, Entity, Dimension, ItemUseAfterEvent } from "@minecraft/server";
import DataManager from "../DataManager";
import Utilities from "../Utilities";
import Vector from "../Vector";

const viewRange = 2;
const clearRange = 4;
export const solidToTransparent = [
    { "solid": "minecraft:cyan_terracotta", "transparent": "minecraft:gray_stained_glass" },
    { "solid": "minecraft:hardened_clay", "transparent": "minecraft:brown_stained_glass" },
    { "solid": "minecraft:polished_andesite", "transparent": "minecraft:light_gray_stained_glass", "minLevel": 2 }
];

const overworld = Utilities.dimensions.overworld;

export function toggleXRayMode(player: Player, lvl: number) {
    var levelInformation: LevelInformation = DataManager.getData(player, "levelInformation");
    var currentModes: ModeData[] = levelInformation.currentModes;
    if (currentModes.some((x) => x.mode == "xray")) endXRayMode(player, levelInformation);
    else tryStartXRayMode(player, lvl, levelInformation);
}

function tryStartXRayMode(player: Player, lvl: number, levelInformation: LevelInformation) {
    var costPerSecond = Utilities.gamebandInfo.xrayMode[lvl].cost;
    var costPerTick = costPerSecond / 20;
    var energyTracker = DataManager.getData(player, "energyTracker");
    if (energyTracker.energyUnits < costPerTick) {
        player.sendMessage("§cNot enough energy!");
        return;
    }

    levelInformation.currentModes.push({ "mode": "xray", "level": lvl });
    levelInformation.information[2].inventory = levelInformation.information[2].inventory.filter((s) => (s.slot != 3));
    levelInformation.information[2].inventory.push({ "slot": 3, "typeId": `theheist:xray_mode_lvl_${lvl}_enchanted`, "lockMode": "slot" });
    DataManager.setData(player, levelInformation);
    Utilities.reloadPlayerInv(player, levelInformation);
    player.playSound("mob.spider.step", { "pitch": 1.5 });
    updateXRayDisplay(player, levelInformation, lvl);
}

function endXRayMode(player: Player, levelInformation: LevelInformation) {
    var currentModes: ModeData[] = levelInformation.currentModes;
    var xrayModeData = currentModes.find((x) => x.mode == "xray");
    levelInformation.currentModes = currentModes.filter((x) => x.mode != "xray");
    levelInformation.information[2].inventory = levelInformation.information[2].inventory.filter((x) => x.slot != 3);
    levelInformation.information[2].inventory.push({ "slot": 3, "typeId": `theheist:xray_mode_lvl_${xrayModeData!.level}`, "lockMode": "slot" });
    DataManager.setData(player, levelInformation);
    Utilities.reloadPlayerInv(player, levelInformation);
    player.playSound("mob.spider.step", { "pitch": 1.25 });
    clearXRayDisplay(player, levelInformation);
    system.runTimeout(() => clearXRayDisplay(player, levelInformation), 5); // Ensure everything actually gets cleared
}

export function xrayTick(player: Player, levelInformation: LevelInformation, energyTracker: EnergyTracker) {
    var currentModes: ModeData[] = levelInformation.currentModes;
    var xrayModeData = currentModes.find((x) => x.mode == "xray");
    if (!xrayModeData) return;
    // Player is currently in xray mode
    var costPerSecond = Utilities.gamebandInfo.xrayMode[xrayModeData.level].cost;
    var costPerTick = costPerSecond / 20;
    energyTracker.energyUnits -= costPerTick;
    if (energyTracker.energyUnits <= 0) {
        // Player can no longer afford xray mode
        energyTracker.energyUnits = 0;
        endXRayMode(player, levelInformation);
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
    var loc = Vector.v3ToVector(player.location);
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
    var loc = Vector.v3ToVector(player.location);
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
    var currentModes: ModeData[] = levelInformation.currentModes;
    return currentModes.some((x) => x.mode == "xray");
}