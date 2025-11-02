import { Player, EntityQueryOptions, system } from "@minecraft/server";
import DataManager from "../DataManager";
import Utilities from "../Utilities";
import GameObjectiveManager from "../GameObjectiveManager";
import ActionManager from "../ActionManager";
import GamebandManager from "./GamebandManager";


export function tryHackingMode(player: Player, lvl: number) {
	let levelInformation = DataManager.getData(player, "levelInformation")!;
	GamebandManager.cancelMode(player, levelInformation.currentMode);

	var playerEnergyTracker = DataManager.getData(player, "playerEnergyTracker")!;
	const query: EntityQueryOptions = {
		"type": "armor_stand",
		"location": { "x": player.location.x, "y": Utilities.consolesHeight, "z": player.location.z },
		"maxDistance": 2
	}
	const armorStands = Utilities.dimensions.overworld.getEntities(query);
	var i = 0;
	let errorMessage = null;
	for (const armorStand of armorStands) {
		i++;
		var armorStandActionTracker = DataManager.getData(armorStand, 'actionTracker')! as ActionTracker;
		if (armorStandActionTracker.used == true || armorStandActionTracker.isKeycardReader) {
			i--;
			continue;
		}
		if (armorStandActionTracker.level <= lvl) {
			if (Utilities.gamebandInfo.hackingMode[lvl].cost > playerEnergyTracker.energyUnits) {
				errorMessage = "Not enough energy!";
				continue;
			}
			if (armorStandActionTracker.prereq) { // If there are prerequisites, ensure they are true here
				var prereq = armorStandActionTracker.prereq!;
				if (prereq.objectives) { // Objective(s) must be completed first
					if (!prereq.objectives!.every(x => GameObjectiveManager.objectiveIsComplete(x))) continue;
				}
			}
			player.playSound('map.hack_use');
			if (armorStandActionTracker.level != 0) playerEnergyTracker.energyUnits -= Utilities.gamebandInfo.hackingMode[lvl].cost;
			DataManager.setData(player, playerEnergyTracker);
			ActionManager.runActions(armorStandActionTracker.actions, player);
			// Player hacked the device, now disable it
			armorStandActionTracker.used = true;
			DataManager.setData(armorStand, armorStandActionTracker);
			errorMessage = null;
		} else {
			errorMessage = "Console is too complicated";
			continue;
		}
	}
	if (i == 0) errorMessage = "No console";
	if (errorMessage) player.sendMessage("§c" + errorMessage);
}