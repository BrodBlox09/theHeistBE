import { system, Player, ItemStack, ItemLockMode } from "@minecraft/server";
import DataManager from "../managers/DataManager";
import Utilities from "../Utilities";
import Vector from "../Vector";
import GamebandManager from "./GamebandManager";
import LoreItem from "../LoreItem";
import { GamebandInfo, GamebandTracker, InventoryTracker, LevelInformation } from "../TypeDefinitions";
import LevelDefinitions from "../levels/LevelDefinitions";
import * as RechargeModeFunc from './recharge';

const sensingRange = 14;
const clearRange = 19;

export const sensorModeInfo: GamebandInfo = {
	1: {
		"cost": 1.0
	},
	2: {
		"cost": 0.4
	}
};

export function tryMap(player: Player, levelInformation: LevelInformation, gamebandTracker: GamebandTracker, inventoryTracker: InventoryTracker) {
    if (RechargeModeFunc.playerIsInRechargeMode(gamebandTracker)) return;
    // If sensor mode lvl. 2 or greater, the player can use the sensor mode to see a map of the level
	const playerRotX = player.getRotation().x;
    let playerIsLookingDown = true;
	if (!(playerRotX < 90 && playerRotX > 80)) playerIsLookingDown = false; // Player is not looking down
    let slotTwos = inventoryTracker.slots.filter((slot) => slot.slot == 2);
    if (!slotTwos) return;
    let sensorModeSlot = slotTwos[slotTwos.length - 1]; // Get last item of slot 2
    if (!sensorModeSlot) return;
    let typeId = sensorModeSlot.typeId;
    if (playerIsLookingDown && typeId.startsWith("theheist:sensor_mode_lvl_") && parseInt(typeId.charAt("theheist:sensor_mode_lvl_".length)) >= 2) { // Player does have a lvl 2 or greater sensor mode
        let playerInvContainer = player.getComponent("minecraft:inventory")?.container;
		let levelDefinition = LevelDefinitions.getLevelDefinitionByID(levelInformation.id);
		if (!levelDefinition) return;
        let map = Utilities.dimensions.overworld.getBlock(levelDefinition.levelCloneInfo.mapLoc)?.getComponent("minecraft:inventory")?.container?.getItem(0);
        if (!map) return;
        map.lockMode = ItemLockMode.slot;
        playerInvContainer?.setItem(2, map);
        inventoryTracker.slots.push({ "slot": 2, "typeId": `minecraft:filled_map`, "lockMode": "slot" });
        DataManager.setData(player, inventoryTracker);
    } else if (!playerIsLookingDown && typeId == "minecraft:filled_map") { // Clear map
        let playerInvContainer = player.getComponent("minecraft:inventory")?.container;
        inventoryTracker.slots = inventoryTracker.slots.filter((s) => (s.typeId != "minecraft:filled_map"));
        DataManager.setData(player, inventoryTracker);
        let sensorModeSlotData = inventoryTracker.slots.find((x) => (x.slot == 2))!;
        let itemStack = new ItemStack(sensorModeSlotData.typeId);
        itemStack.lockMode = ItemLockMode.slot;
		LoreItem.setLoreOfItemStack(itemStack);
        playerInvContainer?.setItem(2, itemStack);
    }
}

export function toggleSensorMode(player: Player, lvl: number) {
    let gamebandTracker = DataManager.getData(player, "gamebandTracker")!;
    let inventoryTracker = DataManager.getData(player, "inventoryTracker")!;
    if (playerIsInSensorMode(gamebandTracker)) endSensorMode(player, gamebandTracker, inventoryTracker);
    else tryStartSensorMode(player, lvl, gamebandTracker, inventoryTracker);
}

function tryStartSensorMode(player: Player, lvl: number, gamebandTracker: GamebandTracker, inventoryTracker: InventoryTracker) {
    GamebandManager.cancelMode(player, gamebandTracker.currentMode);
    gamebandTracker = DataManager.getData(player, "gamebandTracker")!;
    inventoryTracker = DataManager.getData(player, "inventoryTracker")!;

    var costPerSecond = sensorModeInfo[lvl].cost;
    var costPerTick = costPerSecond / 20;
    var energyTracker = DataManager.getData(player, "gamebandTracker")!;
    if (gamebandTracker.energy < costPerTick) {
        player.sendMessage("§cNot enough energy!");
        return;
    }

    gamebandTracker.currentMode = { "mode": "sensor", "level": lvl };
    DataManager.setData(player, gamebandTracker);

    inventoryTracker.slots = inventoryTracker.slots.filter((s) => (s.slot != 2));
    inventoryTracker.slots.push({ "slot": 2, "typeId": `theheist:sensor_mode_lvl_${lvl}_enchanted`, "lockMode": "slot" });
    DataManager.setData(player, inventoryTracker);
	Utilities.reloadPlayerInv(player, inventoryTracker);
    player.playSound("mob.irongolem.throw", { "pitch": 1 });
    updateSensorDisplay(player, gamebandTracker);
}

function endSensorMode(player: Player, gamebandTracker: GamebandTracker, inventoryTracker: InventoryTracker) {
    if (!playerIsInSensorMode(gamebandTracker)) return;
    var sensorModeData = gamebandTracker.currentMode!;
    gamebandTracker.currentMode = null;
    inventoryTracker.slots = inventoryTracker.slots.filter((x) => x.slot != 2);
    inventoryTracker.slots.push({ "slot": 2, "typeId": `theheist:sensor_mode_lvl_${sensorModeData.level}`, "lockMode": "slot" });
    DataManager.setData(player, gamebandTracker);
    DataManager.setData(player, inventoryTracker);
    Utilities.reloadPlayerInv(player, inventoryTracker);
    clearSensed(player);
    player.playSound("mob.irongolem.throw", { "pitch": 0.5 });
    system.runTimeout(() => clearSensed(player), 5); // Ensure everything actually gets cleared
}

export function sensorTick(player: Player, gamebandTracker: GamebandTracker, inventoryTracker: InventoryTracker) {
	let levelInformation = DataManager.getWorldData("levelInformation")!;
	tryMap(player, levelInformation, gamebandTracker, inventoryTracker);
    if (!playerIsInSensorMode(gamebandTracker)) return;
    var sensorModeData = gamebandTracker.currentMode!;
    // Player is currently in sensor mode
    var costPerSecond = sensorModeInfo[sensorModeData.level].cost;
    var costPerTick = costPerSecond / 20;
    gamebandTracker.energy -= costPerTick;
    if (gamebandTracker.energy <= 0) {
        // Player can no longer afford sensor mode
        gamebandTracker.energy = 0;
        endSensorMode(player, gamebandTracker, inventoryTracker);
        DataManager.setData(player, gamebandTracker);
        return;
    }
    DataManager.setData(player, gamebandTracker);
}

/**
 * Update the ground to show where the camera sight blocks are if the player is using sensor mode.
 */
export function updateSensorDisplay(player: Player, gamebandTracker: GamebandTracker) {
    if (!playerIsInSensorMode(gamebandTracker)) return; // Player is not in sensor mode
    clearSensed(player);
    var loc = Vector.from(player.location);
    var corner1Top = loc.subtract(new Vector(sensingRange, 0, sensingRange));
    var corner2Top = loc.add(new Vector(sensingRange, 0, sensingRange));
    var corner1Floor = loc.subtract(new Vector(sensingRange, 0, sensingRange));
    // Hopefully below can be replaced and changed into a script API function
    Utilities.dimensions.overworld.runCommand(`clone ${corner1Top.x} ${Utilities.cameraBlockMappingHeight} ${corner1Top.z} ${corner2Top.x} ${Utilities.cameraBlockMappingHeight} ${corner2Top.z} ${corner1Floor.x} ${Utilities.levelFloorHeight} ${corner1Floor.z} filtered normal theheist:camera_sight`);
    Utilities.dimensions.overworld.runCommand(`clone ${corner1Top.x} ${Utilities.sonarBlockMappingHeight} ${corner1Top.z} ${corner2Top.x} ${Utilities.sonarBlockMappingHeight} ${corner2Top.z} ${corner1Floor.x} ${Utilities.levelFloorHeight} ${corner1Floor.z} filtered normal theheist:sonar_sight`);
    Utilities.dimensions.overworld.runCommand(`clone ${corner1Top.x} ${Utilities.robotPathDisplayMapHeight} ${corner1Top.z} ${corner2Top.x} ${Utilities.robotPathDisplayMapHeight} ${corner2Top.z} ${corner1Floor.x} ${Utilities.levelPlayingHeight} ${corner1Floor.z} filtered normal theheist:robot_path`);
}

function clearSensed(player: Player) {
    var loc = Vector.from(player.location);
    loc.y = Utilities.floorCloneHeight; // To get to floor height
    var corner1 = loc.subtract(new Vector(clearRange, 0, clearRange));
    var corner2 = loc.add(new Vector(clearRange, 0, clearRange));
    var corner3 = loc.subtract(new Vector(clearRange, 0, clearRange));
    corner3.y = Utilities.levelFloorHeight;
	// Remove camera sight blocks
    Utilities.dimensions.overworld.runCommand(`clone ${corner1.x} ${corner1.y} ${corner1.z} ${corner2.x} ${corner2.y} ${corner2.z} ${corner3.x} ${corner3.y} ${corner3.z}`);
	// Remove robot paths
    Utilities.dimensions.overworld.runCommand(`fill ${corner1.x} ${Utilities.levelPlayingHeight} ${corner1.z} ${corner2.x} ${Utilities.levelPlayingHeight} ${corner2.z} air replace theheist:robot_path`);
}

export function playerIsInSensorMode(gamebandTracker: GamebandTracker) {
    return gamebandTracker.currentMode?.mode == "sensor";
}