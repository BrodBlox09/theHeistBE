import { world, system, GameMode, Player, EntityQueryOptions, MolangVariableMap, BlockComponent, Block } from "@minecraft/server";
import { solidToTransparent } from "./gamebands/xray";
import * as SensorModeFunc from "./gamebands/sensor";
import DataManager from "./DataManager";
import Utilities from "./Utilities";
import Vector from "./Vector";

/**
 * The alarm XP bar texture can sometimes, seemingly at random, break and use a strange default-looking one. Just reload the world until you get the custom xp bar.
 */

const cameraHeight = Utilities.cameraHeight;
const cameraMappingHeight = Utilities.cameraMappingHeight;
const robotPathHeight = -49;
const levelHeight = -59;

const cameraFOV = 40;
const sonar360FOV = 70;
const rayDensity = 12;
const movingSecurityDeviceLoadingRange = 256;
const staticSecurityDeviceLoadingRange = 25; // To reduce lag, only map the areas & place camera mapping entities that might actually get the player seen
const sonarTimeoutTime = 3; // Time in ticks that the player is invulnerable to sonar after being seen (to stop double ticking)
const xrayTransparentBlocks = solidToTransparent.map(x => x.transparent);

const overworld = Utilities.dimensions.overworld;

function updatePlayerAlarmLevel(player: Player, levelInformation: LevelInformation) {
	if (player.hasTag("BUSTED")) return;

	// Movement-based security
	if (!levelInformation.information[0].sonarTimeout) levelInformation.information[0].sonarTimeout = 0;
	if (levelInformation.information[0].sonarTimeout > 0) levelInformation.information[0].sonarTimeout -= 1;

	var playerSonarMappingHeightBlock = Utilities.dimensions.overworld.getBlock({ "x": player.location.x, "y": cameraMappingHeight - 5, "z": player.location.z });
	if (playerSonarMappingHeightBlock && playerSonarMappingHeightBlock.typeId == "theheist:sonar_sight" && player.location.y < -57 && levelInformation.information[0].sonarTimeout == 0) {
		// Check if player is moving and if so add to awareness based on speed
		let playerVelocityV3 = player.getVelocity();
		let playerVelocity = Math.abs(playerVelocityV3.x) + Math.abs(playerVelocityV3.y) + Math.abs(playerVelocityV3.z);
		playerVelocity *= 100; // Because the player's velocity is a small number, raise it
		if (playerVelocity > 5) {
			player.playSound("note.snare", { "pitch": 1.75, "volume": 0.5 });
			if (playerVelocity > 40) playerVelocity = 40;
			levelInformation.information[0].level += playerVelocity;
			DataManager.setData(player, levelInformation);
		} else player.playSound("note.pling", { "pitch": 2, "volume": 0.4 });
		levelInformation.information[0].sonarTimeout = sonarTimeoutTime;
	}

	// Presure-based security
	var playerBlock = Utilities.dimensions.overworld.getBlock(player.location);
	if (playerBlock && playerBlock.typeId == "minecraft:stone_pressure_plate")
		levelInformation.information[0].level = 100;

	var playerIsStealth = levelInformation.currentModes.some(x => (x.mode == "stealth"));
	if (playerIsStealth) return;
	// Vision-based security
	// Sight block stuff
	var playerCameraMappingHeightBlock = Utilities.dimensions.overworld.getBlock({ "x": player.location.x, "y": cameraMappingHeight - 3, "z": player.location.z });
	if (playerCameraMappingHeightBlock && playerCameraMappingHeightBlock.typeId == "theheist:camera_sight" && player.location.y < -57) {
		levelInformation.information[0].level += 2;
		player.playSound("note.snare", { "pitch": 1.75, "volume": 0.5 });
	}

	// Laser block stuff
	var topBlock = playerBlock?.above();
	if (playerBlock && topBlock && (playerBlock.hasTag("laser") || topBlock.hasTag("laser")))
		levelInformation.information[0].level = 100;

	DataManager.setData(player, levelInformation);
}

function cameraCanSeeThrough(location: Vector): boolean {
	var bottomBlock = Utilities.dimensions.overworld.getBlock(location);
	var topBlock = Utilities.dimensions.overworld.getBlock(location.add(new Vector(0, 1, 0)));
	if (!topBlock || !bottomBlock) return false;
	var entityQueryOptions: EntityQueryOptions = {
		"maxDistance": 1.125,
		"tags": ["robot"],
		"location": new Vector(location.x, Utilities.cameraHeight, location.z)
	};
	if (overworld.getEntities(entityQueryOptions).length > 0) return false;
	var topBlockTID = topBlock.typeId;
	var bottomBlockTID = bottomBlock.typeId;
	if (xrayTransparentBlocks.includes(bottomBlockTID)) return false;
	if ((!bottomBlock.hasTag("plant") && bottomBlockTID != "minecraft:tallgrass") && topBlockTID == "minecraft:air") return true;
	if (bottomBlockTID == "minecraft:air" && topBlock.hasTag("text_sign")) return true;
	if (topBlockTID == "minecraft:glass" && bottomBlockTID == "minecraft:glass") return true;
	if (topBlockTID.startsWith("theheist:laser") && bottomBlockTID.startsWith("theheist:laser")) return true;
	if (topBlockTID.endsWith("_stained_glass") && bottomBlockTID.endsWith("_stained_glass")) return true;
	if (topBlockTID.endsWith("_stained_glass_pane") && bottomBlockTID.endsWith("_stained_glass_pane")) return true;
	if (bottomBlockTID.startsWith("theheist:custom_door_") && Utilities.getBlockState(bottomBlock, "theheist:open")) return true;
	return false;
}

function sonarCanSeeThrough(location: Vector): boolean {
	var block = Utilities.dimensions.overworld.getBlock(location);
	if (!block) return false;
	if (block.isAir) return true;
	if (block.typeId == "theheist:laser") return true;
	if (block.typeId.startsWith("theheist:custom_door_") && Utilities.getBlockState(block, "theheist:open")) return true;
	return false;
}

system.runInterval(() => {
	// Only include adventure mode players
	var player = world.getPlayers({ "gameMode": GameMode.adventure }).filter((x) => (x != undefined && x != null))[0];
	if (player == undefined) return;

	var playerLevelInformationDataNode = DataManager.getData(player, "levelInformation");
	var level = undefined;
	if (playerLevelInformationDataNode) level = playerLevelInformationDataNode.information[1].level;
	if (playerLevelInformationDataNode == undefined || level == undefined || level > 0) return;

	updateRobots(player, level, playerLevelInformationDataNode);
	updateCameras(player, level, playerLevelInformationDataNode);
	Utilities.fillBlocks(new Vector(Utilities.levelCloneInfo["level_" + level].startX, Utilities.cameraMappingHeight - 5, Utilities.levelCloneInfo["level_" + level].startZ), new Vector(Utilities.levelCloneInfo["level_" + level].endX, Utilities.cameraMappingHeight - 5, Utilities.levelCloneInfo["level_" + level].endZ), "air");
	updateSonars(player, level, playerLevelInformationDataNode);
	updateSonar360s(player, level, playerLevelInformationDataNode);
	SensorModeFunc.updateSensorDisplay(player, DataManager.getData(player, "levelInformation"));
	updatePlayerAlarmLevel(player, playerLevelInformationDataNode);

	// Toggle below to see your velocity at all times, very useful when testing sonars
	// let playerVelocityV3 = player.getVelocity();
	// let playerVelocity: any = Math.abs(playerVelocityV3.x) + Math.abs(playerVelocityV3.y) + Math.abs(playerVelocityV3.z);
	// playerVelocity *= 100; // Because the player's velocity is a small number, raise it
	// playerVelocity = Math.round(playerVelocity * 100) / 100;
	// player.onScreenDisplay.setActionBar(`Velocity: ${playerVelocity}`);
});

function updateRobots(player: Player, level: number, levelInformation: LevelInformation) {
	// Robots take exactly 1 second to turn 90 degrees
	// Robots move at a speed of 1 blocks per 20 ticks
	const tpDistance = 0.05;

	var cameraRobotArmorStandsQuery = {
		"type": "armor_stand",
		"location": { 'x': player.location.x, 'y': cameraHeight, 'z': player.location.z },
		"maxDistance": movingSecurityDeviceLoadingRange
	};
	const cameraRobotArmorStands = Utilities.dimensions.overworld.getEntities(cameraRobotArmorStandsQuery).filter((x) => {
		var cameraRobotTrackerDataNode = DataManager.getData(x, "cameraTracker");
		return (x.location.y == cameraHeight && cameraRobotTrackerDataNode && !cameraRobotTrackerDataNode.disabled && cameraRobotTrackerDataNode.isRobot);
	});

	cameraRobotArmorStands.forEach((cameraRobotArmorStand) => {
		try {
			var cameraDataNode = DataManager.getData(cameraRobotArmorStand, "cameraTracker");
			if (cameraDataNode.isStunned) {
				cameraDataNode.stunTimer -= 1;
				if (cameraDataNode.stunTimer <= 0) cameraDataNode.isStunned = false;
				DataManager.setData(cameraRobotArmorStand, cameraDataNode);

				var cameraRobotQuery = {
					"type": (cameraDataNode.type == "camera") ? "theheist:camera_robot" : "theheist:sonar_robot",
					"location": { 'x': cameraRobotArmorStand.location.x, 'y': levelHeight, 'z': cameraRobotArmorStand.location.z },
					"maxDistance": 5,
					"closest": 1
				};
				var cameraRobot = Utilities.dimensions.overworld.getEntities(cameraRobotQuery)[0];
				if (system.currentTick % 3 == 0) disabledSecurityDeviceEffect(Vector.v3ToVector(cameraRobot.location));
				return;
			}
			var move = (!cameraDataNode.isStatic);
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
					cameraRobotArmorStand.setRotation({ "x": 0, "y": currRot + Math.sign(reqRot - currRot) * 4.5 });
					move = false;
				} else cameraRobotArmorStand.setRotation({ "x": 0, "y": reqRot });
			}
			if (move) cameraRobotArmorStand.teleport({ "x": cameraRobotArmorStand.location.x + -(Utilities.sin(cameraRobotArmorStand.getRotation().y) * tpDistance), "y": cameraRobotArmorStand.location.y, "z": cameraRobotArmorStand.location.z + (Utilities.cos(cameraRobotArmorStand.getRotation().y) * tpDistance) })
			cameraDataNode.rotation = cameraRobotArmorStand.getRotation().y;
			DataManager.setData(cameraRobotArmorStand, cameraDataNode);

			// Update visuals
			var cameraRobotQuery = {
				"type": (cameraDataNode.type == "camera") ? "theheist:camera_robot" : "theheist:sonar_robot",
				"location": { 'x': cameraRobotArmorStand.location.x, 'y': levelHeight, 'z': cameraRobotArmorStand.location.z },
				"maxDistance": 5,
				"closest": 1
			};
			var cameraRobot = Utilities.dimensions.overworld.getEntities(cameraRobotQuery)[0];
			cameraRobot.teleport(new Vector(cameraRobotArmorStand.location.x, -59.25, cameraRobotArmorStand.location.z));
			cameraRobot.setRotation(cameraRobotArmorStand.getRotation());
			if (overworld.getBlock(cameraRobot.location)?.typeId == "minecraft:air") Utilities.setBlock(new Vector(cameraRobotArmorStand.location.x, Utilities.cameraMappingHeight - 4, cameraRobotArmorStand.location.z), "theheist:robot_path");
			if (system.currentTick % ((cameraDataNode.type == "camera") ? 82 : 40) == 0) overworld.playSound((cameraDataNode.type == "camera") ? "map.robot" : "map.robot2", cameraRobot.location, { "volume": 2 }); // Every 5 or 2 seconds play robot ambience sound (100 = 20 * 5, 40 = 20 * 2)
		} catch { }
	});
}

function disabledSecurityDeviceEffect(loc: Vector) {
	loc = loc.add(new Vector(0, 0.5, 0));
	var molangVarMap = new MolangVariableMap();
	molangVarMap.setSpeedAndDirection("direction", 1, new Vector(0, 0, 0));
	overworld.spawnParticle("minecraft:explosion_particle", loc, molangVarMap);
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
	var cameraQuery: EntityQueryOptions = {
		"type": "armor_stand",
		"location": { 'x': player.location.x, 'y': cameraHeight, 'z': player.location.z },
		"maxDistance": staticSecurityDeviceLoadingRange
	};
	const cameraArmorStands = Utilities.dimensions.overworld.getEntities(cameraQuery).filter((x) => {
		var cameraTrackerDataNode = DataManager.getData(x, "cameraTracker");
		if (x.location.y != cameraHeight || !cameraTrackerDataNode || cameraTrackerDataNode.type != "camera") return false;
		if (cameraTrackerDataNode.disabled) {
			var displayCameraQuery = {
				"type": "theheist:camera",
				"location": { 'x': x.location.x, 'y': -57, 'z': x.location.z },
				"maxDistance": 3,
				"closest": 1
			}
			var displayCamera = Utilities.dimensions.overworld.getEntities(displayCameraQuery)[0];
			if (system.currentTick % 3 == 0) disabledSecurityDeviceEffect(Vector.v3ToVector(displayCamera.location));
			return false;
		}
		if (cameraTrackerDataNode.isStunned) {
			return false;
		}
		return true;
	});

	var cameraMappingQuery: EntityQueryOptions = {
		"type": "armor_stand",
		"location": { 'x': player.location.x, 'y': cameraMappingHeight, 'z': player.location.z },
		"maxDistance": movingSecurityDeviceLoadingRange,
		"tags": ["camera"]
	};
	const cameraMappingArmorStands = Utilities.dimensions.overworld.getEntities(cameraMappingQuery).filter((x) => (x.location.y == cameraMappingHeight));

	if ((system.currentTick % 20 == 0)) {
		// 20 tick interval elapsed
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
				} else if (rotateMode == 2) {
					// Increase
					rotation += 5;
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
				rayArmorStand.addTag("camera");
				rayArmorStand.setRotation({ "x": 0, "y": (yRot - cameraFOV / 2) + (cameraFOV * i / (maxCount - 1)) });
				if (cameraTrackerDataNode.isRobot) {
					rayArmorStand.teleport({ "x": armorStand.location.x + -(Utilities.sin(armorStand.getRotation().y) * 0.7), "y": cameraMappingHeight, "z": armorStand.location.z + (Utilities.cos(armorStand.getRotation().y) * 0.7) });
				}
			}
			// Before we save the mapped out camera sight area, make sure we remove the block below the camera if there is one
			Utilities.setBlock({ "x": armorStand.location.x, "y": cameraMappingHeight - 2, "z": armorStand.location.z }, "air");
		});
		Utilities.dimensions.overworld.runCommandAsync(`clone ${Utilities.levelCloneInfo["level_" + level].startX} ${cameraMappingHeight - 2} ${Utilities.levelCloneInfo["level_" + level].startZ} ${Utilities.levelCloneInfo["level_" + level].endX} ${cameraMappingHeight - 2} ${Utilities.levelCloneInfo["level_" + level].endZ} ${Utilities.levelCloneInfo["level_" + level].startX} ${cameraMappingHeight - 3} ${Utilities.levelCloneInfo["level_" + level].startZ}`);
		Utilities.dimensions.overworld.runCommandAsync(`fill ${Utilities.levelCloneInfo["level_" + level].startX} ${cameraMappingHeight - 2} ${Utilities.levelCloneInfo["level_" + level].startZ} ${Utilities.levelCloneInfo["level_" + level].endX} ${cameraMappingHeight - 2} ${Utilities.levelCloneInfo["level_" + level].endZ} air`);
	} else {
		const tpDistance = 0.55;
		cameraMappingArmorStands.forEach((armorStand) => {
			// x sin() needs to be inverted to work properly for some reason
			var belowBlock = { "x": armorStand.location.x, "y": armorStand.location.y - 2, "z": armorStand.location.z };
			armorStand.teleport({ "x": armorStand.location.x + -(Utilities.sin(armorStand.getRotation().y) * tpDistance), "y": cameraMappingHeight, "z": armorStand.location.z + (Utilities.cos(armorStand.getRotation().y) * tpDistance) }, { 'dimension': Utilities.dimensions.overworld });
			let armorStandLocation = Vector.v3ToVector({ "x": armorStand.location.x, "y": Utilities.levelHeight, "z": armorStand.location.z });
			if (cameraCanSeeThrough(armorStandLocation)) {
				let floorBlock = overworld.getBlock({ "x": armorStand.location.x, "y": Utilities.floorCloneHeight, "z": armorStand.location.z })!.typeId;
				if ("minecraft:air" != floorBlock && floorBlock != "theheist:forcefield_bridge") {
					Utilities.setBlock(belowBlock, "theheist:camera_sight");
				}
			} else armorStand.kill();
		});
	}
}

function updateSonars(player: Player, level: number, playerLevelInformationDataNode: LevelInformation) {
	var sonarQuery: EntityQueryOptions = {
		"type": "armor_stand",
		"location": { 'x': player.location.x, 'y': cameraHeight, 'z': player.location.z },
		"maxDistance": staticSecurityDeviceLoadingRange
	};
	const sonarArmorStands = Utilities.dimensions.overworld.getEntities(sonarQuery).filter((x) => {
		var cameraTrackerDataNode = DataManager.getData(x, "cameraTracker");
		if (x.location.y != cameraHeight || !cameraTrackerDataNode || cameraTrackerDataNode.type != "sonar") return false;
		if (cameraTrackerDataNode.disabled) {
			var displayCameraQuery = {
				"type": `theheist:sonar`,
				"location": { 'x': x.location.x, 'y': -57, 'z': x.location.z },
				"maxDistance": 3,
				"closest": 1
			}
			var displayCamera = Utilities.dimensions.overworld.getEntities(displayCameraQuery)[0];
			if (system.currentTick % 3 == 0) disabledSecurityDeviceEffect(Vector.v3ToVector(displayCamera.location));
			return false;
		}
		if (cameraTrackerDataNode.isStunned) {
			return false;
		}
		return true;
	});

	var sonarMappingQuery: EntityQueryOptions = {
		"type": "armor_stand",
		"location": { 'x': player.location.x, 'y': cameraMappingHeight, 'z': player.location.z },
		"maxDistance": movingSecurityDeviceLoadingRange,
		"tags": ["sonar"]
	};
	const sonarMappingArmorStands = Utilities.dimensions.overworld.getEntities(sonarMappingQuery).filter((x) => (x.location.y == cameraMappingHeight));

	if ((system.currentTick % 15 == 0)) {
		// 15 tick interval elapsed
		sonarMappingArmorStands.forEach((armorStand) => {
			armorStand.kill();
		});
		sonarArmorStands.forEach((armorStand) => {
			var yRot = armorStand.getRotation().y;
			var maxCount = rayDensity;
			for (var i = 0; i < maxCount; i++) {
				var rayArmorStand = Utilities.dimensions.overworld.spawnEntity("armor_stand", { "x": armorStand.location.x, "y": cameraMappingHeight, "z": armorStand.location.z });
				rayArmorStand.addTag("sonar");
				rayArmorStand.setRotation({ "x": 0, "y": (yRot - cameraFOV / 2) + (cameraFOV * i / (maxCount - 1)) });
			}
		});
	} else {
		const tpDistance = 0.75;
		sonarMappingArmorStands.forEach((armorStand) => {
			// x sin() needs to be inverted to work properly for some reason
			armorStand.teleport({ "x": armorStand.location.x + -(Utilities.sin(armorStand.getRotation().y) * tpDistance), "y": cameraMappingHeight, "z": armorStand.location.z + (Utilities.cos(armorStand.getRotation().y) * tpDistance) }, { 'dimension': Utilities.dimensions.overworld });
			let armorStandLocationAbove = Vector.v3ToVector({ "x": armorStand.location.x, "y": Utilities.levelHeight + 1, "z": armorStand.location.z });
			let armorStandLocationBelow = Vector.v3ToVector({ "x": armorStand.location.x, "y": Utilities.cameraMappingHeight - 5, "z": armorStand.location.z });
			if (sonarCanSeeThrough(armorStandLocationAbove)) {
				let floorBlock = overworld.getBlock({ "x": armorStand.location.x, "y": Utilities.floorCloneHeight, "z": armorStand.location.z })!.typeId;
				if ("minecraft:air" != floorBlock && floorBlock != "theheist:forcefield_bridge")
					Utilities.setBlock(armorStandLocationBelow, "theheist:sonar_sight");
			} else armorStand.remove();
		});
	}
}

function updateSonar360s(player: Player, level: number, playerLevelInformationDataNode: LevelInformation) {
	var sonarQuery: EntityQueryOptions = {
		"type": "armor_stand",
		"location": { 'x': player.location.x, 'y': cameraHeight, 'z': player.location.z },
		"maxDistance": staticSecurityDeviceLoadingRange
	};
	const sonarArmorStands = Utilities.dimensions.overworld.getEntities(sonarQuery).filter((x) => {
		var cameraTrackerDataNode = DataManager.getData(x, "cameraTracker");
		if (x.location.y != cameraHeight || !cameraTrackerDataNode || cameraTrackerDataNode.type != "sonar360") return false;
		if (cameraTrackerDataNode.disabled) {
			var displayCameraQuery = {
				"type": `theheist:sonar360`,
				"location": { 'x': x.location.x, 'y': -57, 'z': x.location.z },
				"maxDistance": 3,
				"closest": 1
			}
			var displayCamera = Utilities.dimensions.overworld.getEntities(displayCameraQuery)[0];
			if (system.currentTick % 3 == 0) disabledSecurityDeviceEffect(Vector.v3ToVector(displayCamera.location));
			return false;
		}
		if (cameraTrackerDataNode.isStunned) {
			return false;
		}
		return true;
	});

	var sonarMappingQuery: EntityQueryOptions = {
		"type": "armor_stand",
		"location": { 'x': player.location.x, 'y': cameraMappingHeight, 'z': player.location.z },
		"maxDistance": movingSecurityDeviceLoadingRange,
		"tags": ["sonar360"]
	};
	const sonarMappingArmorStands = Utilities.dimensions.overworld.getEntities(sonarMappingQuery).filter((x) => (x.location.y == cameraMappingHeight));

	if ((system.currentTick % 15 == 0)) {
		// 15 tick interval elapsed
		sonarMappingArmorStands.forEach((armorStand) => {
			armorStand.kill();
		});
		sonarArmorStands.forEach((armorStand) => {
			var yRot = armorStand.getRotation().y;
			var maxCount = rayDensity;
			//system.runTimeout(() => {
				for (var i = 0; i < maxCount; i++) {
					var rayArmorStand = Utilities.dimensions.overworld.spawnEntity("armor_stand", { "x": armorStand.location.x + 0.6, "y": cameraMappingHeight, "z": armorStand.location.z });
					rayArmorStand.addTag("sonar360");
					rayArmorStand.setRotation({ "x": 0, "y": (270 - sonar360FOV / 2) + (sonar360FOV * i / (maxCount - 1)) });
				}
				for (var i = 0; i < maxCount; i++) {
					var rayArmorStand = Utilities.dimensions.overworld.spawnEntity("armor_stand", { "x": armorStand.location.x - 0.6, "y": cameraMappingHeight, "z": armorStand.location.z });
					rayArmorStand.addTag("sonar360");
					rayArmorStand.setRotation({ "x": 0, "y": (90 - sonar360FOV / 2) + (sonar360FOV * i / (maxCount - 1)) });
				}
				for (var i = 0; i < maxCount; i++) {
					var rayArmorStand = Utilities.dimensions.overworld.spawnEntity("armor_stand", { "x": armorStand.location.x, "y": cameraMappingHeight, "z": armorStand.location.z + 0.6 });
					rayArmorStand.addTag("sonar360");
					rayArmorStand.setRotation({ "x": 0, "y": (0 - sonar360FOV / 2) + (sonar360FOV * i / (maxCount - 1)) });
				}
				for (var i = 0; i < maxCount; i++) {
					var rayArmorStand = Utilities.dimensions.overworld.spawnEntity("armor_stand", { "x": armorStand.location.x, "y": cameraMappingHeight, "z": armorStand.location.z - 0.6 });
					rayArmorStand.addTag("sonar360");
					rayArmorStand.setRotation({ "x": 0, "y": (180 - sonar360FOV / 2) + (sonar360FOV * i / (maxCount - 1)) });
				}
			//}, 5);
		});
	} else {
		const tpDistance = 0.55;
		sonarMappingArmorStands.forEach((armorStand) => {
			// x sin() needs to be inverted to work properly for some reason
			armorStand.teleport({ "x": armorStand.location.x + -(Utilities.sin(armorStand.getRotation().y) * tpDistance), "y": cameraMappingHeight, "z": armorStand.location.z + (Utilities.cos(armorStand.getRotation().y) * tpDistance) }, { 'dimension': Utilities.dimensions.overworld });
			let armorStandLocationAbove = Vector.v3ToVector({ "x": armorStand.location.x, "y": Utilities.levelHeight + 1, "z": armorStand.location.z });
			let armorStandLocationBelow = Vector.v3ToVector({ "x": armorStand.location.x, "y": Utilities.cameraMappingHeight - 5, "z": armorStand.location.z });
			if (sonarCanSeeThrough(armorStandLocationAbove)) {
				let floorBlock = overworld.getBlock({ "x": armorStand.location.x, "y": Utilities.floorCloneHeight, "z": armorStand.location.z })!.typeId;
				if ("minecraft:air" != floorBlock && floorBlock != "theheist:forcefield_bridge")
					Utilities.setBlock(armorStandLocationBelow, "theheist:sonar_sight");
			} else armorStand.remove();
		});
	}
}