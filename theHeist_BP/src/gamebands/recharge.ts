import { Player, ItemStack, ItemLockMode } from "@minecraft/server";
import DataManager from "../managers/DataManager";
import Utilities from "../Utilities";
import GamebandManager from "./GamebandManager";
import Vector from "../Vector";
import ActionManager from "../actions/ActionManager";
import LoreItem from "../LoreItem";
import { GamebandTracker, InventoryTracker, RechargeGamebandDataList } from "../TypeDefinitions";

export const rechargeModeInfo: RechargeGamebandDataList = {
	1: {
		"max": 100.0
	},
	2: {
		"max": 150.0
	},
	3: {
		"max": 200.0
	}
}

export function toggleRechargeMode(player: Player, lvl: number) {
	let gamebandTracker = DataManager.getData(player, "gamebandTracker")!;
	GamebandManager.cancelMode(player, gamebandTracker.currentMode);
	gamebandTracker = DataManager.getData(player, "gamebandTracker")!;

	const query = {
		"type": "armor_stand",
		"location": new Vector(player.location.x, Utilities.rechargeHeight, player.location.z),
		"maxDistance": 2,
		"closest": 1
	}
	const armorStand = Utilities.dimensions.overworld.getEntities(query)[0];
	if (!armorStand) return;
	let armorStandEnergyTrackerDataNode = DataManager.getData(armorStand, "energyTracker")!;
	gamebandTracker.rechargeLevel = lvl;
	var blockLocation = { "x": armorStandEnergyTrackerDataNode.block.x, "y": armorStandEnergyTrackerDataNode.block.y, "z": armorStandEnergyTrackerDataNode.block.z };
	if (gamebandTracker.recharging == false) {
		if (armorStandEnergyTrackerDataNode.energyUnits == 0.0) return;
		if (armorStandEnergyTrackerDataNode.block.y - 1 > player.location.y) return;
		gamebandTracker.recharging = true;
		gamebandTracker.currentMode = { "mode": "recharge", "level": lvl };
		player.playSound("portal.travel", { "volume": 0.1, "pitch": 2 });
		Utilities.setBlock(blockLocation, "theheist:recharge_station", { "minecraft:cardinal_direction": armorStandEnergyTrackerDataNode.block.rotation, "theheist:state": 2 });
		gamebandTracker.usingRechargerId = armorStandEnergyTrackerDataNode.rechargerID;
		// Remove all gamebands except recharge mode
		var playerInvContainer = player.getComponent("inventory")!.container;
		playerInvContainer.clearAll();
		var rechargeModeItemStack = new ItemStack(`theheist:recharge_mode_lvl_${lvl}_enchanted`);
		rechargeModeItemStack.lockMode = ItemLockMode.slot;
		LoreItem.setLoreOfItemStack(rechargeModeItemStack);
		playerInvContainer.setItem(0, rechargeModeItemStack);
	} else {
		// The player is currently recharging
		gamebandTracker.recharging = false;
		gamebandTracker.currentMode = null;
		Utilities.setBlock(blockLocation, "theheist:recharge_station", { "minecraft:cardinal_direction": armorStandEnergyTrackerDataNode.block.rotation, "theheist:state": 1 });
		gamebandTracker.usingRechargerId = -1;
		// Bring back the player's items
		Utilities.reloadPlayerInv(player);
	}
	DataManager.setData(player, gamebandTracker);
}

export function rechargeTick(player: Player, gamebandTracker: GamebandTracker, inventoryTracker: InventoryTracker) {
	if (!playerIsInRechargeMode(gamebandTracker)) return;
	const query = {
		"type": "armor_stand",
		"location": { 'x': player.location.x, 'y': Utilities.rechargeHeight, 'z': player.location.z },
		"maxDistance": 2
	}
	const armorStands = Utilities.dimensions.overworld.getEntities(query);
	var i = 0;
	for (const armorStand of armorStands) {
		var armorStandEnergyTracker = DataManager.getData(armorStand, "energyTracker")!;
		if (armorStandEnergyTracker.rechargerID != gamebandTracker.usingRechargerId) continue;
		if (armorStandEnergyTracker.block.y - 1 > player.location.y) continue;
		i++;
	}
	if (i == 0) {
		// Player has left range, so stop the player from recharging
		gamebandTracker.recharging = false;
		gamebandTracker.currentMode = null;
		Utilities.reloadPlayerInv(player);
		const subQuery = {
			"type": "armor_stand",
			"location": { 'x': player.location.x, 'y': Utilities.rechargeHeight, 'z': player.location.z },
			"maxDistance": 4
		}
		const subArmorStands = Utilities.dimensions.overworld.getEntities(subQuery);
		for (const subArmorStand of subArmorStands) {
			var armorStandEnergyTracker = DataManager.getData(subArmorStand, "energyTracker")!;
			if (armorStandEnergyTracker.rechargerID != gamebandTracker.usingRechargerId) continue;
			Utilities.setBlock({ x: armorStandEnergyTracker.block.x, y: armorStandEnergyTracker.block.y, z: armorStandEnergyTracker.block.z }, "theheist:recharge_station", { "minecraft:cardinal_direction": armorStandEnergyTracker.block.rotation, "theheist:state": 1 });
			gamebandTracker.usingRechargerId = -1;
		}
	} else if (gamebandTracker.energy < rechargeModeInfo[gamebandTracker.rechargeLevel].max) {
		var addEnergy = 1; // Amount of energy to add per tick
		gamebandTracker.energy = Math.min(gamebandTracker.energy + addEnergy, rechargeModeInfo[gamebandTracker.rechargeLevel].max);
		for (const armorStand of armorStands) {
			var armorStandEnergyTracker = DataManager.getData(armorStand, "energyTracker")!;
			if (armorStandEnergyTracker.rechargerID != gamebandTracker.usingRechargerId) continue;
			armorStandEnergyTracker.energyUnits -= addEnergy;
			if (armorStandEnergyTracker.energyUnits <= 0) {
				// The recharge station is out of energy, so stop player from recharging
				var diff = Math.abs(armorStandEnergyTracker.energyUnits);
				gamebandTracker.energy -= diff;
				armorStandEnergyTracker.energyUnits = 0;
				Utilities.setBlock({ x: armorStandEnergyTracker.block.x, y: armorStandEnergyTracker.block.y, z: armorStandEnergyTracker.block.z }, "theheist:recharge_station", { "minecraft:cardinal_direction": armorStandEnergyTracker.block.rotation, "theheist:state": 3 });
				gamebandTracker.recharging = false;
				gamebandTracker.currentMode = null;
				gamebandTracker.usingRechargerId = -1;
				Utilities.reloadPlayerInv(player);
				// Run actions staged for on depletion
				if (armorStandEnergyTracker.onDepletionActions) ActionManager.runActions(armorStandEnergyTracker.onDepletionActions, player);
			}
			DataManager.setData(armorStand, armorStandEnergyTracker);
		}
	}
	DataManager.setData(player, gamebandTracker);
}

export function playerIsInRechargeMode(gamebandTracker: GamebandTracker) {
	return gamebandTracker.currentMode?.mode == "recharge";
}