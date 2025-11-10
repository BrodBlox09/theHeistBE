import { Vector3 } from "@minecraft/server";

export interface ModeData {
	mode: string,
	level: number
}

export interface IAction {
	type: string;
	do: any;
	delay?: number;
}

export type ActionList = Array<IAction>;

export type DataNodeReturnType<T extends string> = T extends keyof DataNodes ? DataNodes[T] : DataNode;

export type DataNodes =  {
	"levelInformation": LevelInformation,
	"alarmTracker": AlarmTracker,
	"inventoryTracker": InventoryTracker,
	"playerEnergyTracker": PlayerEnergyTracker,
	"actionTracker": IActionTracker,
	"energyTracker": EnergyTracker,
	"cameraTracker": CameraTracker
}

export interface DataNodeHelper {}

export interface DataNode extends Record<string, any> {
	"name": string
}

export interface IActionTracker extends DataNode {
	"name": "actionTracker",
	"used": boolean,
	"actions": ActionList,
	"isKeycardReader"?: boolean,
	// "level"?: number,
	/**
	 * A list of objectives that must be completed before actions can be run.
	 */
	"prereq"?: IPrerequisiteList
}

export interface IPrerequisiteList {
	"objectives"?: Array<string>
}

export interface ConsoleActionTracker extends IActionTracker {
	"name": "actionTracker",
	"level": number,
	"isKeycardReader"?: false
}

export interface KeycardReaderActionTracker extends IActionTracker {
	"name": "actionTracker",
	"level"?: undefined,
	"isKeycardReader": true
}

export interface LevelInformation extends DataNode {
	"name": "levelInformation",
	"currentMode": ModeData | null,
	"id": string,
	"runSecurity": boolean
}

export interface AlarmTracker extends DataNode {
	"name": "alarmTracker",
	"level": number,
	"sonarTimeout": number
}

export interface InventoryTracker extends DataNode {
	"name": "inventoryTracker",
	"slots": Array<IInventorySlotData>
}

export interface PlayerEnergyTracker extends DataNode {
	"name": "playerEnergyTracker",
	"energyUnits": number,
	"recharging": boolean,
	"usingRechargerID": number,
	"rechargeLevel": number
}

export interface EnergyTracker extends DataNode {
	"name": "energyTracker",
	"energyUnits": number,
	"rechargerID": number,
	"block": IBlockOrientation,
	"onDepletionActions": ActionList
}

export interface CameraTracker extends DataNode {
	"name": "cameraTracker",
	"isStatic"?: boolean,
	"isStunned"?: boolean,
	"stunTime"?: number,
	"disabled": boolean,
	"cameraID": number,
	"type": "camera" | "sonar" | "sonar360",
	"swivel"?: ICameraSwivel,
	"rotation": number
}

export type ICameraSwivel = [ CameraSwivelMode, number, number ];

export enum CameraSwivelMode {
	Decrease = 0,
	Increase = 1,
	Continous = 2
}

export enum BlockRotation {
	NORTH = "north",
	SOUTH = "south",
	EAST = "east",
	WEST = "west"
}

export interface ILevelCloneInfo {
	"startX": number,
	"startZ": number,
	"endX": number,
	"endZ": number,
	"prisonLoc": Vector3,
	"mapLoc": Vector3
}

export interface ILevel {
	/**
	 * This is the bottom-most center of the loading elevator structure
	 */
	"loadElevatorLoc": Vector3,
	/**
	 * This is the location the player will be teleported to after the level has finished loading
	 */
	"startPlayerLoc": Vector3,
	"startPlayerRot"?: number,
	"noAutoCleanup"?: boolean,
	"noRunSecurity"?: boolean,
	"levelId": string,
	"levelCloneInfo": ILevelCloneInfo,
	"startingItems": Array<IInventorySlotData>,
	"rechargeLevel": number,
	"startEnergyUnits"?: number,
	"startObjectives": Array<IObjectiveData>,
	"customTitle"?: string,
	"customLoadingArea"?: {
		"waitForLoadLevel": boolean,
		"playerLoadingLocation": Vector3
	},
	"playerNoPhone"?: boolean,
	"timer"?: number,
	/**
	 * Second in function execution order.
	 */
	"setup": Function,
	/**
	 * Last in function execution order.
	 */
	"onStart"?: (player: any) => any,
	/**
	 * First in function execution order.
	 */
	"onLoadStart"?: (player: any) => any
}

/**
 * Provides both a location and block rotation
 */
export interface IBlockOrientation extends Vector3 {
	"rotation": IBlockRotation
}

export type IBlockRotation = "north" | "south" | "east" | "west";

export interface IBlockArea {
	"start": Vector3,
	"end": Vector3
}

export interface IObjectiveData {
	"name": string,
	"sortOrder": number
}

export interface IInventorySlotData {
	"slot": number,
	"typeId": string,
	"lockMode"?: "none"|"inventory"|"slot"
}

export interface GamebandInfo extends Record<number, GamebandLevelInfo> {}

export interface GamebandLevelInfo {
	"cost": number
}

export interface RechargeGamebandDataList extends Record<number, GamebandRechargeLevelData> {}

export interface GamebandRechargeLevelData {
	"max": number
}