import { system, world, Player, EntityQueryOptions, GameMode } from "@minecraft/server";
import GameObjectiveManager from "./managers/GameObjectiveManager";
import DataManager from "./managers/DataManager";
import Utilities from "./Utilities";
import Vector from "./Vector";
import "./customComponents";
import "./lvl_loader";
import { gamebandTick } from "./gameband";
import { alarmTick } from "./alarm";
import ActionManager from "./actions/ActionManager";
import LevelDefinitions from "./levels/LevelDefinitions";

system.runInterval(() => {
	gamebandTick();
	alarmTick();
});

world.afterEvents.playerSpawn.subscribe(eventData => {
	if (!eventData.initialSpawn || !eventData.player.hasTag('loadingLevel')) return;
	var levelInfo = DataManager.getWorldData("levelInformation");
	if (!levelInfo) return;
	system.sendScriptEvent("theheist:load-level", `${levelInfo.id}`);
});

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
			let levelDefinition = LevelDefinitions.getLevelDefinitionByID(args[0]);
			if (!levelDefinition) { player.sendMessage(`§4No level with level ID '${args[0]}' exists.`); return; }
			system.run(() => {
				player.teleport(Vector.from(levelDefinition!.levelCloneInfo.mapLoc).above(), { 'dimension': world.getDimension("overworld") });
			});
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
			player.sendMessage("Data cleared");
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
			player.setGameMode(GameMode.Adventure);
			Utilities.clearPlayerInventory(player);
			DataManager.clearData(player);
			player.resetLevel();
			player.teleport(new Vector(44.5, 60, 70.5), {
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
		case "fillBlocks": {
			system.run(() => {
				Utilities.fillBlocks(new Vector(parseInt(args[0]), parseInt(args[1]), parseInt(args[2])), new Vector(parseInt(args[3]), parseInt(args[4]), parseInt(args[5])), args[6]);
			});
			break;
		}
		case "getData": {
			var query: EntityQueryOptions = {
				closest: 1,
				excludeTypes: ["minecraft:player"],
				location: player.location
			};
			world.sendMessage(DataManager.GetDataRaw(Utilities.dimensions.overworld.getEntities(query)[0])!);
			break;
		}
		case "myData": {
			world.sendMessage(DataManager.GetDataRaw(player) ?? "no data");
			break;
		}
		case "lvlData": {
			var data = DataManager.getWorldData("levelInformation");
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
		case "clearObjectives": {
			GameObjectiveManager.removeAllObjectives();
			console.log("objectives cleared");
		}
		case "runSlideshow": {
			ActionManager.runSlideshow(parseInt(args[0]), player);
		}
	}
});