import { system, Player, ItemStack, ItemLockMode } from "@minecraft/server";
import DataManager from "../DataManager";
import Utilities from "../Utilities";
import Vector from "../Vector";
import GamebandManager from "./GamebandManager";

const sensingRange = 14;
const clearRange = 19;

export function tryMap(player: Player, levelInformation: LevelInformation, playerEnergyTracker: PlayerEnergyTracker) {
    if (playerEnergyTracker.recharging) return;
    // If sensor mode lvl. 2 or greater, the player can use the sensor mode to see a map of the level
	const playerRotX = player.getRotation().x;
    var playerIsLookingDown = true;
	if (!(playerRotX < 90 && playerRotX > 80)) playerIsLookingDown = false; // Player is not looking down
    var slotTwos = levelInformation.information[2].inventory.filter((slot) => slot.slot == 2);
    if (!slotTwos) return;
    var sensorModeSlot = slotTwos[slotTwos.length - 1]; // Get last item of slot 2
    if (!sensorModeSlot) return;
    var typeId = sensorModeSlot.typeId;
    if (playerIsLookingDown && typeId.startsWith("theheist:sensor_mode_lvl_") && parseInt(typeId.charAt("theheist:sensor_mode_lvl_".length)) >= 2) { // Player does have a lvl 2 or greater sensor mode
        var playerInvContainer = player.getComponent("minecraft:inventory")?.container;
        var map = Utilities.dimensions.overworld.getBlock(Utilities.levelCloneInfo[levelInformation.information[1].level].mapLoc)?.getComponent("minecraft:inventory")?.container?.getItem(0);
        if (!map) return;
        map.lockMode = ItemLockMode.slot;
        playerInvContainer?.setItem(2, map);
        levelInformation.information[2].inventory.push({ "slot": 2, "typeId": `minecraft:filled_map`, "lockMode": "slot" });
        DataManager.setData(player, levelInformation);
    } else if (!playerIsLookingDown && typeId == "minecraft:filled_map") { // Clear map
        var playerInvContainer = player.getComponent("minecraft:inventory")?.container;
        levelInformation.information[2].inventory = levelInformation.information[2].inventory.filter((s) => (s.typeId != "minecraft:filled_map"));
        DataManager.setData(player, levelInformation);
        var sensorModeSlotData = levelInformation.information[2].inventory.find((x) => (x.slot == 2))!;
        var itemStack = new ItemStack(sensorModeSlotData.typeId);
        itemStack.lockMode = ItemLockMode.slot;
        playerInvContainer?.setItem(2, itemStack);
    }
}

export function toggleSensorMode(player: Player, lvl: number) {
    var levelInformation = DataManager.getData(player, "levelInformation")!;
    if (playerIsInSensorMode(levelInformation)) endSensorMode(player, levelInformation);
    else tryStartSensorMode(player, lvl, levelInformation);
}

function tryStartSensorMode(player: Player, lvl: number, levelInformation: LevelInformation) {
    GamebandManager.cancelMode(player, levelInformation.currentMode);
    levelInformation = DataManager.getData(player, "levelInformation")!;

    var costPerSecond = Utilities.gamebandInfo.sensorMode[lvl].cost;
    var costPerTick = costPerSecond / 20;
    var energyTracker = DataManager.getData(player, "playerEnergyTracker")!;
    if (energyTracker.energyUnits < costPerTick) {
        player.sendMessage("§cNot enough energy!");
        return;
    }

    levelInformation.currentMode = { "mode": "sensor", "level": lvl };
    levelInformation.information[2].inventory = levelInformation.information[2].inventory.filter((s) => (s.slot != 2));
    levelInformation.information[2].inventory.push({ "slot": 2, "typeId": `theheist:sensor_mode_lvl_${lvl}_enchanted`, "lockMode": "slot" });
    DataManager.setData(player, levelInformation);
    Utilities.reloadPlayerInv(player, levelInformation);
    player.playSound("mob.irongolem.throw", { "pitch": 1 });
    updateSensorDisplay(player, levelInformation);
}

function endSensorMode(player: Player, levelInformation: LevelInformation) {
    if (!playerIsInSensorMode(levelInformation)) return;
    var sensorModeData = levelInformation.currentMode!;
    levelInformation.currentMode = null;
    levelInformation.information[2].inventory = levelInformation.information[2].inventory.filter((x) => x.slot != 2);
    levelInformation.information[2].inventory.push({ "slot": 2, "typeId": `theheist:sensor_mode_lvl_${sensorModeData.level}`, "lockMode": "slot" });
    DataManager.setData(player, levelInformation);
    Utilities.reloadPlayerInv(player, levelInformation);
    clearSensed(player, levelInformation);
    player.playSound("mob.irongolem.throw", { "pitch": 0.5 });
    system.runTimeout(() => clearSensed(player, levelInformation), 5); // Ensure everything actually gets cleared
}

export function sensorTick(player: Player, levelInformation: LevelInformation, energyTracker: PlayerEnergyTracker) {
	tryMap(player, levelInformation, energyTracker);
    if (!playerIsInSensorMode(levelInformation)) return;
    var sensorModeData = levelInformation.currentMode!;
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
    var loc = Vector.from(player.location);
    loc.y = Utilities.cameraMappingHeight - 3; // To get to camera sight blocks height
    var corner1Top = loc.subtract(new Vector(sensingRange, 0, sensingRange));
    var corner2Top = loc.add(new Vector(sensingRange, 0, sensingRange));
    var corner1Floor = loc.subtract(new Vector(sensingRange, 0, sensingRange));
    corner1Floor.y = Utilities.levelHeight - 1; // To get floor height
    // Hopefully below can be replaced and changed into a script API function
    //Utilities.cameraMappingHeight - 4
    Utilities.dimensions.overworld.runCommand(`clone ${corner1Top.x} ${corner1Top.y} ${corner1Top.z} ${corner2Top.x} ${corner2Top.y} ${corner2Top.z} ${corner1Floor.x} ${corner1Floor.y} ${corner1Floor.z} filtered normal theheist:camera_sight`);
    Utilities.dimensions.overworld.runCommand(`clone ${corner1Top.x} ${corner1Top.y - 2} ${corner1Top.z} ${corner2Top.x} ${corner2Top.y - 2} ${corner2Top.z} ${corner1Floor.x} ${corner1Floor.y} ${corner1Floor.z} filtered normal theheist:sonar_sight`);
    Utilities.dimensions.overworld.runCommand(`clone ${corner1Top.x} ${Utilities.cameraMappingHeight - 4} ${corner1Top.z} ${corner2Top.x} ${Utilities.cameraMappingHeight - 4} ${corner2Top.z} ${corner1Floor.x} ${Utilities.levelHeight} ${corner1Floor.z} filtered normal theheist:robot_path`);
}

function clearSensed(player: Player, levelInformation: LevelInformation) {
    var loc = Vector.from(player.location);
    loc.y = Utilities.floorCloneHeight; // To get to floor height
    var corner1 = loc.subtract(new Vector(clearRange, 0, clearRange));
    var corner2 = loc.add(new Vector(clearRange, 0, clearRange));
    var corner3 = loc.subtract(new Vector(clearRange, 0, clearRange));
    corner3.y = Utilities.levelHeight - 1;
    Utilities.dimensions.overworld.runCommand(`clone ${corner1.x} ${corner1.y} ${corner1.z} ${corner2.x} ${corner2.y} ${corner2.z} ${corner3.x} ${corner3.y} ${corner3.z}`);
    /*Utilities.dimensions.overworld.fillBlocks(corner1, corner2, floorBlock, {
        "matchingBlock": BlockPermutation.resolve("theheist:camera_sight")
    });*/
    Utilities.dimensions.overworld.runCommand(`fill ${corner1.x} ${Utilities.levelHeight} ${corner1.z} ${corner2.x} ${Utilities.levelHeight} ${corner2.z} air replace theheist:robot_path`);
}

export function playerIsInSensorMode(levelInformation: LevelInformation) {
    return levelInformation.currentMode?.mode == "sensor";
}