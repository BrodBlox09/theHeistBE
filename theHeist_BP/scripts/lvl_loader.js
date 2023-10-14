//import { BlockLocation, ItemStack, ItemType, Location, EffectTypes, system, Vector, world } from "mojang-minecraft";
import { ItemStack, EffectTypes, Vector, system, world } from "@minecraft/server";
import * as dataManager from "imports/entity_dynamic_properties.js";

// Tag length is max 255, need a different way to store lvl information other than tags :(
// Perhaps similar to how I stored information in the item speedrun thing
// The above worked! Dynamic properties for the win!

// Hack delay: 2 seconds or 40 ticks

/**
 * Base player energy tracker data node:
   {
    "name": "energyTracker",
    "energyUnits": gamebandInfo.rechargeMode.level#Max,
    "recharging": false,
    "usingRechargerID": -1,
    "rechargeLevel": #
   }
 * Base player level information data node:
   {
        "name":"levelInformation",
        "information": [
            {
                "name":"alarmLevel",
                "level":0
            }
        ]
    }
 * Base energy tracker data node:
   {
        "name": "energyTracker",
        "rechargerID": #,
        "energyUnits": 100.0,
        "block": {"x": #, "y": #, "z": #, "rotation": #},
        "actions":[]
    }
 * Base camera tracker data node:
    {
        "name": "cameraTracker",
        "isRobot": false,
        "rotation": #,
        "swing": [#, #] or null,
        "disabled": false,
        "cameraID": #,
        "type": "camera"|"sonar"
    }
 */

//var e = 

/**
 * Layer information:
 * 20: Level map
 * 0: Hackable consoles
 * -5: Recharge stations
 * -10: Cameras, sonars, and robots
 * -15: Cameras and sonars mappout area
 */

const levelMapHeight = 20;
const consolesHeight = -15;
const rechargeHeight = -20;
const cameraHeight = -25;
const cameraMappingHeight = -30;
const levelHeight = -59;

// Second in ticks
const SECOND = 20;

const objectivesObjective = world.scoreboard.getObjective("objectives");
const bustedCounterObjective = world.scoreboard.getObjective("bustedCounter");

const overworld = world.getDimension("overworld");

system.afterEvents.scriptEventReceive.subscribe((event) => {
    var id = event.id;
    var msg = event.message;
    switch (id) {
        case "theheist:load-level":
            var entities = overworld.getEntities();
            for (const entity of entities) {
                if (entity.typeId != "minecraft:player") entity.kill();
            }
            switch (msg) {
                case "1-1":
                    // Load level 1 (The van tutorial level)
                    // Load player
                    var player = world.getPlayers().filter((x) => (x != undefined && x != null))[0];
                    if (player == undefined) return;
                    // Clear all data on player
                    dataManager.clearData(player);
                    player.getTags().forEach((x) => { player.removeTag(x); });
                    // Add energyTracker data node
                    var playerDataNode = { "name": "energyTracker", "energyUnits": 0.0, "recharging": false, "usingRechargerID": -1, "rechargeLevel": 1 };
                    dataManager.setData(player, "energyTracker", playerDataNode);
                    // Add level information data node
                    var playerDataNode = { "name": "levelInformation", "information": [{ "name": "alarmLevel", "level": 0 }, { "name": "gameLevel", "level": 1 }] };
                    dataManager.setData(player, "levelInformation", playerDataNode);
                    // Clear and setup inventory for game
                    var playerInvContainer = player.getComponent('inventory').container;
                    playerInvContainer.clearAll();
                    player.runCommandAsync('replaceitem entity @s slot.hotbar 0 theheist:recharge_mode_lvl_1');
                    player.runCommandAsync('replaceitem entity @s slot.hotbar 1 theheist:hacking_mode_lvl_1');
                    player.teleport({ 'x': -22.5, 'y': -59, 'z': 61.5 }, { 'dimension': overworld, 'rotation': { 'x': 0, 'y': -90 } });

                    // Setup starting objectives
                    clearObjectives();
                    addUnfinishedObjective("Recharge Gameband", 1);
                    addUnfinishedObjective("Activate Slideshow", 0);
                    reloadSidebarDisplay();
                    // Load recharge station 0
                    var recharge0 = overworld.spawnEntity("minecraft:armor_stand", new Vector(-21.5, rechargeHeight, 62.5));
                    //recharge0.setRotation(0, n);
                    // Use for cameras that need to be facing different directions than north (I think)
                    var recharge0DataNode = {"name": "energyTracker", "rechargerID": 0, "energyUnits": 21.0, "block": {"x": -22, "y": -59, "z": 62, "rotation": 5}, "actions":[{"type": "manage_objectives", "do": {"manageType": 2, "objective": "Recharge Gameband", "sortOrder": 1}}]};
                    dataManager.setData(recharge0, "energyTracker", recharge0DataNode);
                    overworld.runCommandAsync('setblock -22 -59 62 theheist:recharge_station ["theheist:rotation":5, "theheist:state":1]');
                    // Load hackable console 0
                    var computer0 = overworld.spawnEntity("minecraft:armor_stand", new Vector(-21.5, consolesHeight, 58.5));
                    var computer0DataNode = {
                        "name": "actionTracker",
                        "used": false,
                        "level": 1,
                        "actions": [
                            {
                                "type": "set_block", "do": { "x": -22, "y": -58, "z": 58, "block": "theheist:computer", "permutations": '["theheist:rotation":5, "theheist:unlocked":1]' }
                            },
                            {
                                "type": "set_block", "do": { "x": -22, "y": -58, "z": 58, "block": "theheist:computer", "permutations": '["theheist:rotation":5, "theheist:unlocked":2]' }, "delay": 40
                            },
                            {
                                "type": "manage_objectives", "do": {"manageType": 2, "objective": "Activate Slideshow", "sortOrder": 0}, "delay": 40
                            },
                            {
                                "type": "slideshow", "do": 1, "delay": 44
                            }
                        ]
                    };
                    dataManager.setData(computer0, "actionTracker", computer0DataNode);
                    // 2 seconds or 2000 milliseconds for static, then green and action!
                    overworld.runCommandAsync('setblock -22 -58 58 theheist:computer ["theheist:rotation":5, "theheist:unlocked":0]');
                    break;
                case "0-1":
                    // Load level 0.5 (The vent intro level)
                    // Load player
                    var player = world.getPlayers().filter((x) => (x != undefined && x != null))[0];
                    if (player == undefined) return;
                    // Clear all data on player
                    dataManager.clearData(player);
                    player.getTags().forEach((x) => { player.removeTag(x); });
                    // Add energyTracker data
                    var playerDataNode = { "name": "energyTracker", "energyUnits": 0.0, "recharging": false, "rechargeLevel": 1 };
                    dataManager.setData(player, "energyTracker", playerDataNode);
                    var playerDataNode = { "name": "levelInformation", "information": [{ "name": "alarmLevel", "level": 0 }, { "name": "gameLevel", "level": 0.5 }] };
                    dataManager.setData(player, "levelInformation", playerDataNode);
                    // Clear and setup inventory for game
                    var playerInvContainer = player.getComponent('inventory').container;
                    playerInvContainer.clearAll();
                    player.runCommandAsync('replaceitem entity @s slot.hotbar 0 theheist:recharge_mode_lvl_1');
                    player.runCommandAsync('replaceitem entity @s slot.hotbar 1 theheist:hacking_mode_lvl_1');
                    // set title options uses ticks instead of seconds now
                    player.onScreenDisplay.setTitle("§o§7Outside the HQ", { "fadeInDuration": 20, "fadeOutDuration": 20, "stayDuration": 160 });
                    player.teleport({ 'x': 1000.5, 'y': -59, 'z': 57.5 }, { 'dimension': overworld, 'rotation': { 'x': 0, 'y': 90 } });
                    clearObjectives();
                    addUnfinishedObjective("Get into the building", 0);
                    reloadSidebarDisplay();
                    //overworld.runCommandAsync("tp @a 1000 -59 57 90 0");
                    break;
                case "0-2":
                    // Load level 0 (The first level)
                    var player = world.getPlayers().filter((x) => (x != undefined && x != null))[0];
                    if (player == undefined) {
                        world.sendMessage("Could not find player");
                        return;
                    }
                    // Clear all data on player
                    dataManager.clearData(player);
                    // Previous level made use of tags, clear them here
                    player.getTags().forEach((x) => { player.removeTag(x); });
                    // Add energyTracker data
                    var playerDataNode = { "name": "energyTracker", "energyUnits": 100.0, "recharging": false, "rechargeLevel": 1 };
                    dataManager.setData(player, "energyTracker", playerDataNode);

                    if (!bustedCounterObjective.hasParticipant(player)) {
                        bustedCounterObjective.setScore(player, 0);
                    }
                    var playerDataNode = { "name": "levelInformation", "information": [{ "name": "alarmLevel", "level": 0 }, { "name": "gameLevel", "level": 0 }, { "name": "bustedCounter", "value": bustedCounterObjective.getScore(player) }] };

                    //if (previousPlayerLevelInformation != undefined && previousPlayerLevelInformation.information[1].level != 0) var playerDataNode = { "name": "levelInformation", "information": [{ "name": "alarmLevel", "level": 0 }, { "name": "gameLevel", "level": 0 }, { "name": "bustedCounter", "value": 0 }] };
                    //else if (previousPlayerLevelInformation != undefined) var playerDataNode = { "name": "levelInformation", "information": [{ "name": "alarmLevel", "level": 0 }, { "name": "gameLevel", "level": 0 }, { "name": "bustedCounter", "value": previousPlayerLevelInformation.information[2].value }] };
                    
                    dataManager.setData(player, "levelInformation", playerDataNode);
                    // Clear and setup inventory for game
                    var playerInvContainer = player.getComponent('inventory').container;
                    playerInvContainer.clearAll();
                    player.runCommandAsync('replaceitem entity @s slot.hotbar 0 theheist:recharge_mode_lvl_1');
                    player.runCommandAsync('replaceitem entity @s slot.hotbar 1 theheist:hacking_mode_lvl_1');
                    player.onScreenDisplay.setTitle("§o§7Level 0", { "fadeInDuration": 20, "fadeOutDuration": 20, "stayDuration": 160 });
                    // Player is in hatch, play appropriate sound files, send message, and teleport player to level pre-hatch //180 y turn
                    clearObjectives();
                    reloadSidebarDisplay();

                    player.teleport({ 'x': 2013.5, 'y': -52, 'z': 53.5 }, { 'dimension': overworld, 'rotation': { 'x': 0, 'y': 90 } });
                    system.runTimeout(() => {player.playSound("map.003");}, 1);
                    player.runCommandAsync('tellraw @a {"rawtext":[{"text":"§5§oVoice:§r "}, {"translate":"map.sub.003"}]}');

                    system.runTimeout(() => {
                        // Load level and send player
                        // Kill all entities
                        var entities = overworld.getEntities();
                        for (const entity of entities) {
                            if (entity.typeId != "minecraft:player") entity.kill();
                        }
                        //#region Setup cameras
                        // Camera 0
                        var camera0 = overworld.spawnEntity("armor_stand", {"x": 2014.5, "y": cameraHeight, "z": 51.5});
                        camera0.setRotation({"x": 0, "y": 10});
                        overworld.spawnEntity("theheist:camera", {"x": 2014.5, "y": -57, "z": 51.5}).setRotation({"x": 0, "y": 10});
                        var camera0DataNode = {
                            "name": "cameraTracker",
                            "isRobot": false,
                            "rotation": 10,
                            "disabled": false,
                            "cameraID": 0,
                            "type": "camera"
                        };
                        dataManager.setData(camera0, "cameraTracker", camera0DataNode);
                        // Camera 1
                        var camera1 = overworld.spawnEntity("armor_stand", {"x": 2005.5, "y": cameraHeight, "z": 52.5});
                        camera1.setRotation({"x": 0, "y": 150});
                        overworld.spawnEntity("theheist:camera", {"x": 2005.5, "y": -57, "z": 52.5}).setRotation({"x": 0, "y": 150});
                        var camera1DataNode = {
                            "name": "cameraTracker",
                            "isRobot": false,
                            "rotation": 150,
                            "disabled": false,
                            "cameraID": 1,
                            "type": "camera"
                        };
                        dataManager.setData(camera1, "cameraTracker", camera1DataNode);
                        // Camera 2
                        var camera2 = overworld.spawnEntity("armor_stand", {"x": 1991.5, "y": cameraHeight, "z": 52.5});
                        camera2.setRotation({"x": 0, "y": 210});
                        overworld.spawnEntity("theheist:camera", {"x": 1991.5, "y": -57, "z": 52.5}).setRotation({"x": 0, "y": 210});
                        var camera2DataNode = {
                            "name": "cameraTracker",
                            "isRobot": false,
                            "rotation": 210,
                            "disabled": false,
                            "cameraID": 2,
                            "type": "camera"
                        };
                        dataManager.setData(camera2, "cameraTracker", camera2DataNode);
                        // Camera 3
                        var camera3 = overworld.spawnEntity("armor_stand", {"x": 2014.5, "y": cameraHeight, "z": 67.5});
                        camera3.setRotation({"x": 0, "y": 100});
                        overworld.spawnEntity("theheist:camera", {"x": 2014.5, "y": -57, "z": 67.5}).setRotation({"x": 0, "y": 100});
                        var camera3DataNode = {
                            "name": "cameraTracker",
                            "isRobot": false,
                            "rotation": 100,
                            "disabled": false,
                            "cameraID": 3,
                            "type": "camera"
                        };
                        dataManager.setData(camera3, "cameraTracker", camera3DataNode);
                        // Camera 4
                        var camera4 = overworld.spawnEntity("armor_stand", {"x": 2010.5, "y": cameraHeight, "z": 76.5});
                        camera4.setRotation({"x": 4, "y": 190});
                        overworld.spawnEntity("theheist:camera", {"x": 2010.5, "y": -57, "z": 76.5}).setRotation({"x": 0, "y": 190});
                        var camera4DataNode = {
                            "name": "cameraTracker",
                            "isRobot": false,
                            "rotation": 190,
                            "disabled": false,
                            "cameraID": 4,
                            "type": "camera"
                        };
                        dataManager.setData(camera4, "cameraTracker", camera4DataNode);
                        // Camera 5
                        var camera5 = overworld.spawnEntity("armor_stand", {"x": 1992.5, "y": cameraHeight, "z": 59.5});
                        camera5.setRotation({"x": 0, "y": 20});
                        overworld.spawnEntity("theheist:camera", {"x": 1992.5, "y": -57, "z": 59.5}).setRotation({"x": 0, "y": 20});
                        var camera5DataNode = {
                            "name": "cameraTracker",
                            "isRobot": false,
                            "rotation": 20,
                            "swivel": [1, 20, 140],
                            "disabled": false,
                            "cameraID": 5,
                            "type": "camera"
                        };
                        dataManager.setData(camera5, "cameraTracker", camera5DataNode);
                        //#endregion
                        //#region Setup consoles
                        // Console 0 (Type: Computer)
                        var console0 = overworld.spawnEntity("armor_stand", {"x": 2020.5, "y": consolesHeight, "z": 54.5});
                        overworld.runCommandAsync('setblock 2020 -58 54 theheist:computer ["theheist:rotation":5]');
                        var console0ActionTracker = {
                            "name": "actionTracker",
                            "used": false,
                            "level": 1,
                            "actions": [
                                {
                                    "type": "set_block", "do": { "x": 2020, "y": -58, "z": 54, "block": "theheist:computer", "permutations": '["theheist:rotation":5, "theheist:unlocked":1]' }
                                },
                                {
                                    "type": "set_block", "do": { "x": 2020, "y": -58, "z": 54, "block": "theheist:computer", "permutations": '["theheist:rotation":5, "theheist:unlocked":2]' }, "delay": 40
                                },
                                {
                                    "type": "disable_camera", "do": { "cameraID": 0 }, "delay": 40
                                },
                                {
                                    "type": "voice_says", "do": { "soundID": "103" }, "delay": 40
                                },
                                {
                                    "type": "manage_objectives", "do": { "manageType": 1, "objective": "Break into Director's office", "sortOrder": 0 }, "delay": 40
                                }
                            ]
                        };
                        dataManager.setData(console0, "actionTracker", console0ActionTracker);
                        // Console 1 (Type: Computer)
                        var console1 = overworld.spawnEntity("armor_stand", {"x": 2017.5, "y": consolesHeight, "z": 52.5});
                        overworld.runCommandAsync('setblock 2017 -58 52 theheist:computer ["theheist:rotation":2]');
                        var console1ActionTracker = {
                            "name": "actionTracker",
                            "used": false,
                            "level": 1,
                            "actions": [
                                {
                                    "type": "set_block", "do": { "x": 2017, "y": -58, "z": 52, "block": "theheist:computer", "permutations": '["theheist:rotation":2, "theheist:unlocked":1]' }
                                },
                                {
                                    "type": "set_block", "do": { "x": 2017, "y": -58, "z": 52, "block": "theheist:computer", "permutations": '["theheist:rotation":2, "theheist:unlocked":2]' }, "delay": 40
                                },
                                {
                                    "type": "set_alarm_level", "do": { "value": 0 }, "delay": 40
                                }
                            ]
                        };
                        dataManager.setData(console1, "actionTracker", console1ActionTracker);
                        // Console 2 (Type: Keypad)
                        var console2 = overworld.spawnEntity("armor_stand", {"x": 2014.5, "y": consolesHeight, "z": 60.5});
                        overworld.runCommandAsync('setblock 2014 -58 60 theheist:keypad ["theheist:rotation":5]');
                        overworld.runCommandAsync('setblock 2015 -59 61 theheist:custom_door_1_bottom ["theheist:rotation":5, "theheist:unlocked":false]');
                        var console2ActionTracker = {
                            "name": "actionTracker",
                            "used": false,
                            "level": 1,
                            "actions": [
                                {
                                    "type": "set_block", "do": { "x": 2014, "y": -58, "z": 60, "block": "theheist:keypad", "permutations": '["theheist:rotation":5, "theheist:unlocked":1]' }
                                },
                                {
                                    "type": "set_block", "do": { "x": 2014, "y": -58, "z": 60, "block": "theheist:keypad", "permutations": '["theheist:rotation":5, "theheist:unlocked":2]' }, "delay": 40
                                },
                                {
                                    "type": "set_block", "do": { "x": 2015, "y": -59, "z": 61, "block": "theheist:custom_door_1_bottom", "permutations": '["theheist:rotation":5, "theheist:unlocked":true]' }, "delay": 40
                                },
                                {
                                    "type": "manage_objectives", "do": { "manageType": 2, "objective": "Break into Director's office", "sortOrder": 0 }, "delay": 40
                                }
                            ]
                        };
                        dataManager.setData(console2, "actionTracker", console2ActionTracker);
                        // Console 3 (Type: Computer)
                        var console3 = overworld.spawnEntity("armor_stand", {"x": 2018.5, "y": consolesHeight, "z": 65.5});
                        overworld.runCommandAsync('setblock 2018 -58 65 theheist:computer ["theheist:rotation":2]');
                        var console3ActionTracker = {
                            "name": "actionTracker",
                            "used": false,
                            "level": 1,
                            "actions": [
                                {
                                    "type": "set_block", "do": { "x": 2018, "y": -58, "z": 65, "block": "theheist:computer", "permutations": '["theheist:rotation":2, "theheist:unlocked":1]' }
                                },
                                {
                                    "type": "set_block", "do": { "x": 2018, "y": -58, "z": 65, "block": "theheist:computer", "permutations": '["theheist:rotation":2, "theheist:unlocked":2]' }, "delay": 40
                                },
                                {
                                    "type": "display_mail", "do": { "mailID": "003" }, "delay": 40
                                },
                                {
                                    "type": "voice_says", "do": { "soundID": "104" }, "delay": 40
                                },
                                {
                                    "type": "manage_objectives", "do": { "manageType": 1, "objective": "Access the elevator", "sortOrder": 1 }, "delay": 40
                                }
                            ]
                        };
                        dataManager.setData(console3, "actionTracker", console3ActionTracker);
                        // Console 4 (Type: Keypad)
                        var console4 = overworld.spawnEntity("armor_stand", {"x": 1996.5, "y": consolesHeight, "z": 55.5});
                        overworld.runCommandAsync('setblock 1996 -58 55 theheist:keypad ["theheist:rotation":3]');
                        overworld.runCommandAsync('setblock 1995 -59 56 theheist:custom_door_1_bottom ["theheist:rotation":3, "theheist:unlocked":false]');
                        var console4ActionTracker = {
                            "name": "actionTracker",
                            "used": false,
                            "level": 1,
                            "actions": [
                                {
                                    "type": "set_block", "do": { "x": 1996, "y": -58, "z": 55, "block": "theheist:keypad", "permutations": '["theheist:rotation":3, "theheist:unlocked":1]' }
                                },
                                {
                                    "type": "set_block", "do": { "x": 1996, "y": -58, "z": 55, "block": "theheist:keypad", "permutations": '["theheist:rotation":3, "theheist:unlocked":2]' }, "delay": 40
                                },
                                {
                                    "type": "set_block", "do": { "x": 1995, "y": -59, "z": 56, "block": "theheist:custom_door_1_bottom", "permutations": '["theheist:rotation":3, "theheist:unlocked":true]' }, "delay": 40
                                },
                                {
                                    // Hack other keypad
                                    "type": "hack_console", "do": { "x": 1992, "z": 62 }, "delay": 40
                                }
                            ]
                        };
                        dataManager.setData(console4, "actionTracker", console4ActionTracker);
                        // Console 5 (Type: Keypad)
                        var console5 = overworld.spawnEntity("armor_stand", {"x": 1992.5, "y": consolesHeight, "z": 62.5});
                        overworld.runCommandAsync('setblock 1992 -58 62 theheist:keypad ["theheist:rotation":5]');
                        overworld.runCommandAsync('setblock 1993 -59 61 theheist:custom_door_1_bottom ["theheist:rotation":5, "theheist:unlocked":false]');
                        var console5ActionTracker = {
                            "name": "actionTracker",
                            "used": false,
                            "level": 1,
                            "actions": [
                                {
                                    "type": "set_block", "do": { "x": 1992, "y": -58, "z": 62, "block": "theheist:keypad", "permutations": '["theheist:rotation":5, "theheist:unlocked":1]' }
                                },
                                {
                                    "type": "set_block", "do": { "x": 1992, "y": -58, "z": 62, "block": "theheist:keypad", "permutations": '["theheist:rotation":5, "theheist:unlocked":2]' }, "delay": 40
                                },
                                {
                                    "type": "set_block", "do": { "x": 1993, "y": -59, "z": 61, "block": "theheist:custom_door_1_bottom", "permutations": '["theheist:rotation":5, "theheist:unlocked":true]' }, "delay": 40
                                },
                                {
                                    // Hack other keypad
                                    "type": "hack_console", "do": { "x": 1996, "z": 56 }, "delay": 40
                                }
                            ]
                        };
                        dataManager.setData(console5, "actionTracker", console5ActionTracker);
                        // Console 6 (Type: Computer)
                        var console6 = overworld.spawnEntity("armor_stand", {"x": 1978.5, "y": consolesHeight, "z": 64.5});
                        overworld.runCommandAsync('setblock 1978 -58 64 theheist:computer ["theheist:rotation":3]');
                        var console6ActionTracker = {
                            "name": "actionTracker",
                            "used": false,
                            "level": 1,
                            "actions": [
                                {
                                    "type": "set_block", "do": { "x": 1978, "y": -58, "z": 64, "block": "theheist:computer", "permutations": '["theheist:rotation":3, "theheist:unlocked":1]' }
                                },
                                {
                                    "type": "set_block", "do": { "x": 1978, "y": -58, "z": 64, "block": "theheist:computer", "permutations": '["theheist:rotation":3, "theheist:unlocked":2]' }, "delay": 40
                                },
                                {
                                    "type": "display_mail", "do": { "mailID": "002" }, "delay": 40
                                },
                                {
                                    "type": "voice_says", "do": { "soundID": "107" }, "delay": 40
                                }
                            ]
                        };
                        dataManager.setData(console6, "actionTracker", console6ActionTracker);
                        // Console 7 (Type: Computer)
                        var console7 = overworld.spawnEntity("armor_stand", {"x": 1978.5, "y": consolesHeight, "z": 56.5});
                        overworld.runCommandAsync('setblock 1978 -58 56 theheist:computer ["theheist:rotation":2]');
                        var console7ActionTracker = {
                            "name": "actionTracker",
                            "used": false,
                            "level": 1,
                            "actions": [
                                {
                                    "type": "set_block", "do": { "x": 1978, "y": -58, "z": 56, "block": "theheist:computer", "permutations": '["theheist:rotation":2, "theheist:unlocked":1]' }
                                },
                                {
                                    "type": "set_block", "do": { "x": 1978, "y": -58, "z": 56, "block": "theheist:computer", "permutations": '["theheist:rotation":2, "theheist:unlocked":2]' }, "delay": 40
                                },
                                {
                                    "type": "display_mail", "do": { "mailID": "001" }, "delay": 40
                                }
                            ]
                        };
                        dataManager.setData(console7, "actionTracker", console7ActionTracker);
                        // Console 8 (Type: Keycard Reader)
                        var console8 = overworld.spawnEntity("armor_stand", {"x": 1990.5, "y": consolesHeight, "z": 67.5});
                        var console8ActionTracker = {
                            "name": "actionTracker",
                            "used": false,
                            "isKeycardReader": true,
                            "keycardType": "yellow",
                            "actions": [
                                {
                                    "type": "set_block", "do": { "x": 1988, "y": -61, "z": 68, "block": "redstone_torch", "permutations": '[]' }
                                },
                                {
                                    "type": "set_block", "do": { "x": 1987, "y": -61, "z": 68, "block": "redstone_torch", "permutations": '[]' }
                                },
                                {
                                    "type": "voice_says", "do": { "soundID": "109" }
                                }
                            ]
                        };
                        dataManager.setData(console8, "actionTracker", console8ActionTracker);
                        //#endregion
                        //#region Setup recharge stations
                        // Recharge Station 0
                        var recharge0 = overworld.spawnEntity("minecraft:armor_stand", new Vector(1998.5, rechargeHeight, 72.5));
                        overworld.runCommandAsync('setblock 1998 -59 72 theheist:recharge_station ["theheist:rotation":5]');
                        var recharge0DataNode = {
                            "name": "energyTracker",
                            "rechargerID": 0,
                            "energyUnits": 100.0,
                            "block": { "x": 1998, "y": -59, "z": 72, "rotation": 5 }
                        };
                        dataManager.setData(recharge0, "energyTracker", recharge0DataNode);
                        // Recharge Station 1
                        var recharge1 = overworld.spawnEntity("minecraft:armor_stand", new Vector(1986.5, rechargeHeight, 70.5));
                        overworld.runCommandAsync('setblock 1986 -59 70 theheist:recharge_station ["theheist:rotation":4]');
                        var recharge1DataNode = {
                            "name": "energyTracker",
                            "rechargerID": 0,
                            "energyUnits": 100.0,
                            "block": { "x": 1986, "y": -59, "z": 70, "rotation": 4 }
                        };
                        dataManager.setData(recharge1, "energyTracker", recharge1DataNode);
                        //#endregion
                        //#region Setup blocks
                        // Fill drawers
                        var drawer0InventoryContainer = overworld.getBlock({"x": 2002.5, "y": -59, "z": 75.5}).getComponent("inventory").container;
                        drawer0InventoryContainer.clearAll();
                        drawer0InventoryContainer.setItem(4, new ItemStack("yellow_dye"));
                        // Set doors and trapdoors
                        
                        // Reset end level doors
                        overworld.runCommandAsync(`fill 1988 -61 67 1987 -61 67 air`);
                        // Turn on command blocks
                        //{"x": 2029.50, "y": -59.00, "z": 56.50}
                        //{"x": 2029.50, "y": -59.00, "z": 61.50}
                        //Dimesion.fillBlocks() does not work
                        overworld.runCommandAsync('fill 2029.50 -59.00 56.50 2029.50 -59.00 61.50 redstone_block');
                        //overworld.fillBlocks({"x": 1988, "y": -61, "z": 67}, {"x": 1987, "y": -61, "z": 67}, "air");
                        //#endregion
                        // Teleport player from pre-hatch to post-hatch
                        player.teleport({ 'x': 2013.5, 'y': -52, 'z': 56.5 }, { 'dimension': overworld, 'rotation': { 'x': 0, 'y': 90 } });
                        player.runCommandAsync('tellraw @a {"rawtext":[{"text":"§5§oVoice:§r "}, {"translate":"map.sub.004"}]}');
                        player.playSound("map.004");
                        
                    }, SECOND * 7.5);
                    break;
            }
            break;
        case "theheist:voice-says":
            var player = world.getPlayers().filter((x) => (x != undefined))[0];
            player.playSound("map." + msg);
            player.sendMessage([{"text": "§5§oVoice:§r "}, {"translate": `map.sub.${msg}`}]);
            break;
        case "theheist:attempt_end_level":
            var valueArray = msg.split(/ /);
            var level = valueArray[0];
            var x = valueArray[1];
            var y = valueArray[2];
            var z = valueArray[3];
            var rotation = valueArray[4];
            var player = world.getPlayers().filter((x) => (x != undefined && x != null))[0];
            if (player == undefined) return;
            var objectives = objectivesObjective.getParticipants().map((x) => {
                return x.displayName;
            });
            /*if (//determine if player has more prototypes to unlock) {
                player.sendMessage([{"text": "§5§oVoice:§r "}, {"translate": `map.sub.forgot_prototypes`}]);
                player.playSound("map.forgot_prototypes");
                overworld.runCommandAsync(`setblock ${x} ${y} ${z} lever ${rotation}`);
            }*/
            if (objectives.some((x) => (x.startsWith("§c")))) {
                // Player hasn't finished all the objectives yet
                player.sendMessage([{"text": "§5§oVoice:§r "}, {"text": "You still have unfinished objectives!"}]);
                overworld.runCommandAsync(`setblock ${x} ${y} ${z} lever ["minecraft:lever_direction":"${rotation}"]`);
                //return;
            }
            bustedCounterObjective.setScore(player, 0);
            //Normally:
            //overworld.runCommandAsync(`scriptevent theheist:load-level ${parseInt(level) - 1}-1`);
            //Demo:
            player.teleport({ "x": -22.50, "y": -59, "z": 67.5 }, { 'dimension': overworld });
            player.onScreenDisplay.setTitle("§5§oThanks for playing!§r");
            player.sendMessage("Congratulations! You finished the demo!");
            break;
    }
});

// Maybe
function createRechargeStation(x, z, energyTracker, rotation) {
    var recharge = overworld.spawnEntity("minecraft:armor_stand", new Vector(x, rechargeHeight, z));
    dataManager.setData(recharge, "energyTracker", energyTracker);
    overworld.runCommandAsync(`setblock -22 -59 62 theheist:recharge_station ["theheist:rotation":${rotation}, "theheist:state":1]`);
    return recharge;
}

function addUnfinishedObjective(objective, sortOrder) {
    objectivesObjective.setScore(`§c${objective}§r`, sortOrder);
}

function clearObjectives() {
    objectivesObjective.getParticipants().forEach((participant) => {
        objectivesObjective.removeParticipant(participant);
    });
}

function reloadSidebarDisplay() {
    world.scoreboard.clearObjectiveAtDisplaySlot("Sidebar");
    world.scoreboard.setObjectiveAtDisplaySlot("Sidebar", {"objective": objectivesObjective});
}