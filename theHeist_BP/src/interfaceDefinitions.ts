interface ModeData {
	mode: string,
	level: number
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
			"inventory": { "slot": number, "typeId": string, "lockMode"?: "none"|"inventory"|"slot" }[]
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
	"mainFloorBlock": string
}