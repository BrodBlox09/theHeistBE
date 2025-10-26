import { MolangVariableMap, BlockPermutation, EffectTypes, world, system, Player, EntityInventoryComponent, ScoreboardObjective, Container, ItemStack, ItemLockMode, Entity, ItemUseAfterEvent, BlockVolume, EntityEquippableComponent, EquipmentSlot, EntityItemComponent, ItemStartUseOnAfterEvent, EntityQueryOptions } from "@minecraft/server";
import Vector from "./Vector";
import DataManager from "./DataManager";
import Utilities from "./Utilities";
import GameObjectiveManager from "./GameObjectiveManager";
import PlayerBustedManager from "./PlayerBustedManager";
import * as HackingModeFunc from "./gamebands/hacking";
import * as RechargeModeFunc from "./gamebands/recharge";
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
			RechargeModeFunc.toggleRechargeMode(player, 1);
			break;
		case "theheist:recharge_mode_lvl_2":
			RechargeModeFunc.toggleRechargeMode(player, 2);
			break;
		case "theheist:recharge_mode_lvl_3":
			RechargeModeFunc.toggleRechargeMode(player, 3);
			break;
		case "theheist:hacking_mode_lvl_1":
			HackingModeFunc.tryHackingMode(player, 1);
			break;
		case "theheist:hacking_mode_lvl_2":
			HackingModeFunc.tryHackingMode(player, 2);
			break;
		case "theheist:hacking_mode_lvl_3":
			HackingModeFunc.tryHackingMode(player, 3);
			break;
		case "theheist:sensor_mode_lvl_1":
			SensorModeFunc.toggleSensorMode(player, 1);
			break;
		case "theheist:sensor_mode_lvl_2":
			SensorModeFunc.toggleSensorMode(player, 2);
			break;
		case "theheist:xray_mode_lvl_1":
			XRayModeFunc.toggleXRayMode(player, 1);
			break;
		case "theheist:xray_mode_lvl_2":
			XRayModeFunc.toggleXRayMode(player, 2);
			break;
		case "theheist:magnet_mode_lvl_1":
			MagnetModeFunc.toggleMagnetMode(player, 1);
			break;
		case "theheist:stealth_mode_lvl_1":
			StealthModeFunc.toggleStealthMode(player, 1);
			break;
		case "theheist:stealth_mode_lvl_2":
			StealthModeFunc.toggleStealthMode(player, 2);
			break;
		case "theheist:stun_mode_lvl_1":
			StunModeFunc.tryStunMode(player, 1);
			break;
		case "theheist:drill_mode_lvl_1":
			DrillModeFunc.tryDrillMode(player, 1);
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
		"location": { 'x': block.location.x, 'y': consolesHeight, 'z': block.location.z },
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
	player.getComponent("inventory")!.container?.clearAll();
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
	player.addEffect('saturation', 2000, { amplifier: 1, showParticles: false });
	player.addEffect('night_vision', 2000, { amplifier: 1, showParticles: false });
	player.addEffect('resistance', 2000, { amplifier: 1, showParticles: false });
	
	// Set lore for items
	const playerInvContainer = player.getComponent('inventory')!.container;
	const playerEquippable = player.getComponent('equippable')!;
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

	// If recharge mode selected, show objectives
	var selectedItemStack = playerInvContainer.getItem(player.selectedSlotIndex);
	if (selectedItemStack != undefined && selectedItemStack.typeId.startsWith("theheist:recharge_mode_lvl_")) {
		GameObjectiveManager.showSidebar();
	} else {
		GameObjectiveManager.hideSidebar();
	}

	// Set player level to player energy level
	var playerEnergyTracker = DataManager.getData(player, "playerEnergyTracker")!;

	// Tick all gameband modes
	if (playerLevelInformation && playerEnergyTracker)
		GamebandManager.tickAllGamebands(player, playerLevelInformation, playerEnergyTracker);

	// Check to see if XP bar display needs to be updated
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

	if (playerEnergyTracker && playerLevelInformation) SensorModeFunc.tryMap(player, playerLevelInformation, playerEnergyTracker);
});