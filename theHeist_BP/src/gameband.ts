import { MolangVariableMap, BlockPermutation, EffectTypes, Vector3, world, system, Player, EntityInventoryComponent, EffectType, DisplaySlotId, ScoreboardObjective, Container, ItemStack, ItemLockMode, Entity, Dimension, ItemUseAfterEvent } from "@minecraft/server";
import Vector from "./Vector";
import DataManager from "./DataManager";
import Utilities from "./Utilities";
import GameObjectiveManager from "./GameObjectiveManager";
import * as SensorModeFunc from "./gamebands/sensor";

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
	new loreItem("theheist:hacking_mode_lvl_1", "§r§2Hacking mode Lvl. 1", ["Use item to §r§6use", "Energy: 15 units"]),
	new loreItem("theheist:sensor_mode_lvl_1", "§r§6Sensor mode Lvl. 1", ["Use item to §r§6toggle", "Energy: 1.0 units/second"]),
	new loreItem('minecraft:paper', '§oUse Keycard§r', ['Can trigger any Keycard reader', 'for which you own a matching card']),
	new loreItem('minecraft:red_dye', '§oRed Keycard§r', ['Used on matching Keycard reader']),
	new loreItem('minecraft:yellow_dye', '§oYellow Keycard§r', ['Used on matching Keycard reader']),
	new loreItem('minecraft:green_dye', '§oGreen Keycard§r', ['Used on matching Keycard reader']),
	new loreItem('minecraft:lapis_lazuli', '§oBlue Keycard§r', ['Used on matching Keycard reader']),
	new loreItem('minecraft:leather_helmet', '§oCall the authorities§r', ['Drop to restart level']),
	new loreItem('theheist:nv_glasses', '§oNV Goggles§r', ['Drop to regain items']),
]

const bustedCounterObjective: ScoreboardObjective = world.scoreboard.getObjective("bustedCounter")!;

/**
 * Layer information:
 * 20: Level map
 * 0: Hackable consoles
 * -5: Recharge stations
 * -10: Cameras, sonars, and robots
 * -15: Cameras and sonars mappout area
 */

const levelMapHeight = 20;
const consolesHeight = -15;
const rechargeHeight = -20;
const cameraHeight = -25;
const cameraMappingHeight = -30;

// 1 second in ticks
const SECOND = 20;

const overworld = world.getDimension("overworld");

world.afterEvents.itemUse.subscribe((event: ItemUseAfterEvent) => {
	const player = event.source;
	//const inv = player.getComponent("minecraft:inventory").container;
	//const text = inv.getSlot(0).typeId;
	var text = event.itemStack.typeId;
	if (text.endsWith("_enchanted")) text = text.substring(0, text.length - "_enchanted".length);
	let keycardType;
	switch (text) {
		case "theheist:recharge_mode_lvl_1":
			rechargeMode(1, player);
			break;
		case "theheist:hacking_mode_lvl_1":
			hackingMode(1, player);
			break;
		case "theheist:sensor_mode_lvl_1":
			sensorMode(1, player);
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
});

/**
 * @description Mode Type: Loop
 * @param lvl 
 * @param player 
 * @returns 
 */
function sensorMode(lvl: number, player: Player) {
	// Sensor mode has a radius of 14 blocks from the player, or 14.5 blocks directly including the block the player is standing on.
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
	//{"type":"set_block", "do":{"x":-22, "y":-58, "z":58, "block":"theheist:computer", "permutations":"[\"theheist:rotation\":5, \"theheist:unlocked\":true]"}}
	const armorStands = overworld.getEntities(query);
	for (const armorStand of armorStands) {

		var armorStandEnergyTrackerDataNode = DataManager.getData(armorStand, "energyTracker");
		var playerEnergyTrackerDataNode = DataManager.getData(player, "energyTracker");
		var blockLocation = { "x": armorStandEnergyTrackerDataNode.block.x, "y": armorStandEnergyTrackerDataNode.block.y, "z": armorStandEnergyTrackerDataNode.block.z };
		if (playerEnergyTrackerDataNode.recharging == false) {
			if (armorStandEnergyTrackerDataNode.energyUnits == 0.0) return;
			playerEnergyTrackerDataNode.recharging = true;//${armorStandEnergyTrackerDataNode.block.rotation}
			player.playSound('map.recharge_use', { "volume": 0.25 });
			Utilities.setBlock(blockLocation, "theheist:recharge_station", { "theheist:rotation": armorStandEnergyTrackerDataNode.block.rotation, "theheist:state": 2 });
			playerEnergyTrackerDataNode.usingRechargerID = armorStandEnergyTrackerDataNode.rechargerID;
			// Enter "1 mode only" state
			savePlayerInventory(player);
			var playerInvContainer = (player.getComponent("inventory") as EntityInventoryComponent).container as Container;
			playerInvContainer.clearAll();
			var rechargeModeItemStack = new ItemStack(`theheist:recharge_mode_lvl_${lvl}_enchanted`);
			rechargeModeItemStack.lockMode = ItemLockMode.slot;
			playerInvContainer.setItem(0, rechargeModeItemStack);
		} else {
			// The player is currently recharging
			playerEnergyTrackerDataNode.recharging = false;
			Utilities.setBlock(blockLocation, "theheist:recharge_station", { "theheist:rotation": armorStandEnergyTrackerDataNode.block.rotation, "theheist:state": 1 });
			playerEnergyTrackerDataNode.usingRechargerID = -1;
			// Bring back player's items
			resetPlayerInventory(player);
		}
		DataManager.setData(player, playerEnergyTrackerDataNode);
		//console.warn(JSON.stringify(DataManager.getData(player, "energyTracker")));
	}
}

/**
 * @description Mode Type: Instant
 * @param lvl 
 * @param player 
 * @returns 
 */
function hackingMode(lvl: number, player: Player) {
	var playerEnergyTracker = DataManager.getData(player, "energyTracker");
	const query = {
		"type": "armor_stand",
		"location": { "x": player.location.x, "y": consolesHeight, "z": player.location.z },
		"maxDistance": 2,
		"closest": 1
	}
	//{"type":"set_block", "do":{"x":-22, "y":-58, "z":58, "block":"theheist:computer", "permutations":"[\"theheist:rotation\":5, \"theheist:unlocked\":true]"}}
	const armorStands = overworld.getEntities(query);
	var i = 0;
	for (const armorStand of armorStands) {
		i++;
		//player.sendMessage(armorStand.location.x + ", " + armorStand.location.y + ", and " + armorStand.location.z);
		var armorStandActionTracker = DataManager.getData(armorStand, 'actionTracker');
		if (armorStandActionTracker.used == true || armorStandActionTracker.isKeycardReader) {
			i--;
			return;
		}
		if (armorStandActionTracker.level <= lvl) {
			if (Utilities.gamebandInfo.hackingMode[lvl].cost > playerEnergyTracker.energyUnits) {
				player.sendMessage("§cNot enough energy!");
				return;
			}
			player.playSound('map.hack_use');
			if (armorStandActionTracker.level != 0) playerEnergyTracker.energyUnits -= Utilities.gamebandInfo.hackingMode[lvl].cost;
			DataManager.setData(player, playerEnergyTracker);
			/*var block = armorStandActionTracker.block;
			if (block.type != "keycard_reader") {
				// _____________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________WHYWHYWHY!!!
				var blockSetter1 = {"type": "set_block", "do": { "x": block.x, "y": block.y, "z": block.z, "block": `theheist:${block.type}`, "permutations": {"theheist:rotation": block.rotation, "theheist:unlocked": 1} }};
				var blockSetter2 = {"type": "set_block", "do": { "x": block.x, "y": block.y, "z": block.z, "block": `theheist:${block.type}`, "permutations": {"theheist:rotation": block.rotation, "theheist:unlocked": 2} }, "delay": 40};
				armorStandActionTracker.actions.unshift( blockSetter1, blockSetter2 );
			}*/
			armorStandActionTracker.actions.forEach((x: Action) => {
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

/**
 * @description Resets player's inventory to what it should be set to, based of of the player's inventory data from the levelInformation data node.
 * @param player 
 * @returns 
 */
function resetPlayerInventory(player: Player) {
	var playerInvContainer = (player.getComponent("inventory") as EntityInventoryComponent).container as Container;
	var playerInvData = DataManager.getData(player, "levelInformation").information[2].inventory;
	playerInvContainer.clearAll();
	playerInvData.forEach((invSlotData: any) => {
		var itemStack = new ItemStack(invSlotData.typeId);
		itemStack.lockMode = ItemLockMode[invSlotData.lockMode as keyof typeof ItemLockMode];
		playerInvContainer.setItem(invSlotData.slot, itemStack);
	});
}

/**
 * @description Saves player's inventory. Ensure this function is run BEFORE whenever you want to enter into a "1 mode only" state.
 * @param player 
 * @returns 
 */
function savePlayerInventory(player: Player) {
	var playerInvContainer = (player.getComponent("inventory") as EntityInventoryComponent).container as Container;
	var playerLevelData = DataManager.getData(player, "levelInformation");
	var newPlayerInvData = [];
	for (var i = 0; i < playerInvContainer.size; i++) {
		var itemStack = playerInvContainer.getItem(i);
		if (itemStack) newPlayerInvData.push({
			"slot": i,
			"typeId": itemStack.typeId,
			"lockMode": itemStack.lockMode
		});
	}
	playerLevelData.information[2].inventory = newPlayerInvData;
	// Update player information
	DataManager.setData(player, playerLevelData);
}

function action(actionInfo: Action, player: Player) {
	switch (actionInfo.type) {
		case "slideshow":
			var slideshowID = actionInfo.do;
			startSlideshow(slideshowID, player);
			break;
		case "set_block": {
			var x = actionInfo.do.x;
			var y = actionInfo.do.y;
			var z = actionInfo.do.z;
			var block = actionInfo.do.block;
			var permutations = actionInfo.do.permutations;
			//overworld.runCommandAsync(`setBlock ${x} ${y} ${z} ${block} ${permutations}`)
			Utilities.setBlock({"x": x, "y": y, "z": z}, block, permutations);
			var query: Record<any, any> = {
				"type": "theheist:hover_text",
				"location": {"x": x, "y": y, "z": z},
				"maxDistance": 1,
				"closest": 1
			};
			var hoverText = overworld.getEntities(query)[0];
			// To not show the death particles
			hoverText?.teleport({"x": x, "y": y + 10, "z": z});
			hoverText?.kill();
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
			var cameraTrackerDataNode = DataManager.getData(cameraArmorStand, "cameraTracker");
			cameraTrackerDataNode.disabled = true;
			DataManager.setData(cameraArmorStand, cameraTrackerDataNode);
			var displayCameraLocation = { "x": cameraArmorStand.location.x, "y": -57, "z": cameraArmorStand.location.z };
			var displayCameraQuery = {
				"type": "theheist:camera",
				"location": displayCameraLocation,
				"maxDistance": 1
			};
			var displayCamera = overworld.getEntities(displayCameraQuery)[0];
			displayCamera.triggerEvent("theheist:disable");
			player.sendMessage([{ "translate": `map.console.camera` }]);
			var maxParticles = 10;
			var radius = 0.4;
			for (var i = 0; i < maxParticles; i++) {
				//console.warn((displayCameraLocation.x + ((cos(360 * i/maxParticles) * radius))).toString());
				//console.warn((360 * i/maxParticles).toString());
				const x = displayCameraLocation.x + ((Utilities.cos(360 * (i / maxParticles)) * radius));
				const y = displayCameraLocation.y + 0.5;
				const z = displayCameraLocation.z + ((Utilities.sin(360 * (i / maxParticles)) * radius));

				try {
					const molangVarMap = new MolangVariableMap()
					molangVarMap.setVector3("velocity", { x, y, z })
					overworld.spawnParticle("minecraft:explosion_particle", { x, y, z }, molangVarMap);
				} catch (err) { }

			}
			break;
		case "voice_says":
			var soundID = actionInfo.do.soundID;
			//const player = world.getPlayers().filter((x) => (x != undefined && x != null))[0];
			//if (player == undefined) return;
			player.playSound(`map.${soundID}`);
			player.sendMessage([{ "text": "§5§oVoice:§r " }, { "translate": `map.sub.${soundID}` }]);
			break;
		case "run_command":
			var command = actionInfo.do.command;
			overworld.runCommandAsync(command);
			break;
		case "hack_console": {
			var x = actionInfo.do.x;
			var z = actionInfo.do.z;
			var query: Record<any, any> = {
				"type": "armor_stand",
				"location": new Vector(x, consolesHeight, z),
				"maxDistance": 2,
				"closest": 1
			};
			var armorStand = overworld.getEntities(query)[0];
			var actionTracker = DataManager.getData(armorStand, "actionTracker");
			actionTracker.actions.forEach((x: Action) => {
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
		case "set_alarm_level":
			var lvlInfo = DataManager.getData(player, "levelInformation");
			lvlInfo.information[0].level = actionInfo.do.value;
			DataManager.setData(player, lvlInfo);
			if (actionInfo.do.value == 0) {
				player.sendMessage([{ "translate": "map.console.alarm" }]);
			}
			//console.warn(actionInfo.do.value.toString());
			//console.warn(DataManager.getData(player, "levelInformation").information[0].level.toString());
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
			var levelInformation = DataManager.getData(player, "levelInformation");
			levelInformation.information[2].inventory.push({ "slot": actionInfo.do.slot, "typeId": `theheist:${actionInfo.do.mode}_mode_lvl_${actionInfo.do.level}`, "lockMode": "slot" });
			DataManager.setData(player, levelInformation);
			Utilities.reloadPlayerInv(player);
			Utilities.dimensions.overworld.setBlockType(actionInfo.do.displayBlock, "minecraft:air");
			world.sendMessage([{ "text": "§7New Mode Available: §r" + actionInfo.do.modeText }]);
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
	actionTracker.actions.forEach((x: Action) => {
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
				overworld.runCommandAsync("scriptevent theheist:load-level 0-1");
			}, SECOND * 30.5);
			break;
	}
}

function playerBusted(player: Player, currentLevel: number) {
	switch (currentLevel) {
		case 0:
			var playerLevelInformation = DataManager.getData(player, "levelInformation");
			bustedCounterObjective.setScore(player, (bustedCounterObjective.getScore(player) ?? 0) + 1);
			playerLevelInformation.information[0].level = 0;
			DataManager.setData(player, playerLevelInformation);
			player.playSound("map.alarm");
			player.addTag("BUSTED");
			(player.getComponent("inventory") as EntityInventoryComponent).container?.clearAll();
			overworld.fillBlocks({ "x": 2029.50, "y": -59.00, "z": 56.50 }, { "x": 2029.50, "y": -59.00, "z": 61.50 }, BlockPermutation.resolve("minecraft:air"));
			system.runTimeout(() => {
				player.runCommandAsync('stopsound @s');
				player.teleport({ "x": 2037.5, "y": -59, "z": 59.5 });
				player.sendMessage(`You got busted §c§l${bustedCounterObjective.getScore(player)}§r time(s)`);
			}, SECOND * 3);
			system.runTimeout(() => {
				player.removeTag("BUSTED");
				overworld.runCommandAsync('scriptevent theheist:load-level 0-2');
			}, SECOND * (3 + 5));
			break;
	}
}

system.runInterval(() => {
	const player = world.getPlayers().filter((x: Player) => (x != undefined && x != null))[0];
	if (player == undefined) return;
	// Give player effects
	const saturation = EffectTypes.get('saturation')!;
	const nightVision = EffectTypes.get('night_vision')!;
	const resistance = EffectTypes.get('resistance')!;
	player.addEffect(saturation, 2000, { 'amplifier': 1, 'showParticles': false });
	player.addEffect(nightVision, 2000, { 'amplifier': 1, 'showParticles': false });
	player.addEffect(resistance, 2000, { 'amplifier': 1, 'showParticles': false });
	// Set lore for items
	const playerInvContainer = (player.getComponent('inventory') as EntityInventoryComponent).container as Container;
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
	var selectedItemStack = playerInvContainer.getItem(player.selectedSlot);
	if (selectedItemStack != undefined && selectedItemStack.typeId.startsWith("theheist:recharge_mode_lvl_")) {
		GameObjectiveManager.showSidebar();
	} else {
		GameObjectiveManager.hideSidebar();
	}

	// Set player level to player energy level
	var playerEnergyTracker: EnergyTracker = DataManager.getData(player, "energyTracker");
	var playerLevelInformation: LevelInformation = DataManager.getData(player, "levelInformation");

	if (playerEnergyTracker && playerLevelInformation) SensorModeFunc.sensorTick(player, playerLevelInformation, playerEnergyTracker);

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
			var armorStandEnergyTracker = DataManager.getData(armorStand, "energyTracker");
			if (armorStandEnergyTracker.rechargerID != playerEnergyTracker.usingRechargerID) continue;
			i++;
		}
		if (i == 0) {
			// Player has left range, so stop the player from recharging
			playerEnergyTracker.recharging = false;
			resetPlayerInventory(player);
			const subQuery = {
				"type": "armor_stand",
				"location": { 'x': player.location.x, 'y': rechargeHeight, 'z': player.location.z },
				"maxDistance": 4
			}
			const subArmorStands = overworld.getEntities(subQuery);
			for (const subArmorStand of subArmorStands) {
				var armorStandEnergyTracker = DataManager.getData(subArmorStand, "energyTracker");
				if (armorStandEnergyTracker.rechargerID != playerEnergyTracker.usingRechargerID) continue;
				Utilities.setBlock({ x: armorStandEnergyTracker.block.x, y: armorStandEnergyTracker.block.y, z: armorStandEnergyTracker.block.z }, "theheist:recharge_station", { "theheist:rotation": armorStandEnergyTracker.block.rotation, "theheist:state": 1 });
				playerEnergyTracker.usingRechargerID = -1;
			}
		} else if (playerEnergyTracker.energyUnits < Utilities.gamebandInfo.rechargeMode[playerEnergyTracker.rechargeLevel].max) {
			var addEnergy = 0.0;
			switch (playerEnergyTracker.rechargeLevel) {
				case 1:
					addEnergy = Utilities.gamebandInfo.rechargeMode[playerEnergyTracker.rechargeLevel].speed;
					break;
			}
			// Divided by ticks in a second, because this is happening every tick (1/20th of a second)
			addEnergy /= 20;
			addEnergy = Math.min(addEnergy, Utilities.gamebandInfo.rechargeMode[playerEnergyTracker.rechargeLevel].max);
			playerEnergyTracker.energyUnits += addEnergy;
			for (const armorStand of armorStands) {
				var armorStandEnergyTracker = DataManager.getData(armorStand, "energyTracker");
				if (armorStandEnergyTracker.rechargerID != playerEnergyTracker.usingRechargerID) continue;

				armorStandEnergyTracker.energyUnits -= addEnergy;
				if (armorStandEnergyTracker.energyUnits <= 0) {
					// The recharge station is out of energy, so stop player from recharging
					var diff = Math.abs(armorStandEnergyTracker.energyUnits);
					playerEnergyTracker.energyUnits -= diff;
					armorStandEnergyTracker.energyUnits = 0;
					Utilities.setBlock({ x: armorStandEnergyTracker.block.x, y: armorStandEnergyTracker.block.y, z: armorStandEnergyTracker.block.z }, "theheist:recharge_station", { "theheist:rotation": armorStandEnergyTracker.block.rotation, "theheist:state": 3 });
					playerEnergyTracker.recharging = false;
					playerEnergyTracker.usingRechargerID = -1;
					resetPlayerInventory(player);
					if (armorStandEnergyTracker.actions) {
						// Energy tracker has actions to run
						armorStandEnergyTracker.actions.forEach((x: Action) => {
							action(x, player);
						});
					}
				}
				DataManager.setData(armorStand, armorStandEnergyTracker);
			}
		}
		DataManager.setData(player, playerEnergyTracker);
	}
	//player.sendMessage(parseInt(playerEnergyTracker.energyUnits) + "||" + player.level);
	// Set map if possible
	const playerRotX = player.getRotation().x;
	if (playerRotX < 90 && playerRotX > 80) {
		// Player is looking down
		// Only possible slot for the sensor mode to be in
		const itemStack = playerInvContainer.getItem(2);
	}
});

interface Action {
	type: string;
	do: any;
	delay?: number;
}