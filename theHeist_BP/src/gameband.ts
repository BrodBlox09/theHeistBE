import { MolangVariableMap, BlockPermutation, EffectTypes, world, system, Player, EntityInventoryComponent, ScoreboardObjective, Container, ItemStack, ItemLockMode, Entity, ItemUseAfterEvent, BlockVolume, EntityEquippableComponent, EquipmentSlot, EntityItemComponent, ItemStartUseOnAfterEvent, EntityQueryOptions } from "@minecraft/server";
import Vector from "./Vector";
import DataManager from "./DataManager";
import Utilities from "./Utilities";
import GameObjectiveManager from "./GameObjectiveManager";
import PlayerBustedManager from "./PlayerBustedManager";
import * as hackingModeFunc from "./gamebands/hacking";
import * as SensorModeFunc from "./gamebands/sensor";
import * as XRayModeFunc from "./gamebands/xray";
import * as MagnetModeFunc from "./gamebands/magnet";
import * as StealthModeFunc from "./gamebands/stealth";
import * as StunModeFunc from "./gamebands/stun";
import * as DrillModeFunc from "./gamebands/drill";
import GamebandManager from "./gamebands/GamebandManager";
import ActionManager from "./ActionManager";

class loreItem {
	id: string;
	nameTag: string;
	lore: string[];

	constructor(id: string, nameTag: string, lore: string[]) {
		this.id = id;
		this.nameTag = nameTag;
		this.lore = lore;
	}
}

const loreItems = [
	new loreItem("theheist:recharge_mode_lvl_1", "§r§9Recharge mode Lvl. 1", ["Use item to §r§6toggle", "Energy: 1.0 units/second", "Select to show objectives"]),
	new loreItem("theheist:recharge_mode_lvl_2", "§r§9Recharge mode Lvl. 2", ["Use item to §r§6toggle", "Energy: 1.0 units/second", "Select to show objectives"]),
	new loreItem("theheist:recharge_mode_lvl_3", "§r§9Recharge mode Lvl. 3", ["Use item to §r§6toggle", "Energy: 1.0 units/second", "Select to show objectives"]),
	new loreItem("theheist:hacking_mode_lvl_1", "§r§2Hacking mode Lvl. 1", ["Use item to §r§6use", "Energy: 15 units"]),
	new loreItem("theheist:hacking_mode_lvl_2", "§r§2Hacking mode Lvl. 2", ["Use item to §r§6use", "Energy: 10 units"]),
	new loreItem("theheist:hacking_mode_lvl_3", "§r§2Hacking mode Lvl. 3", ["Use item to §r§6use", "Energy: 5 units"]),
	new loreItem("theheist:sensor_mode_lvl_1", "§r§6Sensor mode Lvl. 1", ["Use item to §r§6toggle", "Energy: 1.0 units/second"]),
	new loreItem("theheist:sensor_mode_lvl_2", "§r§6Sensor mode Lvl. 2", ["Use item to §r§6toggle", "Energy: 0.4 units/second"]),
	new loreItem("theheist:xray_mode_lvl_1", "§r§4Xray mode Lvl. 1", ["Use item to §r§6toggle", "Energy: 1.33 units/second"]),
	new loreItem("theheist:xray_mode_lvl_2", "§r§4Xray mode Lvl. 2", ["Use item to §r§6toggle", "Energy: 0.67 units/second"]),
	new loreItem("theheist:magnet_mode_lvl_1", "§r§5Magnet mode Lvl. 1", ["Use item to §r§6toggle", "Energy: 1.6 units/second"]),
	new loreItem("theheist:stealth_mode_lvl_1", "§r§fStealth mode Lvl. 1", ["Use item to §r§6toggle", "Energy: 40 units/second"]),
	new loreItem("theheist:stealth_mode_lvl_2", "§r§fStealth mode Lvl. 2", ["Use item to §r§6toggle", "Energy: 10 units/second"]),
	new loreItem("theheist:stun_mode_lvl_1", "§r§eStun mode Lvl. 1", ["Use item to §r§6use", "Energy: 10 units"]),
	new loreItem("theheist:drill_mode_lvl_1", "§r§3Drill mode Lvl. 1", ["Use item to §r§6use", "Energy: 30 units"]),
	new loreItem('minecraft:paper', '§oUse Keycard§r', ['Can trigger any Keycard reader', 'for which you own a matching card']),
	new loreItem('minecraft:red_dye', '§oRed Keycard§r', ['Used on matching Keycard reader']),
	new loreItem('minecraft:yellow_dye', '§oYellow Keycard§r', ['Used on matching Keycard reader']),
	new loreItem('minecraft:green_dye', '§oGreen Keycard§r', ['Used on matching Keycard reader']),
	new loreItem('minecraft:lapis_lazuli', '§oBlue Keycard§r', ['Used on matching Keycard reader']),
	new loreItem('theheist:phone', '§oCall the authorities§r', ['Drop to restart level']),
	new loreItem('theheist:nv_glasses', '§oNV Goggles§r', ['Drop to regain items'])
]

const levelMapHeight = 20;
const consolesHeight = -15;
const rechargeHeight = -20;
const cameraHeight = -25;
const cameraMappingHeight = -30;

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
			rechargeMode(1, player);
			break;
		case "theheist:recharge_mode_lvl_2":
			rechargeMode(2, player);
			break;
		case "theheist:recharge_mode_lvl_3":
			rechargeMode(3, player);
			break;
		case "theheist:hacking_mode_lvl_1":
			hackingMode(1, player);
			break;
		case "theheist:hacking_mode_lvl_2":
			hackingMode(2, player);
			break;
		case "theheist:hacking_mode_lvl_3":
			hackingMode(3, player);
			break;
		case "theheist:sensor_mode_lvl_1":
			sensorMode(1, player);
			break;
		case "theheist:sensor_mode_lvl_2":
			sensorMode(2, player);
			break;
		case "theheist:xray_mode_lvl_1":
			xrayMode(1, player);
			break;
		case "theheist:xray_mode_lvl_2":
			xrayMode(2, player);
			break;
		case "theheist:magnet_mode_lvl_1":
			magnetMode(1, player);
			break;
		case "theheist:stealth_mode_lvl_1":
			stealthMode(1, player);
			break;
		case "theheist:stealth_mode_lvl_2":
			stealthMode(2, player);
			break;
		case "theheist:stun_mode_lvl_1":
			stunMode(1, player);
			break;
		case "theheist:drill_mode_lvl_1":
			drillMode(1, player);
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
			keycard(keycardType!, player);
			break;
	}
}

/**
 * @description Mode Type: Instant
 * @param lvl 
 * @param player 
 * @returns 
 */
function drillMode(lvl: number, player: Player) {
	DrillModeFunc.tryDrillMode(player, lvl);
}

/**
 * @description Mode Type: Instant
 * @param lvl 
 * @param player 
 * @returns 
 */
function stunMode(lvl: number, player: Player) {
	StunModeFunc.tryStunMode(player, lvl);
}

/**
 * @description Mode Type: Loop
 * @param lvl 
 * @param player 
 * @returns 
 */
function stealthMode(lvl: number, player: Player) {
	StealthModeFunc.toggleStealthMode(player, lvl);
}

/**
 * @description Mode Type: Loop
 * @param lvl 
 * @param player 
 * @returns 
 */
function magnetMode(lvl: number, player: Player) {
	MagnetModeFunc.toggleMagnetMode(player, lvl);
}

/**
 * @description Mode Type: Loop
 * @param lvl 
 * @param player 
 * @returns 
 */
function xrayMode(lvl: number, player: Player) {
	/* NOTE: When a region is cloned, the region defined by the first 2 Vector3s will be cloned by the block which is the lowest and most NW (most negative in every direction xyz).
	*  A copy of that block is then translated to the third Vector3 as well as a copy of the rest of the region and then cloned there. */
	XRayModeFunc.toggleXRayMode(player, lvl);
}

/**
 * @description Mode Type: Loop
 * @param lvl 
 * @param player 
 * @returns 
 */
function sensorMode(lvl: number, player: Player) {
	/* NOTE: When a region is cloned, the region defined by the first 2 Vector3s will be cloned by the block which is the lowest and most NW (most negative in every direction xyz).
	*  A copy of that block is then translated to the third Vector3 as well as a copy of the rest of the region and then cloned there. */
	SensorModeFunc.toggleSensorMode(player, lvl);
}

/**
 * @description Mode Type: Loop
 * @param lvl 
 * @param player 
 * @returns 
 */
function rechargeMode(lvl: number, player: Player) {
	let levelInformation = DataManager.getData(player, "levelInformation")!;
	GamebandManager.cancelMode(player, levelInformation.currentMode);

	const query = {
		"type": "armor_stand",
		"location": new Vector(player.location.x, rechargeHeight, player.location.z),
		"maxDistance": 2,
		"closest": 1
	}
	const armorStands = Utilities.dimensions.overworld.getEntities(query);
	for (const armorStand of armorStands) {
		var armorStandEnergyTrackerDataNode = DataManager.getData(armorStand, "energyTracker")!;
		var playerEnergyTrackerDataNode = DataManager.getData(player, "playerEnergyTracker")!;
		playerEnergyTrackerDataNode.rechargeLevel = lvl;
		var blockLocation = { "x": armorStandEnergyTrackerDataNode.block.x, "y": armorStandEnergyTrackerDataNode.block.y, "z": armorStandEnergyTrackerDataNode.block.z };
		if (playerEnergyTrackerDataNode.recharging == false) {
			if (armorStandEnergyTrackerDataNode.energyUnits == 0.0) return;
			if (armorStandEnergyTrackerDataNode.block.y - 1 > player.location.y) return;
			playerEnergyTrackerDataNode.recharging = true;
			player.playSound("portal.travel", { "volume": 0.1, "pitch": 2 });
			Utilities.setBlock(blockLocation, "theheist:recharge_station", { "minecraft:cardinal_direction": armorStandEnergyTrackerDataNode.block.rotation, "theheist:state": 2 });
			playerEnergyTrackerDataNode.usingRechargerID = armorStandEnergyTrackerDataNode.rechargerID;
			// Remove all gamebands except recharge mode
			var playerInvContainer = (player.getComponent("inventory") as EntityInventoryComponent).container as Container;
			playerInvContainer.clearAll();
			var rechargeModeItemStack = new ItemStack(`theheist:recharge_mode_lvl_${lvl}_enchanted`);
			rechargeModeItemStack.lockMode = ItemLockMode.slot;
			playerInvContainer.setItem(0, rechargeModeItemStack);
		} else {
			// The player is currently recharging
			playerEnergyTrackerDataNode.recharging = false;
			Utilities.setBlock(blockLocation, "theheist:recharge_station", { "minecraft:cardinal_direction": armorStandEnergyTrackerDataNode.block.rotation, "theheist:state": 1 });
			playerEnergyTrackerDataNode.usingRechargerID = -1;
			// Bring back the player's items
			Utilities.reloadPlayerInv(player);
		}
		DataManager.setData(player, playerEnergyTrackerDataNode);
	}
}

/**
 * @description Mode Type: Instant
 * @param lvl 
 * @param player 
 * @returns 
 */
function hackingMode(lvl: number, player: Player) {
	hackingModeFunc.tryHackingMode(player, lvl);
}

function keycard(keycardType: string, player: Player) {
	var playerHeadLocation = player.getHeadLocation();
	var blockRaycastHit = Utilities.dimensions.overworld.getBlockFromRay(new Vector(playerHeadLocation.x, playerHeadLocation.y + 0.1, playerHeadLocation.z), player.getViewDirection(), { maxDistance: 2 });
	if (!blockRaycastHit) return;
	var block = blockRaycastHit.block;
	if (block.typeId != "theheist:keycard_reader") return;
	var query = {
		"type": "armor_stand",
		"location": { 'x': block.location.x, 'y': consolesHeight, 'z': block.location.z },
		"maxDistance": 2,
		"closest": 1
	}
	var armorStand = Utilities.dimensions.overworld.getEntities(query)[0];
	if (!armorStand) return;
	var actionTracker = DataManager.getData(armorStand, "actionTracker");
	if (!actionTracker || !actionTracker.isKeycardReader || actionTracker.used == true || (actionTracker.keycardType != keycardType && keycardType != "all")) return;
	if (keycardType == "all") {
		var playerInvContainer = (player.getComponent("inventory") as EntityInventoryComponent).container as Container;
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

function playerBusted(player: Player, currentLevel: number) {
	player.addTag('loadingLevel');
	var playerLevelInformation = DataManager.getData(player, "levelInformation")!;
	PlayerBustedManager.playerBusted(player);
	playerLevelInformation.information[0].level = 0;
	playerLevelInformation.information[2].inventory = [];
	DataManager.setData(player, playerLevelInformation);
	var playerEnergyTracker = DataManager.getData(player, "playerEnergyTracker")!;
	playerEnergyTracker.energyUnits = 0;
	DataManager.setData(player, playerEnergyTracker);
	player.playSound("map.alarm");
	player.addTag("BUSTED");
	player.onScreenDisplay.setTitle("§r§e§lBusted", { "subtitle": "You got detected. Try again!", "fadeInDuration": 20, "fadeOutDuration": 20, "stayDuration": 160 });
	(player.getComponent("inventory") as EntityInventoryComponent).container?.clearAll();
	system.runTimeout(() => {
		stopAllSound();
		player.teleport(Utilities.levelCloneInfo[currentLevel].prisonLoc);
		player.sendMessage(`You got busted §c§l${PlayerBustedManager.getTimesBustedFromPlayer(player)}§r time(s)`);
	}, Utilities.SECOND * 3);
	system.runTimeout(() => {
		player.removeTag("BUSTED");
		system.sendScriptEvent("theheist:load-level", `${currentLevel}`);
	}, Utilities.SECOND * (3 + 5));
}

function stopAllSound() {
	Utilities.dimensions.overworld.getEntities({ "excludeTypes": ["minecraft:armor_stand", "theheist:hover_text"] }).forEach((e) => { try { e.runCommand('stopsound @s'); } catch { } });
}

function cloneFloor(loc: Vector) {
	var range = 10;
	var corner1 = loc.subtract(new Vector(range, 0, range));
	var corner2 = loc.add(new Vector(range, 0, range));
	corner1.y = Utilities.levelHeight - 1;
	corner2.y = Utilities.levelHeight - 1;
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

system.runInterval(() => {
	const player = world.getPlayers().filter((x: Player) => (x != undefined && x != null))[0];
	if (player == undefined) return;

	
	var playerLevelInformation = DataManager.getData(player, "levelInformation")!;
	
	{
		var itemEntity = Utilities.dimensions.overworld.getEntities({
			"type": "minecraft:item",
			"location": player.location,
			"closest": 1,
			"maxDistance": 3
		})[0];
		if (itemEntity) {
			var droppedItemTID = (itemEntity.getComponent("item") as EntityItemComponent).itemStack.typeId;
			itemEntity.remove();
			if (droppedItemTID == "theheist:phone") {
				playerBusted(player, playerLevelInformation.information[1].level);
			} else if (droppedItemTID == "theheist:nv_glasses") {
				Utilities.reloadPlayerInv(player, playerLevelInformation);
			}
		}
	}

	// Toggle below when creating new level
	// cloneFloor(Vector.from(player.location));
	// flattenMap(Vector.from(player.location));
	// clearGlass(Vector.from(player.location));

	// Give player effects
	const saturation = EffectTypes.get('saturation')!;
	const nightVision = EffectTypes.get('night_vision')!;
	const resistance = EffectTypes.get('resistance')!;
	player.addEffect(saturation, 2000, { 'amplifier': 1, 'showParticles': false });
	player.addEffect(nightVision, 2000, { 'amplifier': 1, 'showParticles': false });
	player.addEffect(resistance, 2000, { 'amplifier': 1, 'showParticles': false });
	// Set lore for items
	const playerInvContainer = (player.getComponent('inventory') as EntityInventoryComponent).container as Container;
	const playerEquippable = (player.getComponent('equippable') as EntityEquippableComponent);
	for (let i = 0; i < playerInvContainer.size; i++) {
		const item = playerInvContainer.getItem(i);
		if (!item || !item.getLore()) continue;
		var itemTypeId = item.typeId;
		if (itemTypeId.endsWith("_enchanted")) itemTypeId = itemTypeId.substring(0, itemTypeId.length - "_enchanted".length);
		const foundItem = loreItems.find(x => x.id == itemTypeId)!;
		try {
			item.setLore(foundItem.lore);
			item.nameTag = foundItem.nameTag;
		} catch (err) {
			continue;
		}
		playerInvContainer.setItem(i, item);
	}
	let headItem = playerEquippable.getEquipment(EquipmentSlot.Head);
	if (headItem) {
		let foundItem = loreItems.find(x => x.id == headItem?.typeId)!;
		try {
			headItem.setLore(foundItem.lore);
			headItem.nameTag = foundItem.nameTag;
		} catch (err) { }
	}
	playerEquippable.setEquipment(EquipmentSlot.Head, headItem);
	var selectedItemStack = playerInvContainer.getItem(player.selectedSlotIndex);
	if (selectedItemStack != undefined && selectedItemStack.typeId.startsWith("theheist:recharge_mode_lvl_")) {
		GameObjectiveManager.showSidebar();
	} else {
		GameObjectiveManager.hideSidebar();
	}

	// Set player level to player energy level
	var playerEnergyTracker = DataManager.getData(player, "playerEnergyTracker")!;

	if (playerEnergyTracker && playerLevelInformation) SensorModeFunc.sensorTick(player, playerLevelInformation, playerEnergyTracker);
	if (playerEnergyTracker && playerLevelInformation) XRayModeFunc.xrayTick(player, playerLevelInformation, playerEnergyTracker);
	if (playerEnergyTracker && playerLevelInformation) MagnetModeFunc.magnetTick(player, playerLevelInformation, playerEnergyTracker);
	if (playerEnergyTracker && playerLevelInformation) StealthModeFunc.stealthTick(player, playerLevelInformation, playerEnergyTracker);

	if ((playerEnergyTracker && playerEnergyTracker.energyUnits != player.level) || (playerLevelInformation && player.xpEarnedAtCurrentLevel != ((((playerLevelInformation.information[0].level / 100) - 0.06) * 742) + 41))) {
		player.resetLevel();
		player.addLevels(100);
		// 9 * 100 - 158 = 742 (The total amount of XP you need to go from level 100 to 101)
		//var alarmLvlXpVal = (playerLevelInformation.information[0].level / 100) * 742;
		var alarmLvlXpVal = (((playerLevelInformation.information[0].level / 100) - 0.06) * 742) + 41;
		player.addExperience(alarmLvlXpVal);
		player.addLevels(-100);
		player.addLevels(Math.floor(playerEnergyTracker.energyUnits));
		// Bust player if they have an alarm level that is too high
		if (playerLevelInformation.information[0].level >= 100) {
			// Player is busted
			playerBusted(player, playerLevelInformation.information[1].level);
		}
	}
	// Recharge mode
	if (playerEnergyTracker && playerEnergyTracker.recharging == true) {
		const query = {
			"type": "armor_stand",
			"location": { 'x': player.location.x, 'y': rechargeHeight, 'z': player.location.z },
			"maxDistance": 2
		}
		const armorStands = Utilities.dimensions.overworld.getEntities(query);
		var i = 0;
		for (const armorStand of armorStands) {
			var armorStandEnergyTracker = DataManager.getData(armorStand, "energyTracker")!;
			if (armorStandEnergyTracker.rechargerID != playerEnergyTracker.usingRechargerID) continue;
			if (armorStandEnergyTracker.block.y - 1 > player.location.y) continue;
			i++;
		}
		if (i == 0) {
			// Player has left range, so stop the player from recharging
			playerEnergyTracker.recharging = false;
			Utilities.reloadPlayerInv(player);
			const subQuery = {
				"type": "armor_stand",
				"location": { 'x': player.location.x, 'y': rechargeHeight, 'z': player.location.z },
				"maxDistance": 4
			}
			const subArmorStands = Utilities.dimensions.overworld.getEntities(subQuery);
			for (const subArmorStand of subArmorStands) {
				var armorStandEnergyTracker = DataManager.getData(subArmorStand, "energyTracker")!;
				if (armorStandEnergyTracker.rechargerID != playerEnergyTracker.usingRechargerID) continue;
				Utilities.setBlock({ x: armorStandEnergyTracker.block.x, y: armorStandEnergyTracker.block.y, z: armorStandEnergyTracker.block.z }, "theheist:recharge_station", { "minecraft:cardinal_direction": armorStandEnergyTracker.block.rotation, "theheist:state": 1 });
				playerEnergyTracker.usingRechargerID = -1;
			}
		} else if (playerEnergyTracker.energyUnits < Utilities.rechargeGamebandInfo[playerEnergyTracker.rechargeLevel].max) {
			var addEnergy = 1; // Amount of energy to add per tick
			playerEnergyTracker.energyUnits = Math.min(playerEnergyTracker.energyUnits + addEnergy, Utilities.rechargeGamebandInfo[playerEnergyTracker.rechargeLevel].max);
			for (const armorStand of armorStands) {
				var armorStandEnergyTracker = DataManager.getData(armorStand, "energyTracker")!;
				if (armorStandEnergyTracker.rechargerID != playerEnergyTracker.usingRechargerID) continue;

				armorStandEnergyTracker.energyUnits -= addEnergy;
				if (armorStandEnergyTracker.energyUnits <= 0) {
					// The recharge station is out of energy, so stop player from recharging
					var diff = Math.abs(armorStandEnergyTracker.energyUnits);
					playerEnergyTracker.energyUnits -= diff;
					armorStandEnergyTracker.energyUnits = 0;
					Utilities.setBlock({ x: armorStandEnergyTracker.block.x, y: armorStandEnergyTracker.block.y, z: armorStandEnergyTracker.block.z }, "theheist:recharge_station", { "minecraft:cardinal_direction": armorStandEnergyTracker.block.rotation, "theheist:state": 3 });
					playerEnergyTracker.recharging = false;
					playerEnergyTracker.usingRechargerID = -1;
					Utilities.reloadPlayerInv(player);
					// Run actions staged for on depletion
					if (armorStandEnergyTracker.actions) ActionManager.runActions(armorStandEnergyTracker.onDepletionActions, player);
				}
				DataManager.setData(armorStand, armorStandEnergyTracker);
			}
		}
		DataManager.setData(player, playerEnergyTracker);
	}

	if (playerEnergyTracker && playerLevelInformation) SensorModeFunc.tryMap(player, playerLevelInformation, playerEnergyTracker);
	// player.onScreenDisplay.setActionBar(`TPS: ${Math.round(1 / ((Date.now() - lastTickTime) / 1000))}`);
	// lastTickTime = Date.now();
});