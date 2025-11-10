import { ILevel } from "../TypeDefinitions";
import Vector from "../Vector";

const level: ILevel = {
"levelId": "-6",
// 5 minute time limit
"timeLimit": 300,
"levelCloneInfo": {
	"startX": 7872,
	"startZ": 63,
	"endX": 7999,
	"endZ": 191,
	"prisonLoc": new Vector(7916.5, -59, 94.5),
	"mapLoc": new Vector(7940, -54, 99)
},
"loadElevatorLoc": new Vector(7938, -50, 84),
"startPlayerLoc": new Vector(7938, -60, 84),
"startingItems": [],
"rechargeLevel": 3,
"startObjectives": [],
"setup": () => {

}
}

export default level;