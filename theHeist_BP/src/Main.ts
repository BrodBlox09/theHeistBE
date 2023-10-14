import { EntityTypes, system, world, DynamicPropertiesDefinition, Vector, Vector3 } from "@minecraft/server";
import * as dataManager from "./imports/entity_dynamic_properties";
import "./lvl_loader";
import "./gameband";
import "./alarm";
import Utilities from "./Utilities";

world.sendMessage('e');

world.afterEvents.worldInitialize.subscribe(e => {
	const def = new DynamicPropertiesDefinition(); // this holds the properties
	def.defineString("data", 99999); // we set the maximum length really high
	for (const entity of EntityTypes.getAll()) {
		e.propertyRegistry.registerEntityTypeDynamicProperties(def, entity);
	} // assign the definition to all entities, so every entity can use it
});

//#region Stop Watchdog Terminate
system.beforeEvents.watchdogTerminate.subscribe((event) => {
	event.cancel = true;
});
//#endregion

//#region Admin Help
const levelLocations: Record<string, Vector3> = {
	"2": { 'x': 0.5, 'y': -50, 'z': 56.5 },
	"1": { 'x': -22.5, 'y': -50, 'z': 56.5 },
	"0.5": { 'x': 1000.5, 'y': -50, 'z': 56.5 },
	"0": { 'x': 2000.5, 'y': -50, 'z': 56.5 }//,
	//"-1": {'x': 2000.5, 'y': -50, 'z': 56.5}
}

const objectivesObjective = world.scoreboard.getObjective("objectives");

const overworld = world.getDimension("overworld");

world.beforeEvents.chatSend.subscribe(event => {
	const player = event.sender;
	const msg = event.message;
	if (!(player.name == "BrodBlox09" || player.name == "BrodBloxRox" || player.name == "FoxOfThunder13") || !msg.startsWith("!")) return;
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
			dataManager.setData(player, "levelInformation", { "name": "levelInformation", "information": [{ "name": "alarmLevel", "level": 0 }, { "name": "gameLevel", "level": 0 }] });
			break;
		case "getData":
			console.warn(JSON.stringify(dataManager.getData(player, 'energyTracker')));
			break;
		case "clearData":
			dataManager.clearData(player);
			system.run(() => {
				player.getTags().forEach((x) => { player.removeTag(x); });
			});
			break;
		case "fillLarge":
			system.run(() => {
				//world.getDimension("overworld").fillBlocks({"x": parseInt(args[0]), "y": parseInt(args[1]), "z": parseInt(args[2])}, {"x": parseInt(args[3]), "y": parseInt(args[4]), "z": parseInt(args[5])}, args[6]);
				player.runCommandAsync(`fill ${args[0]} ${args[1]} ${args[2]} ${args[3]} ${args[4]} ${args[5]} ${args[6]}`);
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
				if (!objectivesObjective) return console.error("Objectives objective does not exist.");
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
	}
});
//#endregion