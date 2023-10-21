import { EntityTypes, system, world, DynamicPropertiesDefinition, Vector3 } from "@minecraft/server";
import DataManager from "./DataManager";
import "./lvl_loader";
import "./gameband";
import "./alarm";
import Utilities from "./Utilities";

world.afterEvents.worldInitialize.subscribe(event => {
	const def = new DynamicPropertiesDefinition();
	def.defineString("data", 99999);
	for (const entityType of EntityTypes.getAll()) {
		event.propertyRegistry.registerEntityTypeDynamicProperties(def, entityType.id);
	}
});

system.beforeEvents.watchdogTerminate.subscribe((event) => {
	event.cancel = true;
});

const levelLocations: Record<string, Vector3> = {
	"2": { 'x': 0.5, 'y': -50, 'z': 56.5 },
	"1": { 'x': -22.5, 'y': -50, 'z': 56.5 },
	"0.5": { 'x': 1000.5, 'y': -50, 'z': 56.5 },
	"0": { 'x': 2000.5, 'y': -50, 'z': 56.5 }//,
	//"-1": {'x': 2000.5, 'y': -50, 'z': 56.5}
}

const objectivesObjective = world.scoreboard.getObjective("objectives") ?? world.scoreboard.addObjective("objectives", "Objectives");

const allowedPlayers = [
	"BrodBlox09",
	"BrodBloxRox",
	"FoxOfThunder13",
	"McMelonTV"
];

world.beforeEvents.chatSend.subscribe(event => {
	const player = event.sender;
	const msg = event.message;
	if (!allowedPlayers.includes(player.name) || !msg.startsWith("!")) return;
	event.cancel = true;
	const args = msg.slice(1).split(" ");
	const cmd = args.shift();
	switch (cmd) {
		case "lvlTp":
			if (levelLocations.hasOwnProperty(args[0]))
				system.run(() => {
					player.teleport(levelLocations[args[0]], { 'dimension': world.getDimension("overworld"), 'rotation': { 'x': 90, 'y': 0 } });
				});
			else player.sendMessage(`§4The level ${args[0]} does not exist.`);
			break;
		case "tellRot":
			const xRot = player.getRotation().x;
			const yRot = player.getRotation().y;
			console.error(`X: ${xRot}, Y: ${yRot}`);
			break;
		case "setAlarmLvl":
			if (!Number.isInteger(Number(args[0]))) {
				player.sendMessage(`§4The value "${args[0]}" is not an integer.`);
			}
			const playerEnergyTag = player.getTags().find((x) => (JSON.parse(x).name == "energyTracker"));
			if (!playerEnergyTag) return console.error("Player does not have energyTracker tag.");
			const playerEnergyTagJSON = JSON.parse(playerEnergyTag);
			const playerLevelInformationTag = player.getTags().find((x) => (JSON.parse(x).name == "levelInformation"));
			if (!playerLevelInformationTag) return console.error("Player does not have levelInformation tag.");
			const playerLevelInformationTagJSON = JSON.parse(playerLevelInformationTag);
			//if ((playerEnergyTagJSON && playerEnergyTagJSON.energyUnits != player.level) || (player.xpEarnedAtCurrentLevel != (playerLevelInformationTagJSON.information[0].level / 100) * 742)) {
			//player.resetLevel();
			//player.addLevels(100);
			// 9 * 100 - 158
			//const alarmLvlXpVal = (((Number(args[0]) / 100) - 0.06) * 742) + 41;
			//player.addExperience(alarmLvlXpVal);
			//player.addLevels(-100);
			//player.addLevels(Math.floor(playerEnergyTagJSON.energyUnits));
			//player.addExperience(10); Even though it doesn't exist right now, alarm lvl. tracker must be added!
			//}*/
			//console.error(JSON.stringify(playerLevelInformationTagJSON.information[0].level));
			playerLevelInformationTagJSON.information[0].level = Number(args[0]);
			const newPlayerLevelInformationTag = JSON.stringify(playerLevelInformationTagJSON);
			system.run(() => {
				// As of 1.3.0-beta, native function code that changes game states requires 1 tick of wait and then can run, in before events
				player.removeTag(playerLevelInformationTag);
				player.addTag(newPlayerLevelInformationTag);
			});
			//console.error(player.xpEarnedAtCurrentLevel);
			//console.error(player.getTags().find((x) => (JSON.parse(x).name == "levelInformation")).information[0].level);
			break;
		case "setLvlData":
			DataManager.setData(player, "levelInformation", { "name": "levelInformation", "information": [{ "name": "alarmLevel", "level": 0 }, { "name": "gameLevel", "level": 0 }] });
			break;
		case "getData":
			console.warn(JSON.stringify(DataManager.getData(player, 'energyTracker')));
			break;
		case "clearData":
			DataManager.clearData(player);
			system.run(() => {
				player.getTags().forEach((x) => { player.removeTag(x); });
			});
			break;
		case "fillLarge":
			system.run(() => {
				player.dimension.fillBlocks({ x: Number(args[0]), y: Number(args[1]), z: Number(args[2]) }, { x: Number(args[3]), y: Number(args[4]), z: Number(args[5]) }, args[6]);
			});
			break;
		case "tpCam":
			system.run(() => {
				const camera = world.getDimension("overworld").getEntities({
					"type": "theheist:camera",
					"location": { 'x': player.location.x, 'y': player.location.y, 'z': player.location.z },
					"maxDistance": 3,
					"closest": 1
				})[0];
				if (camera == undefined) return;
				player.sendMessage(camera.getRotation().y.toString());
				camera.setRotation({ 'x': 0, 'y': parseInt(args[0]) });
				player.sendMessage("Camera rotated" + camera.getRotation().y.toString());
			});
			break;
		case "addObj":
			system.run(() => {
				objectivesObjective.setScore(`§c${args.join(" ")}§r`, 0);
			});
			break;
		case "tpFacing":
			system.run(() => {
				//player.teleport({"x": ,"y": , "z": }, {'dimension': world.getDimension("overworld")});
				player.sendMessage(`X: ${Utilities.cos(player.getRotation().x) * 0.7} Z: ${Utilities.sin(player.getRotation().x) * 0.7}`);
			});
			break;
		case "setBlock":
			system.run(() => {
				const block = { "type": "computer", "x": -22, "y": -58, "z": 58, "rotation": 5 };
				const blockSetter1 = { "type": "set_block", "do": { "x": block.x, "y": block.y, "z": block.z, "block": `theheist:${block.type}`, "permutations": { "theheist:rotation": block.rotation, "theheist:unlocked": 1 } } };
				//console.warn(JSON.stringify(blockSetter1.do));
				//setBlock(player.location, blockSetter1.do.block, blockSetter1.do.permutations);
				Utilities.setBlock(player.location, `theheist:${block.type}`, { "theheist:unlocked": 2, "theheist:rotation": 1 });
			});
			break;
		case 'start': {
			system.runTimeout(() => {
				player.dimension.runCommand(`time set 20000`)
				player.runCommand(`gamemode a`)
				player.teleport({
					x: 0.5,
					y: -59,
					z: 61.5
				}, {
					dimension: Utilities.dimensions.overworld,
					rotation: {
						x: 0,
						y: 90
					}
				})
			}, 0)
			break
		}
		case 'playVoice': {
			system.runTimeout(() => {
				player.playSound(`map.${args[0]}`)
				player.sendMessage([{ text: '§5§oVoice:§r ' }, { translate: `map.sub.${args[0]}` }])
			}, 0)
		}
	}
});