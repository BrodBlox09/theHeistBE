interface ModeData {
	mode: string,
	level: number
}

interface ActionTracker {
	"name": "actionTracker",
	"used": boolean,
	"isKeycardReader": boolean,
	"level": number,
	"prereq": Array<string>
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
	"energyTracker": EnergyTracker,
	"cameraTracker": CameraTracker
}


interface DataNode extends Record<string, any> {
	"name": string
}

interface LevelInformation extends DataNode {
	"name": "levelInformation",
	"currentModes": ModeData[],
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

interface EnergyTracker extends DataNode { // Player Energy Tracker, create recharge station energy tracker separate!
	"name": "energyTracker",
	"energyUnits": number,
	"recharging": boolean,
	"usingRechargerID": number,
	"rechargeLevel": number
}

interface CameraTracker extends DataNode {
	"name": "cameraTracker",
	"isStatic": boolean,
	"isStunned": boolean,
	"stunTime": number,
	"type": "camera" | "sonar" | "sonar360",
	"swivel": [ number, number, number ],
	"rotation": number
}

interface ILevelCloneInfo {
	"startX": number,
	"startZ": number,
	"endX": number,
	"endZ": number,
	"prisonLoc": IVector3,
	"mapLoc": IVector3
}

interface ILevel {
	"loadElevatorLoc": IVector3,
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