import { MolangVariableMap, BlockPermutation, EffectTypes, Vector3, world, system, Player, EntityInventoryComponent, EffectType, DisplaySlotId, ScoreboardObjective, Container, ItemStack, ItemLockMode, Entity, Dimension, ItemUseAfterEvent } from "@minecraft/server";
import DataManager from "../DataManager";
import Utilities from "../Utilities";
import Vector from "../Vector";

const sensingRange = 14;
const clearRange = 19;

export function tryMap(player: Player, levelInformation: LevelInformation) {
    // If sensor mode lvl. 2 or greater, the player can use the sensor mode to see a map of the level
	const playerRotX = player.getRotation().x;
	if (!(playerRotX < 90 && playerRotX > 80)) return; // Player is not looking down
    var sensorModeSlot = levelInformation.information[2].inventory.filter((slot) => (slot.slot == 2 && parseInt(slot.typeId.charAt(slot.typeId.length - 1)) >= 2))[0];
    if (!sensorModeSlot) return; // Player does not have a lvl 2 or greater sensor mode

}

export function toggleSensorMode(player: Player, lvl: number) {
    var levelInformation: LevelInformation = DataManager.getData(player, "levelInformation");
    var currentModes: ModeData[] = levelInformation.currentModes;
    if (currentModes.some((x) => x.mode == "sensor")) endSensorMode(player, levelInformation);
    else tryStartSensorMode(player, lvl, levelInformation);
}

function tryStartSensorMode(player: Player, lvl: number, levelInformation: LevelInformation) {
    levelInformation.currentModes.push({ "mode": "sensor", "level": lvl });
    levelInformation.information[2].inventory = levelInformation.information[2].inventory.filter((s) => (s.slot != 2));
    levelInformation.information[2].inventory.push({ "slot": 2, "typeId": `theheist:sensor_mode_lvl_${lvl}_enchanted`, "lockMode": "slot" });
    DataManager.setData(player, levelInformation);
    Utilities.reloadPlayerInv(player, levelInformation);
    updateSensorDisplay(player, levelInformation);
}

function endSensorMode(player: Player, levelInformation: LevelInformation) {
    var currentModes: ModeData[] = levelInformation.currentModes;
    var sensorModeData = currentModes.find((x) => x.mode == "sensor");
    levelInformation.currentModes = currentModes.filter((x) => x.mode != "sensor");
    levelInformation.information[2].inventory = levelInformation.information[2].inventory.filter((x) => x.slot != 2);
    levelInformation.information[2].inventory.push({ "slot": 2, "typeId": `theheist:sensor_mode_lvl_${sensorModeData!.level}`, "lockMode": "slot" });
    DataManager.setData(player, levelInformation);
    Utilities.reloadPlayerInv(player, levelInformation);
    clearSensed(player, levelInformation);
    system.runTimeout(() => clearSensed(player, levelInformation), 5); // Ensure everything actually gets cleared
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

export function updateSensorDisplay(player: Player, levelInformation: LevelInformation) {
    // Update ground to show where the camera sight blocks are
    if (!playerIsInSensorMode(levelInformation)) return; // Player is not in sensor mode
    clearSensed(player, levelInformation);
    var loc = Vector.v3ToVector(player.location);
    loc.y = Utilities.cameraMappingHeight - 3; // To get to camera sight blocks height
    var corner1Top = loc.subtract(new Vector(sensingRange, 0, sensingRange));
    var corner2Top = loc.add(new Vector(sensingRange, 0, sensingRange));
    var corner1Floor = loc.subtract(new Vector(sensingRange, 0, sensingRange));
    corner1Floor.y = Utilities.levelHeight - 1; // To get floor height
    // Hopefully below can be replaced and changed into a script API function
    Utilities.dimensions.overworld.runCommandAsync(`clone ${corner1Top.x} ${corner1Top.y} ${corner1Top.z} ${corner2Top.x} ${corner2Top.y} ${corner2Top.z} ${corner1Floor.x} ${corner1Floor.y} ${corner1Floor.z} filtered normal theheist:camera_sight`);
}

function clearSensed(player: Player, levelInformation: LevelInformation) {
    var loc = Vector.v3ToVector(player.location);
    loc.y = Utilities.levelHeight - 1; // To get to floor height
    var corner1 = loc.subtract(new Vector(clearRange, 0, clearRange));
    var corner2 = loc.add(new Vector(clearRange, 0, clearRange));
    var gameLevel = levelInformation.information[1].level;
    var floorBlock = Utilities.levelCloneInfo["level_" + gameLevel].mainFloorBlock;
    Utilities.dimensions.overworld.fillBlocks(corner1, corner2, floorBlock, {
        "matchingBlock": BlockPermutation.resolve("theheist:camera_sight")
    });
}

export function playerIsInSensorMode(levelInformation: LevelInformation) {
    var currentModes: ModeData[] = levelInformation.currentModes;
    return currentModes.some((x) => x.mode == "sensor");
}