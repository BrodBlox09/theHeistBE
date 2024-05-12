import { MolangVariableMap, BlockPermutation, EffectTypes, Vector3, world, system, Player, EntityInventoryComponent, EffectType, DisplaySlotId, ScoreboardObjective, Container, ItemStack, ItemLockMode, Entity, Dimension, ItemUseAfterEvent } from "@minecraft/server";
import DataManager from "../DataManager";
import Utilities from "../Utilities";
import Vector from "../Vector";

const overworld = Utilities.dimensions.overworld;

export function toggleMagnetMode(player: Player, lvl: number) {
    var levelInformation: LevelInformation = DataManager.getData(player, "levelInformation");
    var currentModes: ModeData[] = levelInformation.currentModes;
    if (currentModes.some((x) => x.mode == "magnet")) endMagnetMode(player, levelInformation);
    else tryStartMagnetMode(player, lvl, levelInformation);
}

function tryStartMagnetMode(player: Player, lvl: number, levelInformation: LevelInformation) {
    var magnetBlock = overworld.getBlock(new Vector(player.location.x, Utilities.magnetModeMagnetBlocksHeight, player.location.z));
    if (!magnetBlock) return;
    if (magnetBlock.typeId == "minecraft:air") {
        player.sendMessage("§4Nothing to grab onto!");
        return;
    }
    levelInformation.currentModes.push({ "mode": "magnet", "level": lvl });
    levelInformation.information[2].inventory = levelInformation.information[2].inventory.filter((s) => (s.slot != 4));
    levelInformation.information[2].inventory.push({ "slot": 4, "typeId": `theheist:magnet_mode_lvl_${lvl}_enchanted`, "lockMode": "slot" });
    DataManager.setData(player, levelInformation);
    Utilities.reloadPlayerInv(player, levelInformation);
}

function clearBarriers(player: Player) {
    overworld.fillBlocks(Vector.v3ToVector(player.location).subtract(new Vector(3, 3, 3)), Vector.v3ToVector(player.location).add(new Vector(3, 3, 3)), "air", {
        "matchingBlock": BlockPermutation.resolve("minecraft:barrier")
    });
}

function endMagnetMode(player: Player, levelInformation: LevelInformation) {
    var currentModes: ModeData[] = levelInformation.currentModes;
    var magnetModeData = currentModes.find((x) => x.mode == "magnet");
    player.removeEffect(EffectTypes.get("levitation")!);
    //clearBarriers(player);
    levelInformation.currentModes = currentModes.filter((x) => x.mode != "magnet");
    levelInformation.information[2].inventory = levelInformation.information[2].inventory.filter((x) => x.slot != 4);
    levelInformation.information[2].inventory.push({ "slot": 4, "typeId": `theheist:magnet_mode_lvl_${magnetModeData!.level}`, "lockMode": "slot" });
    DataManager.setData(player, levelInformation);
    Utilities.reloadPlayerInv(player, levelInformation);
}

export function magnetTick(player: Player, levelInformation: LevelInformation, energyTracker: EnergyTracker) {
    var currentModes: ModeData[] = levelInformation.currentModes;
    var magnetModeData = currentModes.find((x) => x.mode == "magnet");
    if (!magnetModeData) return;
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

    var magnetBlock = overworld.getBlock(new Vector(player.location.x, Utilities.magnetModeMagnetBlocksHeight, player.location.z));
    if (!magnetBlock || magnetBlock.typeId == "minecraft:air") {
        endMagnetMode(player, levelInformation);
        return;
    }

    player.addEffect(EffectTypes.get("levitation")!, 10, { 'amplifier': 10, 'showParticles': false });
    /*clearBarriers(player);
    var belowBlock = overworld.getBlock(player.location)?.below();
    if (belowBlock?.typeId == "minecraft:air") {
        Utilities.setBlock(belowBlock.location, "minecraft:barrier");
    }*/
}

export function playerIsInMagnetMode(levelInformation: LevelInformation) {
    var currentModes: ModeData[] = levelInformation.currentModes;
    return currentModes.some((x) => x.mode == "magnet");
}