import { ItemStack, Container, Camera } from "@minecraft/server";
import Vector from "../Vector";
import Utilities from "../Utilities";
import DataManager from "../managers/DataManager";
import LoreItem from "../LoreItem";
import { BlockRotation, ActionList, ConsoleActionTracker, KeycardReaderActionTracker, IPrerequisiteList, EnergyTracker, CameraTracker, ICameraSwivel } from "../TypeDefinitions";

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
        const console = Utilities.spawnEntity({ "x": loc.x, "y": Utilities.consolesHeight, "z": loc.z }, "armor_stand");
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
                "type": "manage_objective", "do": { "manageType": 2, "objective": `Get ${modeInCase} upgrade` }
            }
        ];
        allActions.push(...actions);
        const consoleActionTracker: ConsoleActionTracker = {
            "name": "actionTracker",
            "used": false,
            "level": 0,
            "actions": allActions
        };
        DataManager.setData(console, consoleActionTracker);
    }

    static newGameband(loc: Vector, mode: string, modeText: string, inventorySlot: number, blockRot: BlockRotation, actions: ActionList) {
        const console = Utilities.spawnEntity({ "x": loc.x, "y": Utilities.consolesHeight, "z": loc.z }, "armor_stand");
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
                "type": "manage_objective", "do": { "manageType": 2, "objective": `Get ${modeInCase} mode` }
            }
        ];
        allActions.push(...actions);
        const consoleActionTracker: ConsoleActionTracker = {
            "name": "actionTracker",
            "used": false,
            "level": 0,
            "actions": allActions
        };
        DataManager.setData(console, consoleActionTracker);
    }

    static keycardReader(loc: Vector, color: string, actions: ActionList) {
        const console = Utilities.spawnEntity({ "x": loc.x, "y": Utilities.consolesHeight, "z": loc.z }, "armor_stand");
        const consoleActionTracker: KeycardReaderActionTracker = {
            "name": "actionTracker",
            "used": false,
            "isKeycardReader": true,
            "keycardType": color,
            "actions": actions
        };
        DataManager.setData(console, consoleActionTracker);
    }

    static keypad(loc: Vector, level: number, blockRot: BlockRotation, actions: ActionList) {
        const console = Utilities.spawnEntity({ "x": loc.x, "y": Utilities.consolesHeight, "z": loc.z }, "armor_stand");
        Utilities.setBlock(loc, "theheist:keypad", { "minecraft:cardinal_direction": blockRot });
        Utilities.spawnEntity(loc, "theheist:hover_text").nameTag = `Lvl. ${level}`;
        var allActions = actions;
        allActions.push(
            {
                "type": "set_block", "do": { "x": loc.x, "y": loc.y, "z": loc.z, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": blockRot, "theheist:unlocked": 1 } }
            },
            {
                "type": "set_block", "do": { "x": loc.x, "y": loc.y, "z": loc.z, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": blockRot, "theheist:unlocked": 2 } }, "delay": 40
            }
        );
        const consoleActionTracker: ConsoleActionTracker = {
            "name": "actionTracker",
            "used": false,
            "level": level,
            "actions": allActions
        };
        DataManager.setData(console, consoleActionTracker);
    }

    static keypadWithPrereq(loc: Vector, level: number, blockRot: BlockRotation, actions: ActionList, prereq: IPrerequisiteList, desc: string = "") {
        const console = Utilities.spawnEntity({ "x": loc.x, "y": Utilities.consolesHeight, "z": loc.z }, "armor_stand");
        Utilities.setBlock(loc, "theheist:keypad", { "minecraft:cardinal_direction": blockRot });
        if (desc.length > 0) Utilities.spawnEntity(loc, "theheist:hover_text").nameTag = desc;
        var allActions = actions;
        allActions.push(
            {
                "type": "set_block", "do": { "x": loc.x, "y": loc.y, "z": loc.z, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": blockRot, "theheist:unlocked": 1 } }
            },
            {
                "type": "set_block", "do": { "x": loc.x, "y": loc.y, "z": loc.z, "block": "theheist:keypad", "permutations": { "minecraft:cardinal_direction": blockRot, "theheist:unlocked": 2 } }, "delay": 40
            }
        );
        const consoleActionTracker: ConsoleActionTracker = {
            "name": "actionTracker",
            "used": false,
            "level": level,
            "actions": allActions,
            "prereq": prereq
        };
        DataManager.setData(console, consoleActionTracker);
    }

    static computer(loc: Vector, desc: string, blockRot: BlockRotation, actions: ActionList) {
        const console = Utilities.spawnEntity({ "x": loc.x, "y": Utilities.consolesHeight, "z": loc.z }, "armor_stand");
        Utilities.setBlock(loc, "theheist:computer", { "minecraft:cardinal_direction": blockRot });
        Utilities.spawnEntity(loc, "theheist:hover_text").nameTag = desc;
        var allActions = actions;
        allActions.push(
            {
                "type": "set_block", "do": { "x": loc.x, "y": loc.y, "z": loc.z, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": blockRot, "theheist:unlocked": 1 } }
            },
            {
                "type": "set_block", "do": { "x": loc.x, "y": loc.y, "z": loc.z, "block": "theheist:computer", "permutations": { "minecraft:cardinal_direction": blockRot, "theheist:unlocked": 2 } }, "delay": 40
            }
        );
        const consoleActionTracker: ConsoleActionTracker = {
            "name": "actionTracker",
            "used": false,
            "level": 1,
            "actions": allActions
        };
        DataManager.setData(console, consoleActionTracker);
    }

    static rechargeStation(loc: Vector, blockRot: BlockRotation, energyUnits: number = 100.0, onDepletionActionList: ActionList = []) {
        const recharge = Utilities.spawnEntity(new Vector(loc.x, Utilities.rechargeHeight, loc.z), "minecraft:armor_stand");
        Utilities.setBlock(loc, "theheist:recharge_station", { "minecraft:cardinal_direction": blockRot });
        const rechargeDataNode: EnergyTracker = {
            "name": "energyTracker",
            "rechargerID": rechargeStations,
            "energyUnits": energyUnits,
            "block": { "x": loc.x, "y": loc.y, "z": loc.z, "rotation": blockRot },
            "onDepletionActions": onDepletionActionList
        };
        DataManager.setData(recharge, rechargeDataNode);
        rechargeStations++;
    }

    static staticCamera(loc: Vector, rot: number) {
        const camera = Utilities.spawnEntity(new Vector(loc.x, Utilities.cameraHeight, loc.z), "armor_stand");
        var rotationVector = { 'x': 0, 'y': rot };
        camera.setRotation(rotationVector);
        Utilities.spawnEntity(loc, "theheist:camera").setRotation(rotationVector);
        const cameraDataNode: CameraTracker = {
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

    static dynamicCamera(loc: Vector, swivel: ICameraSwivel) {
        const camera = Utilities.spawnEntity(new Vector(loc.x, Utilities.cameraHeight, loc.z), "armor_stand");
        var rotationVector = { 'x': 0, 'y': swivel[1] };
        camera.setRotation(rotationVector);
        Utilities.spawnEntity(loc, "theheist:camera").setRotation(rotationVector);
        const cameraDataNode: CameraTracker = {
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
        const sonar = Utilities.spawnEntity(new Vector(loc.x, Utilities.cameraHeight, loc.z), "armor_stand");
        var rotationVector = { 'x': 0, 'y': rot };
        sonar.setRotation(rotationVector);
        Utilities.spawnEntity(loc, "theheist:sonar").setRotation(rotationVector);
        const sonarDataNode: CameraTracker = {
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
        const sonar360 = Utilities.spawnEntity(new Vector(loc.x, Utilities.cameraHeight, loc.z), "armor_stand");
        Utilities.spawnEntity(loc, "theheist:sonar360");
        const sonarDataNode: CameraTracker = {
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
        const robot = Utilities.spawnEntity({ "x": loc.x, "y": Utilities.cameraHeight, "z": loc.z }, "armor_stand");
        robot.setRotation({ "x": 0, "y": rot });
        robot.addTag("robot");
        Utilities.spawnEntity(loc, "theheist:camera_robot").setRotation({ "x": 0, "y": rot });
        const robotDataNode: CameraTracker = {
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
        const robot = Utilities.spawnEntity({ "x": loc.x, "y": Utilities.cameraHeight, "z": loc.z }, "armor_stand");
        robot.setRotation({ "x": 0, "y": rot });
        robot.addTag("robot");
        Utilities.spawnEntity(loc, "theheist:camera_robot").setRotation({ "x": 0, "y": rot });
        const robotDataNode: CameraTracker = {
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
        const robot = Utilities.spawnEntity({ "x": loc.x, "y": Utilities.cameraHeight, "z": loc.z }, "armor_stand");
        robot.setRotation({ "x": 0, "y": rot });
        robot.addTag("robot");
        Utilities.spawnEntity(loc, "theheist:sonar_robot").setRotation({ "x": 0, "y": rot });
        const robotDataNode: CameraTracker = {
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
        const robot = Utilities.spawnEntity({ "x": loc.x, "y": Utilities.cameraHeight, "z": loc.z }, "armor_stand");
        robot.setRotation({ "x": 0, "y": rot });
        robot.addTag("robot");
        Utilities.spawnEntity(loc, "theheist:sonar_robot").setRotation({ "x": 0, "y": rot });
        const robotDataNode: CameraTracker = {
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
        const drawerInventoryContainer = Utilities.dimensions.overworld.getBlock(loc)?.getComponent("inventory")!.container!;
        drawerInventoryContainer.clearAll();
        var keycardTypeId = `minecraft:${color}_dye`;
        if (color == "blue") keycardTypeId = "minecraft:lapis_lazuli";
		const itemStack = new ItemStack(keycardTypeId);
		LoreItem.setLoreOfItemStack(itemStack);
        drawerInventoryContainer.setItem(4, itemStack);
    }
}