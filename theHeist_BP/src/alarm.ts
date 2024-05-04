import { world, system, GameMode, TicksPerDay, BlockPermutation, Player } from "@minecraft/server";
import * as SensorModeFunc from "./gamebands/sensor";
import DataManager from "./DataManager";
import Utilities from "./Utilities";
import Vector from "./Vector";

/**
 * The alarm XP bar texture can sometimes, seemingly at random, break and use a strange default-looking one. Just reload the world until you get the custom xp bar.
 */

const levelMapHeight = 20;
const consolesHeight = -15;
const rechargeHeight = -20;
const cameraHeight = -25;
const cameraMappingHeight = -30;
const robotPathHeight = -49;
const levelHeight = -59;

const cameraFOV = 40;
const rayDensity = 11;

const overworld = Utilities.dimensions.overworld;

// Robots take exactly 1 second to turn 90 degrees
// Robots move at a speed of 1 blocks per 20 ticks

function cameraCanSeeThrough(location: Vector): boolean {
	var topBlock = Utilities.dimensions.overworld.getBlock(location);
	var bottomBlock = Utilities.dimensions.overworld.getBlock(location.subtract(new Vector(0, 1, 0)));
	if (!topBlock || !bottomBlock) return false;
	var topBlockTID = topBlock.typeId;
	var bottomBlockTID = bottomBlock.typeId;
	if (bottomBlockTID == "minecraft:air") return true;
	if (topBlockTID == "minecraft:glass" && bottomBlockTID == "minecraft:glass") return true;
	if (topBlockTID.endsWith("_stained_glass") && bottomBlockTID.endsWith("_stained_glass")) return true;
	if (topBlockTID == "minecraft:air" && bottomBlockTID == "theheist:chair") return true;
	if (bottomBlockTID.startsWith("theheist:custom_door_") && bottomBlock.permutation.getState("theheist:open")) return true;
	return false;
}

system.runInterval(() => {
	// Only include adventure mode players
	var player = world.getPlayers({"gameMode": GameMode.adventure}).filter((x) => (x != undefined && x != null))[0];
	if (player == undefined) return;

	var playerLevelInformationDataNode = DataManager.getData(player, "levelInformation");
	var level = undefined;
	if (playerLevelInformationDataNode) level = playerLevelInformationDataNode.information[1].level;
	if (playerLevelInformationDataNode == undefined || level == undefined || level > 0) return;
	
	updateCameras(player, level, playerLevelInformationDataNode);
	updateCameraRobots(player, level, playerLevelInformationDataNode);

});

function updateCameraRobots(player: Player, level: number, levelInformation: LevelInformation) {
	const tpDistance = 0.05;

	var cameraRobotArmorStandsQuery = {
		"type": "armor_stand",
		"location": { 'x': player.location.x, 'y': cameraHeight, 'z': player.location.z },
		"maxDistance": 50
	};
	const cameraRobotArmorStands = Utilities.dimensions.overworld.getEntities(cameraRobotArmorStandsQuery).filter((x) => {
		var cameraRobotTrackerDataNode = DataManager.getData(x, "cameraTracker");
		return (x.location.y == cameraHeight && cameraRobotTrackerDataNode && !cameraRobotTrackerDataNode.disabled && cameraRobotTrackerDataNode.type == "camera" && cameraRobotTrackerDataNode.isRobot);
	});

	cameraRobotArmorStands.forEach((cameraRobotArmorStand) => {
		var move = true;
		var tryRotate = true;
		var pathLevelBlock = overworld.getBlock(new Vector(cameraRobotArmorStand.location.x, robotPathHeight, cameraRobotArmorStand.location.z))!;
		var currRot = cameraRobotArmorStand.getRotation().y;
		if (Math.abs(cameraRobotArmorStand.location.x % 1 - 0.5) > 0.15) tryRotate = false; // Ensure the robot only turns near the center
		if (Math.abs(cameraRobotArmorStand.location.z % 1 - 0.5) > 0.15) tryRotate = false;
		if (tryRotate && pathLevelBlock.typeId == "minecraft:stone_brick_stairs") { // Terrible solution but works, see if it can be made better later
			var reqRot = getRotFromWeirdoDir(pathLevelBlock.permutation.getState("weirdo_direction") as number);
			if (reqRot < 0 && currRot > 90) reqRot = 270;
			if (reqRot > 0 && currRot < 0) currRot = 360 + currRot;
			if (Math.abs(reqRot - currRot) >= 25) {
				//console.log(`Curr: ${currRot}\nReq: ${reqRot}\nDir: ${Math.sign(reqRot - currRot)}`);
				cameraRobotArmorStand.setRotation({"x": 0, "y": currRot + Math.sign(reqRot - currRot) * 4.5});
				move = false;
			} else cameraRobotArmorStand.setRotation({"x": 0, "y": reqRot});
		}
		if (move) cameraRobotArmorStand.teleport({ "x": cameraRobotArmorStand.location.x + -(Utilities.sin(cameraRobotArmorStand.getRotation().y) * tpDistance), "y": cameraRobotArmorStand.location.y, "z": cameraRobotArmorStand.location.z + (Utilities.cos(cameraRobotArmorStand.getRotation().y) * tpDistance) })
		var cameraDataNode = DataManager.getData(cameraRobotArmorStand, "cameraTracker");
		cameraDataNode.rotation = cameraRobotArmorStand.getRotation().y;
		DataManager.setData(cameraRobotArmorStand, cameraDataNode);

		// Update visuals
		var cameraRobotQuery = {
			"type": "theheist:camera_robot",
			"location": { 'x': cameraRobotArmorStand.location.x, 'y': levelHeight, 'z': cameraRobotArmorStand.location.z },
			"maxDistance": 5,
			"closest": 1
		};
		var cameraRobot = Utilities.dimensions.overworld.getEntities(cameraRobotQuery)[0];
		cameraRobot.teleport(new Vector(cameraRobotArmorStand.location.x, -59.25, cameraRobotArmorStand.location.z));
		cameraRobot.setRotation(cameraRobotArmorStand.getRotation());
		if (system.currentTick % 100 == 0) overworld.playSound("map.robot", cameraRobot.location, { "volume": 2 }); // Every 5 seconds play robot ambience sound (100 = 20 * 5)
	});
}

function getRotFromWeirdoDir(weirdoDir: number): number {
	switch (weirdoDir) {
		case 0:
			return 90;
			break;
		case 1:
			return -90;
			break;
		case 2:
			return 180;
			break;
		case 3:
			return 0;
			break;
	}
	return 0;
}

function updateCameras(player: Player, level: number, playerLevelInformationDataNode: LevelInformation) {
	var playerCameraMappingHeightBlock = Utilities.dimensions.overworld.getBlock({ "x": player.location.x, "y": cameraMappingHeight - 3, "z": player.location.z });
	
	if (playerCameraMappingHeightBlock && playerCameraMappingHeightBlock.typeId == "theheist:camera_sight" && player.location.y < -56 && !player.hasTag("BUSTED")) {
		playerLevelInformationDataNode.information[0].level += 2;
		DataManager.setData(player, playerLevelInformationDataNode);
	}

	var cameraQuery = {
		"type": "armor_stand",
		"location": { 'x': player.location.x, 'y': cameraHeight, 'z': player.location.z },
		"maxDistance": 50
	};
	const cameraArmorStands = Utilities.dimensions.overworld.getEntities(cameraQuery).filter((x) => {
		var cameraTrackerDataNode = DataManager.getData(x, "cameraTracker");
		return (x.location.y == cameraHeight && cameraTrackerDataNode && cameraTrackerDataNode.disabled == false && cameraTrackerDataNode.type == "camera");
	});

	var cameraMappingQuery = {
		"type": "armor_stand",
		"location": { 'x': player.location.x, 'y': cameraMappingHeight, 'z': player.location.z },
		"maxDistance": 50
	};
	const cameraMappingArmorStands = Utilities.dimensions.overworld.getEntities(cameraMappingQuery).filter((x) => (x.location.y == cameraMappingHeight));

	if ((system.currentTick % 15 == 0)) {
		// 15 tick interval elapsed
		cameraMappingArmorStands.forEach((armorStand) => {
			armorStand.kill();
		});
		cameraArmorStands.forEach((armorStand) => {
			var cameraTrackerDataNode = DataManager.getData(armorStand, "cameraTracker");
			if (cameraTrackerDataNode.swivel) {
				// The camera rotates
				var rotateMode = cameraTrackerDataNode.swivel[0];
				var minRotation = cameraTrackerDataNode.swivel[1];
				var maxRotation = cameraTrackerDataNode.swivel[2];
				var rotation = cameraTrackerDataNode.rotation;
				if (rotateMode == 0) {
					// Decrease
					rotation -= 5;
					if (rotation <= minRotation) {
						rotation = minRotation;
						rotateMode = 1;
					}
				} else if (rotateMode == 1) {
					// Increase
					rotation += 5;
					if (rotation >= maxRotation) {
						rotation = maxRotation;
						rotateMode = 0;
					}
				}
				cameraTrackerDataNode.swivel[0] = rotateMode;
				cameraTrackerDataNode.rotation = rotation;
				var displayCameraQuery = {
					"type": "theheist:camera",
					"location": { 'x': armorStand.location.x, 'y': -57, 'z': armorStand.location.z },
					"maxDistance": 3,
					"closest": 1
				}
				var displayCamera = Utilities.dimensions.overworld.getEntities(displayCameraQuery)[0];
				displayCamera.setRotation({ "x": 0, "y": rotation });
				armorStand.setRotation({ "x": 0, "y": rotation });
				DataManager.setData(armorStand, cameraTrackerDataNode);
			}
			var yRot = armorStand.getRotation().y;
			var maxCount = rayDensity;
			for (var i = 0; i < maxCount; i++) {
				var rayArmorStand = Utilities.dimensions.overworld.spawnEntity("armor_stand", { "x": armorStand.location.x, "y": cameraMappingHeight, "z": armorStand.location.z });
				rayArmorStand.setRotation({ "x": 0, "y": (yRot - cameraFOV / 2) + (cameraFOV * i / (maxCount - 1)) });
				if (cameraTrackerDataNode.isRobot) {
					rayArmorStand.teleport({ "x": armorStand.location.x + -(Utilities.sin(armorStand.getRotation().y) * 0.7), "y": cameraMappingHeight, "z": armorStand.location.z + (Utilities.cos(armorStand.getRotation().y) * 0.7) });
				}
			}
			// Before we save the mapped out camera sight area, make sure we remove the block below the camera if there is one
			Utilities.setBlock({"x": armorStand.location.x, "y": cameraMappingHeight - 2, "z": armorStand.location.z}, "air");
		});
		Utilities.dimensions.overworld.runCommandAsync(`clone ${Utilities.levelCloneInfo["level_" + level].startX} ${cameraMappingHeight - 2} ${Utilities.levelCloneInfo["level_" + level].startZ} ${Utilities.levelCloneInfo["level_" + level].endX} ${cameraMappingHeight - 2} ${Utilities.levelCloneInfo["level_" + level].endZ} ${Utilities.levelCloneInfo["level_" + level].startX} ${cameraMappingHeight - 3} ${Utilities.levelCloneInfo["level_" + level].startZ}`);
		Utilities.dimensions.overworld.runCommandAsync(`fill ${Utilities.levelCloneInfo["level_" + level].startX} ${cameraMappingHeight - 2} ${Utilities.levelCloneInfo["level_" + level].startZ} ${Utilities.levelCloneInfo["level_" + level].endX} ${cameraMappingHeight - 2} ${Utilities.levelCloneInfo["level_" + level].endZ} air`);
		system.runTimeout(()=>{SensorModeFunc.updateSensorDisplay(player, DataManager.getData(player, "levelInformation"));}, 2); // Ensure the new blocks load before we update sensor display
	} else {
		//X: sin(player.getRotation().x) * 0.7
		const tpDistance = 0.7;
		const checkDistance = 0;
		cameraMappingArmorStands.forEach((armorStand) => {
			// x sin() needs to be inverted to work properly for some reason
			var belowBlock = { "x": armorStand.location.x, "y": armorStand.location.y - 2, "z": armorStand.location.z };
			armorStand.teleport({ "x": armorStand.location.x + -(Utilities.sin(armorStand.getRotation().y) * tpDistance), "y": cameraMappingHeight, "z": armorStand.location.z + (Utilities.cos(armorStand.getRotation().y) * tpDistance) }, { 'dimension': Utilities.dimensions.overworld });
			if (cameraCanSeeThrough(Vector.v3ToVector({ "x": armorStand.location.x + -(Utilities.sin(armorStand.getRotation().y) * checkDistance), "y": levelHeight, "z": armorStand.location.z + (Utilities.cos(armorStand.getRotation().y) * checkDistance) })))
				Utilities.setBlock(belowBlock, "theheist:camera_sight");
			else armorStand.kill();
		});
	}
}