interface ModeData {
	mode: string,
	level: number
}

interface IAction {
	type: string;
	do: any;
	delay?: number;
}

type ActionList = Array<IAction>;

type DataNodeReturnType<T extends string> = T extends keyof DataNodes ? DataNodes[T] : DataNode;

type DataNodes =  {
	"levelInformation": LevelInformation,
	"playerEnergyTracker": PlayerEnergyTracker,
	"actionTracker": IActionTracker,
	"energyTracker": EnergyTracker,
	"cameraTracker": CameraTracker
}


interface DataNode extends Record<string, any> {
	"name": string
}

interface IActionTracker extends DataNode {
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

interface IPrerequisiteList {
	"objectives"?: Array<string>
}

interface ActionTracker extends IActionTracker {
	"name": "actionTracker",
	"level": number,
	"isKeycardReader"?: false
}

interface KeycardReaderActionTracker extends IActionTracker {
	"name": "actionTracker",
	"level"?: undefined,
	"isKeycardReader": true
}

interface LevelInformation extends DataNode {
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
			"level": number
		},
		{
			"name": "playerInv",
			"inventory": Array<IInventorySlotData>
		}
	]
}

interface PlayerEnergyTracker extends DataNode {
	"name": "playerEnergyTracker",
	"energyUnits": number,
	"recharging": boolean,
	"usingRechargerID": number,
	"rechargeLevel": number
}

interface EnergyTracker extends DataNode {
	"name": "energyTracker",
	"energyUnits": number,
	"rechargerID": number,
	"block": IBlockOrientation,
	"actions": ActionList
}

interface CameraTracker extends DataNode {
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

type ICameraSwivel = [ number, number, number ];

interface ILevelCloneInfo {
	"startX": number,
	"startZ": number,
	"endX": number,
	"endZ": number,
	"prisonLoc": IVector3,
	"mapLoc": IVector3
}

interface ILevel {
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
	"levelID": string,
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

interface IBlockOrientation extends IVector3 {
	"rotation": IBlockRotation
}

type IBlockRotation = "north" | "south" | "east" | "west";

interface IBlockArea {
	"start": IVector3,
	"end": IVector3
}

interface IVector3 {
	"x": number,
	"y": number,
	"z": number
}

interface IObjectiveData {
	"name": string,
	"sortOrder": number
}

interface IInventorySlotData {
	"slot": number,
	"typeId": string,
	"lockMode"?: "none"|"inventory"|"slot"
}

interface GamebandDataList extends Record<string, GamebandDataEntry> {}

interface GamebandDataEntry extends Record<number, GamebandLevelData> {}

interface GamebandLevelData {
	"cost": number
}

interface RechargeGamebandDataList extends Record<number, GamebandRechargeLevelData> {}

interface GamebandRechargeLevelData {
	"max": number
}