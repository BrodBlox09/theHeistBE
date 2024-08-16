import { MolangVariableMap, BlockPermutation, EffectTypes, Vector3, world, system, Player, EntityInventoryComponent, EffectType, DisplaySlotId, ScoreboardObjective, Container, ItemStack, ItemLockMode, Entity, Dimension, ItemUseAfterEvent } from "@minecraft/server";
import DataManager from "../DataManager";
import Utilities from "../Utilities";
import Vector from "../Vector";

const overworld = Utilities.dimensions.overworld;

export function toggleStealthMode(player: Player, lvl: number) {
    var levelInformation: LevelInformation = DataManager.getData(player, "levelInformation");
    var currentModes: ModeData[] = levelInformation.currentModes;
    if (currentModes.some((x) => x.mode == "stealth")) endStealthMode(player, levelInformation);
    else tryStartStealthMode(player, lvl, levelInformation);
}

function tryStartStealthMode(player: Player, lvl: number, levelInformation: LevelInformation) {
    var costPerSecond = Utilities.gamebandInfo.stealthMode[lvl].cost;
    var costPerTick = costPerSecond / 20;
    var energyTracker = DataManager.getData(player, "energyTracker");
    if (energyTracker.energyUnits < costPerTick) {
        player.sendMessage("§cNot enough energy!");
        return;
    }

    levelInformation.currentModes.push({ "mode": "stealth", "level": lvl });
    levelInformation.information[2].inventory = levelInformation.information[2].inventory.filter((s) => (s.slot != 5));
    levelInformation.information[2].inventory.push({ "slot": 5, "typeId": `theheist:stealth_mode_lvl_${lvl}_enchanted`, "lockMode": "slot" });
    DataManager.setData(player, levelInformation);
    Utilities.reloadPlayerInv(player, levelInformation);
    player.playSound("mob.zombie.unfect", { "pitch": 1 });
}

function endStealthMode(player: Player, levelInformation: LevelInformation) {
    var currentModes: ModeData[] = levelInformation.currentModes;
    var stealthModeData = currentModes.find((x) => x.mode == "stealth");
    levelInformation.currentModes = currentModes.filter((x) => x.mode != "stealth");
    levelInformation.information[2].inventory = levelInformation.information[2].inventory.filter((x) => x.slot != 5);
    levelInformation.information[2].inventory.push({ "slot": 5, "typeId": `theheist:stealth_mode_lvl_${stealthModeData!.level}`, "lockMode": "slot" });
    DataManager.setData(player, levelInformation);
    Utilities.reloadPlayerInv(player, levelInformation);
    player.playSound("mob.zombie.unfect", { "pitch": 2 });
}

export function stealthTick(player: Player, levelInformation: LevelInformation, energyTracker: EnergyTracker) {
    var currentModes: ModeData[] = levelInformation.currentModes;
    var stealthModeData = currentModes.find((x) => x.mode == "stealth");
    if (!stealthModeData) return;
    // Player is currently in stealth mode
    var costPerSecond = Utilities.gamebandInfo.stealthMode[stealthModeData.level].cost;
    var costPerTick = costPerSecond / 20;
    energyTracker.energyUnits -= costPerTick;
    if (energyTracker.energyUnits <= 0) {
        // Player can no longer afford stealth mode
        energyTracker.energyUnits = 0;
        endStealthMode(player, levelInformation);
        DataManager.setData(player, energyTracker);
        return;
    }
    DataManager.setData(player, energyTracker);
    player.addEffect("invisibility", 5, { "showParticles": false });
}

export function playerIsInStealthMode(levelInformation: LevelInformation) {
    var currentModes: ModeData[] = levelInformation.currentModes;
    return currentModes.some((x) => x.mode == "stealth");
}