import { world, system, Player, ItemUseAfterEvent, ItemStartUseOnAfterEvent } from "@minecraft/server";
import Vector from "./Vector";
import DataManager from "./managers/DataManager";
import Utilities from "./Utilities";
import GameObjectiveManager from "./managers/GameObjectiveManager";
import PlayerBustedManager from "./managers/PlayerBustedManager";
import GamebandManager from "./gamebands/GamebandManager";
import ActionManager from "./actions/ActionManager";
import { toggleRechargeMode } from "./gamebands/recharge";
import { tryHackingMode } from "./gamebands/hacking";
import { toggleSensorMode } from "./gamebands/sensor";
import { toggleXRayMode } from "./gamebands/xray";
import { toggleMagnetMode } from "./gamebands/magnet";
import { toggleStealthMode } from "./gamebands/stealth";
import { tryStunMode } from "./gamebands/stun";
import { tryDrillMode } from "./gamebands/drill";
import { tryTeleportationMode } from "./gamebands/teleportation";

world.afterEvents.itemStartUseOn.subscribe(itemUse);
world.afterEvents.itemUse.subscribe(itemUse);

function itemUse(event: ItemUseAfterEvent | ItemStartUseOnAfterEvent) {
	if (event instanceof ItemStartUseOnAfterEvent) {
		if (event.block.typeId == "minecraft:wooden_door" ||
			event.block.typeId == "minecraft:wooden_trapdoor" ||
			event.block.typeId == "minecraft:dropper") return;
		if (event.block.hasTag("door") && Utilities.getBlockState(event.block, "theheist:unlocked")) return;
		if (event.block.typeId == "theheist:white_trapdoor" && !Utilities.getBlockState(event.block, "theheist:locked")) return;
	}
	const player = event.source;
	var itemStack = event.itemStack;
	if (!itemStack) return;
	var text = itemStack.typeId;

	if (text.endsWith("_enchanted")) text = text.substring(0, text.length - "_enchanted".length);
	let keycardType;
	switch (text) {
		case "theheist:recharge_mode_lvl_1":
			toggleRechargeMode(player, 1);
			break;
		case "theheist:recharge_mode_lvl_2":
			toggleRechargeMode(player, 2);
			break;
		case "theheist:recharge_mode_lvl_3":
			toggleRechargeMode(player, 3);
			break;
		case "theheist:hacking_mode_lvl_1":
			tryHackingMode(player, 1);
			break;
		case "theheist:hacking_mode_lvl_2":
			tryHackingMode(player, 2);
			break;
		case "theheist:hacking_mode_lvl_3":
			tryHackingMode(player, 3);
			break;
		case "theheist:sensor_mode_lvl_1":
			toggleSensorMode(player, 1);
			break;
		case "theheist:sensor_mode_lvl_2":
			toggleSensorMode(player, 2);
			break;
		case "theheist:xray_mode_lvl_1":
			toggleXRayMode(player, 1);
			break;
		case "theheist:xray_mode_lvl_2":
			toggleXRayMode(player, 2);
			break;
		case "theheist:magnet_mode_lvl_1":
			toggleMagnetMode(player, 1);
		break;
		case "theheist:stealth_mode_lvl_1":
			toggleStealthMode(player, 1);
			break;
		case "theheist:stealth_mode_lvl_2":
			toggleStealthMode(player, 2);
			break;
		case "theheist:stun_mode_lvl_1":
			tryStunMode(player, 1);
			break;
		case "theheist:drill_mode_lvl_1":
			tryDrillMode(player, 1);
			break;
		case "theheist:teleportation_mode_lvl_1":
			tryTeleportationMode(player, 1);
			break;
		case "minecraft:red_dye":
			keycardType = "red"
		case "minecraft:yellow_dye":
			if (!keycardType) keycardType = "yellow";
		case "minecraft:green_dye":
			if (!keycardType) keycardType = "green";
		case "minecraft:lapis_lazuli":
			if (!keycardType) keycardType = "blue";
		case "minecraft:paper":
			if (!keycardType) keycardType = "all";
			keycard(keycardType, player);
			break;
	}
}

function keycard(keycardType: string, player: Player) {
	var playerHeadLocation = player.getHeadLocation();
	var blockRaycastHit = Utilities.dimensions.overworld.getBlockFromRay(new Vector(playerHeadLocation.x, playerHeadLocation.y + 0.1, playerHeadLocation.z), player.getViewDirection(), { maxDistance: 2 });
	if (!blockRaycastHit) return;
	var block = blockRaycastHit.block;
	if (block.typeId != "theheist:keycard_reader") return;
	var query = {
		"type": "armor_stand",
		"location": { 'x': block.location.x, 'y': Utilities.consolesHeight, 'z': block.location.z },
		"maxDistance": 2,
		"closest": 1
	}
	var armorStand = Utilities.dimensions.overworld.getEntities(query)[0];
	if (!armorStand) return;
	var actionTracker = DataManager.getData(armorStand, "actionTracker");
	if (!actionTracker || !actionTracker.isKeycardReader || actionTracker.used == true || (actionTracker.keycardType != keycardType && keycardType != "all")) return;
	if (keycardType == "all") {
		var playerInvContainer = player.getComponent("inventory")!.container;
		if (actionTracker.keycardType != "blue") {
			if (!Utilities.inventoryContainerHasItem(playerInvContainer, `minecraft:${actionTracker.keycardType}_dye`)) return;
		} else {
			if (!Utilities.inventoryContainerHasItem(playerInvContainer, "minecraft:lapis_lazuli")) return;
		}
	}
	ActionManager.runActions(actionTracker.actions, player);
	// Keypad has been used, so ensure to save that
	actionTracker.used = true;
	DataManager.setData(armorStand, actionTracker);
}

function cloneFloor(loc: Vector) {
	var range = 10;
	var corner1 = loc.subtract(new Vector(range, 0, range));
	var corner2 = loc.add(new Vector(range, 0, range));
	corner1.y = Utilities.levelFloorHeight;
	corner2.y = Utilities.levelFloorHeight;
	var corner3 = loc.subtract(new Vector(range, 0, range));
	corner3.y = Utilities.floorCloneHeight;
	Utilities.dimensions.overworld.runCommand(`clone ${corner1.x} ${corner1.y} ${corner1.z} ${corner2.x} ${corner2.y} ${corner2.z} ${corner3.x} ${corner3.y} ${corner3.z}`);
	//Utilities.dimensions.overworld.runCommand(`fill ${corner1.x} ${Utilities.floorCloneHeight + 1} ${corner1.z} ${corner2.x} ${Utilities.floorCloneHeight + 1} ${corner2.z} air`);
}

function flattenMap(loc: Vector) {
	var range = 10;
	var corner1 = loc.subtract(new Vector(range, 0, range));
	var corner2 = loc.add(new Vector(range, 0, range));
	corner1.y = Utilities.levelMapHeight + 1;
	corner2.y = Utilities.levelMapHeight + 1;
	var corner3 = loc.subtract(new Vector(range, 0, range));
	corner3.y = Utilities.levelMapHeight;
	Utilities.dimensions.overworld.runCommand(`clone ${corner1.x} ${corner1.y} ${corner1.z} ${corner2.x} ${corner2.y} ${corner2.z} ${corner3.x} ${corner3.y} ${corner3.z} masked move`);
}

function clearGlass(loc: Vector) {
	var range = 10;
	loc.y = -50;
	var corner1 = loc.subtract(new Vector(range, 0, range));
	var corner2 = loc.add(new Vector(range, 0, range));
	Utilities.dimensions.overworld.runCommand(`fill ${corner1.x} ${corner1.y} ${corner1.z} ${corner2.x} ${corner2.y} ${corner2.z} air replace glass`);
}

export function gamebandTick() {
	const player = world.getPlayers().filter((x: Player) => (x != undefined && x != null))[0];
	if (player == undefined) return;

	// Give player effects
	player.addEffect('saturation', 2000, { amplifier: 1, showParticles: false });
	player.addEffect('night_vision', 2000, { amplifier: 1, showParticles: false });
	player.addEffect('resistance', 2000, { amplifier: 1, showParticles: false });

	const playerInvContainer = player.getComponent('inventory')!.container;
	var selectedItemStack = playerInvContainer.getItem(player.selectedSlotIndex);
	
	let inventoryTracker = DataManager.getData(player, "inventoryTracker");
	let gamebandTracker = DataManager.getData(player, "gamebandTracker");
	let alarmTracker = DataManager.getData(player, "alarmTracker");

	if (!inventoryTracker || !gamebandTracker || !alarmTracker) return;
	
	// Handle dropped items
	{
		var itemEntity = Utilities.dimensions.overworld.getEntities({
			"type": "minecraft:item",
			"location": player.location,
			"closest": 1,
			"maxDistance": 3
		})[0];
		if (itemEntity) {
			var droppedItemTID = itemEntity.getComponent("item")!.itemStack.typeId;
			itemEntity.remove();
			if (droppedItemTID == "theheist:phone") {
				PlayerBustedManager.playerBusted(player);
			} else if (droppedItemTID == "theheist:nv_glasses") {
				Utilities.reloadPlayerInv(player, inventoryTracker);
			}
		}
	}

	// Toggle below when creating new level
	// cloneFloor(Vector.from(player.location));
	// flattenMap(Vector.from(player.location));
	// clearGlass(Vector.from(player.location));

	// Tick all gameband modes
	if (gamebandTracker) GamebandManager.tickAllGamebands(player, gamebandTracker, inventoryTracker, selectedItemStack);

	// Check to see if XP bar display needs to be updated
	if (gamebandTracker.energy != player.level || player.xpEarnedAtCurrentLevel != ((((alarmTracker.level / 100) - 0.06) * 742) + 41)) {
		player.resetLevel();
		player.addLevels(100);
		// 9 * 100 - 158 = 742 (The total amount of XP you need to go from level 100 to 101)
		//var alarmLvlXpVal = (alarmTracker.level / 100) * 742;
		var alarmLvlXpVal = (((Math.min(alarmTracker.level, 100) / 100) - 0.06) * 742) + 41;
		player.addExperience(alarmLvlXpVal);
		player.addLevels(-100);
		player.addLevels(Math.floor(gamebandTracker.energy));
	}
}