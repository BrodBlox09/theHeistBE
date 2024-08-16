import { ItemStack, Player, system, world, DisplaySlotId, BlockInventoryComponent, BlockPermutation, Container, ItemLockMode, GameMode } from "@minecraft/server";
import Vector from "./Vector";
import Utilities from "./Utilities";
import DataManager from "./DataManager";
import VoiceOverManager from "./VoiceOverManager";
import LevelConstructor from "./levels/LevelConstructor";
import LevelDefinitions from "./levels/levelDefinitions";
import GameObjectiveManager from "./GameObjectiveManager";

// Hack delay: 2 seconds or 40 ticks

/**
 * Base player energy tracker data node:
	{
	"name": "energyTracker",
	"energyUnits": gamebandInfo.rechargeMode.level#Max,
	"recharging": false,
	"usingRechargerID": -1,
	"rechargeLevel": #
	}
 * Base player level information data node:
	{
		"name":"levelInformation",
		"currentModes": [], // A list of the current modes as a ModeData interface in use by the player. Does not include the recharge mode because it has exceptionally special functionality.
		"information": [
			{
				"name":"alarmLevel",
				"level":0
			},
			{
				"name": "gameLevel",
				"level": #
			},
			{
				"name": "playerInv",
				"inventory": [
					{
						"slot": #,
						"typeId": "", // The typeId of the item stack you would like to place in the player's inventory
						"lockMode": "none"|"inventory"|"slot" // See https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/itemlockmode?view=minecraft-bedrock-experimental
					}
				]
			}
		]
	}
 * Base energy tracker data node:
	{
		"name": "energyTracker",
		"rechargerID": #,
		"energyUnits": 100.0,
		"block": {"x": #, "y": #, "z": #, "rotation": #},
		"actions":[]
	}
 * Base camera tracker data node:
	{
		"name": "cameraTracker",
		"isRobot": false,
		"rotation": #,
		"swing": [#, #]|null,
		"disabled": false,
		"cameraID": #,
		"type": "camera"|"sonar"
	}
 */

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
const levelHeight = -60;

// Second in ticks
const SECOND = 20;

const objectivesObjective = world.scoreboard.getObjective("objectives")!;
const bustedCounterObjective = world.scoreboard.getObjective("bustedCounter")!;

const overworld = Utilities.dimensions.overworld;

system.afterEvents.scriptEventReceive.subscribe((event) => {
	const id = event.id;
	const msg = event.message;
	switch (id) {
		case "theheist:load-level": {
			const entities = overworld.getEntities();
			for (const entity of entities) {
				if (!["minecraft:player", "minecraft:painting"].includes(entity.typeId)) entity.kill();
			}
			const player = world.getPlayers().filter((x) => (x != undefined && x != null))[0];
			if (player == undefined) {
				world.sendMessage("Could not find player");
				return;
			}
			player.addTag('loadingLevel');
			if (!bustedCounterObjective.hasParticipant(player)) {
				bustedCounterObjective.setScore(player, 0);
			}
			switch (msg) {
				case "1-1": {
					// Load level 1 (The van tutorial level)
					// Clear all data on player
					DataManager.clearData(player);
					player.getTags().forEach((x) => { if (x != 'loadingLevel') player.removeTag(x); });
					// Add energyTracker data node
					const playerEnergyTrackerDataNode: EnergyTracker = { "name": "energyTracker", "energyUnits": 0.0, "recharging": false, "usingRechargerID": -1, "rechargeLevel": 1 };
					DataManager.setData(player, playerEnergyTrackerDataNode);
					// Add level information data node
					if (!bustedCounterObjective.hasParticipant(player)) {
						bustedCounterObjective.setScore(player, 0);
					}
					const playerLevelInformationDataNode = { "name": "levelInformation", "currentModes": [], "information": [{ "name": "alarmLevel", "level": 0 }, { "name": "gameLevel", "level": 1 }, { "name": "playerInv", "inventory": [{ "slot": 0, "typeId": 'theheist:recharge_mode_lvl_1', "lockMode": "slot" }, { "slot": 1, "typeId": 'theheist:hacking_mode_lvl_1', "lockMode": "slot" }] }] };
					DataManager.setData(player, playerLevelInformationDataNode);
					
					Utilities.reloadPlayerInv(player, playerLevelInformationDataNode);

					player.teleport({ 'x': -22.5, 'y': -59, 'z': 61.5 }, { 'dimension': overworld, 'rotation': { 'x': 0, 'y': -90 } });

					// Setup starting objectives
					clearObjectives();
					addUnfinishedObjective("Recharge Gameband", 1);
					addUnfinishedObjective("Activate Slideshow", 0);
					reloadSidebarDisplay();
					// Load recharge station 0
					const recharge0 = overworld.spawnEntity("minecraft:armor_stand", new Vector(-21.5, rechargeHeight, 62.5));
					//recharge0.setRotation(0, n);
					// Use for cameras that need to be facing different directions than north (I think)
					const recharge0DataNode = { "name": "energyTracker", "rechargerID": 0, "energyUnits": 21.0, "block": { "x": -22, "y": -59, "z": 62, "rotation": 5 }, "actions": [{ "type": "manage_objectives", "do": { "manageType": 2, "objective": "Recharge Gameband", "sortOrder": 1 } }] };
					DataManager.setData(recharge0, recharge0DataNode);
					Utilities.setBlock({ x: -22, y: -59, z: 62 }, "theheist:recharge_station", { "theheist:rotation": 5, "theheist:state": 1 });
					// Load hackable console 0
					const computer0 = overworld.spawnEntity("minecraft:armor_stand", new Vector(-21.5, consolesHeight, 58.5));
					Utilities.setBlock({ x: -22, y: -58, z: 58 }, "theheist:computer", { "theheist:rotation": 5, "theheist:unlocked": 0 });
					overworld.spawnEntity("theheist:hover_text", { x: -21.5, y: -58, z: 58.5 }).nameTag = "Start slideshow";
					// 2 seconds or 40 ticks for static, then green and action!
					const computer0DataNode = {
						"name": "actionTracker",
						"used": false,
						"level": 1,
						"actions": [
							{
								"type": "set_block", "do": { "x": -22, "y": -58, "z": 58, "block": "theheist:computer", "permutations": { "theheist:rotation": 5, "theheist:unlocked": 1 } }
							},
							{
								"type": "set_block", "do": { "x": -22, "y": -58, "z": 58, "block": "theheist:computer", "permutations": { "theheist:rotation": 5, "theheist:unlocked": 2 } }, "delay": 40
							},
							{
								"type": "manage_objectives", "do": { "manageType": 2, "objective": "Activate Slideshow", "sortOrder": 0 }, "delay": 40
							},
							{
								"type": "slideshow", "do": 1, "delay": 44
							}
						]
					};
					DataManager.setData(computer0, computer0DataNode);
					break;
				}
				case "0-1": {
					// Load level 0.5 (The vent intro level)
					// Clear all data on player
					DataManager.clearData(player);
					player.getTags().forEach((x) => { if (x != 'loadingLevel') player.removeTag(x); });
					// Add energyTracker data
					const playerEnergyTrackerDataNode: EnergyTracker = { "name": "energyTracker", "energyUnits": 0.0, "recharging": false, "usingRechargerID": -1, "rechargeLevel": 1 };
					DataManager.setData(player, playerEnergyTrackerDataNode);
					if (!bustedCounterObjective.hasParticipant(player)) {
						bustedCounterObjective.setScore(player, 0);
					}
					const playerLevelInformationDataNode = { "name": "levelInformation", "currentModes": [], "information": [{ "name": "alarmLevel", "level": 0 }, { "name": "gameLevel", "level": 0.5 }, { "name": "playerInv", "inventory": [{ "slot": 0, "typeId": 'theheist:recharge_mode_lvl_1', "lockMode": "slot" }, { "slot": 1, "typeId": 'theheist:hacking_mode_lvl_1', "lockMode": "slot" }] }] };
					DataManager.setData(player, playerLevelInformationDataNode);

					Utilities.reloadPlayerInv(player, playerLevelInformationDataNode);

					player.teleport({ 'x': 1000.5, 'y': -59, 'z': 57.5 }, { 'dimension': overworld, 'rotation': { 'x': 0, 'y': 90 } });
					player.camera.clear()
					player.onScreenDisplay.setTitle("§o§7Outside the HQ", { "fadeInDuration": 20, "fadeOutDuration": 20, "stayDuration": 160 });
					clearObjectives();
					addUnfinishedObjective("Get into the building", 0);
					reloadSidebarDisplay();
					break;
				}
				case "0-2": {
					// Load level 0 (The first level)
					// Clear all data on player
					DataManager.clearData(player);
					// Previous level made use of tags, clear them here
					player.getTags().forEach((x) => { if (x != 'loadingLevel') player.removeTag(x); });
					// Add energyTracker data
					const playerEnergyTrackerDataNode: EnergyTracker = { "name": "energyTracker", "energyUnits": 100.0, "recharging": false, "usingRechargerID": -1, "rechargeLevel": 1 };
					DataManager.setData(player, playerEnergyTrackerDataNode);

					if (!bustedCounterObjective.hasParticipant(player)) {
						bustedCounterObjective.setScore(player, 0);
					}
					const playerLevelInformationDataNode = { "name": "levelInformation", "currentModes": [], "information": [{ "name": "alarmLevel", "level": 0 }, { "name": "gameLevel", "level": 0 }, { "name": "playerInv", "inventory": [{ "slot": 0, "typeId": 'theheist:recharge_mode_lvl_1', "lockMode": "slot" }, { "slot": 1, "typeId": 'theheist:hacking_mode_lvl_1', "lockMode": "slot" }] }] };

					DataManager.setData(player, playerLevelInformationDataNode);

					Utilities.reloadPlayerInv(player, playerLevelInformationDataNode);

					player.onScreenDisplay.setTitle("§o§7Level 0", { "fadeInDuration": 20, "fadeOutDuration": 20, "stayDuration": 160 });
					clearObjectives();
					reloadSidebarDisplay();

					player.teleport({ 'x': 2013.5, 'y': -53, 'z': 53.5 }, { 'dimension': overworld, 'rotation': { 'x': 0, 'y': 90 } });
					system.runTimeout(() => {
						VoiceOverManager.play(player, "003");
					}, 1);

					system.runTimeout(() => {
						// Load level and send player
						// Kill all entities
						const entities = overworld.getEntities();
						for (const entity of entities) {
							if (!["minecraft:player","minecraft:painting"].includes(entity.typeId)) entity.kill();
						}
						// Camera 0
						const camera0 = overworld.spawnEntity("armor_stand", { "x": 2014.5, "y": cameraHeight, "z": 51.5 });
						camera0.setRotation({ "x": 0, "y": 13 });
						overworld.spawnEntity("theheist:camera", { "x": 2014.5, "y": -58, "z": 51.5 }).setRotation({ "x": 0, "y": 10 });
						const camera0DataNode = {
							"name": "cameraTracker",
							"isRobot": false,
							"rotation": 10,
							"disabled": false,
							"cameraID": 0,
							"type": "camera"
						};
						DataManager.setData(camera0, camera0DataNode);
						// Camera 1
						const camera1 = overworld.spawnEntity("armor_stand", { "x": 2005.5, "y": cameraHeight, "z": 52.5 });
						camera1.setRotation({ "x": 0, "y": 150 });
						overworld.spawnEntity("theheist:camera", { "x": 2005.5, "y": -58, "z": 52.5 }).setRotation({ "x": 0, "y": 150 });
						const camera1DataNode = {
							"name": "cameraTracker",
							"isRobot": false,
							"rotation": 150,
							"disabled": false,
							"cameraID": 1,
							"type": "camera"
						};
						DataManager.setData(camera1, camera1DataNode);
						// Camera 2
						const camera2 = overworld.spawnEntity("armor_stand", { "x": 1991.5, "y": cameraHeight, "z": 52.5 });
						camera2.setRotation({ "x": 0, "y": 210 });
						overworld.spawnEntity("theheist:camera", { "x": 1991.5, "y": -58, "z": 52.5 }).setRotation({ "x": 0, "y": 210 });
						const camera2DataNode = {
							"name": "cameraTracker",
							"isRobot": false,
							"rotation": 210,
							"disabled": false,
							"cameraID": 2,
							"type": "camera"
						};
						DataManager.setData(camera2, camera2DataNode);
						// Camera 3
						const camera3 = overworld.spawnEntity("armor_stand", { "x": 2014.5, "y": cameraHeight, "z": 67.5 });
						camera3.setRotation({ "x": 0, "y": 100 });
						overworld.spawnEntity("theheist:camera", { "x": 2014.5, "y": -58, "z": 67.5 }).setRotation({ "x": 0, "y": 100 });
						const camera3DataNode = {
							"name": "cameraTracker",
							"isRobot": false,
							"rotation": 100,
							"disabled": false,
							"cameraID": 3,
							"type": "camera"
						};
						DataManager.setData(camera3, camera3DataNode);
						// Camera 4
						const camera4 = overworld.spawnEntity("armor_stand", { "x": 2010.5, "y": cameraHeight, "z": 76.5 });
						camera4.setRotation({ "x": 4, "y": 190 });
						overworld.spawnEntity("theheist:camera", { "x": 2010.5, "y": -58, "z": 76.5 }).setRotation({ "x": 0, "y": 190 });
						const camera4DataNode = {
							"name": "cameraTracker",
							"isRobot": false,
							"rotation": 190,
							"disabled": false,
							"cameraID": 4,
							"type": "camera"
						};
						DataManager.setData(camera4, camera4DataNode);
						// Camera 5
						const camera5 = overworld.spawnEntity("armor_stand", { "x": 1992.5, "y": cameraHeight, "z": 59.5 });
						camera5.setRotation({ "x": 0, "y": 20 });
						overworld.spawnEntity("theheist:camera", { "x": 1992.5, "y": -58, "z": 59.5 }).setRotation({ "x": 0, "y": 20 });
						const camera5DataNode = {
							"name": "cameraTracker",
							"isRobot": false,
							"rotation": 20,
							"swivel": [1, 20, 140],
							"disabled": false,
							"cameraID": 5,
							"type": "camera"
						};
						DataManager.setData(camera5, camera5DataNode);
						// Console 0 (Type: Computer)
						const console0 = overworld.spawnEntity("armor_stand", { "x": 2020.5, "y": consolesHeight, "z": 54.5 });
						Utilities.setBlock({ x: 2020, y: -59, z: 54 }, "theheist:computer", { "theheist:rotation": 5 });
						overworld.spawnEntity("theheist:hover_text", { x: 2020.5, y: -59, z: 54.5 }).nameTag = "Disable nearby camera";
						const console0ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 2020, "y": -59, "z": 54, "block": "theheist:computer", "permutations": { "theheist:rotation": 5, "theheist:unlocked": 1 } }
								},
								{
									"type": "set_block", "do": { "x": 2020, "y": -59, "z": 54, "block": "theheist:computer", "permutations": { "theheist:rotation": 5, "theheist:unlocked": 2 } }, "delay": 40
								},
								{
									"type": "disable_camera", "do": { "cameraID": 0 }, "delay": 40
								},
								{
									"type": "voice_says", "do": { "soundID": "103" }, "delay": 40
								},
								{
									"type": "manage_objectives", "do": { "manageType": 1, "objective": "Break into Director's office", "sortOrder": 0 }, "delay": 40
								}
							]
						};
						DataManager.setData(console0, console0ActionTracker);
						// Console 1 (Type: Computer)
						const console1 = overworld.spawnEntity("armor_stand", { "x": 2017.5, "y": consolesHeight, "z": 52.5 });
						Utilities.setBlock({ x: 2017, y: -59, z: 52 }, "theheist:computer", { "theheist:rotation": 2 });
						overworld.spawnEntity("theheist:hover_text", { x: 2017.5, y: -59, z: 52.5 }).nameTag = "Clear alarm status";
						const console1ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 2017, "y": -59, "z": 52, "block": "theheist:computer", "permutations": { "theheist:rotation": 2, "theheist:unlocked": 1 } }
								},
								{
									"type": "set_block", "do": { "x": 2017, "y": -59, "z": 52, "block": "theheist:computer", "permutations": { "theheist:rotation": 2, "theheist:unlocked": 2 } }, "delay": 40
								},
								{
									"type": "set_alarm_level", "do": { "value": 0 }, "delay": 40
								}
							]
						};
						DataManager.setData(console1, console1ActionTracker);
						// Console 2 (Type: Keypad)
						const console2 = overworld.spawnEntity("armor_stand", { "x": 2014.5, "y": consolesHeight, "z": 60.5 });
						Utilities.setBlock({ x: 2014, y: -59, z: 60 }, "theheist:keypad", { "theheist:rotation": 5 });
						overworld.spawnEntity("theheist:hover_text", { x: 2014.5, y: -59, z: 60.5 }).nameTag = "Lvl. 1";
						Utilities.setBlock({ x: 2015, y: -60, z: 61 }, "theheist:custom_door_1_bottom", { "theheist:rotation": 5, "theheist:unlocked": false });
						const console2ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 2014, "y": -59, "z": 60, "block": "theheist:keypad", "permutations": { "theheist:rotation": 5, "theheist:unlocked": 1 } }
								},
								{
									"type": "set_block", "do": { "x": 2014, "y": -59, "z": 60, "block": "theheist:keypad", "permutations": { "theheist:rotation": 5, "theheist:unlocked": 2 } }, "delay": 40
								},
								{
									"type": "set_block", "do": { "x": 2015, "y": -60, "z": 61, "block": "theheist:custom_door_1_bottom", "permutations": { "theheist:rotation": 5, "theheist:unlocked": true } }, "delay": 40
								},
								{
									"type": "manage_objectives", "do": { "manageType": 2, "objective": "Break into Director's office", "sortOrder": 0 }, "delay": 40
								}
							]
						};
						DataManager.setData(console2, console2ActionTracker);
						// Console 3 (Type: Computer)
						const console3 = overworld.spawnEntity("armor_stand", { "x": 2018.5, "y": consolesHeight, "z": 65.5 });
						Utilities.setBlock({ x: 2018, y: -59, z: 65 }, "theheist:computer", { "theheist:rotation": 2 });
						overworld.spawnEntity("theheist:hover_text", { x: 2018.5, y: -59, z: 65.5 }).nameTag = "Mail";
						const console3ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 2018, "y": -59, "z": 65, "block": "theheist:computer", "permutations": { "theheist:rotation": 2, "theheist:unlocked": 1 } }
								},
								{
									"type": "set_block", "do": { "x": 2018, "y": -59, "z": 65, "block": "theheist:computer", "permutations": { "theheist:rotation": 2, "theheist:unlocked": 2 } }, "delay": 40
								},
								{
									"type": "display_mail", "do": { "mailID": "003" }, "delay": 40
								},
								{
									"type": "voice_says", "do": { "soundID": "104" }, "delay": 40
								},
								{
									"type": "manage_objectives", "do": { "manageType": 1, "objective": "Access the elevator", "sortOrder": 1 }, "delay": 40
								}
							]
						};
						DataManager.setData(console3, console3ActionTracker);
						// Console 4 (Type: Keypad)
						const console4 = overworld.spawnEntity("armor_stand", { "x": 1996.5, "y": consolesHeight, "z": 55.5 });
						Utilities.setBlock({ x: 1996, y: -59, z: 55 }, "theheist:keypad", { "theheist:rotation": 3 });
						overworld.spawnEntity("theheist:hover_text", { x: 1996.5, y: -59, z: 55.5 }).nameTag = "Lvl. 1";
						Utilities.setBlock({ x: 1995, y: -60, z: 56 }, "theheist:custom_door_1_bottom", { "theheist:rotation": 3, "theheist:unlocked": false });
						const console4ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 1996, "y": -59, "z": 55, "block": "theheist:keypad", "permutations": { "theheist:rotation": 3, "theheist:unlocked": 1 } }
								},
								{
									"type": "set_block", "do": { "x": 1996, "y": -59, "z": 55, "block": "theheist:keypad", "permutations": { "theheist:rotation": 3, "theheist:unlocked": 2 } }, "delay": 40
								},
								{
									"type": "set_block", "do": { "x": 1995, "y": -60, "z": 56, "block": "theheist:custom_door_1_bottom", "permutations": { "theheist:rotation": 3, "theheist:unlocked": true } }, "delay": 40
								},
								{
									// Hack other keypad
									"type": "hack_console", "do": { "x": 1992, "z": 62 }
								}
							]
						};
						DataManager.setData(console4, console4ActionTracker);
						// Console 5 (Type: Keypad)
						const console5 = overworld.spawnEntity("armor_stand", { "x": 1992.5, "y": consolesHeight, "z": 62.5 });
						Utilities.setBlock({ x: 1992, y: -59, z: 62 }, "theheist:keypad", { "theheist:rotation": 5 });
						overworld.spawnEntity("theheist:hover_text", { x: 1992.5, y: -59, z: 62.5 }).nameTag = "Lvl. 1";
						Utilities.setBlock({ x: 1993, y: -60, z: 61 }, "theheist:custom_door_1_bottom", { "theheist:rotation": 5, "theheist:unlocked": false });
						const console5ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 1992, "y": -59, "z": 62, "block": "theheist:keypad", "permutations": { "theheist:rotation": 5, "theheist:unlocked": 1 } }
								},
								{
									"type": "set_block", "do": { "x": 1992, "y": -59, "z": 62, "block": "theheist:keypad", "permutations": { "theheist:rotation": 5, "theheist:unlocked": 2 } }, "delay": 40
								},
								{
									"type": "set_block", "do": { "x": 1993, "y": -60, "z": 61, "block": "theheist:custom_door_1_bottom", "permutations": { "theheist:rotation": 5, "theheist:unlocked": true } }, "delay": 40
								},
								{
									// Hack other keypad
									"type": "hack_console", "do": { "x": 1996, "z": 56 }
								}
							]
						};
						DataManager.setData(console5, console5ActionTracker);
						// Console 6 (Type: Computer)
						const console6 = overworld.spawnEntity("armor_stand", { "x": 1978.5, "y": consolesHeight, "z": 64.5 });
						Utilities.setBlock({ x: 1978, y: -59, z: 64 }, "theheist:computer", { "theheist:rotation": 3 });
						overworld.spawnEntity("theheist:hover_text", { x: 1978.5, y: -59, z: 64.5 }).nameTag = "Mail";
						const console6ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 1978, "y": -59, "z": 64, "block": "theheist:computer", "permutations": { "theheist:rotation": 3, "theheist:unlocked": 1 } }
								},
								{
									"type": "set_block", "do": { "x": 1978, "y": -59, "z": 64, "block": "theheist:computer", "permutations": { "theheist:rotation": 3, "theheist:unlocked": 2 } }, "delay": 40
								},
								{
									"type": "display_mail", "do": { "mailID": "002" }, "delay": 40
								},
								{
									"type": "voice_says", "do": { "soundID": "107" }, "delay": 40
								}
							]
						};
						DataManager.setData(console6, console6ActionTracker);
						// Console 7 (Type: Computer)
						const console7 = overworld.spawnEntity("armor_stand", { "x": 1978.5, "y": consolesHeight, "z": 56.5 });
						Utilities.setBlock({ x: 1978, y: -59, z: 56 }, "theheist:computer", { "theheist:rotation": 2 });
						overworld.spawnEntity("theheist:hover_text", { x: 1978.5, y: -59, z: 56.5 }).nameTag = "Mail";
						const console7ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 1978, "y": -59, "z": 56, "block": "theheist:computer", "permutations": { "theheist:rotation": 2, "theheist:unlocked": 1 } }
								},
								{
									"type": "set_block", "do": { "x": 1978, "y": -59, "z": 56, "block": "theheist:computer", "permutations": { "theheist:rotation": 2, "theheist:unlocked": 2 } }, "delay": 40
								},
								{
									"type": "display_mail", "do": { "mailID": "001" }, "delay": 40
								},
								{
									"type": "manage_objectives", "do": { "manageType": 1, "objective": "Find Yellow Keycard", "sortOrder": -1 }, "delay": 40
								}
							]
						};
						DataManager.setData(console7, console7ActionTracker);
						// Console 8 (Type: Keycard Reader)
						const console8 = overworld.spawnEntity("armor_stand", { "x": 1990.5, "y": consolesHeight, "z": 67.5 });
						const console8ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"isKeycardReader": true,
							"keycardType": "yellow",
							"actions": [
								{
									"type": "set_block", "do": { "x": 1988, "y": -60, "z": 68, "block": "theheist:custom_door_4_bottom_l", "permutations": { "theheist:rotation": 3, "theheist:unlocked": true, "theheist:open": true } }
								},
								{
									"type": "set_block", "do": { "x": 1987, "y": -60, "z": 68, "block": "theheist:custom_door_4_bottom_r", "permutations": { "theheist:rotation": 3, "theheist:unlocked": true, "theheist:open": true  } }
								},
								{
									"type": "voice_says", "do": { "soundID": "109" }
								},
								{
									"type": "manage_objectives", "do": { "manageType": 2, "objective": "Access the elevator", "sortOrder": 1 }
								}
							]
						};
						DataManager.setData(console8, console8ActionTracker);

						// Recharge Station 0
						const recharge0 = overworld.spawnEntity("minecraft:armor_stand", new Vector(1998.5, rechargeHeight, 72.5));
						Utilities.setBlock({ x: 1998, y: -60, z: 72 }, "theheist:recharge_station", { "theheist:rotation": 5 });
						const recharge0DataNode = {
							"name": "energyTracker",
							"rechargerID": 0,
							"energyUnits": 100.0,
							"block": { "x": 1998, "y": -60, "z": 72, "rotation": 5 }
						};
						DataManager.setData(recharge0, recharge0DataNode);
						// Recharge Station 1
						const recharge1 = overworld.spawnEntity("minecraft:armor_stand", new Vector(1986.5, rechargeHeight, 70.5));
						Utilities.setBlock({ x: 1986, y: -60, z: 70 }, "theheist:recharge_station", { "theheist:rotation": 4 });
						const recharge1DataNode = {
							"name": "energyTracker",
							"rechargerID": 0,
							"energyUnits": 100.0,
							"block": { "x": 1986, "y": -60, "z": 70, "rotation": 4 }
						};
						DataManager.setData(recharge1, recharge1DataNode);
						// Fill drawers
						const drawer0InventoryContainer = (overworld.getBlock({ "x": 2002.5, "y": -60, "z": 75.5 })!.getComponent("inventory") as BlockInventoryComponent).container  as Container;
						drawer0InventoryContainer.clearAll();
						drawer0InventoryContainer.setItem(4, new ItemStack("yellow_dye"));
						// Set doors and trapdoors

						// Reset end level doors
						Utilities.setBlock(new Vector(1988, -60, 68), "theheist:custom_door_4_bottom_l", { "theheist:rotation": 3, "theheist:unlocked": false });
						Utilities.setBlock(new Vector(1987, -60, 68), "theheist:custom_door_4_bottom_r", { "theheist:rotation": 3, "theheist:unlocked": false });
						Utilities.setBlock(new Vector(1987, -59, 73), "minecraft:lever", { "lever_direction": "north" });
						// Turn on command blocks
						Utilities.fillBlocks({ x: 2029.50, y: -59.00, z: 56.50 }, { x: 2029.50, y: -59.00, z: 61.50 }, 'minecraft:redstone_block');
						// Teleport player from pre-hatch to post-hatch
						player.teleport({ x: 2013.5, y: -52, z: 56.5 }, { dimension: overworld, rotation: { x: 0, y: 90 } });
						VoiceOverManager.play(player, '004');
						player.removeTag('loadingLevel');
					}, SECOND * 7.5);
					break;
				}
				case "-1-1": {
					// Load level -1 (the second level)
					// Clear all data on player
					DataManager.clearData(player);
					// Previous level made use of tags, clear them here
					player.getTags().forEach((x) => { if (x != 'loadingLevel') player.removeTag(x); });
					// Add energyTracker data
					const playerEnergyTrackerDataNode: EnergyTracker = { "name": "energyTracker", "energyUnits": 100.0, "recharging": false, "usingRechargerID": -1, "rechargeLevel": 1 };
					DataManager.setData(player, playerEnergyTrackerDataNode);

					if (!bustedCounterObjective.hasParticipant(player)) {
						bustedCounterObjective.setScore(player, 0);
					}
					const playerLevelInformationDataNode = { "name": "levelInformation", "currentModes": [], "information": [{ "name": "alarmLevel", "level": 0 }, { "name": "gameLevel", "level": -1 }, { "name": "playerInv", "inventory": [{ "slot": 0, "typeId": 'theheist:recharge_mode_lvl_1', "lockMode": "slot" }, { "slot": 1, "typeId": 'theheist:hacking_mode_lvl_1', "lockMode": "slot" }] }] };
					
					DataManager.setData(player, playerLevelInformationDataNode);

					Utilities.reloadPlayerInv(player, playerLevelInformationDataNode);

					player.onScreenDisplay.setTitle("§o§7Level -1", { "fadeInDuration": 20, "fadeOutDuration": 20, "stayDuration": 160 });
					clearObjectives();
					addUnfinishedObjective("Access next level", 5);
					addUnfinishedObjective("Get Sensor mode", 4);
					addUnfinishedObjective("Get Hacking upgrade", 3);
					addUnfinishedObjective("Get Recharge upgrade", 2);
					reloadSidebarDisplay();

					player.teleport({ 'x': 3099.0, 'y': -56, 'z': 109.0 }, { 'dimension': overworld, 'rotation': { 'x': 0, 'y': -90 } });
					var elevatorInterval =  runElelevatorAnimation(new Vector(3099.0, -60, 109.0));

					// Ensure parts far away are loaded
					overworld.runCommandAsync('tickingarea remove_all');
					overworld.runCommandAsync('tickingarea add 3032 -61 128 3040 -14 133 "t1" true');

					system.runTimeout(() => { // After 10 seconds bring the player out of the elevator and end the interval
						overworld.runCommand('tickingarea remove_all');
						system.clearRun(elevatorInterval);
						player.teleport({ "x": 3086.0, "y": -60, "z": 110.0 }, { 'dimension': overworld, 'rotation': { 'x': 0, 'y': 90 } });
						player.removeTag('loadingLevel');
					}, SECOND * 10);
					system.runTimeout(() => { // After 7.5 seconds load the level objects
						// Kill all entities
						const entities = overworld.getEntities();
						for (const entity of entities) {
							if (!["minecraft:player","minecraft:painting"].includes(entity.typeId)) entity.kill();
						}
						// Clear sensor residue
						const levelCloneInfo = Utilities.levelCloneInfo[`level_-1`];
						Utilities.fillBlocks(new Vector(levelCloneInfo.startX, Utilities.cameraMappingHeight - 4, levelCloneInfo.startZ), new Vector(levelCloneInfo.endX, Utilities.cameraMappingHeight - 4, levelCloneInfo.endZ), "air");
						overworld.runCommandAsync(`fill ${levelCloneInfo.startX} ${Utilities.levelHeight} ${levelCloneInfo.startZ} ${levelCloneInfo.endX} ${Utilities.levelHeight} ${levelCloneInfo.endZ} air replace theheist:robot_path`);
						overworld.runCommandAsync(`clone ${levelCloneInfo.startX} ${Utilities.floorCloneHeight} ${levelCloneInfo.startZ} ${levelCloneInfo.endX} ${Utilities.floorCloneHeight} ${levelCloneInfo.endZ} ${levelCloneInfo.startX} ${Utilities.levelHeight - 1} ${levelCloneInfo.startZ}`);

						// Camera 0
						const camera0 = overworld.spawnEntity("armor_stand", { "x": 3066.5, "y": cameraHeight, "z": 105.5 });
						camera0.setRotation({ "x": 0, "y": 180 });
						overworld.spawnEntity("theheist:camera", { "x": 3066.5, "y": -58, "z": 105.5 }).setRotation({ "x": 0, "y": 180 });
						const camera0DataNode = {
							"name": "cameraTracker",
							"isRobot": false,
							"rotation": 180,
							"disabled": false,
							"cameraID": 0,
							"type": "camera"
						};
						DataManager.setData(camera0, camera0DataNode);
						// Camera 1
						const camera1 = overworld.spawnEntity("armor_stand", { "x": 3061.5, "y": cameraHeight, "z": 147.5 });
						camera1.setRotation({ "x": 0, "y": -85 });
						overworld.spawnEntity("theheist:camera", { "x": 3061.5, "y": -58, "z": 147.5 }).setRotation({ "x": 0, "y": -85 });
						const camera1DataNode = {
							"name": "cameraTracker",
							"isRobot": false,
							"rotation": 20,
							"swivel": [1, -85, 85],
							"disabled": false,
							"cameraID": 1,
							"type": "camera"
						};
						DataManager.setData(camera1, camera1DataNode);
						// Camera 2
						const camera2 = overworld.spawnEntity("armor_stand", { "x": 3080.5, "y": cameraHeight, "z": 127.5 });
						camera2.setRotation({ "x": 0, "y": 150 });
						overworld.spawnEntity("theheist:camera", { "x": 3080.5, "y": -58, "z": 127.5 }).setRotation({ "x": 0, "y": 150 });
						const camera2DataNode = {
							"name": "cameraTracker",
							"isRobot": false,
							"rotation": 150,
							"swivel": [0, 30, 150],
							"disabled": false,
							"cameraID": 2,
							"type": "camera"
						};
						DataManager.setData(camera2, camera2DataNode);
						// Camera 3
						const camera3 = overworld.spawnEntity("armor_stand", { "x": 3064.5, "y": cameraHeight, "z": 127.5 });
						camera3.setRotation({ "x": 0, "y": -30 });
						overworld.spawnEntity("theheist:camera", { "x": 3064.5, "y": -58, "z": 127.5 }).setRotation({ "x": 0, "y": -30 });
						const camera3DataNode = {
							"name": "cameraTracker",
							"isRobot": false,
							"rotation": -30,
							"swivel": [0, -150, -30],
							"disabled": false,
							"cameraID": 3,
							"type": "camera"
						};
						DataManager.setData(camera3, camera3DataNode);
						// Camera 4
						const camera4 = overworld.spawnEntity("armor_stand", { "x": 3081.5, "y": cameraHeight, "z": 135.5 });
						camera4.setRotation({ "x": 0, "y": -105 });
						overworld.spawnEntity("theheist:camera", { "x": 3081.5, "y": -58, "z": 135.5 }).setRotation({ "x": 0, "y": -105 });
						const camera4DataNode = {
							"name": "cameraTracker",
							"isRobot": false,
							"rotation": -105,
							"disabled": false,
							"cameraID": 4,
							"type": "camera"
						};
						DataManager.setData(camera4, camera4DataNode);
						// Camera 5
						const camera5 = overworld.spawnEntity("armor_stand", { "x": 3108.5, "y": cameraHeight, "z": 129.5 });
						camera5.setRotation({ "x": 0, "y": 15 });
						overworld.spawnEntity("theheist:camera", { "x": 3108.5, "y": -58, "z": 129.5 }).setRotation({ "x": 0, "y": 15 });
						const camera5DataNode = {
							"name": "cameraTracker",
							"isRobot": false,
							"rotation": 15,
							"swivel": [1, 15, 75],
							"disabled": false,
							"cameraID": 5,
							"type": "camera"
						};
						DataManager.setData(camera5, camera5DataNode);
						// Camera 6
						const camera6 = overworld.spawnEntity("armor_stand", { "x": 3045.5, "y": cameraHeight, "z": 115.5 });
						camera6.setRotation({ "x": 0, "y": -62 });
						overworld.spawnEntity("theheist:camera", { "x": 3045.5, "y": -58, "z": 115.5 }).setRotation({ "x": 0, "y": -62 });
						const camera6DataNode = {
							"name": "cameraTracker",
							"isRobot": false,
							"rotation": -62,
							"swivel": [1, -62, -16],
							"disabled": false,
							"cameraID": 6,
							"type": "camera"
						};
						DataManager.setData(camera6, camera6DataNode);

						// Robot 0
						const robot0 = overworld.spawnEntity("armor_stand", { "x": 3088.5, "y": cameraHeight, "z": 134.5 });
						robot0.setRotation({ "x": 0, "y": -90 });
						overworld.spawnEntity("theheist:camera_robot", { "x": 3088.5, "y": -59.25, "z": 134.5 }).setRotation({ "x": 0, "y": -90 });
						const robot0DataNode = {
							"name": "cameraTracker",
							"isRobot": true,
							"isStunned": false,
							"rotation": -90,
							"disabled": false,
							"cameraID": 6,
							"type": "camera"
						};
						DataManager.setData(robot0, robot0DataNode);
						// Robot 1
						const robot1 = overworld.spawnEntity("armor_stand", { "x": 3055.5, "y": cameraHeight, "z": 124.5 });
						robot1.setRotation({ "x": 0, "y": 180 });
						overworld.spawnEntity("theheist:camera_robot", { "x": 3055.5, "y": -59.25, "z": 124.5 }).setRotation({ "x": 0, "y": 180 });
						const robot1DataNode = {
							"name": "cameraTracker",
							"isRobot": true,
							"isStunned": false,
							"rotation": 180,
							"disabled": false,
							"cameraID": 7,
							"type": "camera"
						};
						DataManager.setData(robot1, robot1DataNode);

						// Consoles 0-9
						{
						// Console 0 (Type: Keypad)
						const console0 = overworld.spawnEntity("armor_stand", { "x": 3079.5, "y": consolesHeight, "z": 107.5 });
						Utilities.setBlock({ x: 3079, y: -59, z: 107 }, "theheist:keypad", { "theheist:rotation": 2 });
						overworld.spawnEntity("theheist:hover_text", { x: 3079.5, y: -59, z: 107.5 }).nameTag = "Lvl. 1";
						Utilities.setBlock({ x: 3078, y: -60, z: 106 }, "theheist:custom_door_1_bottom", { "theheist:rotation": 2, "theheist:unlocked": false });
						const console0ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 3079, "y": -59, "z": 107, "block": "theheist:keypad", "permutations": { "theheist:rotation": 2, "theheist:unlocked": 1 } }
								},
								{
									"type": "set_block", "do": { "x": 3079, "y": -59, "z": 107, "block": "theheist:keypad", "permutations": { "theheist:rotation": 2, "theheist:unlocked": 2 } }, "delay": 40
								},
								{
									"type": "set_block", "do": { "x": 3078, "y": -60, "z": 106, "block": "theheist:custom_door_1_bottom", "permutations": { "theheist:rotation": 2, "theheist:unlocked": true } }, "delay": 40
								}
							]
						};
						DataManager.setData(console0, console0ActionTracker);
						// Console 1 (Type: Computer)
						const console1 = overworld.spawnEntity("armor_stand", { "x": 3072.5, "y": consolesHeight, "z": 105.5 });
						Utilities.setBlock({ x: 3072, y: -59, z: 105 }, "theheist:computer", { "theheist:rotation": 3 });
						overworld.spawnEntity("theheist:hover_text", { x: 3072.5, y: -59, z: 105.5 }).nameTag = "Research info";
						const console1ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 3072, "y": -59, "z": 105, "block": "theheist:computer", "permutations": { "theheist:rotation": 3, "theheist:unlocked": 1 } }
								},
								{
									"type": "set_block", "do": { "x": 3072, "y": -59, "z": 105, "block": "theheist:computer", "permutations": { "theheist:rotation": 3, "theheist:unlocked": 2 } }, "delay": 40
								},
								{
									"type": "display_research", "do": { "researchID": 100 }, "delay": 40
								}
							]
						};
						DataManager.setData(console1, console1ActionTracker);
						// Console 2 (Type: New Gameband)
						const console2 = overworld.spawnEntity("armor_stand", { "x": 3074.5, "y": consolesHeight, "z": 100.5 });
						Utilities.setBlock({ x: 3074, y: -59, z: 100 }, "theheist:sensor_mode_display", { "theheist:rotation": 2 });
						const console2ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 0,
							"actions": [
								{
									"type": "new_gameband", "do": {
										"displayBlock": { "x": 3074, "y": -59, "z": 100 },
										"mode": "sensor",
										"modeText": "§6§lSensor",
										"level": 1,
										"slot": 2
									}
								},
								{
									"type": "manage_objectives", "do": { "manageType": 2, "objective": "Get Sensor mode" }
								}
							]
						};
						DataManager.setData(console2, console2ActionTracker);
						// Console 3 (Type: Keypad)
						const console3 = overworld.spawnEntity("armor_stand", { "x": 3074.5, "y": consolesHeight, "z": 116.5 });
						Utilities.setBlock({ x: 3074, y: -59, z: 116 }, "theheist:keypad", { "theheist:rotation": 5 });
						overworld.spawnEntity("theheist:hover_text", { x: 3074.5, y: -59, z: 116.5 }).nameTag = "Lvl. 3";
						const console3ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 3,
							"actions": []
						};
						DataManager.setData(console3, console3ActionTracker);
						// Console 4 (Type: Keypad)
						const console4 = overworld.spawnEntity("armor_stand", { "x": 3052.5, "y": consolesHeight, "z": 115.5 });
						Utilities.setBlock({ x: 3052, y: -59, z: 115 }, "theheist:keypad", { "theheist:rotation": 2 });
						overworld.spawnEntity("theheist:hover_text", { x: 3052.5, y: -59, z: 115.5 }).nameTag = "Lvl. 1";
						Utilities.setBlock({ x: 3051, y: -60, z: 114 }, "theheist:custom_door_1_bottom", { "theheist:rotation": 2, "theheist:unlocked": false });
						const console4ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 3052, "y": -59, "z": 115, "block": "theheist:keypad", "permutations": { "theheist:rotation": 2, "theheist:unlocked": 1 } }
								},
								{
									"type": "set_block", "do": { "x": 3052, "y": -59, "z": 115, "block": "theheist:keypad", "permutations": { "theheist:rotation": 2, "theheist:unlocked": 2 } }, "delay": 40
								},
								{
									"type": "set_block", "do": { "x": 3051, "y": -60, "z": 114, "block": "theheist:custom_door_1_bottom", "permutations": { "theheist:rotation": 2, "theheist:unlocked": true } }, "delay": 40
								}
							]
						};
						DataManager.setData(console4, console4ActionTracker);
						// Console 5 (Type: Computer)
						const console5 = overworld.spawnEntity("armor_stand", { "x": 3045.5, "y": consolesHeight, "z": 111.5 });
						Utilities.setBlock({ x: 3045, y: -59, z: 111 }, "theheist:computer", { "theheist:rotation": 4 });
						overworld.spawnEntity("theheist:hover_text", { x: 3045.5, y: -59, z: 111.5 }).nameTag = "Mail";
						const console5ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 3045, "y": -59, "z": 111, "block": "theheist:computer", "permutations": { "theheist:rotation": 4, "theheist:unlocked": 1 } }
								},
								{
									"type": "set_block", "do": { "x": 3045, "y": -59, "z": 111, "block": "theheist:computer", "permutations": { "theheist:rotation": 4, "theheist:unlocked": 2 } }, "delay": 40
								},
								{
									"type": "display_mail", "do": { "mailID": 103 }, "delay": 40
								}
							]
						};
						DataManager.setData(console5, console5ActionTracker);
						// Console 6 (Type: Keypad)
						const console6 = overworld.spawnEntity("armor_stand", { "x": 3074.5, "y": consolesHeight, "z": 139.5 });
						Utilities.setBlock({ x: 3074, y: -59, z: 139 }, "theheist:keypad", { "theheist:rotation": 5 });
						overworld.spawnEntity("theheist:hover_text", { x: 3074.5, y: -59, z: 139.5 }).nameTag = "Lvl. 1";
						Utilities.setBlock({ x: 3075, y: -60, z: 140 }, "theheist:custom_door_1_bottom", { "theheist:rotation": 5, "theheist:unlocked": false });
						const console6ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 3074, "y": -59, "z": 139, "block": "theheist:keypad", "permutations": { "theheist:rotation": 5, "theheist:unlocked": 1 } }
								},
								{
									"type": "set_block", "do": { "x": 3074, "y": -59, "z": 139, "block": "theheist:keypad", "permutations": { "theheist:rotation": 5, "theheist:unlocked": 2 } }, "delay": 40
								},
								{
									"type": "set_block", "do": { "x": 3075, "y": -60, "z": 140, "block": "theheist:custom_door_1_bottom", "permutations": { "theheist:rotation": 5, "theheist:unlocked": true } }, "delay": 40
								}
							]
						};
						DataManager.setData(console6, console6ActionTracker);
						// Console 7 (Type: Computer)
						const console7 = overworld.spawnEntity("armor_stand", { "x": 3080.5, "y": consolesHeight, "z": 142.5 });
						Utilities.setBlock({ x: 3080, y: -59, z: 142 }, "theheist:computer", { "theheist:rotation": 3 });
						overworld.spawnEntity("theheist:hover_text", { x: 3080.5, y: -59, z: 142.5 }).nameTag = "Clear alarm status";
						const console7ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 3080, "y": -59, "z": 142, "block": "theheist:computer", "permutations": { "theheist:rotation": 3, "theheist:unlocked": 1 } }
								},
								{
									"type": "set_block", "do": { "x": 3080, "y": -59, "z": 142, "block": "theheist:computer", "permutations": { "theheist:rotation": 3, "theheist:unlocked": 2 } }, "delay": 40
								},
								{
									"type": "set_alarm_level", "do": { "value": 0 }, "delay": 40
								}
							]
						};
						DataManager.setData(console7, console7ActionTracker);
						// Console 8 (Type: Computer)
						const console8 = overworld.spawnEntity("armor_stand", { "x": 3082.5, "y": consolesHeight, "z": 118.5 });
						Utilities.setBlock({ x: 3082, y: -59, z: 118 }, "theheist:computer", { "theheist:rotation": 5 });
						overworld.spawnEntity("theheist:hover_text", { x: 3082.5, y: -59, z: 118.5 }).nameTag = "Mail";
						const console8ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 3082, "y": -59, "z": 118, "block": "theheist:computer", "permutations": { "theheist:rotation": 5, "theheist:unlocked": 1 } }
								},
								{
									"type": "set_block", "do": { "x": 3082, "y": -59, "z": 118, "block": "theheist:computer", "permutations": { "theheist:rotation": 5, "theheist:unlocked": 2 } }, "delay": 40
								},
								{
									"type": "display_mail", "do": { "mailID": 104 }, "delay": 40
								},
								{
									"type": "manage_objectives", "do": { "manageType": 1, "objective": "Find Yellow Keycard", "sortOrder": 1 }, "delay": 40
								},
								{
									"type": "manage_objectives", "do": { "manageType": 1, "objective": "Find Green Keycard", "sortOrder": 0 }, "delay": 40
								}
							]
						};
						DataManager.setData(console8, console8ActionTracker);
						// Console 9 (Type: Keypad)
						const console9 = overworld.spawnEntity("armor_stand", { "x": 3104.5, "y": consolesHeight, "z": 116.5 });
						Utilities.setBlock({ x: 3104, y: -59, z: 116 }, "theheist:keypad", { "theheist:rotation": 4 });
						overworld.spawnEntity("theheist:hover_text", { x: 3104.5, y: -59, z: 116.5 }).nameTag = "Lvl. 2";
						Utilities.setBlock({ x: 3103, y: -60, z: 115 }, "theheist:custom_door_2_bottom", { "theheist:rotation": 4, "theheist:unlocked": false });
						const console9ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 2,
							"actions": [
								{
									"type": "set_block", "do": { "x": 3104, "y": -59, "z": 116, "block": "theheist:keypad", "permutations": { "theheist:rotation": 4, "theheist:unlocked": 1 } }
								},
								{
									"type": "set_block", "do": { "x": 3104, "y": -59, "z": 116, "block": "theheist:keypad", "permutations": { "theheist:rotation": 4, "theheist:unlocked": 2 } }, "delay": 40
								},
								{
									"type": "set_block", "do": { "x": 3103, "y": -60, "z": 115, "block": "theheist:custom_door_2_bottom", "permutations": { "theheist:rotation": 4, "theheist:unlocked": true } }, "delay": 40
								},
								{
									"type": "hack_console", "do": { "x": 3097, "z": 123 }, "delay": 40
								}
							]
						};
						DataManager.setData(console9, console9ActionTracker);
						}
						// Console 10 (Type: Keypad)
						const console10 = overworld.spawnEntity("armor_stand", { "x": 3097.5, "y": consolesHeight, "z": 123.5 });
						Utilities.setBlock({ x: 3097, y: -59, z: 123 }, "theheist:keypad", { "theheist:rotation": 2 });
						overworld.spawnEntity("theheist:hover_text", { x: 3097.5, y: -59, z: 123.5 }).nameTag = "Lvl. 2";
						Utilities.setBlock({ x: 3096, y: -60, z: 122 }, "theheist:custom_door_2_bottom", { "theheist:rotation": 2, "theheist:unlocked": false });
						const console10ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 2,
							"actions": [
								{
									"type": "set_block", "do": { "x": 3097, "y": -59, "z": 123, "block": "theheist:keypad", "permutations": { "theheist:rotation": 2, "theheist:unlocked": 1 } }
								},
								{
									"type": "set_block", "do": { "x": 3097, "y": -59, "z": 123, "block": "theheist:keypad", "permutations": { "theheist:rotation": 2, "theheist:unlocked": 2 } }, "delay": 40
								},
								{
									"type": "set_block", "do": { "x": 3096, "y": -60, "z": 122, "block": "theheist:custom_door_2_bottom", "permutations": { "theheist:rotation": 2, "theheist:unlocked": true } }, "delay": 40
								},
								{
									"type": "hack_console", "do": { "x": 3104, "z": 116 }, "delay": 40
								}
							]
						};
						DataManager.setData(console10, console10ActionTracker);
						// Console 11 (Type: Computer)
						const console11 = overworld.spawnEntity("armor_stand", { "x": 3097.5, "y": consolesHeight, "z": 114.5 });
						Utilities.setBlock({ x: 3097, y: -59, z: 114 }, "theheist:computer", { "theheist:rotation": 2 });
						overworld.spawnEntity("theheist:hover_text", { x: 3097.5, y: -59, z: 114.5 }).nameTag = "Research info";
						const console11ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 3097, "y": -59, "z": 114, "block": "theheist:computer", "permutations": { "theheist:rotation": 2, "theheist:unlocked": 1 } }
								},
								{
									"type": "set_block", "do": { "x": 3097, "y": -59, "z": 114, "block": "theheist:computer", "permutations": { "theheist:rotation": 2, "theheist:unlocked": 2 } }, "delay": 40
								},
								{
									"type": "display_research", "do": { "researchID": 101 }, "delay": 40
								}
							]
						};
						DataManager.setData(console11, console11ActionTracker);
						// Console 12 (Type: Gameband Upgrade)
						const console12 = overworld.spawnEntity("armor_stand", { "x": 3105.5, "y": consolesHeight, "z": 117.5 });
						Utilities.setBlock({ x: 3106, y: -59, z: 117 }, "theheist:hacking_mode_display", { "theheist:rotation": 5 });
						const console12ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 0,
							"actions": [
								{
									"type": "upgrade_gameband", "do": {
										"displayBlock": { "x": 3106, "y": -59, "z": 117 },
										"mode": "hacking",
										"modeText": "§2§lHacking Lvl. 2",
										"level": 2,
										"slot": 1
									}
								},
								{
									"type": "manage_objectives", "do": { "manageType": 2, "objective": "Get Hacking upgrade" }
								}
							]
						};
						DataManager.setData(console12, console12ActionTracker);
						// Console 13 (Type: Keypad)
						const console13 = overworld.spawnEntity("armor_stand", { "x": 3062.5, "y": consolesHeight, "z": 150.5 });
						Utilities.setBlock({ x: 3062, y: -59, z: 150 }, "theheist:keypad", { "theheist:rotation": 3 });
						overworld.spawnEntity("theheist:hover_text", { x: 3062.5, y: -59, z: 150.5 }).nameTag = "Lvl. 2";
						Utilities.setBlock({ x: 3061, y: -60, z: 151 }, "theheist:custom_door_2_bottom", { "theheist:rotation": 3, "theheist:unlocked": false });
						const console13ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 2,
							"actions": [
								{
									"type": "set_block", "do": { "x": 3062, "y": -59, "z": 150, "block": "theheist:keypad", "permutations": { "theheist:rotation": 3, "theheist:unlocked": 1 } }
								},
								{
									"type": "set_block", "do": { "x": 3062, "y": -59, "z": 150, "block": "theheist:keypad", "permutations": { "theheist:rotation": 3, "theheist:unlocked": 2 } }, "delay": 40
								},
								{
									"type": "set_block", "do": { "x": 3061, "y": -60, "z": 151, "block": "theheist:custom_door_2_bottom", "permutations": { "theheist:rotation": 3, "theheist:unlocked": true } }, "delay": 40
								}
							]
						};
						DataManager.setData(console13, console13ActionTracker);
						// Console 14 (Type: Computer)
						const console14 = overworld.spawnEntity("armor_stand", { "x": 3058.5, "y": consolesHeight, "z": 156.5 });
						Utilities.setBlock({ x: 3058, y: -59, z: 156 }, "theheist:computer", { "theheist:rotation": 4 });
						overworld.spawnEntity("theheist:hover_text", { x: 3058.5, y: -59, z: 156.5 }).nameTag = "Research info";
						const console14ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 3058, "y": -59, "z": 156, "block": "theheist:computer", "permutations": { "theheist:rotation": 4, "theheist:unlocked": 1 } }
								},
								{
									"type": "set_block", "do": { "x": 3058, "y": -59, "z": 156, "block": "theheist:computer", "permutations": { "theheist:rotation": 4, "theheist:unlocked": 2 } }, "delay": 40
								},
								{
									"type": "display_research", "do": { "researchID": 102 }, "delay": 40
								}
							]
						};
						DataManager.setData(console14, console14ActionTracker);
						// Console 15 (Type: Gameband Upgrade)
						const console15 = overworld.spawnEntity("armor_stand", { "x": 3063.5, "y": consolesHeight, "z": 159.5 });
						Utilities.setBlock({ x: 3063, y: -59, z: 159 }, "theheist:recharge_mode_display", { "theheist:rotation": 3 });
						const console15ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 0,
							"actions": [
								{
									"type": "upgrade_gameband", "do": {
										"displayBlock": { "x": 3063, "y": -59, "z": 159 },
										"mode": "recharge",
										"modeText": "§1§lRecharge Lvl. 2",
										"level": 2,
										"slot": 0
									}
								},
								{
									"type": "manage_objectives", "do": { "manageType": 2, "objective": "Get Recharge upgrade" }
								}
							]
						};
						DataManager.setData(console15, console15ActionTracker);
						// Console 16 (Type: Keycard Reader)
						const console16 = overworld.spawnEntity("armor_stand", { "x": 3039.5, "y": consolesHeight, "z": 129.5 });
						Utilities.setBlock({ x: 3038, y: -60, z: 131 }, "theheist:custom_door_2_bottom", { "theheist:rotation": 4, "theheist:unlocked": false });
						const console16ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"isKeycardReader": true,
							"keycardType": "yellow",
							"actions": [
								{
									"type": "set_block", "do": { "x": 3038, "y": -60, "z": 131, "block": "theheist:custom_door_2_bottom", "permutations": { "theheist:rotation": 4, "theheist:unlocked": true, "theheist:open": true } }
								},
								{
									"type": "play_sound", "do": { "soundID": "random.door_open" }
								}
							]
						};
						DataManager.setData(console16, console16ActionTracker);
						// Console 17 (Type: Keycard Reader)
						const console17 = overworld.spawnEntity("armor_stand", { "x": 3087.5, "y": consolesHeight, "z": 131.5 });
						Utilities.setBlock(new Vector(3089, -60, 130), "theheist:custom_door_4_bottom_l", { "theheist:rotation": 2, "theheist:unlocked": false });
						Utilities.setBlock(new Vector(3090, -60, 130), "theheist:custom_door_4_bottom_r", { "theheist:rotation": 2, "theheist:unlocked": false });
						const console17ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"isKeycardReader": true,
							"keycardType": "green",
							"actions": [
								{
									"type": "set_block", "do": { "x": 3089, "y": -60, "z": 130, "block": "theheist:custom_door_4_bottom_l", "permutations": { "theheist:rotation": 2, "theheist:unlocked": true, "theheist:open": true } }
								},
								{
									"type": "set_block", "do": { "x": 3090, "y": -60, "z": 130, "block": "theheist:custom_door_4_bottom_r", "permutations": { "theheist:rotation": 2, "theheist:unlocked": true, "theheist:open": true  } }
								},
								{
									"type": "play_sound", "do": { "soundID": "random.door_open" }
								},
								{
									"type": "manage_objectives", "do": { "manageType": 2, "objective": "Access next level" }
								},
								{
									"type": "voice_says", "do": { "soundID": 204 }
								}
							]
						};
						DataManager.setData(console17, console17ActionTracker);
						// Console 18 (Type: Computer)
						const console18 = overworld.spawnEntity("armor_stand", { "x": 3081.5, "y": consolesHeight, "z": 137.5 });
						Utilities.setBlock({ x: 3081, y: -59, z: 137 }, "theheist:computer", { "theheist:rotation": 2 });
						overworld.spawnEntity("theheist:hover_text", { x: 3081.5, y: -59, z: 137.5 }).nameTag = "Disable nearby camera";
						const console18ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 3081, "y": -59, "z": 137, "block": "theheist:computer", "permutations": { "theheist:rotation": 2, "theheist:unlocked": 1 } }
								},
								{
									"type": "set_block", "do": { "x": 3081, "y": -59, "z": 137, "block": "theheist:computer", "permutations": { "theheist:rotation": 2, "theheist:unlocked": 2 } }, "delay": 40
								},
								{
									"type": "disable_camera", "do": { "cameraID": 4 }, "delay": 40
								}
							]
						};
						DataManager.setData(console18, console18ActionTracker);

						// Recharge Station 0
						const recharge0 = overworld.spawnEntity("minecraft:armor_stand", new Vector(3070.5, rechargeHeight, 110.5));
						Utilities.setBlock({ x: 3070, y: -60, z: 110 }, "theheist:recharge_station", { "theheist:rotation": 4 });
						const recharge0DataNode = {
							"name": "energyTracker",
							"rechargerID": 0,
							"energyUnits": 100.0,
							"block": { "x": 3070, "y": -60, "z": 110, "rotation": 4 }
						};
						DataManager.setData(recharge0, recharge0DataNode);
						// Recharge Station 1
						const recharge1 = overworld.spawnEntity("minecraft:armor_stand", new Vector(3100.5, rechargeHeight, 121.5));
						Utilities.setBlock({ x: 3100, y: -60, z: 121 }, "theheist:recharge_station", { "theheist:rotation": 3 });
						const recharge1DataNode = {
							"name": "energyTracker",
							"rechargerID": 1,
							"energyUnits": 100.0,
							"block": { "x": 3100, "y": -60, "z": 121, "rotation": 3 }
						};
						DataManager.setData(recharge1, recharge1DataNode);
						// Recharge Station 2
						const recharge2 = overworld.spawnEntity("minecraft:armor_stand", new Vector(3061.5, rechargeHeight, 138.5));
						Utilities.setBlock({ x: 3061, y: -60, z: 138 }, "theheist:recharge_station", { "theheist:rotation": 2 });
						const recharge2DataNode = {
							"name": "energyTracker",
							"rechargerID": 2,
							"energyUnits": 100.0,
							"block": { "x": 3061, "y": -60, "z": 138, "rotation": 2 }
						};
						DataManager.setData(recharge2, recharge2DataNode);
						// Recharge Station 3
						const recharge3 = overworld.spawnEntity("minecraft:armor_stand", new Vector(3077.5, rechargeHeight, 119.5));
						Utilities.setBlock({ x: 3077, y: -60, z: 119 }, "theheist:recharge_station", { "theheist:rotation": 3 });
						const recharge3DataNode = {
							"name": "energyTracker",
							"rechargerID": 3,
							"energyUnits": 100.0,
							"block": { "x": 3077, "y": -60, "z": 119, "rotation": 3 }
						};
						DataManager.setData(recharge3, recharge3DataNode);
						// Recharge Station 4
						const recharge4 = overworld.spawnEntity("minecraft:armor_stand", new Vector(3091.5, rechargeHeight, 128.5));
						Utilities.setBlock({ x: 3091, y: -60, z: 128 }, "theheist:recharge_station", { "theheist:rotation": 5 });
						const recharge4DataNode = {
							"name": "energyTracker",
							"rechargerID": 4,
							"energyUnits": 100.0,
							"block": { "x": 3091, "y": -60, "z": 128, "rotation": 5 }
						};
						DataManager.setData(recharge4, recharge4DataNode);

						// Decorations & Miscellaneous
						Utilities.dimensions.overworld.setBlockType(new Vector(3073, -55, 127), "minecraft:redstone_block");
						Utilities.setBlock(new Vector(3090, -59, 124), "minecraft:lever", { "lever_direction": "south" });
						Utilities.dimensions.overworld.spawnEntity("theheist:camera_robot", new Vector(3053.5, -59, 110.5)).setRotation({ "x": 0, "y": 180 });
						const decorativeCamera0 = Utilities.dimensions.overworld.spawnEntity("theheist:camera", new Vector(3034.5, -59, 141.5));
						decorativeCamera0.setRotation({ "x": 0, "y": 180 });
						decorativeCamera0.triggerEvent("theheist:disable");
						const decorativeCamera1 = Utilities.dimensions.overworld.spawnEntity("theheist:camera", new Vector(3035.5, -59, 141.5));
						decorativeCamera1.setRotation({ "x": 0, "y": 180 });
						decorativeCamera1.triggerEvent("theheist:disable");
						const decorativeCamera2 = Utilities.dimensions.overworld.spawnEntity("theheist:camera", new Vector(3036.5, -59, 141.5));
						decorativeCamera2.setRotation({ "x": 0, "y": 180 });
						decorativeCamera2.triggerEvent("theheist:disable");
						// Fill drawers
						const drawer0InventoryContainer = overworld.getBlock(new Vector(3058, -60, 157))?.getComponent("inventory")!.container as Container;
						drawer0InventoryContainer.clearAll();
						drawer0InventoryContainer.setItem(4, new ItemStack("minecraft:yellow_dye"));
						const drawer1InventoryContainer = overworld.getBlock(new Vector(3033, -60, 130))?.getComponent("inventory")!.container as Container;
						drawer1InventoryContainer.clearAll();
						drawer1InventoryContainer.setItem(4, new ItemStack("minecraft:green_dye"));

					}, SECOND * 7.5);
					break;
				}
				default:
					// Clear all data on player
					DataManager.clearData(player);
					player.getTags().forEach((x) => { if (x != 'loadingLevel') player.removeTag(x); });
					if (!bustedCounterObjective.hasParticipant(player)) {
						bustedCounterObjective.setScore(player, 0);
					}

					// Ensure player is in correct game mode
					player.setGameMode(GameMode.adventure);

					// Get level definition
					const levelDefinition = LevelDefinitions.getLevelDefinitionByID(msg);
					if (levelDefinition == undefined) return;
					const levelNum = parseInt(levelDefinition.levelID.substring(0, levelDefinition.levelID.length - "-1".length));
					
					// Add mandatory data
					const maxEnergy = Utilities.gamebandInfo.rechargeMode[levelDefinition.rechargeLevel].max;
					const playerEnergyTrackerDataNode: EnergyTracker = { "name": "energyTracker", "energyUnits": maxEnergy, "recharging": false, "usingRechargerID": -1, "rechargeLevel": levelDefinition.rechargeLevel };
					DataManager.setData(player, playerEnergyTrackerDataNode);

					const playerLevelInformationDataNode: LevelInformation = { "name": "levelInformation", "currentModes": [], "information": [{ "name": "alarmLevel", "level": 0 }, { "name": "gameLevel", "level": levelNum }, { "name": "playerInv", "inventory": [] }] };
					levelDefinition.startingItems.forEach((item) => {
						playerLevelInformationDataNode.information[2].inventory.push(item);
					});
					DataManager.setData(player, playerLevelInformationDataNode);
					Utilities.reloadPlayerInv(player, playerLevelInformationDataNode);

					clearObjectives();
					levelDefinition.startObjectives.forEach((objData) => {
						addUnfinishedObjective(objData.name, objData.sortOrder);
					});
					reloadSidebarDisplay();

					player.onScreenDisplay.setTitle(`§o§7Level ${levelNum}`, { "fadeInDuration": 20, "fadeOutDuration": 20, "stayDuration": 160 });
					player.teleport(Vector.v3ToVector(levelDefinition.loadElevatorLoc).add(new Vector(0, 4, 0)));
					var elevatorInterval =  runElelevatorAnimation(Vector.v3ToVector(levelDefinition.loadElevatorLoc));

					// Ensure parts far away are loaded
					overworld.runCommand('tickingarea remove_all');
					//overworld.runCommand('tickingarea add 3033 -60 129 3039 -69 132 "t1" true');

					system.runTimeout(() => {
						const entities = overworld.getEntities();
						for (const entity of entities) {
							if (!["minecraft:player","minecraft:painting"].includes(entity.typeId)) entity.kill();
						}
						// Clear sensor mode residue
						const levelCloneInfo = Utilities.levelCloneInfo[`level_${levelNum}`];
						Utilities.fillBlocks(new Vector(levelCloneInfo.startX, Utilities.cameraMappingHeight - 4, levelCloneInfo.startZ), new Vector(levelCloneInfo.endX, Utilities.cameraMappingHeight - 4, levelCloneInfo.endZ), "air");
						overworld.runCommandAsync(`fill ${levelCloneInfo.startX} ${Utilities.levelHeight} ${levelCloneInfo.startZ} ${levelCloneInfo.endX} ${Utilities.levelHeight} ${levelCloneInfo.endZ} air replace theheist:robot_path`);
						overworld.runCommandAsync(`clone ${levelCloneInfo.startX} ${Utilities.floorCloneHeight} ${levelCloneInfo.startZ} ${levelCloneInfo.endX} ${Utilities.floorCloneHeight} ${levelCloneInfo.endZ} ${levelCloneInfo.startX} ${Utilities.levelHeight - 1} ${levelCloneInfo.startZ}`);
						
						LevelConstructor.start();
						levelDefinition.setup()
					}, SECOND * 7.5); // After 7.5 seconds load level objects
					system.runTimeout(() => { // After 10 seconds bring the player out of the elevator and end the interval
						overworld.runCommand('tickingarea remove_all');
						system.clearRun(elevatorInterval);
						player.teleport(levelDefinition.startPlayerLoc);
						player.removeTag('loadingLevel');
					}, SECOND * 10);
					break;
			}
			break;
		}
		case "theheist:voice-says": {
			const player = world.getPlayers().filter((x) => (x != undefined))[0];
			VoiceOverManager.play(player, msg);
			break;
		}
		case "theheist:keycard-objective": {
			const valueArray = msg.split(/ /);
			const color = valueArray[0];
			const sortOrder = parseInt(valueArray[1]);
			const colorInCase = color.substring(0, 1).toUpperCase() + color.substring(1).toLowerCase();
			var keycardItemTypeId = `minecraft:${color}_dye`;
			if (color == "blue") keycardItemTypeId == "minecraft:lapis_lazuli";

			const player = world.getPlayers().filter((x) => (x != undefined))[0];
			var playerInvContainer = player.getComponent("inventory")!.container as Container;
			var index = Utilities.inventoryContainerIndexOf(playerInvContainer, keycardItemTypeId);
			var i2 = 19;
			while (playerInvContainer.getItem(i2) && i2 < playerInvContainer.size) i2++;
			if (index) playerInvContainer.setItem(index); // If item is in slot, clear slot (avoids errors)
			var itemStack = new ItemStack(keycardItemTypeId);
			itemStack.lockMode = ItemLockMode.slot;
			playerInvContainer.setItem(i2, itemStack);
			var itemStack2 = new ItemStack("minecraft:paper");
			itemStack2.lockMode = ItemLockMode.slot;
			playerInvContainer.setItem(8, itemStack2);
			Utilities.savePlayerInventory(player);

			GameObjectiveManager.completeObjectiveNonStrict(`Find ${colorInCase} Keycard`, sortOrder);
			break;
		}
		case "theheist:complete-objective": {
			const valueArray = msg.split(/ /);
			const objectiveSortOrder = parseInt(valueArray.shift()!);
			const objectiveName = valueArray.join(" ");
			GameObjectiveManager.completeObjectiveNonStrict(objectiveName, objectiveSortOrder);
			break;
		}
		case "theheist:attempt_end_level": {
			const valueArray = msg.split(/ /);
			const currLevel = parseInt(valueArray[0]);
			const x = valueArray[1];
			const y = valueArray[2];
			const z = valueArray[3];
			const rotation = valueArray[4];
			const player = world.getPlayers().filter((player) => (player != undefined && player != null))[0];
			if (player == undefined) return;
			const objectives = objectivesObjective.getParticipants().map((obj) => {
				return obj.displayName;
			});
			if (objectives.some((obj) => (obj.startsWith("§c") && (obj.includes("upgrade") || obj.includes("mode"))))) { // If the objective text includes "upgrade" then the objective is talking about upgrading a gameband. If "mode", then the objective is talking about gaining a new gameband
				// Player hasn't finished all the gameband-related objectives yet
				VoiceOverManager.play(player, "forgot_prototypes");
				Utilities.setBlock({ x: Number(x), y: Number(y), z: Number(z) }, "minecraft:lever", { "lever_direction": rotation });
				return;
			}
			bustedCounterObjective.setScore(player, 0);

			if (currLevel != -3) overworld.runCommandAsync(`scriptevent theheist:load-level ${currLevel - 1}-1`);
			else endDemo(player);
			break;
		}
	}
});

function endDemo(player: Player) {
	player.teleport(new Vector(-22.5, -59, 67.5));
	player.onScreenDisplay.setTitle("Thanks for playing!", {
		"fadeInDuration": 20,
		"fadeOutDuration": 20,
		"stayDuration": 160,
		"subtitle": "More levels coming soon"
	});
}

/**
 * Assumes elevator height of 12 blocks
 * @param middleBottomPos The position of the bottom-most middle of the elevator.
 * @returns An opaque identifier that can be used with the clearRun function to cancel the execution of this animation.
 */
function runElelevatorAnimation(middleBottomPos: Vector): number {
	var elevatorIndex = 0;
	var elevatorEdgesBottom = [middleBottomPos.add(new Vector(-2.5,0,-2.5)),middleBottomPos.add(new Vector(-2.5,0,2.5)),middleBottomPos.add(new Vector(2.5,0,-2.5)),middleBottomPos.add(new Vector(2.5,0,2.5))];
	var elevatorEdgesTop = elevatorEdgesBottom.map((pos) => {
		return { 'x': pos.x, 'y': middleBottomPos.y + 11, 'z': pos.z };
	});
	var elevatorInterval = system.runInterval(() => {
		elevatorEdgesBottom.forEach((pos, i) => {
			Utilities.fillBlocksWithPermutation(pos, elevatorEdgesTop[i], BlockPermutation.resolve("minecraft:polished_andesite"));
		});
		for (var i = 0; i < 4; i++) {
			var currY = elevatorEdgesBottom[0].y + 3 * i;
			elevatorEdgesBottom.forEach((pos) => {
				Utilities.setBlock({ 'x': pos.x, 'y': currY + elevatorIndex, 'z': pos.z }, "minecraft:redstone_lamp");
			});
		}
		elevatorIndex++;
		elevatorIndex = elevatorIndex % 3;
	}, 10); // Every 0.5 seconds update the elevator
	return elevatorInterval;
}

/**
 * Add an unfinished objective to the objective sidebar
 * @param objective The description of the objective.
 * @param sortOrder The sort index of the objective. Objectives are sorted from highest to lowest.
 */
function addUnfinishedObjective(objective: string, sortOrder: number) {
	objectivesObjective.setScore(`§c${objective}§r`, sortOrder);
}

function clearObjectives() {
	objectivesObjective.getParticipants().forEach((participant) => {
		objectivesObjective.removeParticipant(participant);
	});
}

function reloadSidebarDisplay() {
	world.scoreboard.clearObjectiveAtDisplaySlot(DisplaySlotId.Sidebar);
	world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, { "objective": objectivesObjective });
}