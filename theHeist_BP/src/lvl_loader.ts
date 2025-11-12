import { ItemStack, Player, system, world, BlockPermutation, ItemLockMode, GameMode, HudVisibility } from "@minecraft/server";
import Vector from "./Vector";
import Utilities from "./Utilities";
import DataManager from "./managers/DataManager";
import VoiceOverManager from "./managers/VoiceOverManager";
import LevelConstructor from "./levels/LevelConstructor";
import LevelDefinitions from "./levels/LevelDefinitions";
import GameObjectiveManager from "./managers/GameObjectiveManager";
import PlayerBustedManager from "./managers/PlayerBustedManager";
import LoreItem from "./LoreItem";
import { LevelInformation, InventoryTracker, AlarmTracker, GamebandTracker } from "./TypeDefinitions";
import { rechargeModeInfo } from "./gamebands/recharge";

/**
 * Layer information:
 * 20: Level map
 * 0: Hackable consoles
 * -5: Recharge stations
 * -10: Cameras, sonars, and robots
 * -15: Cameras and sonars mappout area
 */

// Second in ticks
const SECOND = 20;

const persistentEntities = ["minecraft:player","minecraft:painting","theheist:driver","theheist:rideable"];
const persistentTags = ["loadingLevel","developer","persistent"];

system.afterEvents.scriptEventReceive.subscribe((event) => {
	const id = event.id;
	const msg = event.message;
	switch (id) {
		case "theheist:load-level": {
			const entities = Utilities.dimensions.overworld.getEntities();
			for (const entity of entities) {
				if (!persistentEntities.includes(entity.typeId) && !entity.hasTag("persistent")) entity.remove();
			}
			const player = world.getPlayers().filter((x) => (x != undefined && x != null))[0];
			if (player == undefined) {
				world.sendMessage("Could not find player");
				return;
			}
			player.addTag('loadingLevel');
			// Clear all data on player
			DataManager.clearData(player);
			player.getTags().forEach((x) => { if (!persistentTags.includes(x) && !x.startsWith("p_")) player.removeTag(x); });

			// Ensure player is in correct game mode
			player.setGameMode(GameMode.Adventure);

			// Get level definition
			const levelDefinition = LevelDefinitions.getLevelDefinitionByID(msg);
			if (levelDefinition == undefined) return;
			const levelId = levelDefinition.levelId;

			// Add mandatory data
			const levelInformationDataNode: LevelInformation = {
				"id": levelId,
				"runSecurity": !levelDefinition.noRunSecurity
			};
			if (levelDefinition.timeLimit) {
				levelInformationDataNode.timeLimit = {
					"maxTime": levelDefinition.timeLimit * Utilities.SECOND,
					"remainingTime": levelDefinition.timeLimit * Utilities.SECOND
				};
				GameObjectiveManager.setTimeRemaining(player, levelInformationDataNode.timeLimit.remainingTime);
			}
			DataManager.setWorldData("levelInformation", levelInformationDataNode);
			
			const maxEnergy = rechargeModeInfo[levelDefinition.rechargeLevel].max;
			const gamebandTracker: GamebandTracker = {
				"name": "gamebandTracker",
				"currentMode": null,
				"energy": levelDefinition.startEnergyUnits ?? maxEnergy,
				"rechargeLevel": levelDefinition.rechargeLevel,
				"usingRechargerId": -1
			};
			DataManager.setData(player, gamebandTracker);

			const alarmTrackerDataNode: AlarmTracker = {
				"name": "alarmTracker",
				"level": 0,
				"sonarTimeout": 0
			};
			DataManager.setData(player, alarmTrackerDataNode);

			const inventoryTrackerDataNode: InventoryTracker = {
				"name": "inventoryTracker",
				"slots": []
			};
			inventoryTrackerDataNode.slots = levelDefinition.startingItems;
			if (!levelDefinition.playerNoPhone) levelDefinition.startingItems.push({ "slot": 9, "typeId": 'theheist:phone' });
			Utilities.reloadPlayerInv(player, inventoryTrackerDataNode);
			DataManager.setData(player, inventoryTrackerDataNode);

			GameObjectiveManager.removeAllObjectives();
			levelDefinition.startObjectives.forEach((objData) => {
				GameObjectiveManager.addObjective(objData.name, objData.sortOrder, false);
			});
			if (levelDefinition.onLoadStart) levelDefinition.onLoadStart(player);

			var elevatorInterval: number;
			var waitForLoadLevel = true;
			if (levelDefinition.customTitle == undefined) player.onScreenDisplay.setTitle(`§o§7Level ${levelId}`, { "fadeInDuration": 20, "fadeOutDuration": 20, "stayDuration": 160 });
			else if (levelDefinition.customTitle != "") player.onScreenDisplay.setTitle(levelDefinition.customTitle, { "fadeInDuration": 20, "fadeOutDuration": 20, "stayDuration": 160 });
			if (!levelDefinition.customLoadingArea) {
				player.teleport(Vector.from(levelDefinition.loadElevatorLoc).add(new Vector(0, 4, 0)), { rotation: player.getRotation() });
				elevatorInterval = runElelevatorAnimation(Vector.from(levelDefinition.loadElevatorLoc));
			} else if (levelDefinition.customLoadingArea.waitForLoadLevel) {
				player.teleport(levelDefinition.customLoadingArea.playerLoadingLocation, { rotation: player.getRotation() });
			} else waitForLoadLevel = false;

			const levelCloneInfo = levelDefinition.levelCloneInfo;
			// Ensure parts far away are loaded
			Utilities.dimensions.overworld.runCommand('tickingarea remove_all');
			if (levelCloneInfo) system.runTimeout(() => {
				// Ticking area doesn't depend on Y level and it uses rounded X and Z coordinates
				Utilities.dimensions.overworld.runCommand(`tickingarea add ${levelCloneInfo.startX} 0 ${levelCloneInfo.startZ} ${levelCloneInfo.endX} 0 ${levelCloneInfo.endZ} level-wide`);
			}, waitForLoadLevel ? 2 : 0); // Ensure this ticking area isn't removed

			system.runTimeout(() => {
				if (!levelDefinition.noAutoCleanup) {
					const entities = Utilities.dimensions.overworld.getEntities();
					for (const entity of entities) {
						if (!persistentEntities.includes(entity.typeId) && !entity.hasTag("persistent")) entity.remove();
					}
					if (levelCloneInfo) {
						// Clear robot paths in the air
						Utilities.fillBlocks(new Vector(levelCloneInfo.startX, Utilities.robotPathDisplayMapHeight, levelCloneInfo.startZ), new Vector(levelCloneInfo.endX, Utilities.robotPathDisplayMapHeight, levelCloneInfo.endZ), "air");
						// Clear robot paths on the floor
						Utilities.dimensions.overworld.runCommand(`fill ${levelCloneInfo.startX} ${Utilities.levelPlayingHeight} ${levelCloneInfo.startZ} ${levelCloneInfo.endX} ${Utilities.levelPlayingHeight} ${levelCloneInfo.endZ} air replace theheist:robot_path`);
						// Clear sensor mode residue
						Utilities.dimensions.overworld.runCommand(`clone ${levelCloneInfo.startX} ${Utilities.floorCloneHeight} ${levelCloneInfo.startZ} ${levelCloneInfo.endX} ${Utilities.floorCloneHeight} ${levelCloneInfo.endZ} ${levelCloneInfo.startX} ${Utilities.levelFloorHeight} ${levelCloneInfo.startZ}`);
						// Move drilled areas back into position
						Utilities.dimensions.overworld.runCommand(`clone ${levelCloneInfo.startX} ${Utilities.drilledBlocksHeight} ${levelCloneInfo.startZ} ${levelCloneInfo.endX} ${Utilities.drilledBlocksHeight + 1} ${levelCloneInfo.endZ} ${levelCloneInfo.startX} ${Utilities.levelFloorHeight} ${levelCloneInfo.startZ} filtered normal minecraft:hardened_clay`);
						Utilities.dimensions.overworld.runCommand(`clone ${levelCloneInfo.startX} ${Utilities.drilledBlocksHeight} ${levelCloneInfo.startZ} ${levelCloneInfo.endX} ${Utilities.drilledBlocksHeight + 1} ${levelCloneInfo.endZ} ${levelCloneInfo.startX} ${Utilities.levelPlayingHeight} ${levelCloneInfo.startZ} filtered move minecraft:hardened_clay`);
					}
				}

				LevelConstructor.start();
				levelDefinition.setup(player);
			}, waitForLoadLevel ? SECOND * 7.5 : 0); // After 7.5 seconds load level objects
			system.runTimeout(() => { // After 10 seconds bring the player out of the elevator and end the interval
				if (elevatorInterval) system.clearRun(elevatorInterval);
				player.teleport(levelDefinition.startPlayerLoc, { rotation: levelDefinition.startPlayerRot ? { 'x': 0, 'y': levelDefinition.startPlayerRot } : player.getRotation() });
				if (levelDefinition.onStart) levelDefinition.onStart(player);
				player.removeTag('loadingLevel');
			}, waitForLoadLevel ? SECOND * 10 : 0);
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
			var playerInvContainer = player.getComponent("inventory")!.container;
			var index = Utilities.inventoryContainerIndexOf(playerInvContainer, keycardItemTypeId);
			var i = 10;
			while (playerInvContainer.getItem(i) && i < playerInvContainer.size) i++;
			if (index) playerInvContainer.setItem(index); // If item is in a slot already, clear the slot
			const itemStack = new ItemStack(keycardItemTypeId);
			itemStack.lockMode = ItemLockMode.slot;
			LoreItem.setLoreOfItemStack(itemStack);
			playerInvContainer.setItem(i, itemStack);
			const itemStack2 = new ItemStack("minecraft:paper"); // Set universal keycard
			itemStack2.lockMode = ItemLockMode.slot;
			LoreItem.setLoreOfItemStack(itemStack2);
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
			const nextLevel = valueArray[5];
			const player = world.getPlayers().filter((player) => (player != undefined && player != null))[0];
			if (player == undefined) return;
			const objectives = GameObjectiveManager.getAllObjectives();
			// If the objective text includes "upgrade" then the objective is talking about upgrading a gameband. If "mode", then the objective is talking about gaining a new gameband
			// May want to rework objective system to allow for required and optional objectives
			if (objectives.some((obj) => (obj.startsWith("§c") && (obj.includes("upgrade") || obj.includes("mode"))))) {
				// Player hasn't finished all the gameband-related objectives yet
				VoiceOverManager.play(player, "forgot_prototypes");
				Utilities.setBlock({ x: Number(x), y: Number(y), z: Number(z) }, "minecraft:lever", { "lever_direction": rotation });
				return;
			}
			PlayerBustedManager.setTimesBusted(player, 0);
			// Remove all tags (except persistent), even p_ tags (like for voice over)
			player.getTags().forEach((x) => { if (!persistentTags.includes(x)) player.removeTag(x); });
			if (!nextLevel) {
				if (currLevel != -5) system.sendScriptEvent("theheist:load-level", `${currLevel - 1}`);
				else endDemo(player);
			} else if (nextLevel == "end") {
				endDemo(player);
			} else {
				system.sendScriptEvent("theheist:load-level", `${nextLevel}`)
			}
			break;
		}
		case "theheist:end_demo": {
			const player = world.getPlayers().filter((player) => (player != undefined && player != null))[0];
			endDemo(player);
			break;
		}
	}
});

function endDemo(player: Player) {
	Utilities.clearPlayerInventory(player);
	DataManager.clearData(player);
	player.resetLevel();
	player.onScreenDisplay.setHudVisibility(HudVisibility.Hide);
	player.camera.fade({"fadeTime":{"holdTime": 5,"fadeInTime":0.5,"fadeOutTime":0.5}});
	player.onScreenDisplay.setTitle("Thanks for playing!", {
		"fadeInDuration": 10,
		"fadeOutDuration": 10,
		"stayDuration": 100,
		"subtitle": "More levels coming soon"
	});
	system.runTimeout(() => player.teleport(new Vector(44.5, -59, 70.5), {"rotation":{"x":0,"y":90}}), 20);
	system.runTimeout(() => player.onScreenDisplay.setHudVisibility(HudVisibility.Reset), 120);
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