import { MolangVariableMap, BlockPermutation, EffectTypes, world, system, Player, EntityInventoryComponent, ScoreboardObjective, Container, ItemStack, ItemLockMode, Entity, ItemUseAfterEvent, BlockVolume, EntityEquippableComponent, EquipmentSlot, EntityItemComponent, ItemStartUseOnAfterEvent } from "@minecraft/server";
import Vector from "./Vector";
import DataManager from "./DataManager";
import Utilities from "./Utilities";
import GameObjectiveManager from "./GameObjectiveManager";
import * as SensorModeFunc from "./gamebands/sensor";
import * as XRayModeFunc from "./gamebands/xray";
import * as MagnetModeFunc from "./gamebands/magnet";
import * as StealthModeFunc from "./gamebands/stealth";
import * as StunModeFunc from "./gamebands/stun";
import * as DrillModeFunc from "./gamebands/drill";
import VoiceOverManager from "./VoiceOverManager";
import { SlideshowAction } from "./actionDefinitions";

/**
 * Unfinished objectives color: §c (Red)
 * Finished objectives color: §a (Green)
 */

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
	new loreItem("theheist:stealth_mode_lvl_1", "§r§fStealth mode Lvl. 1", ["Use item to §r§6toggle", "Energy: 10 units/second"]),
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

const bustedCounterObjective: ScoreboardObjective = world.scoreboard.getObjective("bustedCounter")!;

const levelMapHeight = 20;
const consolesHeight = -15;
const rechargeHeight = -20;
const cameraHeight = -25;
const cameraMappingHeight = -30;

// 1 second in ticks
const SECOND = 20;

const overworld = world.getDimension("overworld");

world.afterEvents.itemStartUseOn.subscribe(itemUse);
world.afterEvents.itemUse.subscribe(itemUse);

function itemUse(event: ItemUseAfterEvent | ItemStartUseOnAfterEvent) {
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
	const query = {
		"type": "armor_stand",
		"location": new Vector(player.location.x, rechargeHeight, player.location.z),
		"maxDistance": 2,
		"closest": 1
	}
	const armorStands = overworld.getEntities(query);
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
			// Enter "1 mode only" state
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
			// Bring back player's items
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
	var playerEnergyTracker = DataManager.getData(player, "playerEnergyTracker")!;
	const query = {
		"type": "armor_stand",
		"location": { "x": player.location.x, "y": consolesHeight, "z": player.location.z },
		"maxDistance": 2,
		"closest": 1
	}
	const armorStands = overworld.getEntities(query);
	var i = 0;
	for (const armorStand of armorStands) {
		i++;
		var armorStandActionTracker = DataManager.getData(armorStand, 'actionTracker')! as ActionTracker;
		if (armorStandActionTracker.used == true || armorStandActionTracker.isKeycardReader) {
			i--;
			return;
		}
		if (armorStandActionTracker.level <= lvl) {
			if (Utilities.gamebandInfo.hackingMode[lvl].cost > playerEnergyTracker.energyUnits) {
				player.sendMessage("§cNot enough energy!");
				return;
			}
			if (armorStandActionTracker.prereq) { // If there are any prerequisites, ensure they are true here
				var prereq = armorStandActionTracker.prereq;
				if (prereq.objectives) { // Objective(s) must be completed first
					if (!prereq.objectives.every(x => GameObjectiveManager.objectiveIsComplete(x))) return;
				}
			}
			player.playSound('map.hack_use');
			if (armorStandActionTracker.level != 0) playerEnergyTracker.energyUnits -= Utilities.gamebandInfo.hackingMode[lvl].cost;
			DataManager.setData(player, playerEnergyTracker);
			armorStandActionTracker.actions.forEach((x: IAction) => {
				if (!x.delay) {
					action(x, player);
				} else {
					system.runTimeout(() => {
						action(x, player);
					}, x.delay);
				}
			});
			// Player hacked the device, now disable it
			armorStandActionTracker.used = true;
			// Remove old data & add the modified data
			DataManager.setData(armorStand, armorStandActionTracker);
		} else {
			player.sendMessage("§cConsole is too complicated");
			return;
		}
	}
	if (i == 0) {
		player.sendMessage("§cNo console");
		return;
	}
}

function cancelAllModes(player: Player, lvlInfo: LevelInformation) {
	lvlInfo.currentModes.forEach((mode) => {
		switch (mode.mode) {
			case "sensor":
				SensorModeFunc.toggleSensorMode(player, 0);
				break;
			case "magnet":
				MagnetModeFunc.toggleMagnetMode(player, 0);
				break;
			case "stealth":
				StealthModeFunc.toggleStealthMode(player, 0);
				break;
			case "xray":
				XRayModeFunc.toggleXRayMode(player, 0);
				break;
		}
	})
}

function action(actionInfo: IAction, player: Player) {
	switch (actionInfo.type) {
		case "slideshow":
			let slideshowInfo = actionInfo as SlideshowAction;
			var slideshowID = slideshowInfo.do.slideshowID;
			startSlideshow(slideshowID, player);
			break;
		case "set_block": {
			var x = actionInfo.do.x;
			var y = actionInfo.do.y;
			var z = actionInfo.do.z;
			var block = actionInfo.do.block;
			var permutations = actionInfo.do.permutations;
			Utilities.setBlock(new Vector(x, y, z), block, permutations);
			var query = {
				"type": "theheist:hover_text",
				"location": new Vector(x, y, z),
				"maxDistance": 1,
				"closest": 1
			};
			var hoverText = overworld.getEntities(query)[0];
			// To not show the death particles
			hoverText?.remove();
			break;
		}
		case "fill_blocks": {
			var x1 = actionInfo.do.x1;
			var y1 = actionInfo.do.y1;
			var z1 = actionInfo.do.z1;
			var x2 = actionInfo.do.x2;
			var y2 = actionInfo.do.y2;
			var z2 = actionInfo.do.z2;
			var block = actionInfo.do.block;
			var permutations = actionInfo.do.permutations;
			Utilities.fillBlocks(new Vector(x1, y1, z1), new Vector(x2, y2, z2), block, permutations);
			break;
		}
		case "disable_camera":
			player.playSound('map.disable');
			var cameraID = actionInfo.do.cameraID;
			var cameraQuery = {
				"type": "armor_stand",
				"location": { 'x': player.location.x, 'y': cameraHeight, 'z': player.location.z },
				"maxDistance": 50
			};
			var cameraArmorStand = overworld.getEntities(cameraQuery).filter((x: Entity) => {
				var cameraTrackerDataNode = DataManager.getData(x, "cameraTracker");
				return (x.location.y == cameraHeight && cameraTrackerDataNode && cameraTrackerDataNode.disabled == false && cameraTrackerDataNode.cameraID == cameraID);
			})[0];
			if (cameraArmorStand == undefined) return;
			var cameraTrackerDataNode = DataManager.getData(cameraArmorStand, "cameraTracker")!;
			cameraTrackerDataNode.disabled = true;
			DataManager.setData(cameraArmorStand, cameraTrackerDataNode);
			var displayCameraLocation = { "x": cameraArmorStand.location.x, "y": -57, "z": cameraArmorStand.location.z };
			var displayCameraQuery = {
				"type": `theheist:${cameraTrackerDataNode.type}`,
				"location": displayCameraLocation,
				"maxDistance": 1
			};
			var displayCamera = overworld.getEntities(displayCameraQuery)[0];
			displayCamera.triggerEvent("theheist:disable");
			if (!actionInfo.do.noMessage) player.sendMessage([{ "translate": `map.console.${cameraTrackerDataNode.type != "sonar360" ? cameraTrackerDataNode.type : "sonar"}` }]);
			var maxParticles = 10;
			var radius = 0.4;
			for (var i = 0; i < maxParticles; i++) {
				const x = displayCameraLocation.x + ((Utilities.cos(360 * (i / maxParticles)) * radius));
				const y = displayCameraLocation.y + 0.5;
				const z = displayCameraLocation.z + ((Utilities.sin(360 * (i / maxParticles)) * radius));

				try {
					const molangVarMap = new MolangVariableMap();
					molangVarMap.setVector3("variable.velocity", { x, y, z });
					overworld.spawnParticle("minecraft:explosion_particle", { x, y, z }, molangVarMap);
				} catch (err) { }

			}
			break;
		case "voice_says":
			var soundID = actionInfo.do.soundID;
			VoiceOverManager.play(player, soundID);
			break;
		case "play_sound":
			var soundID = actionInfo.do.soundID;
			player.playSound(soundID);
			break;
		case "run_command":
			var command = actionInfo.do.command;
			overworld.runCommand(command);
			break;
		case "hack_console": {
			var x = actionInfo.do.x;
			var z = actionInfo.do.z;
			var query = {
				"type": "armor_stand",
				"location": new Vector(x, consolesHeight, z),
				"maxDistance": 2,
				"closest": 1
			};
			var armorStand = overworld.getEntities(query)[0];
			var actionTracker = DataManager.getData(armorStand, "actionTracker")!;
			actionTracker.actions.forEach((x: IAction) => {
				if (x.type == "hack_console") return;
				if (!x.delay) {
					action(x, player);
				} else {
					system.runTimeout(() => {
						action(x, player);
					}, x.delay);
				}
			});
			actionTracker.used = true;
			DataManager.setData(armorStand, actionTracker);
			break;
		}
		case "display_mail":
			var mailID = actionInfo.do.mailID;
			player.sendMessage([{ "text": "§cEmail:§r §o" }, { "translate": `map.mail.${mailID}` }]);
			break;
		case "display_research":
			var researchID = actionInfo.do.researchID;
			player.sendMessage([{ "text": "§9Research Report:§r §o" }, { "translate": `map.mail.${researchID}` }]);
			break;
		case "display_text":
			var text = actionInfo.do.text;
			player.sendMessage(text);
			break;
		case "set_alarm_level":
			var lvlInfo = DataManager.getData(player, "levelInformation")!;
			lvlInfo.information[0].level = actionInfo.do.value;
			DataManager.setData(player, lvlInfo);
			if (actionInfo.do.value == 0) {
				player.sendMessage([{ "translate": "map.console.alarm" }]);
				player.playSound("note.snare", { "pitch": 1.8, "volume": 0.5 });
			}
			break;
		case "manage_objectives":
			var manageType = actionInfo.do.manageType;
			// §c = red (unfinished)
			// §a = green (finished)
			switch (manageType) {
				case 1:
					// Add an unfinished objective
					var objective = actionInfo.do.objective;
					var sortOrder = actionInfo.do.sortOrder;

					GameObjectiveManager.addObjective(objective, sortOrder);
					break;
				case 2:
					// Finish an objective
					var objective = actionInfo.do.objective;

					GameObjectiveManager.completeObjective(objective);
					break;
				case 3:
					// Remove an objective
					var objective = actionInfo.do.objective;

					GameObjectiveManager.removeObjective(objective);
					break;
			}
			break;
		case "new_gameband": {
			/**
			 * actionInfo.do.displayBlock: Vector3
			 * actionInfo.do.mode: string
			 * actionInfo.do.slot: number
			 * actionInfo.do.modeText: string
			 * actionInfo.do.level: number
			 */
			var levelInformation = DataManager.getData(player, "levelInformation")!;
			levelInformation.information[2].inventory.push({ "slot": actionInfo.do.slot, "typeId": `theheist:${actionInfo.do.mode}_mode_lvl_${actionInfo.do.level}`, "lockMode": "slot" });
			DataManager.setData(player, levelInformation);
			Utilities.reloadPlayerInv(player);
			Utilities.dimensions.overworld.getBlock(actionInfo.do.displayBlock)?.setType("minecraft:air");
			world.sendMessage([{ "text": "§7New Mode Available: §r" + actionInfo.do.modeText }]);
			break;
		}
		case "upgrade_gameband": {
			/**
			 * actionInfo.do.displayBlock: Vector3
			 * actionInfo.do.mode: string
			 * actionInfo.do.slot: number
			 * actionInfo.do.modeText: string
			 * actionInfo.do.level: number
			 */
			var levelInformation = DataManager.getData(player, "levelInformation")!;
			var inUse = false;
			levelInformation.currentModes.forEach((x, i) => {
				if (x.mode == actionInfo.do.mode) {
					levelInformation.currentModes[i].level += 1;
					inUse = true;
				}
			});
			levelInformation.information[2].inventory = levelInformation.information[2].inventory.filter((x: IInventorySlotData) => (x.slot != actionInfo.do.slot));
			levelInformation.information[2].inventory.push({ "slot": actionInfo.do.slot, "typeId": `theheist:${actionInfo.do.mode}_mode_lvl_${actionInfo.do.level}${inUse ? "_enchanted" : ""}`, "lockMode": "slot" });
			DataManager.setData(player, levelInformation);
			Utilities.reloadPlayerInv(player);
			if (actionInfo.do.mode == "recharge") {
				var playerEnergyTracker: PlayerEnergyTracker = DataManager.getData(player, "playerEnergyTracker")!;
				playerEnergyTracker.rechargeLevel = actionInfo.do.level;
				DataManager.setData(player, playerEnergyTracker);
			}
			Utilities.dimensions.overworld.getBlock(actionInfo.do.displayBlock)?.setType("minecraft:air");
			world.sendMessage([{ "text": "§7Upgrade Recieved: §r" + actionInfo.do.modeText }]);
			break;
		}
	}
}

function keycard(keycardType: string, player: Player) {
	var playerHeadLocation = player.getHeadLocation();
	var blockRaycastHit = overworld.getBlockFromRay(new Vector(playerHeadLocation.x, playerHeadLocation.y + 0.1, playerHeadLocation.z), player.getViewDirection(), { maxDistance: 2 });
	if (!blockRaycastHit) return;
	var block = blockRaycastHit.block;
	if (block.typeId != "theheist:keycard_reader") return;
	var query = {
		"type": "armor_stand",
		"location": { 'x': block.location.x, 'y': consolesHeight, 'z': block.location.z },
		"maxDistance": 2,
		"closest": 1
	}
	var armorStand = overworld.getEntities(query)[0];
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
	actionTracker.actions.forEach((x: IAction) => {
		if (!x.delay) {
			action(x, player);
		} else {
			system.runTimeout(() => {
				action(x, player);
			}, x.delay);
		}
	});
	// Keypad has been used, so ensure to save that
	actionTracker.used = true;
	DataManager.setData(armorStand, actionTracker);
}

function startSlideshow(slideshowID: number, player: Player) {
	switch (slideshowID) {
		case 1:
			// Clear player's inventory
			const playerInvContainer = (player.getComponent('inventory') as EntityInventoryComponent).container as Container;
			playerInvContainer.clearAll();

			// Start speaking & send subtitles
			player.playSound('map.001');
			player.sendMessage([{ "text": "§5§oVoice:§r " }, { "translate": "map.sub.001.A" }]);
			player.sendMessage([{ "text": "§5§oVoice:§r " }, { "translate": "map.sub.001.B" }]);

			const hideHud = system.runInterval(() => {
				player.onScreenDisplay.setTitle('hideHud')
			}, 0)

			// First TP
			player.teleport({ x: 998.5, y: -60, z: 112.5 }, { 'dimension': overworld });
			player.camera.setCamera('minecraft:free', {
				location: { x: 1030.5, y: -57.25, z: 107.5 },
				rotation: { x: 0, y: 180 }
			})

			system.runTimeout(() => {
				player.camera.setCamera('minecraft:free', {
					location: { x: 1031.5, y: -57.25, z: 88.5 },
					rotation: { x: -30, y: 125 }
				})
			}, SECOND * 5);

			system.runTimeout(() => {
				player.camera.setCamera('minecraft:free', {
					location: { x: 1027.5, y: -57.25, z: 68.5 },
					rotation: { x: 0, y: 135 }
				})
			}, SECOND * 13);

			system.runTimeout(() => {
				player.camera.setCamera('minecraft:free', {
					location: { x: 1017.5, y: -57.25, z: 56.5 },
					rotation: { x: -25, y: 80 }
				})
			}, SECOND * 22);

			system.runTimeout(() => {
				system.clearRun(hideHud);
				player.camera.clear();
				overworld.runCommand("scriptevent theheist:load-level 1");
			}, SECOND * 30.5);
			break;
	}
}

function playerBusted(player: Player, currentLevel: number) {
	player.addTag('loadingLevel');
	var playerLevelInformation = DataManager.getData(player, "levelInformation")!;
	bustedCounterObjective.setScore(player, (bustedCounterObjective.getScore(player) ?? 0) + 1);
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
		player.sendMessage(`You got busted §c§l${bustedCounterObjective.getScore(player)}§r time(s)`);
	}, SECOND * 3);
	system.runTimeout(() => {
		player.removeTag("BUSTED");
		overworld.runCommandAsync(`scriptevent theheist:load-level ${currentLevel}`);
	}, SECOND * (3 + 5));
}

function stopAllSound() {
	overworld.getEntities({ "excludeTypes": ["minecraft:armor_stand", "theheist:hover_text"] }).forEach((e) => { try { e.runCommand('stopsound @s'); } catch { } });
}

function cloneFloor(loc: Vector) {
	var range = 10;
	var corner1 = loc.subtract(new Vector(range, 0, range));
	var corner2 = loc.add(new Vector(range, 0, range));
	corner1.y = Utilities.levelHeight - 1;
	corner2.y = Utilities.levelHeight - 1;
	var corner3 = loc.subtract(new Vector(range, 0, range));
	corner3.y = Utilities.floorCloneHeight;
	overworld.runCommand(`clone ${corner1.x} ${corner1.y} ${corner1.z} ${corner2.x} ${corner2.y} ${corner2.z} ${corner3.x} ${corner3.y} ${corner3.z}`);
	//overworld.runCommand(`fill ${corner1.x} ${Utilities.floorCloneHeight + 1} ${corner1.z} ${corner2.x} ${Utilities.floorCloneHeight + 1} ${corner2.z} air`);
}

function flattenMap(loc: Vector) {
	var range = 10;
	var corner1 = loc.subtract(new Vector(range, 0, range));
	var corner2 = loc.add(new Vector(range, 0, range));
	corner1.y = Utilities.levelMapHeight + 1;
	corner2.y = Utilities.levelMapHeight + 1;
	var corner3 = loc.subtract(new Vector(range, 0, range));
	corner3.y = Utilities.levelMapHeight;
	overworld.runCommand(`clone ${corner1.x} ${corner1.y} ${corner1.z} ${corner2.x} ${corner2.y} ${corner2.z} ${corner3.x} ${corner3.y} ${corner3.z} masked move`);
}

function clearGlass(loc: Vector) {
	var range = 10;
	loc.y = -50;
	var corner1 = loc.subtract(new Vector(range, 0, range));
	var corner2 = loc.add(new Vector(range, 0, range));
	overworld.runCommand(`fill ${corner1.x} ${corner1.y} ${corner1.z} ${corner2.x} ${corner2.y} ${corner2.z} air replace glass`);
}

system.runInterval(() => {
	const player = world.getPlayers().filter((x: Player) => (x != undefined && x != null))[0];
	if (player == undefined) return;

	
	var playerLevelInformation = DataManager.getData(player, "levelInformation")!;
	
	{
		var itemEntity = overworld.getEntities({
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
	//cloneFloor(Vector.fromV3(player.location));
	//flattenMap(Vector.fromV3(player.location));
	//clearGlass(Vector.fromV3(player.location));

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
		const armorStands = overworld.getEntities(query);
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
			const subArmorStands = overworld.getEntities(subQuery);
			for (const subArmorStand of subArmorStands) {
				var armorStandEnergyTracker = DataManager.getData(subArmorStand, "energyTracker")!;
				if (armorStandEnergyTracker.rechargerID != playerEnergyTracker.usingRechargerID) continue;
				Utilities.setBlock({ x: armorStandEnergyTracker.block.x, y: armorStandEnergyTracker.block.y, z: armorStandEnergyTracker.block.z }, "theheist:recharge_station", { "minecraft:cardinal_direction": armorStandEnergyTracker.block.rotation, "theheist:state": 1 });
				playerEnergyTracker.usingRechargerID = -1;
			}
		} else if (playerEnergyTracker.energyUnits < Utilities.gamebandInfo.rechargeMode[playerEnergyTracker.rechargeLevel].max) {
			var addEnergy = Utilities.gamebandInfo.rechargeMode[playerEnergyTracker.rechargeLevel].speed;
			// Divided by ticks in a second, because this is happening every tick (1/20th of a second)
			addEnergy /= 20;
			playerEnergyTracker.energyUnits = Math.min(playerEnergyTracker.energyUnits + addEnergy, Utilities.gamebandInfo.rechargeMode[playerEnergyTracker.rechargeLevel].max);
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
					if (armorStandEnergyTracker.actions) {
						// Energy tracker has actions to run
						armorStandEnergyTracker.actions.forEach((x: IAction) => {
							action(x, player);
						});
					}
				}
				DataManager.setData(armorStand, armorStandEnergyTracker);
			}
		}
		DataManager.setData(player, playerEnergyTracker);
	}

	if (playerEnergyTracker && playerLevelInformation) SensorModeFunc.tryMap(player, playerLevelInformation, playerEnergyTracker);
});