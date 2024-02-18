import { EntityTypes, system, world, Vector3, EntityInventoryComponent, GameMode } from "@minecraft/server";
import DataManager from "./DataManager";
import "./lvl_loader";
import "./gameband";
import "./alarm";
import Utilities from "./Utilities";

/*world.afterEvents.worldInitialize.subscribe(event => {
	const def = new DynamicPropertiesDefinition();
	def.defineString("data", 99999);
	for (const entityType of EntityTypes.getAll()) {
		event.propertyRegistry.registerEntityTypeDynamicProperties(def, entityType.id);
	}
});*/

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
			playerLevelInformationTagJSON.information[0].level = Number(args[0]);
			const newPlayerLevelInformationTag = JSON.stringify(playerLevelInformationTagJSON);
			system.run(() => {
				// As of 1.3.0-beta, native function code that changes game states requires 1 tick of wait and then can run, in before events // WOW This is so old XD
				player.removeTag(playerLevelInformationTag);
				player.addTag(newPlayerLevelInformationTag);
			});
			break;
		case "clearData":
			DataManager.clearData(player);
			system.run(() => {
				player.getTags().forEach((x) => { player.removeTag(x); });
			});
			break;
		case "rotateCam":
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
			}, 0);
			break;
		}
		case 'playVoice': {
			system.runTimeout(() => {
				player.playSound(`map.${args[0]}`)
				player.sendMessage([{ text: '§5§oVoice:§r ' }, { translate: `map.sub.${args[0]}` }])
			}, 0);
			break;
		}
	}
});