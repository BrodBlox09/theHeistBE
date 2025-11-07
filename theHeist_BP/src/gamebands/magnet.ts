import { EffectTypes, Player } from "@minecraft/server";
import DataManager from "../DataManager";
import Utilities from "../Utilities";
import Vector from "../Vector";
import GamebandManager from "./GamebandManager";
import { LevelInformation, PlayerEnergyTracker } from "../TypeDefinitions";

export function toggleMagnetMode(player: Player, lvl: number) {
    var levelInformation = DataManager.getData(player, "levelInformation")!;
    if (playerIsInMagnetMode(levelInformation)) endMagnetMode(player, levelInformation);
    else tryStartMagnetMode(player, lvl, levelInformation);
}

function tryStartMagnetMode(player: Player, lvl: number, levelInformation: LevelInformation) {
    GamebandManager.cancelMode(player, levelInformation.currentMode);
    levelInformation = DataManager.getData(player, "levelInformation")!;

    var costPerSecond = Utilities.gamebandInfo.magnetMode[lvl].cost;
    var costPerTick = costPerSecond / 20;
    var energyTracker = DataManager.getData(player, "playerEnergyTracker")!;
    if (energyTracker.energyUnits < costPerTick) {
        player.sendMessage("§cNot enough energy!");
        return;
    }

    var magnetBlock = Utilities.dimensions.overworld.getBlock(new Vector(player.location.x, Utilities.magnetModeMagnetBlocksHeight, player.location.z));
    if (!magnetBlock) return;
    if (magnetBlock.typeId != "minecraft:iron_block") {
        player.sendMessage("§cNothing to grab onto!");
        return;
    }

    levelInformation.currentMode = { "mode": "magnet", "level": lvl };
    levelInformation.information[2].inventory = levelInformation.information[2].inventory.filter((s) => (s.slot != 4));
    levelInformation.information[2].inventory.push({ "slot": 4, "typeId": `theheist:magnet_mode_lvl_${lvl}_enchanted`, "lockMode": "slot" });
    DataManager.setData(player, levelInformation);
    Utilities.reloadPlayerInv(player, levelInformation);
}

function endMagnetMode(player: Player, levelInformation: LevelInformation) {
    if (!playerIsInMagnetMode(levelInformation)) return;
    var magnetModeData = levelInformation.currentMode!;
    player.removeEffect(EffectTypes.get("levitation")!);
    levelInformation.currentMode = null;
    levelInformation.information[2].inventory = levelInformation.information[2].inventory.filter((x) => x.slot != 4);
    levelInformation.information[2].inventory.push({ "slot": 4, "typeId": `theheist:magnet_mode_lvl_${magnetModeData.level}`, "lockMode": "slot" });
    DataManager.setData(player, levelInformation);
    Utilities.reloadPlayerInv(player, levelInformation);
}

export function magnetTick(player: Player, levelInformation: LevelInformation, energyTracker: PlayerEnergyTracker) {
    if (!playerIsInMagnetMode(levelInformation)) return;
    var magnetModeData = levelInformation.currentMode!;
    // Player is currently in magnet mode
    var costPerSecond = Utilities.gamebandInfo.magnetMode[magnetModeData.level].cost;
    var costPerTick = costPerSecond / 20;
    energyTracker.energyUnits -= costPerTick;
    if (energyTracker.energyUnits <= 0) {
        // Player can no longer afford magnet mode
        energyTracker.energyUnits = 0;
        endMagnetMode(player, levelInformation);
        DataManager.setData(player, energyTracker);
        return;
    }
    DataManager.setData(player, energyTracker);

    var magnetBlock = Utilities.dimensions.overworld.getBlock(new Vector(player.location.x, Utilities.magnetModeMagnetBlocksHeight, player.location.z));
    if (!magnetBlock || magnetBlock.typeId == "minecraft:air") {
        endMagnetMode(player, levelInformation);
        return;
    }

    player.addEffect(EffectTypes.get("levitation")!, 10, { 'amplifier': 10, 'showParticles': false });
}

export function playerIsInMagnetMode(levelInformation: LevelInformation) {
    return levelInformation.currentMode?.mode == "magnet";
}