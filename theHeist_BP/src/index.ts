import { system, world, Vector3, Player, EntityQueryOptions, BlockVolume, BlockPermutation, GameMode } from "@minecraft/server";
import VoiceOverManager from "./VoiceOverManager";
import DataManager from "./DataManager";
import Utilities from "./Utilities";
import Vector from "./Vector";
import "./customComponents";
import "./lvl_loader";
import "./gameband";
import "./alarm";

world.afterEvents.playerSpawn.subscribe(eventData => {
	if (!eventData.initialSpawn || !eventData.player.hasTag('loadingLevel')) return;
	var levelInfo = DataManager.getData(eventData.player, "levelInformation");
	if (!levelInfo) return;
	var gameLevel = levelInfo.information[1].level;
	Utilities.dimensions.overworld.runCommand(`scriptevent theheist:load-level ${gameLevel}`);
});

// system.beforeEvents.watchdogTerminate.subscribe((event) => {
// 	event.cancel = true;
// });

const levelLocations: Record<string, Vector3> = {
	"3": { 'x': 0.5, 'y': -50, 'z': 56.5 },
	"2": { 'x': -22.5, 'y': -50, 'z': 56.5 },
	"1": { 'x': 1000.5, 'y': -50, 'z': 56.5 },
	"0": { 'x': 2000.5, 'y': -50, 'z': 56.5 },
	"-1": {'x': 3075.5, 'y': -50, 'z': 100.5},
	"-2": { 'x': 4101, 'y': -47, 'z': 131 },
	"-3": { 'x': 4996, 'y': -44, 'z': 126 },
	"-4": { 'x': 5893, 'y': -44, 'z': 129 },
	"-5": { 'x': 6939, 'y': -54, 'z': 71 }
}

const objectivesObjective = world.scoreboard.getObjective("objectives") ?? world.scoreboard.addObjective("objectives", "Objectives");

system.afterEvents.scriptEventReceive.subscribe(event => { // stable-friendly version of world.beforeEvents.chatSend
	if (event.id != "theheist:run_cmd") return;
	const player = event.sourceEntity as Player;
	if (!player || player.typeId != "minecraft:player") return;
	if (!player.hasTag("developer")) {
		player.sendMessage("§4You must have the §6'developer'§4 tag to use developer commands.");
		return;
	}
	const msg = event.message;
	const args = msg.split(" ");
	const cmd = args.shift();
	switch (cmd) {
		case "lvlTp":
			if (levelLocations.hasOwnProperty(args[0]))
				system.run(() => {
					player.teleport(levelLocations[args[0]], { 'dimension': world.getDimension("overworld") });
				});
			else player.sendMessage(`§4The level ${args[0]} does not exist.`);
			break;
		case "tellRot":
			const xRot = player.getRotation().x;
			const yRot = player.getRotation().y;
			console.error(`X: ${xRot}, Y: ${yRot}`);
			break;
		case "clearData":
			DataManager.clearData(player);
			system.run(() => {
				player.getTags().forEach((x) => { if (x != "developer") player.removeTag(x); });
			});
			system.run(() => Utilities.dimensions.overworld.runCommand('tickingarea remove_all'));
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
			player.dimension.runCommand(`time set 20000`)
			player.setGameMode(GameMode.adventure);
			Utilities.clearPlayerInventory(player);
			DataManager.clearData(player);
			player.resetLevel();
			player.teleport(new Vector(44.5, -59, 70.5), {
				dimension: Utilities.dimensions.overworld,
				rotation: { x: 0, y: 90 }
			});
			break;
		}
		case 'playVoice': {
			system.runTimeout(() => {
				player.playSound(`map.${args[0]}`)
				player.sendMessage([{ text: '§5§oVoice:§r ' }, { translate: `map.sub.${args[0]}` }])
			}, 0);
			break;
		}
		case "fillLarge": {
			system.run(() => {
				const lvlCI = Utilities.levelCloneInfo["-5"];
				Utilities.fillBlocks(new Vector(lvlCI.startX, parseInt(args[0]), lvlCI.startZ), new Vector(lvlCI.endX, parseInt(args[0]), lvlCI.endZ), args[1]);
			});
			break;
		}
		case "getData": {
			var query: EntityQueryOptions = {
				closest: 1,
				excludeTypes: ["minecraft:player"],
				location: player.location
			};
			world.sendMessage(DataManager.GetDataRaw(Utilities.dimensions.overworld.getEntities(query)[0]) as string);
			break;
		}
		case "myData": {
			world.sendMessage(DataManager.GetDataRaw(player) ?? "no data");
			break;
		}
		case "lvlData": {
			var data = DataManager.getData(player, "levelInformation");
			world.sendMessage(JSON.stringify(data));
			break;
		}
		case "spawnJeb": {
			system.run(() => {
				Utilities.dimensions.overworld.spawnEntity("minecraft:sheep", player.location).nameTag = "jeb_";
			});
		}
		case "blockPermutationData": {
			var block = player.getBlockFromViewDirection()!.block;
			var states = block.permutation.getAllStates();
			player.sendMessage(block.typeId);
			player.sendMessage(JSON.stringify(states));
		}
	}
});