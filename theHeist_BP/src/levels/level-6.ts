import { BlockRotation, CameraSwivelMode, ILevel } from "../TypeDefinitions";
import Vector from "../Vector";
import LevelConstructor from "./LevelConstructor";
import VectorXZ from "../VectorXZ";

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

{ // Entry Hall
	LevelConstructor.sonarRobot(new VectorXZ(7941.5, 105.5), 90);
}

{ // Horizontal Hall
	LevelConstructor.cameraRobot(new VectorXZ(7927.5, 126.5), -90);
	LevelConstructor.cameraRobot(new VectorXZ(7931.5, 124.5), 90);

	LevelConstructor.staticCamera(new VectorXZ(7922.5, 120.5), 90);
}

{ // Recharge Hall
	LevelConstructor.staticCamera(new VectorXZ(7909.5, 125.5), 25);
	LevelConstructor.sonar(new VectorXZ(7905.5, 125.5), -25);

	LevelConstructor.rechargeStation(new VectorXZ(7911, 132), BlockRotation.WEST);
}

{ // 6-Camera Matrix Hall
	// 0 | 1 - 2 | 3
	// Second row, 0
	LevelConstructor.dynamicCamera(new VectorXZ(7922.5, 129.5), [CameraSwivelMode.Decrease, 40, 285]);
	// Second row, 2
	LevelConstructor.dynamicCamera(new VectorXZ(7922.5, 141.5), [CameraSwivelMode.Decrease, -55, 195]);
	// Third row, 3
	LevelConstructor.dynamicCamera(new VectorXZ(7929.5, 145.5), [CameraSwivelMode.Increase, 110, 250]);
	// Between fourth and fifth row, 1
	LevelConstructor.dynamicCamera(new VectorXZ(7936.5, 134.5), [CameraSwivelMode.Increase, 275, 90]);
	// Between sixth and seventh row, 0
	LevelConstructor.dynamicCamera(new VectorXZ(7946.5, 132.5), [CameraSwivelMode.Increase, 65, 100]);
	// Seventh row, 3
	LevelConstructor.dynamicCamera(new VectorXZ(7950.5, 145.5), [CameraSwivelMode.Increase, 105, 160]);
}

{ // Double Static Robot Hall
	LevelConstructor.staticCameraRobot(new VectorXZ(7955.5, 151.5), 0);
	LevelConstructor.staticSonarRobot(new VectorXZ(7953.5, 151.5), 0);
}

{ // Camera + Laser Hall
	LevelConstructor.dynamicCamera(new VectorXZ(7949.5, 167.5), [CameraSwivelMode.Increase, 110, 210]);
}

{ // 3 Camera Room
	LevelConstructor.staticCamera(new VectorXZ(7934.5, 167.5), 255);
	LevelConstructor.staticCamera(new VectorXZ(7934.5, 165.5), 115);
	LevelConstructor.staticCamera(new VectorXZ(7933.5, 166.5), 175);
}

}
}

export default level;