import { ILevel } from "../TypeDefinitions";
import Vector from "../Vector";
import Utilities from "../Utilities";

const level: ILevel = {
"levelId": "-6",
// 5 minute time limit
"timeLimit": 300,
"levelCloneInfo": {
	"startX": 7872,
	"startZ": 63,
	"endX": 7999,
	"endZ": 191,
	"prisonLoc": new Vector(7916.5, 61, 94.5),
	"mapLoc": new Vector(7940, 66, 99)
},
"loadElevatorLoc": new Vector(7938, 70, 84),
"startPlayerLoc": new Vector(7938, Utilities.levelPlayingHeight, 84),
"startingItems": [],
"rechargeLevel": 3,
"startObjectives": [],
"setup": () => {

}
}

export default level;