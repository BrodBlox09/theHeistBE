import { HudVisibility, ItemStack, Player, system } from "@minecraft/server";
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

export let lastTickPlayerHeldTeleportationMode: number = 0;

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
	player.camera.fade({"fadeTime":{"holdTime": 5,"fadeInTime":0,"fadeOutTime":0.5}});
	player.onScreenDisplay.setTitle("To be continued...", {
		"fadeInDuration": 10,
		"fadeOutDuration": 10,
		"stayDuration": 100,
		"subtitle": `You finished "The Heist"!`
	});
	player.onScreenDisplay.setActionBar("");
	system.runTimeout(() => player.teleport(new Vector(44.5, Utilities.levelPlayingHeight, 70.5), {"rotation":{"x":0,"y":90}}), 20);
	system.runTimeout(() => player.onScreenDisplay.setHudVisibility(HudVisibility.Reset), 120);
}

export function teleportationTick(player: Player, gamebandTracker: GamebandTracker, inventoryTracker: InventoryTracker, selectedItemStack: ItemStack | undefined) {
	if (selectedItemStack != undefined && selectedItemStack.typeId.startsWith("theheist:teleportation_mode_lvl_")) {
		player.addEffect('nausea', 10 * Utilities.SECOND, { amplifier: 1, showParticles: false }); // Must be around 10 seconds, lower durations aren't visible on screen
		lastTickPlayerHeldTeleportationMode = system.currentTick;
	} else if (lastTickPlayerHeldTeleportationMode + Utilities.SECOND * 0.5 == system.currentTick) { // Wait 0.5 seconds and then clear the effect
		player.removeEffect('nausea');
	}
}