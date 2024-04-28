import { MolangVariableMap, BlockPermutation, EffectTypes, Vector3, world, system, Player, EntityInventoryComponent, EffectType, DisplaySlotId, ScoreboardObjective, Container, ItemStack, ItemLockMode, Entity, Dimension, ItemUseAfterEvent } from "@minecraft/server";
import DataManager from "../DataManager";
import Utilities from "../Utilities";

export function toggleSensorMode(player: Player, lvl: number) {
    var levelInformation: LevelInformation = DataManager.getData(player, "levelInformation");
    var currentModes: ModeData[] = levelInformation.currentModes;
    if (currentModes.some((x) => x.mode == "sensor")) endSensorMode(player, levelInformation);
    else tryStartSensorMode(player, lvl, levelInformation);
}

function tryStartSensorMode(player: Player, lvl: number, levelInformation: LevelInformation) {
    levelInformation.currentModes.push({ "mode": "sensor", "level": lvl });
    levelInformation.information[2].inventory.push({ "slot": 2, "typeId": `theheist:sensor_mode_lvl_${lvl}_enchanted`, "lockMode": "slot" });
    DataManager.setData(player, levelInformation);
    Utilities.reloadPlayerInv(player, levelInformation);
}

function endSensorMode(player: Player, levelInformation: LevelInformation) {
    var currentModes: ModeData[] = levelInformation.currentModes;
    var sensorModeData = currentModes.find((x) => x.mode == "sensor");
    levelInformation.currentModes = currentModes.filter((x) => x.mode != "sensor");
    levelInformation.information[2].inventory = levelInformation.information[2].inventory.filter((x) => x.slot != 2);
    levelInformation.information[2].inventory.push({ "slot": 2, "typeId": `theheist:sensor_mode_lvl_${sensorModeData!.level}`, "lockMode": "slot" });
    DataManager.setData(player, levelInformation);
    Utilities.reloadPlayerInv(player, levelInformation);
}

export function sensorTick(player: Player, levelInformation: LevelInformation, energyTracker: EnergyTracker) {
    var currentModes: ModeData[] = levelInformation.currentModes;
    var sensorModeData = currentModes.find((x) => x.mode == "sensor");
    if (!sensorModeData) return;
    // Player is currently in sensor mode
    var costPerSecond = Utilities.gamebandInfo.sensorMode[sensorModeData.level].cost;
    var costPerTick = costPerSecond / 20;
    energyTracker.energyUnits -= costPerTick;
    if (energyTracker.energyUnits <= 0) {
        // Player can no longer afford sensor mode
        energyTracker.energyUnits = 0;
        endSensorMode(player, levelInformation);
        DataManager.setData(player, energyTracker);
        return;
    }
    DataManager.setData(player, energyTracker);
}

export function updateSensorDisplay() {
    // Update ground to show where the camera sight blocks are
    //console.warn("Updating sensor display");
}