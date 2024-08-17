import { ItemStack, Player, system, world, DisplaySlotId, BlockInventoryComponent, BlockPermutation, Container, ItemLockMode } from "@minecraft/server";
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

    static gamebandUpgrade(loc: Vector, mode: string, modeText: string, level: number, inventorySlot: number, blockRot: number, actions: IAction[]) {
        const console = overworld.spawnEntity("armor_stand", { "x": loc.x, "y": Utilities.consolesHeight, "z": loc.z });
        Utilities.setBlock(loc, `theheist:${mode}_mode_display`, { "theheist:rotation": blockRot });
        const modeInCase = mode.substring(0, 1).toUpperCase() + mode.substring(1).toLowerCase();
        var allActions = [
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

    static newGameband(loc: Vector, mode: string, modeText: string, inventorySlot: number, blockRot: number, actions: IAction[]) {
        const console = overworld.spawnEntity("armor_stand", { "x": loc.x, "y": Utilities.consolesHeight, "z": loc.z });
        Utilities.setBlock(loc, `theheist:${mode}_mode_display`, { "theheist:rotation": blockRot });
        const modeInCase = mode.substring(0, 1).toUpperCase() + mode.substring(1).toLowerCase();
        var allActions = [
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

    static keycardReader(loc: Vector, color: string, actions: Array<IAction>) {
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

    static keypad(loc: Vector, level: number, blockRot: number, actions: Array<IAction>) {
        const console = overworld.spawnEntity("armor_stand", { "x": loc.x, "y": Utilities.consolesHeight, "z": loc.z });
        Utilities.setBlock(loc, "theheist:keypad", { "theheist:rotation": blockRot });
        overworld.spawnEntity("theheist:hover_text", loc).nameTag = `Lvl. ${level}`;
        var allActions = actions;
        allActions.push({
            "type": "set_block", "do": { "x": loc.x, "y": loc.y, "z": loc.z, "block": "theheist:keypad", "permutations": { "theheist:rotation": blockRot, "theheist:unlocked": 1 } }
        },
            {
                "type": "set_block", "do": { "x": loc.x, "y": loc.y, "z": loc.z, "block": "theheist:keypad", "permutations": { "theheist:rotation": blockRot, "theheist:unlocked": 2 } }, "delay": 40
            });
        const consoleActionTracker = {
            "name": "actionTracker",
            "used": false,
            "level": level,
            "actions": allActions
        };
        DataManager.setData(console, consoleActionTracker);
    }

    static keypadWithPrereq(loc: Vector, level: number, blockRot: number, actions: Array<IAction>, prereq: any, desc: string = "") {
        const console = overworld.spawnEntity("armor_stand", { "x": loc.x, "y": Utilities.consolesHeight, "z": loc.z });
        Utilities.setBlock(loc, "theheist:keypad", { "theheist:rotation": blockRot });
        if (desc.length > 0) overworld.spawnEntity("theheist:hover_text", loc).nameTag = desc;
        var allActions = actions;
        allActions.push({
            "type": "set_block", "do": { "x": loc.x, "y": loc.y, "z": loc.z, "block": "theheist:keypad", "permutations": { "theheist:rotation": blockRot, "theheist:unlocked": 1 } }
        },
            {
                "type": "set_block", "do": { "x": loc.x, "y": loc.y, "z": loc.z, "block": "theheist:keypad", "permutations": { "theheist:rotation": blockRot, "theheist:unlocked": 2 } }, "delay": 40
            });
        const consoleActionTracker = {
            "name": "actionTracker",
            "used": false,
            "level": level,
            "actions": allActions,
            "prereq": prereq
        };
        DataManager.setData(console, consoleActionTracker);
    }

    static computer(loc: Vector, desc: string, blockRot: number, actions: Array<IAction>) {
        const console = overworld.spawnEntity("armor_stand", { "x": loc.x, "y": Utilities.consolesHeight, "z": loc.z });
        Utilities.setBlock(loc, "theheist:computer", { "theheist:rotation": blockRot });
        overworld.spawnEntity("theheist:hover_text", loc).nameTag = desc;
        var allActions = actions;
        allActions.push({
            "type": "set_block", "do": { "x": loc.x, "y": loc.y, "z": loc.z, "block": "theheist:computer", "permutations": { "theheist:rotation": blockRot, "theheist:unlocked": 1 } }
        },
            {
                "type": "set_block", "do": { "x": loc.x, "y": loc.y, "z": loc.z, "block": "theheist:computer", "permutations": { "theheist:rotation": blockRot, "theheist:unlocked": 2 } }, "delay": 40
            });
        const consoleActionTracker = {
            "name": "actionTracker",
            "used": false,
            "level": 1,
            "actions": allActions
        };
        DataManager.setData(console, consoleActionTracker);
    }

    static rechargeStation(loc: Vector, blockRot: number) {
        const recharge = overworld.spawnEntity("minecraft:armor_stand", new Vector(loc.x, Utilities.rechargeHeight, loc.z));
        Utilities.setBlock(loc, "theheist:recharge_station", { "theheist:rotation": blockRot });
        const rechargeDataNode = {
            "name": "energyTracker",
            "rechargerID": rechargeStations,
            "energyUnits": 100.0,
            "block": { "x": loc.x, "y": loc.y, "z": loc.z, "rotation": blockRot }
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