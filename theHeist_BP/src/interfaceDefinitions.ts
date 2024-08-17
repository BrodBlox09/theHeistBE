interface ModeData {
	mode: string,
	level: number
}

interface IAction {
	type: string;
	do: any;
	delay?: number;
}

interface LevelInformation {
	"name": "levelInformation",
	"currentModes": ModeData[],
	"information": [
		{
			"name": "alarmLevel",
			"level": number
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

interface EnergyTracker {
	"name": "energyTracker",
	"energyUnits": number,
	"recharging": boolean,
	"usingRechargerID": number,
	"rechargeLevel": number
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
	"levelID": string,
	"startingItems": Array<IInventorySlotData>,
	"rechargeLevel": number,
	"startObjectives": Array<IObjectiveData>,
	setup: Function
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