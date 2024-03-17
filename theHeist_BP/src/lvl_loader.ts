import { ItemStack, Vector, system, world, DisplaySlotId, BlockInventoryComponent, BlockPermutation, Container } from "@minecraft/server";
import DataManager from "./DataManager";
import VoiceOverManager from "./VoiceOverManager";
import Utilities from "./Utilities";

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

const overworld = world.getDimension("overworld");

system.afterEvents.scriptEventReceive.subscribe((event) => {
	const id = event.id;
	const msg = event.message;
	switch (id) {
		case "theheist:load-level": {
			const entities = overworld.getEntities();
			for (const entity of entities) {
				if (entity.typeId != "minecraft:player") entity.kill();
			}
			const player = world.getPlayers().filter((x) => (x != undefined && x != null))[0];
			if (player == undefined) {
				world.sendMessage("Could not find player");
				return;
			}
			var lvlInfo = DataManager.getData(player, "levelInformation");
			if (lvlInfo) {
				var currPlayerLevel = Utilities.levelToLevelID[lvlInfo.information[1]];
				if (currPlayerLevel != msg) {
					// Player is going to a new level, so clear busted counter
					bustedCounterObjective.setScore(player, 0);
				}
			}
			switch (msg) {
				case "1-1": {
					// Load level 1 (The van tutorial level)
					// Clear all data on player
					DataManager.clearData(player);
					player.getTags().forEach((x) => { player.removeTag(x); });
					// Add energyTracker data node
					const playerEnergyTrackerDataNode = { "name": "energyTracker", "energyUnits": 0.0, "recharging": false, "usingRechargerID": -1, "rechargeLevel": 1 };
					DataManager.setData(player, playerEnergyTrackerDataNode);
					// Add level information data node
					if (!bustedCounterObjective.hasParticipant(player)) {
						bustedCounterObjective.setScore(player, 0);
					}
					const playerLevelInformationDataNode = { "name": "levelInformation", "information": [{ "name": "alarmLevel", "level": 0 }, { "name": "gameLevel", "level": 1 }, { "name": "playerInv", "inventory": [{ "slot": 0, "typeId": 'theheist:recharge_mode_lvl_1', "lockMode": "slot" }, { "slot": 1, "typeId": 'theheist:hacking_mode_lvl_1', "lockMode": "slot" }] }] };
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
					player.getTags().forEach((x) => { player.removeTag(x); });
					// Add energyTracker data
					const playerEnergyTrackerDataNode = { "name": "energyTracker", "energyUnits": 0.0, "recharging": false, "rechargeLevel": 1 };
					DataManager.setData(player, playerEnergyTrackerDataNode);
					if (!bustedCounterObjective.hasParticipant(player)) {
						bustedCounterObjective.setScore(player, 0);
					}
					const playerLevelInformationDataNode = { "name": "levelInformation", "information": [{ "name": "alarmLevel", "level": 0 }, { "name": "gameLevel", "level": 0.5 }, { "name": "playerInv", "inventory": [{ "slot": 0, "typeId": 'theheist:recharge_mode_lvl_1', "lockMode": "slot" }, { "slot": 1, "typeId": 'theheist:hacking_mode_lvl_1', "lockMode": "slot" }] }] };
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
					player.getTags().forEach((x) => { player.removeTag(x); });
					// Add energyTracker data
					const playerEnergyTrackerDataNode = { "name": "energyTracker", "energyUnits": 100.0, "recharging": false, "rechargeLevel": 1 };
					DataManager.setData(player, playerEnergyTrackerDataNode);

					if (!bustedCounterObjective.hasParticipant(player)) {
						bustedCounterObjective.setScore(player, 0);
					}
					const playerLevelInformationDataNode = { "name": "levelInformation", "information": [{ "name": "alarmLevel", "level": 0 }, { "name": "gameLevel", "level": 0 }, { "name": "playerInv", "inventory": [{ "slot": 0, "typeId": 'theheist:recharge_mode_lvl_1', "lockMode": "slot" }, { "slot": 1, "typeId": 'theheist:hacking_mode_lvl_1', "lockMode": "slot" }] }] };

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
							if (entity.typeId != "minecraft:player") entity.kill();
						}
						// Camera 0
						const camera0 = overworld.spawnEntity("armor_stand", { "x": 2014.5, "y": cameraHeight, "z": 51.5 });
						camera0.setRotation({ "x": 0, "y": 10 });
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
						// Turn on command blocks
						overworld.fillBlocks({ x: 2029.50, y: -59.00, z: 56.50 }, { x: 2029.50, y: -59.00, z: 61.50 }, BlockPermutation.resolve('minecraft:redstone_block'));
						// Teleport player from pre-hatch to post-hatch
						player.teleport({ x: 2013.5, y: -52, z: 56.5 }, { dimension: overworld, rotation: { x: 0, y: 90 } });
						VoiceOverManager.play(player, '004')

					}, SECOND * 7.5);
					break;
				}
				case "-1-1": {
					// Load level -1 (the second level)
					// Clear all data on player
					DataManager.clearData(player);
					// Previous level made use of tags, clear them here
					player.getTags().forEach((x) => { player.removeTag(x); });
					// Add energyTracker data
					const playerEnergyTrackerDataNode = { "name": "energyTracker", "energyUnits": 100.0, "recharging": false, "rechargeLevel": 1 };
					DataManager.setData(player, playerEnergyTrackerDataNode);

					if (!bustedCounterObjective.hasParticipant(player)) {
						bustedCounterObjective.setScore(player, 0);
					}
					const playerLevelInformationDataNode = { "name": "levelInformation", "information": [{ "name": "alarmLevel", "level": 0 }, { "name": "gameLevel", "level": -1 }, { "name": "playerInv", "inventory": [{ "slot": 0, "typeId": 'theheist:recharge_mode_lvl_1', "lockMode": "slot" }, { "slot": 1, "typeId": 'theheist:hacking_mode_lvl_1', "lockMode": "slot" }] }] };

					DataManager.setData(player, playerLevelInformationDataNode);

					Utilities.reloadPlayerInv(player, playerLevelInformationDataNode);

					player.onScreenDisplay.setTitle("§o§7Level 0", { "fadeInDuration": 20, "fadeOutDuration": 20, "stayDuration": 160 });
					clearObjectives();
					reloadSidebarDisplay();

					player.teleport({ 'x': 3099.0, 'y': -56, 'z': 109.0 }, { 'dimension': overworld, 'rotation': { 'x': 0, 'y': -90 } });
					var elevatorInterval =  runElelevatorAnimation(new Vector(3099.0, -60, 109.0));

					system.runTimeout(() => { // After 10 seconds bring the player out of the elevator and end the interval
						console.warn("Attept abort");
						system.clearRun(elevatorInterval);
						player.teleport({ "x": 3086.0, "y": -60, "z": 110.0 }, { 'dimension': overworld, 'rotation': { 'x': 0, 'y': 90 } });
					}, SECOND * 10);
					system.runTimeout(() => { // After 7.5 seconds load the level objects
						// Kill all entities
						const entities = overworld.getEntities();
						for (const entity of entities) {
							if (entity.typeId != "minecraft:player") entity.kill();
						}
						/**
						 * // Camera 0
						const camera0 = overworld.spawnEntity("armor_stand", { "x": 2014.5, "y": cameraHeight, "z": 51.5 });
						camera0.setRotation({ "x": 0, "y": 10 });
						overworld.spawnEntity("theheist:camera", { "x": 2014.5, "y": -57, "z": 51.5 }).setRotation({ "x": 0, "y": 10 });
						const camera0DataNode = {
							"name": "cameraTracker",
							"isRobot": false,
							"rotation": 10,
							"disabled": false,
							"cameraID": 0,
							"type": "camera"
						};
						DataManager.setData(camera0, camera0DataNode);
						 */
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
									"type": "set_block", "do": { "x": 3079, "y": -50, "z": 107, "block": "theheist:keypad", "permutations": { "theheist:rotation": 2, "theheist:unlocked": 1 } }
								},
								{
									"type": "set_block", "do": { "x": 3079, "y": -50, "z": 107, "block": "theheist:keypad", "permutations": { "theheist:rotation": 2, "theheist:unlocked": 2 } }, "delay": 40
								},
								{
									"type": "set_block", "do": { "x": 3078, "y": -60, "z": 106, "block": "theheist:custom_door_1_bottom", "permutations": { "theheist:rotation": 2, "theheist:unlocked": true } }, "delay": 40
								}
							]
						};
						// ---------------------------- UPDATE COORDINATES TO MATCH ACTUAL LEVEL -------------------------------------
						DataManager.setData(console0, console0ActionTracker);
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
					}, SECOND * 7.5);
				}
			}
			break;
		}
		case "theheist:voice-says": {
			const player = world.getPlayers().filter((x) => (x != undefined))[0];
			VoiceOverManager.play(player, msg);
			break;
		}
		case "theheist:attempt_end_level": {
			const valueArray = msg.split(/ /);
			const level = valueArray[0];
			const x = valueArray[1];
			const y = valueArray[2];
			const z = valueArray[3];
			const rotation = valueArray[4];
			const player = world.getPlayers().filter((x) => (x != undefined && x != null))[0];
			if (player == undefined) return;
			const objectives = objectivesObjective.getParticipants().map((x) => {
				return x.displayName;
			});
			if (objectives.some((x) => (x.startsWith("§c") && (x.includes("upgrade") || x.includes("mode"))))) { // If the objective text includes "upgrade" then the objective is talking about upgrading a gameband. If "mode", then the objective is talking about gaining a new gameband
				// Player hasn't finished all the gameband-related objectives yet
				VoiceOverManager.play(player, "forgot_prototypes");
				Utilities.setBlock({ x: Number(x), y: Number(y), z: Number(z) }, "minecraft:lever", { "lever_direction": rotation });
				//return;
			} else if (objectives.some((x) => (x.startsWith("§c")))) {
				// Player hasn't finished all the objectives yet
				player.sendMessage([{ "text": "§5§oVoice:§r " }, { "text": "You still have unfinished objectives!" }]);
				Utilities.setBlock({ x: Number(x), y: Number(y), z: Number(z) }, "minecraft:lever", { "lever_direction": rotation });
				//return;
			}
			bustedCounterObjective.setScore(player, 0);
			//Normally:
			overworld.runCommandAsync(`scriptevent theheist:load-level ${parseInt(level) - 1}-1`);
			break;
		}
	}
});

/**
 * Assumes elevator height of 12 blocks
 * @param middleBottomPos The position of the bottom-most middle of the elevator.
 * @param elevatorHeight The number of blocks tall the elevator is.
 * @returns An opaque identifier that can be used with the clearRun function to cancel the execution of this animation.
 */
function runElelevatorAnimation(middleBottomPos: Vector): number {
	var elevatorIndex = 0;
	var elevatorEdgesBottom = [Vector.add(middleBottomPos, new Vector(-2.5,0,-2.5)),Vector.add(middleBottomPos, new Vector(-2.5,0,2.5)), Vector.add(middleBottomPos, new Vector(2.5,0,-2.5)), Vector.add(middleBottomPos, new Vector(2.5,0,2.5))];
	var elevatorEdgesTop = elevatorEdgesBottom.map((pos) => {
		return { 'x': pos.x, 'y': middleBottomPos.y + 11, 'z': pos.z };
	});
	var elevatorInterval = system.runInterval(() => {
		elevatorEdgesBottom.forEach((pos, i) => {
			overworld.fillBlocks(pos, elevatorEdgesTop[i], BlockPermutation.resolve("minecraft:polished_andesite"));
		});
		for (var i = 0; i < 4; i++) {
			var currY = elevatorEdgesBottom[0].y + 3 * i;
			elevatorEdgesBottom.forEach((pos) => {
				Utilities.setBlock({ 'x': pos.x, 'y': currY + elevatorIndex, 'z': pos.z }, "minecraft:redstone_lamp");
			});
		}
		elevatorIndex++;
		elevatorIndex = elevatorIndex % 3;
		console.warn("Still running...");
	}, 10); // Every 0.5 seconds update the elevator
	return elevatorInterval;
}

// Maybe
function createRechargeStation(x: number, z: number, energyTracker: object, rotation: number) {
	const recharge = overworld.spawnEntity("minecraft:armor_stand", new Vector(x, rechargeHeight, z));
	DataManager.setData(recharge, energyTracker);
	Utilities.setBlock({ x, y: rechargeHeight, z }, "theheist:recharge_station", { "theheist:rotation": rotation });
	return recharge;
}

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

interface ModeData {
	mode: string,
	level: number
}