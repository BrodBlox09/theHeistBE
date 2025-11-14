import { ScoreboardObjective, world, Player, system } from "@minecraft/server";
import DataManager from "./DataManager";
import Utilities from "../Utilities";
import LevelDefinitions from "../levels/LevelDefinitions";
import GamebandManager from "../gamebands/GamebandManager";

let bustedCounterObjective: ScoreboardObjective;

world.afterEvents.worldLoad.subscribe(event => {
	bustedCounterObjective = world.scoreboard.getObjective("bustedCounter")  ?? world.scoreboard.addObjective('bustedCounter', 'bustedCounter');
});

export default class PlayerBustedManager {
	static playerBusted(player: Player): void {
		let levelInformation = DataManager.getWorldData("levelInformation")!;
		let levelDefinition = LevelDefinitions.getLevelDefinitionByID(levelInformation.id);
		if (!levelDefinition) {
			console.warn("Player busted but no level definition to determine prison location.");
			return;
		}
		let levelCI = levelDefinition.levelCloneInfo;

		player.addTag("BUSTED");

		let alarmTracker = DataManager.getData(player, "alarmTracker")!;
		alarmTracker.level = 0;
		DataManager.setData(player, alarmTracker);

		let inventoryTracker = DataManager.getData(player, "inventoryTracker")!;
		inventoryTracker.slots = [];
		DataManager.setData(player, inventoryTracker);

		let gamebandTracker = DataManager.getData(player, "gamebandTracker")!;
		GamebandManager.cancelMode(player, gamebandTracker.currentMode);
		gamebandTracker.energy = 0;
		DataManager.setData(player, gamebandTracker);

		let currentBustCount = bustedCounterObjective.hasParticipant(player) ? bustedCounterObjective.getScore(player)! : 0;
		bustedCounterObjective.setScore(player, currentBustCount + 1);
		player.playSound("map.alarm");
		player.addTag('loadingLevel');
		player.onScreenDisplay.setTitle("§r§e§lBusted", { "subtitle": "You got detected. Try again!", "fadeInDuration": 20, "fadeOutDuration": 20, "stayDuration": 160 });
		player.getComponent("inventory")!.container.clearAll();
		system.runTimeout(() => {
			PlayerBustedManager.stopAllSound();
			player.teleport(levelCI.prisonLoc);
			let bustedCount = PlayerBustedManager.getTimesBustedFromPlayer(player);
			player.sendMessage(`You got busted §c§l${bustedCount}§r time${bustedCount > 1 ? 's' : ''}`);
		}, Utilities.SECOND * 3);
		system.runTimeout(() => {
			player.removeTag("BUSTED");
			system.sendScriptEvent("theheist:load-level", `${levelInformation.id}`);
		}, Utilities.SECOND * (3 + 5));
	}

	static setTimesBusted(player: Player, bustedCount: number): void {
		bustedCounterObjective.setScore(player, bustedCount);
	}

	static getTimesBustedFromPlayer(player: Player): number {
		return bustedCounterObjective.getScore(player) ?? 0;
	}

	static stopAllSound() {
		Utilities.dimensions.overworld.getEntities({ "excludeTypes": ["minecraft:armor_stand", "theheist:hover_text"] }).forEach((e) => { try { e.runCommand('stopsound @s'); } catch { } });
	}
}