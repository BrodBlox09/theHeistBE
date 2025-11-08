import { Player } from "@minecraft/server";
import DataManager from "../managers/DataManager";
import Utilities from "../Utilities";
import Vector from "../Vector";
import GamebandManager from "./GamebandManager";
import { GamebandInfo } from "../TypeDefinitions";

const range = 2;

export const stunModeInfo: GamebandInfo = {
	1: {
		"cost": 10
	}
};

export function tryStunMode(player: Player, lvl: number) {
    let levelInformation = DataManager.getData(player, "levelInformation")!;
    GamebandManager.cancelMode(player, levelInformation.currentMode);
    levelInformation = DataManager.getData(player, "levelInformation")!;

    let robots = Utilities.dimensions.overworld.getEntities({
        "location": new Vector(player.location.x, Utilities.cameraHeight, player.location.z),
        "maxDistance": range,
        "tags": ["robot"]
    });
    if (robots.length == 0) return;

    var cost = stunModeInfo[lvl].cost;
    var energyTracker = DataManager.getData(player, "playerEnergyTracker")!;
    if (energyTracker.energyUnits < cost) {
        player.sendMessage("§cNot enough energy!");
        return;
    }
    energyTracker.energyUnits -= cost;
    DataManager.setData(player, energyTracker);
    player.playSound("map.shock", { "pitch": 1 });

    robots.forEach(robot => {
        var cameraTracker = DataManager.getData(robot, "cameraTracker")!;
        cameraTracker.isStunned = true;
        cameraTracker.stunTimer = 200;
        DataManager.setData(robot, cameraTracker);
    });
}