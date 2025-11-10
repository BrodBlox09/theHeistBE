import { Player, EntityQueryOptions, system } from "@minecraft/server";
import DataManager from "../managers/DataManager";
import Utilities from "../Utilities";
import GameObjectiveManager from "../managers/GameObjectiveManager";
import ActionManager from "../actions/ActionManager";
import GamebandManager from "./GamebandManager";
import { ConsoleActionTracker, GamebandInfo } from "../TypeDefinitions";

export const hackingModeInfo: GamebandInfo = {
	1: {
		"cost": 15.0
	},
	2: {
		"cost": 10.0
	},
	3: {
		"cost": 5.0
	}
};

export function tryHackingMode(player: Player, lvl: number) {
	let gamebandTracker = DataManager.getData(player, "gamebandTracker")!;
	GamebandManager.cancelMode(player, gamebandTracker.currentMode);

	let consolesAttempted = 0;
	let errorMessage: string | null = null;
	if (player.location.y < Utilities.ventHeight) {
		const query: EntityQueryOptions = {
			"type": "armor_stand",
			"location": { "x": player.location.x, "y": Utilities.consolesHeight, "z": player.location.z },
			"maxDistance": 2
		}
		const armorStands = Utilities.dimensions.overworld.getEntities(query);
		for (const armorStand of armorStands) {
			let armorStandActionTracker = DataManager.getData(armorStand, 'actionTracker');
			if (!armorStandActionTracker || armorStandActionTracker.used == true || armorStandActionTracker.isKeycardReader) continue;
			let armorStandConsoleActionTracker = armorStandActionTracker as ConsoleActionTracker;
			consolesAttempted++;
			
			if (armorStandConsoleActionTracker.level <= lvl) {
				if (hackingModeInfo[lvl].cost > gamebandTracker.energy) {
					errorMessage = "Not enough energy!";
					continue;
				}
				if (armorStandConsoleActionTracker.prereq) { // If there are prerequisites, ensure they are true here
					var prereq = armorStandConsoleActionTracker.prereq!;
					if (prereq.objectives) { // Objective(s) must be completed first
						if (!prereq.objectives!.every(x => GameObjectiveManager.objectiveIsComplete(x))) continue;
					}
				}
				player.playSound('map.hack_use');
				if (armorStandConsoleActionTracker.level != 0) gamebandTracker.energy -= hackingModeInfo[lvl].cost;
				DataManager.setData(player, gamebandTracker);
				ActionManager.runActions(armorStandConsoleActionTracker.actions, player);
				// Player hacked the device, now disable it
				armorStandConsoleActionTracker.used = true;
				DataManager.setData(armorStand, armorStandConsoleActionTracker);
				errorMessage = null;
				break;
			} else {
				errorMessage = "Console is too complicated";
				continue;
			}
		}
	}
	if (consolesAttempted == 0) errorMessage = "No console";
	if (errorMessage) player.sendMessage("§c" + errorMessage);
}