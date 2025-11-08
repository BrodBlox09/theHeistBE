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
	"playerEnergyTracker": PlayerEnergyTracker,
	"actionTracker": IActionTracker,
	"energyTracker": EnergyTracker,
	"cameraTracker": CameraTracker
}

export interface DataNode extends Record<string, any> {
	"name": string
}

export interface IActionTracker extends DataNode {
	"name": "actionTracker",
	"used": boolean,
	"actions": ActionList,
	"isKeycardReader"?: boolean,
	"level"?: number,
	/**
	 * @description A list of objectives that must be completed before actions can be run.
	 */
	"prereq"?: IPrerequisiteList
}

export interface IPrerequisiteList {
	"objectives"?: Array<string>
}

export interface ActionTracker extends IActionTracker {
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
	"information": [
		{
			"name": "alarmLevel",
			"level": number,
			"sonarTimeout": number
		},
		{
			"name": "gameLevel",
			"levelId": string
		},
		{
			"name": "playerInv",
			"inventory": Array<IInventorySlotData>
		}
	]
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
	"prisonLoc": IVector3,
	"mapLoc": IVector3
}

export interface ILevel {
	/**
	 * @description This is the bottom-most center of the loading elevator structure
	 */
	"loadElevatorLoc": IVector3,
	/**
	 * @description This is the location the player will be teleported to after the level has finished loading
	 */
	"startPlayerLoc": IVector3,
	"startPlayerRot"?: number,
	"noAutoCleanup"?: boolean,
	"levelId": string,
	"levelCloneInfo": ILevelCloneInfo,
	"startingItems": Array<IInventorySlotData>,
	"rechargeLevel": number,
	"startEnergyUnits"?: number,
	"startObjectives": Array<IObjectiveData>,
	"customTitle"?: string,
	"customLoadingArea"?: {
		"waitForLoadLevel": boolean,
		"playerLoadingLocation": IVector3
	},
	"playerNoPhone"?: boolean,
	"timer"?: number,
	/**
	 * @description Second in function execution order.
	 */
	"setup": Function,
	/**
	 * @description Last in function execution order.
	 */
	"onStart"?: (player: any) => any,
	/**
	 * @description First in function execution order.
	 */
	"onLoadStart"?: (player: any) => any
}

export interface IBlockOrientation extends IVector3 {
	"rotation": IBlockRotation
}

export type IBlockRotation = "north" | "south" | "east" | "west";

export interface IBlockArea {
	"start": IVector3,
	"end": IVector3
}

export interface IVector3 {
	"x": number,
	"y": number,
	"z": number
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

export interface GamebandDataList extends Record<string, GamebandDataEntry> {}

export interface GamebandDataEntry extends Record<number, GamebandLevelData> {}

export interface GamebandLevelData {
	"cost": number
}

export interface RechargeGamebandDataList extends Record<number, GamebandRechargeLevelData> {}

export interface GamebandRechargeLevelData {
	"max": number
}