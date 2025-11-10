import { ScoreboardObjective, world, Player, system } from "@minecraft/server";
import DataManager from "./DataManager";
import Utilities from "../Utilities";
import LevelDefinitions from "../levels/LevelDefinitions";

let bustedCounterObjective: ScoreboardObjective;

world.afterEvents.worldLoad.subscribe(event => {
	bustedCounterObjective = world.scoreboard.getObjective("bustedCounter")  ?? world.scoreboard.addObjective('bustedCounter', 'bustedCounter');
});

export default class PlayerBustedManager {
	static playerBusted(player: Player): void {
		let playerLevelInformation = DataManager.getData(player, "levelInformation")!;
		let levelDefinition = LevelDefinitions.getLevelDefinitionByID(playerLevelInformation.id);
		if (!levelDefinition) {
			console.warn("Player busted but no level definition to determine prison location.");
			return;
		}
		let levelCI = levelDefinition.levelCloneInfo;

		player.addTag('loadingLevel');

		playerLevelInformation.alarmLevelInfo.level = 0;
		DataManager.setData(player, playerLevelInformation);

		let inventoryTracker = DataManager.getData(player, "inventoryTracker")!;
		inventoryTracker.slots = [];
		DataManager.setData(player, inventoryTracker);

		let playerEnergyTracker = DataManager.getData(player, "playerEnergyTracker")!;
		playerEnergyTracker.energyUnits = 0;
		DataManager.setData(player, playerEnergyTracker);

		bustedCounterObjective.setScore(player, (bustedCounterObjective.getScore(player) ?? 0) + 1);
		player.playSound("map.alarm");
		player.addTag("BUSTED");
		player.onScreenDisplay.setTitle("§r§e§lBusted", { "subtitle": "You got detected. Try again!", "fadeInDuration": 20, "fadeOutDuration": 20, "stayDuration": 160 });
		player.getComponent("inventory")!.container?.clearAll();
		system.runTimeout(() => {
			PlayerBustedManager.stopAllSound();
			player.teleport(levelCI.prisonLoc);
			player.sendMessage(`You got busted §c§l${PlayerBustedManager.getTimesBustedFromPlayer(player)}§r time(s)`);
		}, Utilities.SECOND * 3);
		system.runTimeout(() => {
			player.removeTag("BUSTED");
			system.sendScriptEvent("theheist:load-level", `${playerLevelInformation.id}`);
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