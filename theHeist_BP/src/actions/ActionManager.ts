import { Player, system, world, MolangVariableMap } from "@minecraft/server";
import GameObjectiveManager from "../managers/GameObjectiveManager";
import VoiceOverManager from "../managers/VoiceOverManager";
import DataManager from "../managers/DataManager";
import Utilities from "../Utilities";
import Vector from "../Vector";
import { IAction, IInventorySlotData, PlayerEnergyTracker } from "../TypeDefinitions";

export default class ActionManager {
	static runActions(actionInfos: IAction[], player: Player) {
		actionInfos.forEach(x => ActionManager.runAction(x, player));
	}

	static runAction(actionInfo: IAction, player: Player) {
		if (!actionInfo.delay) {
			ActionManager._runAction(actionInfo, player);
		} else {
			system.runTimeout(() => {
				ActionManager._runAction(actionInfo, player);
			}, actionInfo.delay);
		}
	}

	private static _runAction(actionInfo: IAction, player: Player) {
		switch (actionInfo.type) {
			case "slideshow":
				var slideshowID = actionInfo.do.slideshowID;
				ActionManager.runSlideshow(slideshowID, player);
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
				var hoverText = Utilities.dimensions.overworld.getEntities(query)[0];
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
					"location": { 'x': player.location.x, 'y': Utilities.cameraHeight, 'z': player.location.z },
					"maxDistance": 50
				};
				var cameraArmorStand = Utilities.dimensions.overworld.getEntities(cameraQuery).filter(x => {
					var cameraTrackerDataNode = DataManager.getData(x, "cameraTracker");
					return (x.location.y == Utilities.cameraHeight && cameraTrackerDataNode && cameraTrackerDataNode.disabled == false && cameraTrackerDataNode.cameraID == cameraID);
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
				var displayCamera = Utilities.dimensions.overworld.getEntities(displayCameraQuery)[0];
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
						molangVarMap.setVector3("variable.velocity", new Vector(x, y, z));
						Utilities.dimensions.overworld.spawnParticle("minecraft:explosion_particle", { x, y, z }, molangVarMap);
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
				Utilities.dimensions.overworld.runCommand(command);
				break;
			case "hack_console": {
				var x = actionInfo.do.x;
				var z = actionInfo.do.z;
				var query = {
					"type": "armor_stand",
					"location": new Vector(x, Utilities.consolesHeight, z),
					"maxDistance": 2,
					"closest": 1
				};
				var armorStand = Utilities.dimensions.overworld.getEntities(query)[0];
				var actionTracker = DataManager.getData(armorStand, "actionTracker")!;
				actionTracker.actions.forEach((x: IAction) => {
					if (x.type == "hack_console") return;
					if (!x.delay) {
						ActionManager.runAction(x, player);
					} else {
						system.runTimeout(() => {
							ActionManager.runAction(x, player);
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
				lvlInfo.alarmLevelInfo.level = actionInfo.do.value;
				DataManager.setData(player, lvlInfo);
				if (actionInfo.do.value == 0) {
					player.sendMessage([{ "translate": "map.console.alarm" }]);
					player.playSound("note.snare", { "pitch": 1.8, "volume": 0.5 });
				}
				break;
			case "manage_objective":
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
				let inventoryTracker = DataManager.getData(player, "inventoryTracker")!;
				inventoryTracker.slots.push({ "slot": actionInfo.do.slot, "typeId": `theheist:${actionInfo.do.mode}_mode_lvl_1`, "lockMode": "slot" });
				DataManager.setData(player, inventoryTracker);
				Utilities.reloadPlayerInv(player);
				Utilities.dimensions.overworld.getBlock(actionInfo.do.displayBlock)?.setType("minecraft:air");
				world.sendMessage([{ "text": "§7New Mode Available: §r" + actionInfo.do.modeText }]);
				break;
			}
			case "upgrade_gameband": {
				let inventoryTracker = DataManager.getData(player, "inventoryTracker")!;
				inventoryTracker.slots = inventoryTracker.slots.filter((x: IInventorySlotData) => (x.slot != actionInfo.do.slot));
				inventoryTracker.slots.push({ "slot": actionInfo.do.slot, "typeId": `theheist:${actionInfo.do.mode}_mode_lvl_${actionInfo.do.level}`, "lockMode": "slot" });
				DataManager.setData(player, inventoryTracker);
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

	static runSlideshow(slideshowID: number, player: Player) {
		switch (slideshowID) {
			case 1:
				// Clear player's inventory
				const playerInvContainer = player.getComponent('inventory')!.container;
				playerInvContainer.clearAll();

				// Start speaking & send subtitles
				player.playSound('map.001');
				player.sendMessage([{ "text": "§5§oVoice:§r " }, { "translate": "map.sub.001.A" }]);
				player.sendMessage([{ "text": "§5§oVoice:§r " }, { "translate": "map.sub.001.B" }]);

				const hideHud = system.runInterval(() => {
					player.onScreenDisplay.setTitle('hideHud')
				}, 0)

				// First TP
				player.teleport({ x: 998.5, y: -60, z: 112.5 }, { 'dimension': Utilities.dimensions.overworld });
				player.camera.setCamera('minecraft:free', {
					location: { x: 1030.5, y: -57.25, z: 107.5 },
					rotation: { x: 0, y: 180 }
				})

				system.runTimeout(() => {
					player.camera.setCamera('minecraft:free', {
						location: { x: 1031.5, y: -57.25, z: 88.5 },
						rotation: { x: -30, y: 125 }
					})
				}, Utilities.SECOND * 5);

				system.runTimeout(() => {
					player.camera.setCamera('minecraft:free', {
						location: { x: 1027.5, y: -57.25, z: 68.5 },
						rotation: { x: 0, y: 135 }
					})
				}, Utilities.SECOND * 13);

				system.runTimeout(() => {
					player.camera.setCamera('minecraft:free', {
						location: { x: 1017.5, y: -57.25, z: 56.5 },
						rotation: { x: -25, y: 80 }
					})
				}, Utilities.SECOND * 22);

				system.runTimeout(() => {
					system.clearRun(hideHud);
					player.camera.clear();
					system.sendScriptEvent("theheist:load-level", "1");
				}, Utilities.SECOND * 30.5);
				break;
		}
	}
}