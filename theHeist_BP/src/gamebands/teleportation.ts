import { HudVisibility, ItemStack, MolangVariableMap, Player, system, Vector3 } from "@minecraft/server";
import { GamebandInfo, GamebandTracker, InventoryTracker } from "../TypeDefinitions";
import Utilities from "../Utilities";
import DataManager from "../managers/DataManager";
import GamebandManager from "./GamebandManager";
import VoiceOverManager from "../managers/VoiceOverManager";
import Vector from "../Vector";
import PlayerBustedManager from "../managers/PlayerBustedManager";

export const teleportationModeInfo: GamebandInfo = {
	1: {
		"cost": 200
	}
};
const finalSceneHoldTimeSeconds = 10;

export function tryTeleportationMode(player: Player, lvl: number) {
	let gamebandTracker = DataManager.getData(player, "gamebandTracker")!;
	GamebandManager.cancelMode(player, gamebandTracker.currentMode);
	gamebandTracker = DataManager.getData(player, "gamebandTracker")!;

	var cost = teleportationModeInfo[lvl].cost;
	if (gamebandTracker.energy < cost) {
		player.sendMessage("§cNot enough energy!");
		return;
	}
	gamebandTracker.energy -= cost;
	DataManager.setData(player, gamebandTracker);

	player.sendMessage("§l§6Teleporting...");
	VoiceOverManager.play(player, 704);

	Utilities.clearPlayerInventory(player);
	DataManager.clearData(player);
	PlayerBustedManager.setTimesBusted(player, 0);
	player.getTags().forEach((x) => { if (!Utilities.persistentTags.includes(x)) player.removeTag(x); });
	player.resetLevel();
	player.onScreenDisplay.setHudVisibility(HudVisibility.Hide);
	player.camera.fade({"fadeTime":{"holdTime": finalSceneHoldTimeSeconds,"fadeInTime":0,"fadeOutTime":0.5}});
	player.onScreenDisplay.setTitle("To be continued...", {
		"fadeInDuration": 10,
		"fadeOutDuration": 10,
		"stayDuration": finalSceneHoldTimeSeconds * Utilities.SECOND,
		"subtitle": `You finished "The Heist"!`
	});
	player.onScreenDisplay.setActionBar("");
	system.runTimeout(() => player.teleport(new Vector(44.5, Utilities.levelPlayingHeight, 70.5), {"rotation":{"x":0,"y":90}}), Utilities.SECOND);
	system.runTimeout(() => player.onScreenDisplay.setHudVisibility(HudVisibility.Reset), finalSceneHoldTimeSeconds * Utilities.SECOND);
}

export function teleportationTick(player: Player, gamebandTracker: GamebandTracker, inventoryTracker: InventoryTracker, selectedItemStack: ItemStack | undefined) {
	if (selectedItemStack != undefined && selectedItemStack.typeId.startsWith("theheist:teleportation_mode_lvl_")) {
		player.addEffect('nausea', 5 * Utilities.SECOND, { amplifier: 1, showParticles: false }); // Must be around 5 seconds, lower durations aren't visible on screen
	}
	if (inventoryTracker.slots.some(x => x.typeId == "theheist:teleportation_mode_lvl_1") && system.currentTick % 2 == 0) {
		spawnPortalParticle(Vector.from(player.location).add(new Vector(0, 2, 0)));
	}
}

export function spawnPortalParticle(location: Vector3) {
	let varMap = new MolangVariableMap();
	varMap.setVector3("direction", new Vector(getRandPN(), getRandPN(), getRandPN()));
	Utilities.dimensions.overworld.spawnParticle("minecraft:portal_directional", location, varMap);
}

function getRandPN() {
	return 2 * (Math.random() - 0.5);
}