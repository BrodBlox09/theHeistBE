import { ItemStack, Vector, system, world, DisplaySlotId, BlockInventoryComponent, EntityInventoryComponent, ItemLockMode } from "@minecraft/server";
import DataManager from "./DataManager";
import VoiceOverManager from "./VoiceOverManager";

// Tag length is max 255, need a different way to store lvl information other than tags :(
// Perhaps similar to how I stored information in the item speedrun thing
// The above worked! Dynamic properties for the win!

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
		"information": [
			{
				"name":"alarmLevel",
				"level":0
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
		"swing": [#, #] or null,
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
const levelHeight = -59;

// Second in ticks
const SECOND = 20;

const objectivesObjective = world.scoreboard.getObjective("objectives")!;
const bustedCounterObjective = world.scoreboard.getObjective("bustedCounter")!;

const overworld = world.getDimension("overworld");

system.afterEvents.scriptEventReceive.subscribe((event) => {
	const id = event.id;
	const msg = event.message;
	switch (id) {
		case "theheist:load-level":
			const entities = overworld.getEntities();
			for (const entity of entities) {
				if (entity.typeId != "minecraft:player") entity.kill();
			}
			switch (msg) {
				case "1-1": {
					// Load level 1 (The van tutorial level)
					// Load player
					const player = world.getPlayers().filter((x) => (x != undefined && x != null))[0];
					if (player == undefined) return;
					// Clear all data on player
					DataManager.clearData(player);
					player.getTags().forEach((x) => { player.removeTag(x); });
					// Add energyTracker data node
					const playerEnergyTrackerDataNode = { "name": "energyTracker", "energyUnits": 0.0, "recharging": false, "usingRechargerID": -1, "rechargeLevel": 1 };
					DataManager.setData(player, "energyTracker", playerEnergyTrackerDataNode);
					// Add level information data node
					const playerLevelInformationDataNode = { "name": "levelInformation", "information": [{ "name": "alarmLevel", "level": 0 }, { "name": "gameLevel", "level": 1 }] };
					DataManager.setData(player, "levelInformation", playerLevelInformationDataNode);

					const playerInvContainer = (player.getComponent('inventory') as EntityInventoryComponent).container;
					playerInvContainer.clearAll();

					const RechargeModeItem = new ItemStack('theheist:recharge_mode_lvl_1')
					RechargeModeItem.lockMode = ItemLockMode.slot
					RechargeModeItem.keepOnDeath = true

					const HackingModeItem = new ItemStack('theheist:hacking_mode_lvl_1')
					HackingModeItem.lockMode = ItemLockMode.slot
					HackingModeItem.keepOnDeath = true

					playerInvContainer.setItem(0, RechargeModeItem);
					playerInvContainer.setItem(1, HackingModeItem);

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
					DataManager.setData(recharge0, "energyTracker", recharge0DataNode);
					overworld.runCommandAsync('setblock -22 -59 62 theheist:recharge_station ["theheist:rotation":5, "theheist:state":1]');
					// Load hackable console 0
					const computer0 = overworld.spawnEntity("minecraft:armor_stand", new Vector(-21.5, consolesHeight, 58.5));
					const computer0DataNode = {
						"name": "actionTracker",
						"used": false,
						"level": 1,
						"actions": [
							{
								"type": "set_block", "do": { "x": -22, "y": -58, "z": 58, "block": "theheist:computer", "permutations": '["theheist:rotation":5, "theheist:unlocked":1]' }
							},
							{
								"type": "set_block", "do": { "x": -22, "y": -58, "z": 58, "block": "theheist:computer", "permutations": '["theheist:rotation":5, "theheist:unlocked":2]' }, "delay": 40
							},
							{
								"type": "manage_objectives", "do": { "manageType": 2, "objective": "Activate Slideshow", "sortOrder": 0 }, "delay": 40
							},
							{
								"type": "slideshow", "do": 1, "delay": 44
							}
						]
					};
					DataManager.setData(computer0, "actionTracker", computer0DataNode);
					// 2 seconds or 2000 milliseconds for static, then green and action!
					overworld.runCommandAsync('setblock -22 -58 58 theheist:computer ["theheist:rotation":5, "theheist:unlocked":0]');
					break;
				}
				case "0-1": {
					// Load level 0.5 (The vent intro level)
					// Load player
					const player = world.getPlayers().filter((x) => (x != undefined && x != null))[0];
					if (player == undefined) return;
					// Clear all data on player
					DataManager.clearData(player);
					player.getTags().forEach((x) => { player.removeTag(x); });
					// Add energyTracker data
					const playerEnergyTrackerDataNode = { "name": "energyTracker", "energyUnits": 0.0, "recharging": false, "rechargeLevel": 1 };
					DataManager.setData(player, "energyTracker", playerEnergyTrackerDataNode);
					const playerLevelInformationDataNode = { "name": "levelInformation", "information": [{ "name": "alarmLevel", "level": 0 }, { "name": "gameLevel", "level": 0.5 }] };
					DataManager.setData(player, "levelInformation", playerLevelInformationDataNode);

					const playerInvContainer = (player.getComponent('inventory') as EntityInventoryComponent).container;
					playerInvContainer.clearAll();

					const RechargeModeItem = new ItemStack('theheist:recharge_mode_lvl_1')
					RechargeModeItem.lockMode = ItemLockMode.slot
					RechargeModeItem.keepOnDeath = true

					const HackingModeItem = new ItemStack('theheist:hacking_mode_lvl_1')
					HackingModeItem.lockMode = ItemLockMode.slot
					HackingModeItem.keepOnDeath = true

					playerInvContainer.setItem(0, RechargeModeItem);
					playerInvContainer.setItem(1, HackingModeItem);

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
					const player = world.getPlayers().filter((x) => (x != undefined && x != null))[0];
					if (player == undefined) {
						world.sendMessage("Could not find player");
						return;
					}
					// Clear all data on player
					DataManager.clearData(player);
					// Previous level made use of tags, clear them here
					player.getTags().forEach((x) => { player.removeTag(x); });
					// Add energyTracker data
					const playerEnergyTrackerDataNode = { "name": "energyTracker", "energyUnits": 100.0, "recharging": false, "rechargeLevel": 1 };
					DataManager.setData(player, "energyTracker", playerEnergyTrackerDataNode);

					if (!bustedCounterObjective.hasParticipant(player)) {
						bustedCounterObjective.setScore(player, 0);
					}
					const playerLevelInformationDataNode = { "name": "levelInformation", "information": [{ "name": "alarmLevel", "level": 0 }, { "name": "gameLevel", "level": 0 }, { "name": "bustedCounter", "value": bustedCounterObjective.getScore(player) }] };

					DataManager.setData(player, "levelInformation", playerLevelInformationDataNode);

					const playerInvContainer = (player.getComponent('inventory') as EntityInventoryComponent).container;
					playerInvContainer.clearAll();

					const RechargeModeItem = new ItemStack('theheist:recharge_mode_lvl_1')
					RechargeModeItem.lockMode = ItemLockMode.slot
					RechargeModeItem.keepOnDeath = true

					const HackingModeItem = new ItemStack('theheist:hacking_mode_lvl_1')
					HackingModeItem.lockMode = ItemLockMode.slot
					HackingModeItem.keepOnDeath = true

					playerInvContainer.setItem(0, RechargeModeItem);
					playerInvContainer.setItem(1, HackingModeItem);

					player.onScreenDisplay.setTitle("§o§7Level 0", { "fadeInDuration": 20, "fadeOutDuration": 20, "stayDuration": 160 });
					clearObjectives();
					reloadSidebarDisplay();

					player.teleport({ 'x': 2013.5, 'y': -52, 'z': 53.5 }, { 'dimension': overworld, 'rotation': { 'x': 0, 'y': 90 } });
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
						overworld.spawnEntity("theheist:camera", { "x": 2014.5, "y": -57, "z": 51.5 }).setRotation({ "x": 0, "y": 10 });
						const camera0DataNode = {
							"name": "cameraTracker",
							"isRobot": false,
							"rotation": 10,
							"disabled": false,
							"cameraID": 0,
							"type": "camera"
						};
						DataManager.setData(camera0, "cameraTracker", camera0DataNode);
						// Camera 1
						const camera1 = overworld.spawnEntity("armor_stand", { "x": 2005.5, "y": cameraHeight, "z": 52.5 });
						camera1.setRotation({ "x": 0, "y": 150 });
						overworld.spawnEntity("theheist:camera", { "x": 2005.5, "y": -57, "z": 52.5 }).setRotation({ "x": 0, "y": 150 });
						const camera1DataNode = {
							"name": "cameraTracker",
							"isRobot": false,
							"rotation": 150,
							"disabled": false,
							"cameraID": 1,
							"type": "camera"
						};
						DataManager.setData(camera1, "cameraTracker", camera1DataNode);
						// Camera 2
						const camera2 = overworld.spawnEntity("armor_stand", { "x": 1991.5, "y": cameraHeight, "z": 52.5 });
						camera2.setRotation({ "x": 0, "y": 210 });
						overworld.spawnEntity("theheist:camera", { "x": 1991.5, "y": -57, "z": 52.5 }).setRotation({ "x": 0, "y": 210 });
						const camera2DataNode = {
							"name": "cameraTracker",
							"isRobot": false,
							"rotation": 210,
							"disabled": false,
							"cameraID": 2,
							"type": "camera"
						};
						DataManager.setData(camera2, "cameraTracker", camera2DataNode);
						// Camera 3
						const camera3 = overworld.spawnEntity("armor_stand", { "x": 2014.5, "y": cameraHeight, "z": 67.5 });
						camera3.setRotation({ "x": 0, "y": 100 });
						overworld.spawnEntity("theheist:camera", { "x": 2014.5, "y": -57, "z": 67.5 }).setRotation({ "x": 0, "y": 100 });
						const camera3DataNode = {
							"name": "cameraTracker",
							"isRobot": false,
							"rotation": 100,
							"disabled": false,
							"cameraID": 3,
							"type": "camera"
						};
						DataManager.setData(camera3, "cameraTracker", camera3DataNode);
						// Camera 4
						const camera4 = overworld.spawnEntity("armor_stand", { "x": 2010.5, "y": cameraHeight, "z": 76.5 });
						camera4.setRotation({ "x": 4, "y": 190 });
						overworld.spawnEntity("theheist:camera", { "x": 2010.5, "y": -57, "z": 76.5 }).setRotation({ "x": 0, "y": 190 });
						const camera4DataNode = {
							"name": "cameraTracker",
							"isRobot": false,
							"rotation": 190,
							"disabled": false,
							"cameraID": 4,
							"type": "camera"
						};
						DataManager.setData(camera4, "cameraTracker", camera4DataNode);
						// Camera 5
						const camera5 = overworld.spawnEntity("armor_stand", { "x": 1992.5, "y": cameraHeight, "z": 59.5 });
						camera5.setRotation({ "x": 0, "y": 20 });
						overworld.spawnEntity("theheist:camera", { "x": 1992.5, "y": -57, "z": 59.5 }).setRotation({ "x": 0, "y": 20 });
						const camera5DataNode = {
							"name": "cameraTracker",
							"isRobot": false,
							"rotation": 20,
							"swivel": [1, 20, 140],
							"disabled": false,
							"cameraID": 5,
							"type": "camera"
						};
						DataManager.setData(camera5, "cameraTracker", camera5DataNode);
						// Console 0 (Type: Computer)
						const console0 = overworld.spawnEntity("armor_stand", { "x": 2020.5, "y": consolesHeight, "z": 54.5 });
						overworld.runCommandAsync('setblock 2020 -58 54 theheist:computer ["theheist:rotation":5]');
						const console0ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 2020, "y": -58, "z": 54, "block": "theheist:computer", "permutations": '["theheist:rotation":5, "theheist:unlocked":1]' }
								},
								{
									"type": "set_block", "do": { "x": 2020, "y": -58, "z": 54, "block": "theheist:computer", "permutations": '["theheist:rotation":5, "theheist:unlocked":2]' }, "delay": 40
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
						DataManager.setData(console0, "actionTracker", console0ActionTracker);
						// Console 1 (Type: Computer)
						const console1 = overworld.spawnEntity("armor_stand", { "x": 2017.5, "y": consolesHeight, "z": 52.5 });
						overworld.runCommandAsync('setblock 2017 -58 52 theheist:computer ["theheist:rotation":2]');
						const console1ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 2017, "y": -58, "z": 52, "block": "theheist:computer", "permutations": '["theheist:rotation":2, "theheist:unlocked":1]' }
								},
								{
									"type": "set_block", "do": { "x": 2017, "y": -58, "z": 52, "block": "theheist:computer", "permutations": '["theheist:rotation":2, "theheist:unlocked":2]' }, "delay": 40
								},
								{
									"type": "set_alarm_level", "do": { "value": 0 }, "delay": 40
								}
							]
						};
						DataManager.setData(console1, "actionTracker", console1ActionTracker);
						// Console 2 (Type: Keypad)
						const console2 = overworld.spawnEntity("armor_stand", { "x": 2014.5, "y": consolesHeight, "z": 60.5 });
						overworld.runCommandAsync('setblock 2014 -58 60 theheist:keypad ["theheist:rotation":5]');
						overworld.runCommandAsync('setblock 2015 -59 61 theheist:custom_door_1_bottom ["theheist:rotation":5, "theheist:unlocked":false]');
						const console2ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 2014, "y": -58, "z": 60, "block": "theheist:keypad", "permutations": '["theheist:rotation":5, "theheist:unlocked":1]' }
								},
								{
									"type": "set_block", "do": { "x": 2014, "y": -58, "z": 60, "block": "theheist:keypad", "permutations": '["theheist:rotation":5, "theheist:unlocked":2]' }, "delay": 40
								},
								{
									"type": "set_block", "do": { "x": 2015, "y": -59, "z": 61, "block": "theheist:custom_door_1_bottom", "permutations": '["theheist:rotation":5, "theheist:unlocked":true]' }, "delay": 40
								},
								{
									"type": "manage_objectives", "do": { "manageType": 2, "objective": "Break into Director's office", "sortOrder": 0 }, "delay": 40
								}
							]
						};
						DataManager.setData(console2, "actionTracker", console2ActionTracker);
						// Console 3 (Type: Computer)
						const console3 = overworld.spawnEntity("armor_stand", { "x": 2018.5, "y": consolesHeight, "z": 65.5 });
						overworld.runCommandAsync('setblock 2018 -58 65 theheist:computer ["theheist:rotation":2]');
						const console3ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 2018, "y": -58, "z": 65, "block": "theheist:computer", "permutations": '["theheist:rotation":2, "theheist:unlocked":1]' }
								},
								{
									"type": "set_block", "do": { "x": 2018, "y": -58, "z": 65, "block": "theheist:computer", "permutations": '["theheist:rotation":2, "theheist:unlocked":2]' }, "delay": 40
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
						DataManager.setData(console3, "actionTracker", console3ActionTracker);
						// Console 4 (Type: Keypad)
						const console4 = overworld.spawnEntity("armor_stand", { "x": 1996.5, "y": consolesHeight, "z": 55.5 });
						overworld.runCommandAsync('setblock 1996 -58 55 theheist:keypad ["theheist:rotation":3]');
						overworld.runCommandAsync('setblock 1995 -59 56 theheist:custom_door_1_bottom ["theheist:rotation":3, "theheist:unlocked":false]');
						const console4ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 1996, "y": -58, "z": 55, "block": "theheist:keypad", "permutations": '["theheist:rotation":3, "theheist:unlocked":1]' }
								},
								{
									"type": "set_block", "do": { "x": 1996, "y": -58, "z": 55, "block": "theheist:keypad", "permutations": '["theheist:rotation":3, "theheist:unlocked":2]' }, "delay": 40
								},
								{
									"type": "set_block", "do": { "x": 1995, "y": -59, "z": 56, "block": "theheist:custom_door_1_bottom", "permutations": '["theheist:rotation":3, "theheist:unlocked":true]' }, "delay": 40
								},
								{
									// Hack other keypad
									"type": "hack_console", "do": { "x": 1992, "z": 62 }, "delay": 40
								}
							]
						};
						DataManager.setData(console4, "actionTracker", console4ActionTracker);
						// Console 5 (Type: Keypad)
						const console5 = overworld.spawnEntity("armor_stand", { "x": 1992.5, "y": consolesHeight, "z": 62.5 });
						overworld.runCommandAsync('setblock 1992 -58 62 theheist:keypad ["theheist:rotation":5]');
						overworld.runCommandAsync('setblock 1993 -59 61 theheist:custom_door_1_bottom ["theheist:rotation":5, "theheist:unlocked":false]');
						const console5ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 1992, "y": -58, "z": 62, "block": "theheist:keypad", "permutations": '["theheist:rotation":5, "theheist:unlocked":1]' }
								},
								{
									"type": "set_block", "do": { "x": 1992, "y": -58, "z": 62, "block": "theheist:keypad", "permutations": '["theheist:rotation":5, "theheist:unlocked":2]' }, "delay": 40
								},
								{
									"type": "set_block", "do": { "x": 1993, "y": -59, "z": 61, "block": "theheist:custom_door_1_bottom", "permutations": '["theheist:rotation":5, "theheist:unlocked":true]' }, "delay": 40
								},
								{
									// Hack other keypad
									"type": "hack_console", "do": { "x": 1996, "z": 56 }, "delay": 40
								}
							]
						};
						DataManager.setData(console5, "actionTracker", console5ActionTracker);
						// Console 6 (Type: Computer)
						const console6 = overworld.spawnEntity("armor_stand", { "x": 1978.5, "y": consolesHeight, "z": 64.5 });
						overworld.runCommandAsync('setblock 1978 -58 64 theheist:computer ["theheist:rotation":3]');
						const console6ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 1978, "y": -58, "z": 64, "block": "theheist:computer", "permutations": '["theheist:rotation":3, "theheist:unlocked":1]' }
								},
								{
									"type": "set_block", "do": { "x": 1978, "y": -58, "z": 64, "block": "theheist:computer", "permutations": '["theheist:rotation":3, "theheist:unlocked":2]' }, "delay": 40
								},
								{
									"type": "display_mail", "do": { "mailID": "002" }, "delay": 40
								},
								{
									"type": "voice_says", "do": { "soundID": "107" }, "delay": 40
								}
							]
						};
						DataManager.setData(console6, "actionTracker", console6ActionTracker);
						// Console 7 (Type: Computer)
						const console7 = overworld.spawnEntity("armor_stand", { "x": 1978.5, "y": consolesHeight, "z": 56.5 });
						overworld.runCommandAsync('setblock 1978 -58 56 theheist:computer ["theheist:rotation":2]');
						const console7ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"level": 1,
							"actions": [
								{
									"type": "set_block", "do": { "x": 1978, "y": -58, "z": 56, "block": "theheist:computer", "permutations": '["theheist:rotation":2, "theheist:unlocked":1]' }
								},
								{
									"type": "set_block", "do": { "x": 1978, "y": -58, "z": 56, "block": "theheist:computer", "permutations": '["theheist:rotation":2, "theheist:unlocked":2]' }, "delay": 40
								},
								{
									"type": "display_mail", "do": { "mailID": "001" }, "delay": 40
								}
							]
						};
						DataManager.setData(console7, "actionTracker", console7ActionTracker);
						// Console 8 (Type: Keycard Reader)
						const console8 = overworld.spawnEntity("armor_stand", { "x": 1990.5, "y": consolesHeight, "z": 67.5 });
						const console8ActionTracker = {
							"name": "actionTracker",
							"used": false,
							"isKeycardReader": true,
							"keycardType": "yellow",
							"actions": [
								{
									"type": "set_block", "do": { "x": 1988, "y": -61, "z": 68, "block": "redstone_torch", "permutations": '[]' }
								},
								{
									"type": "set_block", "do": { "x": 1987, "y": -61, "z": 68, "block": "redstone_torch", "permutations": '[]' }
								},
								{
									"type": "voice_says", "do": { "soundID": "109" }
								}
							]
						};
						DataManager.setData(console8, "actionTracker", console8ActionTracker);
						// Recharge Station 0
						const recharge0 = overworld.spawnEntity("minecraft:armor_stand", new Vector(1998.5, rechargeHeight, 72.5));
						overworld.runCommandAsync('setblock 1998 -59 72 theheist:recharge_station ["theheist:rotation":5]');
						const recharge0DataNode = {
							"name": "energyTracker",
							"rechargerID": 0,
							"energyUnits": 100.0,
							"block": { "x": 1998, "y": -59, "z": 72, "rotation": 5 }
						};
						DataManager.setData(recharge0, "energyTracker", recharge0DataNode);
						// Recharge Station 1
						const recharge1 = overworld.spawnEntity("minecraft:armor_stand", new Vector(1986.5, rechargeHeight, 70.5));
						overworld.runCommandAsync('setblock 1986 -59 70 theheist:recharge_station ["theheist:rotation":4]');
						const recharge1DataNode = {
							"name": "energyTracker",
							"rechargerID": 0,
							"energyUnits": 100.0,
							"block": { "x": 1986, "y": -59, "z": 70, "rotation": 4 }
						};
						DataManager.setData(recharge1, "energyTracker", recharge1DataNode);
						// Fill drawers
						const drawer0InventoryContainer = (overworld.getBlock({ "x": 2002.5, "y": -59, "z": 75.5 })!.getComponent("inventory") as BlockInventoryComponent).container;
						drawer0InventoryContainer.clearAll();
						drawer0InventoryContainer.setItem(4, new ItemStack("yellow_dye"));
						// Set doors and trapdoors

						// Reset end level doors
						overworld.runCommandAsync(`fill 1988 -61 67 1987 -61 67 air`);
						// Turn on command blocks
						//{"x": 2029.50, "y": -59.00, "z": 56.50}
						//{"x": 2029.50, "y": -59.00, "z": 61.50}
						//Dimesion.fillBlocks() does not work
						overworld.runCommandAsync('fill 2029.50 -59.00 56.50 2029.50 -59.00 61.50 redstone_block');
						//overworld.fillBlocks({"x": 1988, "y": -61, "z": 67}, {"x": 1987, "y": -61, "z": 67}, "air");
						// Teleport player from pre-hatch to post-hatch
						player.teleport({ 'x': 2013.5, 'y': -52, 'z': 56.5 }, { 'dimension': overworld, 'rotation': { 'x': 0, 'y': 90 } });
						VoiceOverManager.play(player, '004')

					}, SECOND * 7.5);
					break;
				}
			}
			break;
		case "theheist:voice-says": {
			const player = world.getPlayers().filter((x) => (x != undefined))[0];
			VoiceOverManager.play(player, msg);
			break;
		}
		case "theheist:attempt_end_level":
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
			/*if (//determine if player has more prototypes to unlock) {
				player.sendMessage([{"text": "§5§oVoice:§r "}, {"translate": `map.sub.forgot_prototypes`}]);
				player.playSound("map.forgot_prototypes");
				overworld.runCommandAsync(`setblock ${x} ${y} ${z} lever ${rotation}`);
			}*/
			if (objectives.some((x) => (x.startsWith("§c")))) {
				// Player hasn't finished all the objectives yet
				player.sendMessage([{ "text": "§5§oVoice:§r " }, { "text": "You still have unfinished objectives!" }]);
				overworld.runCommandAsync(`setblock ${x} ${y} ${z} lever ["minecraft:lever_direction":"${rotation}"]`);
				//return;
			}
			bustedCounterObjective.setScore(player, 0);
			//Normally:
			//overworld.runCommandAsync(`scriptevent theheist:load-level ${parseInt(level) - 1}-1`);
			//Demo:
			player.teleport({ "x": -22.50, "y": -59, "z": 67.5 }, { 'dimension': overworld });
			player.onScreenDisplay.setTitle("§5§oThanks for playing!§r");
			player.sendMessage("Congratulations! You finished the demo!");
			break;
	}
});

// Maybe
function createRechargeStation(x: number, z: number, energyTracker: object, rotation: number) {
	const recharge = overworld.spawnEntity("minecraft:armor_stand", new Vector(x, rechargeHeight, z));
	DataManager.setData(recharge, "energyTracker", energyTracker);
	overworld.runCommandAsync(`setblock -22 -59 62 theheist:recharge_station ["theheist:rotation":${rotation}, "theheist:state":1]`);
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