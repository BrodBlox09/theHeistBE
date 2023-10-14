import { MolangVariableMap, BlockPermutation, EffectTypes, Vector, world, system, DisplaySlotId } from "@minecraft/server";
import * as dataManager from "./imports/entity_dynamic_properties";
import Utilities from "./Utilities";
class loreItem {
    constructor(id, nameTag, lore) {
        this.id = id;
        this.nameTag = nameTag;
        this.lore = lore;
    }
}
const loreItems = [
    new loreItem("theheist:recharge_mode_lvl_1", "§1Recharge mode Lvl. 1", ["Right click/long press/RT to §r§6toggle", "Energy: 10 units/second", "Select to show objectives"]),
    new loreItem("theheist:hacking_mode_lvl_1", "§2Hacking mode Lvl. 1", ["Right click/long press/RT to §r§6use", "Energy: 15 units"])
];
const gamebandInfo = {
    "rechargeMode": {
        "level1Speed": 10.0,
        "level1Max": 100.0
    },
    "hackingMode": {
        "level1Cost": 15
    }
};
const objectivesObjective = world.scoreboard.getObjective("objectives");
const bustedCounterObjective = world.scoreboard.getObjective("bustedCounter");
const levelMapHeight = 20;
const consolesHeight = -15;
const rechargeHeight = -20;
const cameraHeight = -25;
const cameraMappingHeight = -30;
const SECOND = 20;
const overworld = world.getDimension("overworld");
world.afterEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const rot = player.getRotation().x;
    const text = event.itemStack.typeId;
    if (!["theheist:recharge_mode_lvl_1", "theheist:hacking_mode_lvl_1", "minecraft:red_dye", "minecraft:yellow_dye", "minecraft:green_dye", "minecraft:paper"].includes(text))
        return;
    let keycardType;
    switch (text) {
        case "theheist:recharge_mode_lvl_1":
            rechargeMode(1, player);
            break;
        case "theheist:hacking_mode_lvl_1":
            hackingMode(1, player);
            break;
        case "minecraft:red_dye":
            console.warn("r");
            keycardType = "red";
        case "minecraft:yellow_dye":
            console.warn("y");
            if (!keycardType)
                keycardType = "yellow";
        case "minecraft:green_dye":
            console.warn("g");
            if (!keycardType)
                keycardType = "green";
        case "minecraft:paper":
            console.warn("p");
            if (!keycardType)
                keycardType = "all";
    }
    keycard(keycardType, player);
});
function rechargeMode(lvl, player) {
    const query = {
        "type": "armor_stand",
        "location": new Vector(player.location.x, rechargeHeight, player.location.z),
        "maxDistance": 2,
        "closest": 1
    };
    const armorStands = overworld.getEntities(query);
    for (const armorStand of armorStands) {
        var armorStandEnergyTrackerDataNode = dataManager.getData(armorStand, "energyTracker");
        var playerEnergyTrackerDataNode = dataManager.getData(player, "energyTracker");
        var blockLocation = { "x": armorStandEnergyTrackerDataNode.block.x, "y": armorStandEnergyTrackerDataNode.block.y, "z": armorStandEnergyTrackerDataNode.block.z };
        if (playerEnergyTrackerDataNode.recharging == false) {
            if (armorStandEnergyTrackerDataNode.energyUnits == 0.0)
                return;
            playerEnergyTrackerDataNode.recharging = true;
            player.playSound('map.recharge_use', { "volume": 0.5 });
            Utilities.setBlock(blockLocation, "theheist:recharge_station", { "theheist:rotation": armorStandEnergyTrackerDataNode.block.rotation, "theheist:state": 2 });
            playerEnergyTrackerDataNode.usingRechargerID = armorStandEnergyTrackerDataNode.rechargerID;
        }
        else {
            playerEnergyTrackerDataNode.recharging = false;
            Utilities.setBlock(blockLocation, "theheist:recharge_station", { "theheist:rotation": armorStandEnergyTrackerDataNode.block.rotation, "theheist:state": 1 });
            playerEnergyTrackerDataNode.usingRechargerID = -1;
        }
        dataManager.setData(player, "energyTracker", playerEnergyTrackerDataNode);
    }
}
function hackingMode(lvl, player) {
    var playerEnergyTracker = dataManager.getData(player, "energyTracker");
    const query = {
        "type": "armor_stand",
        "location": new Vector(player.location.x, consolesHeight, player.location.z),
        "maxDistance": 2,
        "closest": 1
    };
    const armorStands = overworld.getEntities(query);
    var i = 0;
    for (const armorStand of armorStands) {
        i++;
        var armorStandActionTracker = dataManager.getData(armorStand, 'actionTracker');
        if (armorStandActionTracker.used == true || armorStandActionTracker.isKeycardReader) {
            i--;
            return;
        }
        if (armorStandActionTracker.level <= lvl) {
            if (gamebandInfo["hackingMode"]["level" + lvl + "Cost"] > playerEnergyTracker.energyUnits) {
                player.sendMessage("§cNot enough energy!");
                return;
            }
            player.playSound('map.hack_use');
            playerEnergyTracker.energyUnits -= gamebandInfo["hackingMode"]["level" + lvl + "Cost"];
            dataManager.setData(player, "energyTracker", playerEnergyTracker);
            armorStandActionTracker.actions.forEach((x) => {
                if (!x.delay) {
                    action(x, player);
                }
                else {
                    system.runTimeout(() => {
                        action(x, player);
                    }, x.delay);
                }
            });
            armorStandActionTracker.used = true;
            dataManager.setData(armorStand, "actionTracker", armorStandActionTracker);
        }
        else {
            player.sendMessage("§cConsole is too complicated");
            return;
        }
    }
    if (i == 0) {
        player.sendMessage("§cNo console");
        return;
    }
}
function action(actionInfo, player) {
    switch (actionInfo.type) {
        case "slideshow":
            var slideshowID = actionInfo.do;
            startSlideshow(slideshowID, player);
            break;
        case "set_block":
            var x = actionInfo.do.x;
            var y = actionInfo.do.y;
            var z = actionInfo.do.z;
            var block = actionInfo.do.block;
            var permutations = actionInfo.do.permutations;
            overworld.runCommandAsync(`setBlock ${x} ${y} ${z} ${block} ${permutations}`);
            break;
        case "disable_camera":
            player.playSound('map.disable');
            var cameraID = actionInfo.do.cameraID;
            var cameraQuery = {
                "type": "armor_stand",
                "location": { 'x': player.location.x, 'y': cameraHeight, 'z': player.location.z },
                "maxDistance": 50
            };
            var cameraArmorStand = overworld.getEntities(cameraQuery).filter((x) => {
                var cameraTrackerDataNode = dataManager.getData(x, "cameraTracker");
                return (x.location.y == cameraHeight && cameraTrackerDataNode && cameraTrackerDataNode.disabled == false && cameraTrackerDataNode.cameraID == cameraID);
            })[0];
            if (cameraArmorStand == undefined)
                return;
            var cameraTrackerDataNode = dataManager.getData(cameraArmorStand, "cameraTracker");
            cameraTrackerDataNode.disabled = true;
            dataManager.setData(cameraArmorStand, "cameraTracker", cameraTrackerDataNode);
            console.warn(cameraArmorStand.location.x.toString());
            var displayCameraLocation = { "x": cameraArmorStand.location.x, "y": -57, "z": cameraArmorStand.location.z };
            var displayCameraQuery = {
                "type": "theheist:camera",
                "location": displayCameraLocation,
                "maxDistance": 1
            };
            var displayCamera = overworld.getEntities(displayCameraQuery)[0];
            displayCamera.triggerEvent("theheist:disable");
            player.sendMessage([{ "translate": `map.console.camera` }]);
            var maxParticles = 10;
            var radius = 0.4;
            for (var i = 0; i < maxParticles; i++) {
                const x = displayCameraLocation.x + ((Utilities.cos(360 * (i / maxParticles)) * radius));
                const y = displayCameraLocation.y + 0.5;
                const z = displayCameraLocation.z + ((Utilities.sin(360 * (i / maxParticles)) * radius));
                try {
                    overworld.spawnParticle("minecraft:explosion_particle", { "x": x, "y": y, "z": z }, new MolangVariableMap());
                }
                catch (err) { }
            }
            break;
        case "voice_says":
            var soundID = actionInfo.do.soundID;
            player.playSound(`map.${soundID}`);
            player.sendMessage([{ "text": "§5§oVoice:§r " }, { "translate": `map.sub.${soundID}` }]);
            break;
        case "run_command":
            var command = actionInfo.do.command;
            overworld.runCommandAsync(command);
            break;
        case "hack_console":
            var x = actionInfo.do.x;
            var z = actionInfo.do.z;
            var query = {
                "type": "armor_stand",
                "location": new Vector(x, consolesHeight, z),
                "maxDistance": 2,
                "closest": 1
            };
            var armorStand = overworld.getEntities(query)[0];
            var actionTracker = dataManager.getData(armorStand, "actionTracker");
            actionTracker.actions.forEach((x) => {
                if (x.type == "hack_console")
                    return;
                if (!x.delay) {
                    action(x, player);
                }
                else {
                    system.runTimeout(() => {
                        action(x, player);
                    }, x.delay);
                }
            });
            actionTracker.used = true;
            dataManager.setData(armorStand, "actionTracker", actionTracker);
            break;
        case "display_mail":
            var mailID = actionInfo.do.mailID;
            player.sendMessage([{ "text": "§c§oEmail:§r " }, { "translate": `map.mail.${mailID}` }]);
            break;
        case "set_alarm_level":
            var lvlInfo = dataManager.getData(player, "levelInformation");
            lvlInfo.information[0].level = actionInfo.do.value;
            dataManager.setData(player, "levelInformation", lvlInfo);
            break;
        case "manage_objectives":
            var manageType = actionInfo.do.manageType;
            switch (manageType) {
                case 1:
                    var objective = actionInfo.do.objective;
                    var sortOrder = actionInfo.do.sortOrder;
                    objectivesObjective.setScore(`§c${objective}§r`, sortOrder);
                    player.sendMessage([{ "text": `§o§7New objective: §r§c${objective}§r` }]);
                    reloadSidebarDisplay();
                    break;
                case 2:
                    var objective = actionInfo.do.objective;
                    var sortOrder = actionInfo.do.sortOrder;
                    objectivesObjective.removeParticipant(`§c${objective}§r`);
                    objectivesObjective.setScore(`§a${objective}§r`, sortOrder);
                    player.sendMessage([{ "text": `§o§7Completed objective: §r§a${objective}§r` }]);
                    reloadSidebarDisplay();
                    break;
                case 3:
                    var objective = actionInfo.do.objective;
                    objectivesObjective.removeParticipant(`§c${objective}§r`);
                    objectivesObjective.removeParticipant(`§a${objective}§r`);
                    reloadSidebarDisplay();
                    break;
            }
    }
}
function keycard(keycardType, player) {
    var playerHeadLocation = player.getHeadLocation();
    var blockRaycastHit = overworld.getBlockFromRay(new Vector(playerHeadLocation.x, playerHeadLocation.y + 0.1, playerHeadLocation.z), player.getViewDirection(), { maxDistance: 2 });
    if (!blockRaycastHit)
        return;
    var block = blockRaycastHit.block;
    if (block.typeId != "theheist:keycard_reader")
        return;
    var query = {
        "type": "armor_stand",
        "location": { 'x': block.location.x, 'y': consolesHeight, 'z': block.location.z },
        "maxDistance": 2,
        "closest": 1
    };
    var armorStand = overworld.getEntities(query)[0];
    if (!armorStand)
        return;
    var actionTracker = dataManager.getData(armorStand, "actionTracker");
    console.warn("a");
    if (!actionTracker || !actionTracker.isKeycardReader || actionTracker.used == true || (actionTracker.keycardType != keycardType && keycardType != "all"))
        return;
    console.warn("b");
    actionTracker.actions.forEach((x) => {
        if (!x.delay) {
            action(x, player);
        }
        else {
            system.runTimeout(() => {
                action(x, player);
            }, x.delay);
        }
    });
}
function reloadSidebarDisplay() {
    world.scoreboard.clearObjectiveAtDisplaySlot(DisplaySlotId.Sidebar);
    world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, { "objective": objectivesObjective });
}
function startSlideshow(slideshowID, player) {
    switch (slideshowID) {
        case 1:
            const playerInvContainer = player.getComponent('inventory').container;
            playerInvContainer.clearAll();
            player.playSound('map.001');
            player.runCommandAsync('tellraw @a {"rawtext":[{"text":"§5§oVoice:§r "}, {"translate":"map.sub.001.A"}]}');
            player.runCommandAsync('tellraw @a {"rawtext":[{"text":"§5§oVoice:§r "}, {"translate":"map.sub.001.B"}]}');
            player.runCommandAsync('replaceitem entity @s slot.armor.head 0 carved_pumpkin');
            let tpInterval;
            tpInterval = system.runInterval(() => {
                player.teleport({ 'x': 1030.50, 'y': -59.00, 'z': 107.50 }, { 'dimension': overworld, 'rotation': { 'x': 0, 'y': 180 } });
            });
            system.runTimeout(() => {
                system.clearRun(tpInterval);
                tpInterval = system.runInterval(() => {
                    player.teleport({ 'x': 1031.50, 'y': -59.00, 'z': 88.50 }, { 'dimension': overworld, 'rotation': { 'x': -30, 'y': 125 } });
                });
            }, SECOND * 5);
            system.runTimeout(() => {
                system.clearRun(tpInterval);
                tpInterval = system.runInterval(() => {
                    player.teleport({ 'x': 1027.50, 'y': -59.00, 'z': 68.50 }, { 'dimension': overworld, 'rotation': { 'x': 0, 'y': 135 } });
                });
            }, SECOND * 13);
            system.runTimeout(() => {
                system.clearRun(tpInterval);
                tpInterval = system.runInterval(() => {
                    player.teleport({ 'x': 1017.50, 'y': -59.00, 'z': 56.50 }, { 'dimension': overworld, 'rotation': { 'x': -25, 'y': 80 } });
                });
            }, SECOND * 22);
            system.runTimeout(() => {
                system.clearRun(tpInterval);
                overworld.runCommandAsync("scriptevent theheist:load-level 0-1");
                player.runCommandAsync('replaceitem entity @s slot.armor.head 0 air');
            }, SECOND * 30.5);
            break;
    }
}
function playerBusted(player, currentLevel) {
    var _a;
    switch (currentLevel) {
        case 0:
            var playerLevelInformation = dataManager.getData(player, "levelInformation");
            bustedCounterObjective.setScore(player, ((_a = bustedCounterObjective.getScore(player)) !== null && _a !== void 0 ? _a : 0) + 1);
            playerLevelInformation.information[0].level = 0;
            dataManager.setData(player, "levelInformation", playerLevelInformation);
            player.playSound("map.alarm");
            player.addTag("BUSTED");
            player.getComponent("inventory").container.clearAll();
            overworld.fillBlocks({ "x": 2029.50, "y": -59.00, "z": 56.50 }, { "x": 2029.50, "y": -59.00, "z": 61.50 }, BlockPermutation.resolve("minecraft:air"));
            system.runTimeout(() => {
                player.runCommandAsync('stopsound @s');
                player.teleport({ "x": 2037.5, "y": -59, "z": 59.5 });
                player.sendMessage(`You got busted §c§l${bustedCounterObjective.getScore(player)}§r time(s)`);
            }, SECOND * 3);
            system.runTimeout(() => {
                player.removeTag("BUSTED");
                overworld.runCommandAsync('scriptevent theheist:load-level 0-2');
            }, SECOND * (3 + 5));
            break;
    }
}
system.runInterval(() => {
    const player = world.getPlayers().filter((x) => (x != undefined && x != null))[0];
    if (player == undefined)
        return;
    const saturation = EffectTypes.get('saturation');
    const nightVision = EffectTypes.get('night_vision');
    const resistance = EffectTypes.get('resistance');
    player.addEffect(saturation, 2000, { 'amplifier': 1, 'showParticles': false });
    player.addEffect(nightVision, 2000, { 'amplifier': 1, 'showParticles': false });
    player.addEffect(resistance, 2000, { 'amplifier': 1, 'showParticles': false });
    const playerInvContainer = player.getComponent('inventory').container;
    for (let i = 0; i < playerInvContainer.size; i++) {
        const item = playerInvContainer.getItem(i);
        if (!item || !item.getLore())
            continue;
        const foundItem = loreItems.find(x => x.id == item.typeId);
        try {
            item.setLore(foundItem.lore);
            item.nameTag = foundItem.nameTag;
        }
        catch (err) {
            continue;
        }
        playerInvContainer.setItem(i, item);
    }
    var selectedItemStack = playerInvContainer.getItem(player.selectedSlot);
    if (selectedItemStack != undefined && selectedItemStack.typeId.startsWith("theheist:recharge_mode_lvl_")) {
        if (world.scoreboard.getObjectiveAtDisplaySlot(DisplaySlotId.Sidebar) == undefined)
            world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, { "objective": objectivesObjective });
    }
    else {
        if (world.scoreboard.getObjectiveAtDisplaySlot(DisplaySlotId.Sidebar) != undefined)
            world.scoreboard.clearObjectiveAtDisplaySlot(DisplaySlotId.Sidebar);
    }
    var playerEnergyTracker = dataManager.getData(player, "energyTracker");
    console.log((playerEnergyTracker));
    var playerLevelInformation = dataManager.getData(player, "levelInformation");
    if ((playerEnergyTracker && playerEnergyTracker.energyUnits != player.level) || (playerLevelInformation && player.xpEarnedAtCurrentLevel != ((((playerLevelInformation.information[0].level / 100) - 0.06) * 742) + 41))) {
        player.resetLevel();
        player.addLevels(100);
        var alarmLvlXpVal = (((playerLevelInformation.information[0].level / 100) - 0.06) * 742) + 41;
        player.addExperience(alarmLvlXpVal);
        player.addLevels(-100);
        player.addLevels(Math.floor(playerEnergyTracker.energyUnits));
        if (playerLevelInformation.information[0].level >= 100) {
            playerBusted(player, playerLevelInformation.information[1].level);
        }
    }
    if (playerEnergyTracker && playerEnergyTracker.recharging == true) {
        const query = {
            "type": "armor_stand",
            "location": { 'x': player.location.x, 'y': rechargeHeight, 'z': player.location.z },
            "maxDistance": 2
        };
        const armorStands = overworld.getEntities(query);
        var i = 0;
        for (const armorStand of armorStands) {
            var armorStandEnergyTracker = dataManager.getData(armorStand, "energyTracker");
            if (armorStandEnergyTracker.rechargerID != playerEnergyTracker.usingRechargerID)
                continue;
            i++;
        }
        if (i == 0) {
            playerEnergyTracker.recharging = false;
            console.warn('Out of recharge mode range!');
            const subQuery = {
                "type": "armor_stand",
                "location": { 'x': player.location.x, 'y': rechargeHeight, 'z': player.location.z },
                "maxDistance": 4
            };
            const subArmorStands = overworld.getEntities(subQuery);
            for (const subArmorStand of subArmorStands) {
                var armorStandEnergyTracker = dataManager.getData(subArmorStand, "energyTracker");
                if (armorStandEnergyTracker.rechargerID != playerEnergyTracker.usingRechargerID)
                    continue;
                overworld.runCommandAsync(`setBlock ${armorStandEnergyTracker.block.x} ${armorStandEnergyTracker.block.y} ${armorStandEnergyTracker.block.z} theheist:recharge_station ["theheist:rotation":${armorStandEnergyTracker.block.rotation}, "theheist:state":1]`);
                playerEnergyTracker.usingRechargerID = -1;
            }
        }
        else if (playerEnergyTracker.energyUnits < gamebandInfo.rechargeMode["level" + playerEnergyTracker.rechargeLevel + "Max"]) {
            var addEnergy = 0.0;
            switch (playerEnergyTracker.rechargeLevel) {
                case 1:
                    addEnergy = gamebandInfo.rechargeMode.level1Speed;
                    break;
            }
            addEnergy /= 20;
            addEnergy = Math.min(addEnergy, gamebandInfo.rechargeMode["level" + playerEnergyTracker.rechargeLevel + "Max"]);
            playerEnergyTracker.energyUnits += addEnergy;
            for (const armorStand of armorStands) {
                var armorStandEnergyTracker = dataManager.getData(armorStand, "energyTracker");
                if (armorStandEnergyTracker.rechargerID != playerEnergyTracker.usingRechargerID)
                    continue;
                armorStandEnergyTracker.energyUnits -= addEnergy;
                if (armorStandEnergyTracker.energyUnits <= 0) {
                    var diff = Math.abs(armorStandEnergyTracker.energyUnits);
                    playerEnergyTracker.energyUnits -= diff;
                    armorStandEnergyTracker.energyUnits = 0;
                    overworld.runCommandAsync(`setBlock ${armorStandEnergyTracker.block.x} ${armorStandEnergyTracker.block.y} ${armorStandEnergyTracker.block.z} theheist:recharge_station ["theheist:rotation":${armorStandEnergyTracker.block.rotation}, "theheist:state":3]`);
                    playerEnergyTracker.recharging = false;
                    playerEnergyTracker.usingRechargerID = -1;
                    if (armorStandEnergyTracker.actions) {
                        armorStandEnergyTracker.actions.forEach((x) => {
                            action(x, player);
                        });
                    }
                }
                dataManager.setData(armorStand, "energyTracker", armorStandEnergyTracker);
            }
        }
        dataManager.setData(player, "energyTracker", playerEnergyTracker);
    }
    const playerRotX = player.getRotation().x;
    if (playerRotX < 90 && playerRotX > 80) {
        for (let i = 0; i < playerInvContainer.size; i++) {
            const itemStack = playerInvContainer.getItem(i);
        }
    }
});
