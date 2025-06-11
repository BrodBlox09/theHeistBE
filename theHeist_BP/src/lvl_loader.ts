import { ItemStack, Player, system, world, DisplaySlotId, BlockInventoryComponent, BlockPermutation, Container, ItemLockMode, GameMode, HudVisibility } from "@minecraft/server";
import Vector from "./Vector";
import Utilities from "./Utilities";
import DataManager from "./DataManager";
import VoiceOverManager from "./VoiceOverManager";
import LevelConstructor from "./levels/LevelConstructor";
import LevelDefinitions from "./levels/levelDefinitions";
import GameObjectiveManager from "./GameObjectiveManager";

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

const persistentEntities = ["minecraft:player","minecraft:painting","minecraft:chicken","theheist:driver","theheist:rideable"];
const persistentTags = ["loadingLevel","developer"];

system.afterEvents.scriptEventReceive.subscribe((event) => {
	const id = event.id;
	const msg = event.message;
	switch (id) {
		case "theheist:load-level": {
			const entities = overworld.getEntities();
			for (const entity of entities) {
				if (!persistentEntities.includes(entity.typeId) && !entity.hasTag("persistent")) entity.remove();
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
			// Clear all data on player
			DataManager.clearData(player);
			player.getTags().forEach((x) => { if (!persistentTags.includes(x)) player.removeTag(x); });
			if (!bustedCounterObjective.hasParticipant(player)) {
				bustedCounterObjective.setScore(player, 0);
			}

			// Ensure player is in correct game mode
			player.setGameMode(GameMode.adventure);

			// Get level definition
			const levelDefinition = LevelDefinitions.getLevelDefinitionByID(msg);
			if (levelDefinition == undefined) return;
			const levelNum = parseInt(levelDefinition.levelID.substring(0, levelDefinition.levelID.length));

			// Add mandatory data
			const maxEnergy = Utilities.gamebandInfo.rechargeMode[levelDefinition.rechargeLevel].max;
			const playerEnergyTrackerDataNode: EnergyTracker = { "name": "energyTracker", "energyUnits": levelDefinition.startEnergyUnits ?? maxEnergy, "recharging": false, "usingRechargerID": -1, "rechargeLevel": levelDefinition.rechargeLevel };
			DataManager.setData(player, playerEnergyTrackerDataNode);

			const playerLevelInformationDataNode: LevelInformation = { "name": "levelInformation", "currentModes": [], "information": [{ "name": "alarmLevel", "level": 0, "sonarTimeout": 0 }, { "name": "gameLevel", "level": levelNum }, { "name": "playerInv", "inventory": [] }] };
			if (!levelDefinition.playerNoPhone) levelDefinition.startingItems.push({ "slot": 19, "typeId": 'theheist:phone' });
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
			if (levelDefinition.onLoadStart) levelDefinition.onLoadStart(player);

			var elevatorInterval: number;
			var waitForLoadLevel = true;
			if (levelDefinition.customTitle == undefined) player.onScreenDisplay.setTitle(`§o§7Level ${levelNum}`, { "fadeInDuration": 20, "fadeOutDuration": 20, "stayDuration": 160 });
			else if (levelDefinition.customTitle != "") player.onScreenDisplay.setTitle(levelDefinition.customTitle, { "fadeInDuration": 20, "fadeOutDuration": 20, "stayDuration": 160 });
			if (!levelDefinition.customLoadingArea) {
				player.teleport(Vector.from(levelDefinition.loadElevatorLoc).add(new Vector(0, 4, 0)));
				elevatorInterval = runElelevatorAnimation(Vector.from(levelDefinition.loadElevatorLoc));
			} else if (levelDefinition.customLoadingArea.waitForLoadLevel) {
				player.teleport(levelDefinition.customLoadingArea.playerLoadingLocation);
			} else waitForLoadLevel = false;

			const levelCloneInfo = Utilities.levelCloneInfo[levelNum];
			// Ensure parts far away are loaded
			overworld.runCommandAsync('tickingarea remove_all');
			if (levelCloneInfo) system.runTimeout(() => {
				// Ticking area doesn't depend on Y level and it uses rounded X and Z coordinates
				overworld.runCommandAsync(`tickingarea add ${levelCloneInfo.startX} 0 ${levelCloneInfo.startZ} ${levelCloneInfo.endX} 0 ${levelCloneInfo.endZ} level-wide`);
			}, waitForLoadLevel ? 2 : 0); // Ensure this ticking area isn't removed

			system.runTimeout(() => {
				if (!levelDefinition.noAutoCleanup) {
					const entities = overworld.getEntities();
					for (const entity of entities) {
						if (!persistentEntities.includes(entity.typeId) && !entity.hasTag("persistent")) entity.remove();
					}
					// Clear sensor mode residue
					if (levelCloneInfo) {
						Utilities.fillBlocks(new Vector(levelCloneInfo.startX, Utilities.cameraMappingHeight - 4, levelCloneInfo.startZ), new Vector(levelCloneInfo.endX, Utilities.cameraMappingHeight - 4, levelCloneInfo.endZ), "air");
						overworld.runCommandAsync(`fill ${levelCloneInfo.startX} ${Utilities.levelHeight} ${levelCloneInfo.startZ} ${levelCloneInfo.endX} ${Utilities.levelHeight} ${levelCloneInfo.endZ} air replace theheist:robot_path`);
						overworld.runCommandAsync(`clone ${levelCloneInfo.startX} ${Utilities.floorCloneHeight} ${levelCloneInfo.startZ} ${levelCloneInfo.endX} ${Utilities.floorCloneHeight} ${levelCloneInfo.endZ} ${levelCloneInfo.startX} ${Utilities.levelHeight - 1} ${levelCloneInfo.startZ}`);
						// Move drilled areas back into position
						overworld.runCommandAsync(`clone ${levelCloneInfo.startX} ${Utilities.drilledBlocksHeight} ${levelCloneInfo.startZ} ${levelCloneInfo.endX} ${Utilities.drilledBlocksHeight + 1} ${levelCloneInfo.endZ} ${levelCloneInfo.startX} ${Utilities.levelHeight} ${levelCloneInfo.startZ} filtered normal minecraft:hardened_clay`);
						overworld.runCommandAsync(`clone ${levelCloneInfo.startX} ${Utilities.drilledBlocksHeight} ${levelCloneInfo.startZ} ${levelCloneInfo.endX} ${Utilities.drilledBlocksHeight + 1} ${levelCloneInfo.endZ} ${levelCloneInfo.startX} ${Utilities.levelHeight + 1} ${levelCloneInfo.startZ} filtered move minecraft:hardened_clay`);
					}
				}

				LevelConstructor.start();
				levelDefinition.setup(player);
			}, waitForLoadLevel ? SECOND * 7.5 : 0); // After 7.5 seconds load level objects
			system.runTimeout(() => { // After 10 seconds bring the player out of the elevator and end the interval
				if (elevatorInterval) system.clearRun(elevatorInterval);
				player.teleport(levelDefinition.startPlayerLoc, { rotation: { 'x': 0, 'y': levelDefinition.startPlayerRot ?? 0 } });
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
			var playerInvContainer = player.getComponent("inventory")!.container as Container;
			var index = Utilities.inventoryContainerIndexOf(playerInvContainer, keycardItemTypeId);
			var i2 = 21; //19
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
			const nextLevel = valueArray[5];
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

			if (!nextLevel) {
				if (currLevel != -5) overworld.runCommandAsync(`scriptevent theheist:load-level ${currLevel - 1}`);
				else endDemo(player);
			} else if (nextLevel == "end") {
				endDemo(player);
			} else {
				overworld.runCommandAsync(`scriptevent theheist:load-level ${nextLevel}`);
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