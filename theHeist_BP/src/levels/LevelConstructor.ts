import { ItemStack, Container } from "@minecraft/server";
import BlockRotation from "../BlockRotation";
import Vector from "../Vector";
import Utilities from "../Utilities";
import DataManager from "../DataManager";

const overworld = Utilities.dimensions.overworld;

let cameras = 0;
let rechargeStations = 0;

export default class LevelConstructor {
    static start() {
        cameras = 0;
        rechargeStations = 0;
    }

    static door1(loc: Vector, rotation: BlockRotation, unlocked: boolean = false) {
        Utilities.setBlock(loc, "theheist:custom_door_1_bottom", { "minecraft:cardinal_direction": rotation, "theheist:unlocked": unlocked });
    }

    static door2(loc: Vector, rotation: BlockRotation, unlocked: boolean = false) {
        Utilities.setBlock(loc, "theheist:custom_door_2_bottom", { "minecraft:cardinal_direction": rotation, "theheist:unlocked": unlocked });
    }

    static door3(loc: Vector, rotation: BlockRotation, unlocked: boolean = false) {
        Utilities.setBlock(loc, "theheist:custom_door_3_bottom", { "minecraft:cardinal_direction": rotation, "theheist:unlocked": unlocked });
    }

    static door4(locLeft: Vector, locRight: Vector, rotation: BlockRotation, unlocked: boolean = false) {
        Utilities.setBlock(locLeft, "theheist:custom_door_4_bottom_l", { "minecraft:cardinal_direction": rotation, "theheist:unlocked": unlocked });
        Utilities.setBlock(locRight, "theheist:custom_door_4_bottom_r", { "minecraft:cardinal_direction": rotation, "theheist:unlocked": unlocked });
    }

    static gamebandUpgrade(loc: Vector, mode: string, modeText: string, level: number, inventorySlot: number, blockRot: BlockRotation, actions: ActionList) {
        const console = overworld.spawnEntity("armor_stand", { "x": loc.x, "y": Utilities.consolesHeight, "z": loc.z });
        Utilities.setBlock(loc, `theheist:${mode}_mode_display`, { "minecraft:cardinal_direction": blockRot });
        const modeInCase = mode.substring(0, 1).toUpperCase() + mode.substring(1).toLowerCase();
        var allActions: ActionList = [
            {
                "type": "upgrade_gameband", "do": {
                    "displayBlock": { "x": loc.x, "y": loc.y, "z": loc.z },
                    "mode": mode.toLowerCase(),
                    "modeText": modeText,
                    "level": level,
                    "slot": inventorySlot
                }
            },
            {
                "type": "manage_objectives", "do": { "manageType": 2, "objective": `Get ${modeInCase} upgrade` }
            }
        ];
        allActions.push(...actions);
        const consoleActionTracker = {
            "name": "actionTracker",
            "used": false,
            "level": 0,
            "actions": allActions
        };
        DataManager.setData(console, consoleActionTracker);
    }

    static newGameband(loc: Vector, mode: string, modeText: string, inventorySlot: number, blockRot: BlockRotation, actions: ActionList) {
        const console = overworld.spawnEntity("armor_stand", { "x": loc.x, "y": Utilities.consolesHeight, "z": loc.z });
        Utilities.setBlock(loc, `theheist:${mode}_mode_display`, { "minecraft:cardinal_direction": blockRot });
        const modeInCase = mode.substring(0, 1).toUpperCase() + mode.substring(1).toLowerCase();
        var allActions: ActionList = [
            {
                "type": "new_gameband", "do": {
                    "displayBlock": { "x": loc.x, "y": loc.y, "z": loc.z },
                    "mode": mode.toLowerCase(),
                    "modeText": modeText,
                    "level": 1,
                    "slot": inventorySlot
                }
            },
            {
                "type": "manage_objectives", "do": { "manageType": 2, "objective": `Get ${modeInCase} mode` }
            }
        ];
        allActions.push(...actions);
        const consoleActionTracker = {
            "name": "actionTracker",
            "used": false,
            "level": 0,
            "actions": allActions
        };
        DataManager.setData(console, consoleActionTracker);
    }

    static keycardReader(loc: Vector, color: string, actions: ActionList) {
        const console = overworld.spawnEntity("armor_stand", { "x": loc.x, "y": Utilities.consolesHeight, "z": loc.z });
        const consoleActionTracker = {
            "name": "actionTracker",
            "used": false,
            "isKeycardReader": true,
            "keycardType": color,
            "actions": actions
        };
        DataManager.setData(console, consoleActionTracker);
    }

    static keypad(loc: Vector, level: number, blockRot: BlockRotation, actions: ActionList) {
        const console = overworld.spawnEntity("armor_stand", { "x": loc.x, "y": Utilities.consolesHeight, "z": loc.z });
        Utilities.setBlock(loc, "theheist:keypad", { "minecraft:cardinal_direction": blockRot });
        overworld.spawnEntity("theheist:hover_text", loc).nameTag = `Lvl. ${level}`;
        var allActions = actions;
        allActions.push(
            {
                "type": "set_block", "do": { "x": loc.x, "y": loc.y, "z": loc.z, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": blockRot, "theheist:unlocked": 1 } }
            },
            {
                "type": "set_block", "do": { "x": loc.x, "y": loc.y, "z": loc.z, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": blockRot, "theheist:unlocked": 2 } }, "delay": 40
            }
        );
        const consoleActionTracker = {
            "name": "actionTracker",
            "used": false,
            "level": level,
            "actions": allActions
        };
        DataManager.setData(console, consoleActionTracker);
    }

    static keypadWithPrereq(loc: Vector, level: number, blockRot: BlockRotation, actions: ActionList, prereq: any, desc: string = "") {
        const console = overworld.spawnEntity("armor_stand", { "x": loc.x, "y": Utilities.consolesHeight, "z": loc.z });
        Utilities.setBlock(loc, "theheist:keypad", { "minecraft:cardinal_direction": blockRot });
        if (desc.length > 0) overworld.spawnEntity("theheist:hover_text", loc).nameTag = desc;
        var allActions = actions;
        allActions.push(
            {
                "type": "set_block", "do": { "x": loc.x, "y": loc.y, "z": loc.z, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": blockRot, "theheist:unlocked": 1 } }
            },
            {
                "type": "set_block", "do": { "x": loc.x, "y": loc.y, "z": loc.z, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": blockRot, "theheist:unlocked": 2 } }, "delay": 40
            }
        );
        const consoleActionTracker = {
            "name": "actionTracker",
            "used": false,
            "level": level,
            "actions": allActions,
            "prereq": prereq
        };
        DataManager.setData(console, consoleActionTracker);
    }

    static computer(loc: Vector, desc: string, blockRot: BlockRotation, actions: ActionList) {
        const console = overworld.spawnEntity("armor_stand", { "x": loc.x, "y": Utilities.consolesHeight, "z": loc.z });
        Utilities.setBlock(loc, "theheist:computer", { "minecraft:cardinal_direction": blockRot });
        overworld.spawnEntity("theheist:hover_text", loc).nameTag = desc;
        var allActions = actions;
        allActions.push(
            {
                "type": "set_block", "do": { "x": loc.x, "y": loc.y, "z": loc.z, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": blockRot, "theheist:unlocked": 1 } }
            },
            {
                "type": "set_block", "do": { "x": loc.x, "y": loc.y, "z": loc.z, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": blockRot, "theheist:unlocked": 2 } }, "delay": 40
            }
        );
        const consoleActionTracker = {
            "name": "actionTracker",
            "used": false,
            "level": 1,
            "actions": allActions
        };
        DataManager.setData(console, consoleActionTracker);
    }

    static rechargeStation(loc: Vector, blockRot: BlockRotation, energyUnits: number = 100.0, actionList: ActionList = []) {
        const recharge = overworld.spawnEntity("minecraft:armor_stand", new Vector(loc.x, Utilities.rechargeHeight, loc.z));
        Utilities.setBlock(loc, "theheist:recharge_station", { "minecraft:cardinal_direction": blockRot });
        const rechargeDataNode = {
            "name": "energyTracker",
            "rechargerID": rechargeStations,
            "energyUnits": energyUnits,
            "block": { "x": loc.x, "y": loc.y, "z": loc.z, "rotation": blockRot },
            "actions": actionList
        };
        DataManager.setData(recharge, rechargeDataNode);
        rechargeStations++;
    }

    static staticCamera(loc: Vector, rot: number) {
        const camera = overworld.spawnEntity("armor_stand", new Vector(loc.x, Utilities.cameraHeight, loc.z));
        var rotationVector = { 'x': 0, 'y': rot };
        camera.setRotation(rotationVector);
        overworld.spawnEntity("theheist:camera", loc).setRotation(rotationVector);
        const cameraDataNode = {
            "name": "cameraTracker",
            "isRobot": false,
            "rotation": rot,
            "disabled": false,
            "cameraID": cameras,
            "type": "camera"
        }
        DataManager.setData(camera, cameraDataNode);
        cameras++;
    }

    static dynamicCamera(loc: Vector, swivel: Array<number>) {
        const camera = overworld.spawnEntity("armor_stand", new Vector(loc.x, Utilities.cameraHeight, loc.z));
        var rotationVector = { 'x': 0, 'y': swivel[1] };
        camera.setRotation(rotationVector);
        overworld.spawnEntity("theheist:camera", loc).setRotation(rotationVector);
        const cameraDataNode = {
            "name": "cameraTracker",
            "isRobot": false,
            "rotation": swivel[1],
            "swivel": swivel,
            "disabled": false,
            "cameraID": cameras,
            "type": "camera"
        }
        DataManager.setData(camera, cameraDataNode);
        cameras++;
    }

    static sonar(loc: Vector, rot: number) {
        const sonar = overworld.spawnEntity("armor_stand", new Vector(loc.x, Utilities.cameraHeight, loc.z));
        var rotationVector = { 'x': 0, 'y': rot };
        sonar.setRotation(rotationVector);
        overworld.spawnEntity("theheist:sonar", loc).setRotation(rotationVector);
        const sonarDataNode = {
            "name": "cameraTracker",
            "isRobot": false,
            "rotation": rot,
            "disabled": false,
            "cameraID": cameras,
            "type": "sonar"
        }
        DataManager.setData(sonar, sonarDataNode);
        cameras++;
    }

    static sonar360(loc: Vector) {
        const sonar360 = overworld.spawnEntity("armor_stand", new Vector(loc.x, Utilities.cameraHeight, loc.z));
        overworld.spawnEntity("theheist:sonar360", loc);
        const sonarDataNode = {
            "name": "cameraTracker",
            "isRobot": false,
            "rotation": 0,
            "disabled": false,
            "cameraID": cameras,
            "type": "sonar360"
        }
        DataManager.setData(sonar360, sonarDataNode);
        cameras++;
    }

    static cameraRobot(loc: Vector, rot: number) {
        const robot = overworld.spawnEntity("armor_stand", { "x": loc.x, "y": Utilities.cameraHeight, "z": loc.z });
        robot.setRotation({ "x": 0, "y": rot });
        robot.addTag("robot");
        overworld.spawnEntity("theheist:camera_robot", loc).setRotation({ "x": 0, "y": rot });
        const robotDataNode = {
            "name": "cameraTracker",
            "isRobot": true,
            "isStunned": false,
            "rotation": rot,
            "disabled": false,
            "cameraID": cameras,
            "type": "camera"
        };
        DataManager.setData(robot, robotDataNode);
        cameras++;
    }

    static staticCameraRobot(loc: Vector, rot: number) {
        const robot = overworld.spawnEntity("armor_stand", { "x": loc.x, "y": Utilities.cameraHeight, "z": loc.z });
        robot.setRotation({ "x": 0, "y": rot });
        robot.addTag("robot");
        overworld.spawnEntity("theheist:camera_robot", loc).setRotation({ "x": 0, "y": rot });
        const robotDataNode = {
            "name": "cameraTracker",
            "isRobot": true,
            "isStatic": true,
            "isStunned": false,
            "rotation": rot,
            "disabled": false,
            "cameraID": cameras,
            "type": "camera"
        };
        DataManager.setData(robot, robotDataNode);
        cameras++;
    }

    static sonarRobot(loc: Vector, rot: number) {
        const robot = overworld.spawnEntity("armor_stand", { "x": loc.x, "y": Utilities.cameraHeight, "z": loc.z });
        robot.setRotation({ "x": 0, "y": rot });
        robot.addTag("robot");
        overworld.spawnEntity("theheist:sonar_robot", loc).setRotation({ "x": 0, "y": rot });
        const robotDataNode = {
            "name": "cameraTracker",
            "isRobot": true,
            "isStunned": false,
            "rotation": rot,
            "disabled": false,
            "cameraID": cameras,
            "type": "sonar"
        };
        DataManager.setData(robot, robotDataNode);
        cameras++;
    }

    static staticSonarRobot(loc: Vector, rot: number) {
        const robot = overworld.spawnEntity("armor_stand", { "x": loc.x, "y": Utilities.cameraHeight, "z": loc.z });
        robot.setRotation({ "x": 0, "y": rot });
        robot.addTag("robot");
        overworld.spawnEntity("theheist:sonar_robot", loc).setRotation({ "x": 0, "y": rot });
        const robotDataNode = {
            "name": "cameraTracker",
            "isRobot": true,
            "isStatic": true,
            "isStunned": false,
            "rotation": rot,
            "disabled": false,
            "cameraID": cameras,
            "type": "sonar"
        };
        DataManager.setData(robot, robotDataNode);
        cameras++;
    }

    static keycardDrawer(loc: Vector, color: string) {
        const drawerInventoryContainer = overworld.getBlock(loc)?.getComponent("inventory")!.container as Container;
        drawerInventoryContainer.clearAll();
        var keycardTypeId = `minecraft:${color}_dye`;
        if (color == "blue") keycardTypeId = "minecraft:lapis_lazuli";
        drawerInventoryContainer.setItem(4, new ItemStack(keycardTypeId));
    }
}