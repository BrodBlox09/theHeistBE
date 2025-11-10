import { world, system, GameMode, Player, EntityQueryOptions, MolangVariableMap, BlockComponent, Block } from "@minecraft/server";
import { solidToTransparent } from "./gamebands/xray";
import * as StealthModeFunc from "./gamebands/stealth";
import * as SensorModeFunc from "./gamebands/sensor";
import DataManager from "./managers/DataManager";
import Utilities from "./Utilities";
import Vector from "./Vector";
import { LevelInformation, CameraSwivelMode, ILevelCloneInfo, AlarmTracker, GamebandTracker } from "./TypeDefinitions";
import LevelDefinitions from "./levels/LevelDefinitions";

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

system.runInterval(() => {
	// Only include adventure mode players
	let player = world.getPlayers({ "gameMode": GameMode.Adventure }).filter((x) => (x != undefined && x != null))[0];
	if (player == undefined) return;

	let playerLevelInformationDataNode = DataManager.getData(player, "levelInformation");
	if (!playerLevelInformationDataNode || !playerLevelInformationDataNode.runSecurity) return;
	let levelId = playerLevelInformationDataNode.id;
	let levelDefinition = LevelDefinitions.getLevelDefinitionByID(levelId);
	if (!levelDefinition) return;
	let levelCI = levelDefinition.levelCloneInfo;

	let alarmTracker = DataManager.getData(player, "alarmTracker")!;
	let gamebandTracker = DataManager.getData(player, "gamebandTracker")!;

	updateRobots(player);
	updateCameras(player, levelCI);
	updateSonars(player, levelCI);
	updateSonar360s(player);
	SensorModeFunc.updateSensorDisplay(player, gamebandTracker);
	updatePlayerAlarmLevel(player, gamebandTracker, alarmTracker);

	// Toggle below to see your velocity at all times, very useful when testing sonars
	// let playerVelocityV3 = player.getVelocity();
	// let playerVelocity: number = Math.abs(playerVelocityV3.x) + Math.abs(playerVelocityV3.y) + Math.abs(playerVelocityV3.z);
	// playerVelocity *= 100; // Because the player's velocity is a small number, increase it
	// playerVelocity = Math.round(playerVelocity * 100) / 100;
	// player.onScreenDisplay.setActionBar(`Velocity: ${playerVelocity}`);
});

function updatePlayerAlarmLevel(player: Player, gamebandTracker: GamebandTracker, alarmTracker: AlarmTracker) {
	if (player.hasTag("BUSTED")) return;

	// Movement-based security
	if (!alarmTracker.sonarTimeout) alarmTracker.sonarTimeout = 0;
	if (alarmTracker.sonarTimeout > 0) alarmTracker.sonarTimeout -= 1;

	var playerSonarMappingHeightBlock = Utilities.dimensions.overworld.getBlock({ "x": player.location.x, "y": cameraMappingHeight - 5, "z": player.location.z });
	if (playerSonarMappingHeightBlock && playerSonarMappingHeightBlock.typeId == "theheist:sonar_sight" && player.location.y < -57 && alarmTracker.sonarTimeout == 0) {
		// Check if player is moving and if so add to awareness based on speed
		let playerVelocityV3 = player.getVelocity();
		let playerVelocity = Math.abs(playerVelocityV3.x) + Math.abs(playerVelocityV3.y) + Math.abs(playerVelocityV3.z);
		playerVelocity *= 100; // Because the player's velocity is a small number, raise it
		if (playerVelocity > 5) {
			player.playSound("note.snare", { "pitch": 1.75, "volume": 0.5 });
			if (playerVelocity > 40) playerVelocity = 40;
			alarmTracker.level += playerVelocity;
		} else player.playSound("note.pling", { "pitch": 2, "volume": 0.4 });
		alarmTracker.sonarTimeout = sonarTimeoutTime;
	}

	// Presure-based security
	var playerBlock = Utilities.dimensions.overworld.getBlock(player.location);
	if (playerBlock && playerBlock.typeId == "minecraft:stone_pressure_plate")
		alarmTracker.level = 100;

	if (StealthModeFunc.playerIsInStealthMode(gamebandTracker)) return;
	// Vision-based security
	// Sight block stuff
	var playerCameraMappingHeightBlock = Utilities.dimensions.overworld.getBlock({ "x": player.location.x, "y": cameraMappingHeight - 3, "z": player.location.z });
	if (playerCameraMappingHeightBlock && playerCameraMappingHeightBlock.typeId == "theheist:camera_sight" && player.location.y < -57) {
		alarmTracker.level += 2;
		player.playSound("note.snare", { "pitch": 1.75, "volume": 0.5 });
	}

	// Laser block stuff
	var topBlock = playerBlock?.above();
	if (playerBlock && topBlock && (playerBlock.hasTag("laser") || topBlock.hasTag("laser")))
		alarmTracker.level = 100;

	DataManager.setData(player, alarmTracker);
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
	if (Utilities.dimensions.overworld.getEntities(entityQueryOptions).length > 0) return false;
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

function updateRobots(player: Player) {
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
			var cameraDataNode = DataManager.getData(cameraRobotArmorStand, "cameraTracker")!;
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
				if (system.currentTick % 3 == 0) disabledSecurityDeviceEffect(Vector.from(cameraRobot.location));
				return;
			}
			var move = (!cameraDataNode.isStatic);
			var tryRotate = true;
			var pathLevelBlock = Utilities.dimensions.overworld.getBlock(new Vector(cameraRobotArmorStand.location.x, robotPathHeight, cameraRobotArmorStand.location.z))!;
			var currRot = cameraRobotArmorStand.getRotation().y;
			if (Math.abs(cameraRobotArmorStand.location.x % 1 - 0.5) > 0.15) tryRotate = false; // Ensure the robot only turns near the center
			if (Math.abs(cameraRobotArmorStand.location.z % 1 - 0.5) > 0.15) tryRotate = false;
			if (tryRotate && pathLevelBlock.typeId == "minecraft:stone_brick_stairs") {
				var reqRot = getRotFromWeirdoDir(pathLevelBlock.permutation.getState("weirdo_direction")!);
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
			if (Utilities.dimensions.overworld.getBlock(cameraRobot.location)?.typeId == "minecraft:air") Utilities.setBlock(new Vector(cameraRobotArmorStand.location.x, Utilities.cameraMappingHeight - 4, cameraRobotArmorStand.location.z), "theheist:robot_path");
		} catch { }
	});
}

function disabledSecurityDeviceEffect(loc: Vector) {
	loc = loc.add(new Vector(0, 0.5, 0));
	var molangVarMap = new MolangVariableMap();
	molangVarMap.setSpeedAndDirection("direction", 1, new Vector(0, 0, 0));
	Utilities.dimensions.overworld.spawnParticle("minecraft:explosion_particle", loc, molangVarMap);
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

function updateCameras(player: Player, levelCI: ILevelCloneInfo) {
	const cameraQuery: EntityQueryOptions = {
		"type": "armor_stand",
		"location": { 'x': player.location.x, 'y': cameraHeight, 'z': player.location.z },
		"maxDistance": staticSecurityDeviceLoadingRange
	};
	const cameraArmorStands = Utilities.dimensions.overworld.getEntities(cameraQuery).filter((x) => {
		var cameraTrackerDataNode = DataManager.getData(x, "cameraTracker");
		if (x.location.y != cameraHeight || !cameraTrackerDataNode || cameraTrackerDataNode.type != "camera") return false;
		if (cameraTrackerDataNode.disabled) {
			if (system.currentTick % 3 == 0) {
				let trackerLocation = Vector.from(x.location);
				let displayCameraLocation = trackerLocation.clone();
				displayCameraLocation.y = Utilities.cameraDisplayHeight;
				disabledSecurityDeviceEffect(displayCameraLocation);
			}
			return false;
		}
		if (cameraTrackerDataNode.isStunned) return false;
		return true;
	});

	const cameraMappingQuery: EntityQueryOptions = {
		"type": "armor_stand",
		"location": { 'x': player.location.x, 'y': cameraMappingHeight, 'z': player.location.z },
		"maxDistance": movingSecurityDeviceLoadingRange,
		"tags": ["camera"]
	};
	const cameraMappingArmorStands = Utilities.dimensions.overworld.getEntities(cameraMappingQuery).filter((x) => (x.location.y == cameraMappingHeight));

	if (system.currentTick % 20 == 0) {
		// 20 tick interval elapsed
		cameraMappingArmorStands.forEach(armorStand => armorStand.kill());
		cameraArmorStands.forEach(armorStand => {
			let cameraTrackerDataNode = DataManager.getData(armorStand, "cameraTracker")!;
			if (cameraTrackerDataNode.swivel) {
				// The camera rotates
				let rotateMode = cameraTrackerDataNode.swivel[0];
				let minRotation = cameraTrackerDataNode.swivel[1];
				let maxRotation = cameraTrackerDataNode.swivel[2];
				let rotation = cameraTrackerDataNode.rotation;
				switch (rotateMode) {
					case CameraSwivelMode.Decrease:
						rotation -= 5;
						if (rotation <= minRotation) {
							rotation = minRotation;
							rotateMode = 1;
						}
						break;
					case CameraSwivelMode.Increase:
						rotation += 5;
						if (rotation >= maxRotation) {
							rotation = maxRotation;
							rotateMode = 0;
						}
						break;
					case CameraSwivelMode.Continous:
						rotation += 5;
						break;
				}
				cameraTrackerDataNode.swivel[0] = rotateMode;
				cameraTrackerDataNode.rotation = rotation;
				const displayCameraQuery = {
					"type": "theheist:camera",
					"location": { 'x': armorStand.location.x, 'y': -57, 'z': armorStand.location.z },
					"maxDistance": 3,
					"closest": 1
				}
				const displayCamera = Utilities.dimensions.overworld.getEntities(displayCameraQuery)[0];
				displayCamera.setRotation({ "x": 0, "y": rotation });
				armorStand.setRotation({ "x": 0, "y": rotation });
				DataManager.setData(armorStand, cameraTrackerDataNode);
			}
			let yRot = armorStand.getRotation().y;
			let maxCount = rayDensity;
			for (let i = 0; i < maxCount; i++) {
				let rayArmorStand = Utilities.dimensions.overworld.spawnEntity("minecraft:armor_stand", { "x": armorStand.location.x, "y": cameraMappingHeight, "z": armorStand.location.z });
				rayArmorStand.addTag("camera");
				rayArmorStand.setRotation({ "x": 0, "y": (yRot - cameraFOV / 2) + (cameraFOV * i / (maxCount - 1)) });
				if (cameraTrackerDataNode.isRobot) {
					rayArmorStand.teleport({ "x": armorStand.location.x + -(Utilities.sin(armorStand.getRotation().y) * 0.7), "y": cameraMappingHeight, "z": armorStand.location.z + (Utilities.cos(armorStand.getRotation().y) * 0.7) });
				}
			}
			// Before we save the mapped out camera sight area, make sure we remove the block cache below the camera tracker armor stand if there is one
			Utilities.setBlock({ "x": armorStand.location.x, "y": cameraMappingHeight - 2, "z": armorStand.location.z }, "air");
		});
		Utilities.dimensions.overworld.runCommand(`clone ${levelCI.startX} ${cameraMappingHeight - 2} ${levelCI.startZ} ${levelCI.endX} ${cameraMappingHeight - 2} ${levelCI.endZ} ${levelCI.startX} ${cameraMappingHeight - 3} ${levelCI.startZ}`);
		Utilities.dimensions.overworld.runCommand(`fill ${levelCI.startX} ${cameraMappingHeight - 2} ${levelCI.startZ} ${levelCI.endX} ${cameraMappingHeight - 2} ${levelCI.endZ} air`);
	} else {
		const tpDistance = 0.55;
		cameraMappingArmorStands.forEach(armorStand => {
			// x sin() must be inverted to work properly for some reason
			let belowBlock = { "x": armorStand.location.x, "y": armorStand.location.y - 2, "z": armorStand.location.z };
			armorStand.teleport({ "x": armorStand.location.x + -(Utilities.sin(armorStand.getRotation().y) * tpDistance), "y": cameraMappingHeight, "z": armorStand.location.z + (Utilities.cos(armorStand.getRotation().y) * tpDistance) }, { 'dimension': Utilities.dimensions.overworld });
			let armorStandLocation = Vector.from({ "x": armorStand.location.x, "y": Utilities.levelHeight, "z": armorStand.location.z });
			if (cameraCanSeeThrough(armorStandLocation)) {
				let floorBlock = Utilities.dimensions.overworld.getBlock({ "x": armorStand.location.x, "y": Utilities.floorCloneHeight, "z": armorStand.location.z })!.typeId;
				if ("minecraft:air" != floorBlock && floorBlock != "theheist:forcefield_bridge") {
					Utilities.setBlock(belowBlock, "theheist:camera_sight");
				}
			} else armorStand.kill();
		});
	}
}

function updateSonars(player: Player, levelCI: ILevelCloneInfo) {
	Utilities.fillBlocks(new Vector(levelCI.startX, Utilities.cameraMappingHeight - 5, levelCI.startZ), new Vector(levelCI.endX, Utilities.cameraMappingHeight - 5, levelCI.endZ), "air");

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
			if (system.currentTick % 3 == 0) disabledSecurityDeviceEffect(Vector.from(displayCamera.location));
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
				var rayArmorStand = Utilities.dimensions.overworld.spawnEntity("minecraft:armor_stand", { "x": armorStand.location.x, "y": cameraMappingHeight, "z": armorStand.location.z });
				rayArmorStand.addTag("sonar");
				rayArmorStand.setRotation({ "x": 0, "y": (yRot - cameraFOV / 2) + (cameraFOV * i / (maxCount - 1)) });
			}
		});
	} else {
		const tpDistance = 0.75;
		sonarMappingArmorStands.forEach((armorStand) => {
			// x sin() needs to be inverted to work properly for some reason
			armorStand.teleport({ "x": armorStand.location.x + -(Utilities.sin(armorStand.getRotation().y) * tpDistance), "y": cameraMappingHeight, "z": armorStand.location.z + (Utilities.cos(armorStand.getRotation().y) * tpDistance) }, { 'dimension': Utilities.dimensions.overworld });
			let armorStandLocationAbove = Vector.from({ "x": armorStand.location.x, "y": Utilities.levelHeight + 1, "z": armorStand.location.z });
			let armorStandLocationBelow = Vector.from({ "x": armorStand.location.x, "y": Utilities.cameraMappingHeight - 5, "z": armorStand.location.z });
			if (sonarCanSeeThrough(armorStandLocationAbove)) {
				let floorBlock = Utilities.dimensions.overworld.getBlock({ "x": armorStand.location.x, "y": Utilities.floorCloneHeight, "z": armorStand.location.z })!.typeId;
				if ("minecraft:air" != floorBlock && floorBlock != "theheist:forcefield_bridge")
					Utilities.setBlock(armorStandLocationBelow, "theheist:sonar_sight");
			} else armorStand.remove();
		});
	}
}

function updateSonar360s(player: Player) {
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
			if (system.currentTick % 3 == 0) disabledSecurityDeviceEffect(Vector.from(displayCamera.location));
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
					var rayArmorStand = Utilities.dimensions.overworld.spawnEntity("minecraft:armor_stand", { "x": armorStand.location.x + 0.6, "y": cameraMappingHeight, "z": armorStand.location.z });
					rayArmorStand.addTag("sonar360");
					rayArmorStand.setRotation({ "x": 0, "y": (270 - sonar360FOV / 2) + (sonar360FOV * i / (maxCount - 1)) });
				}
				for (var i = 0; i < maxCount; i++) {
					var rayArmorStand = Utilities.dimensions.overworld.spawnEntity("minecraft:armor_stand", { "x": armorStand.location.x - 0.6, "y": cameraMappingHeight, "z": armorStand.location.z });
					rayArmorStand.addTag("sonar360");
					rayArmorStand.setRotation({ "x": 0, "y": (90 - sonar360FOV / 2) + (sonar360FOV * i / (maxCount - 1)) });
				}
				for (var i = 0; i < maxCount; i++) {
					var rayArmorStand = Utilities.dimensions.overworld.spawnEntity("minecraft:armor_stand", { "x": armorStand.location.x, "y": cameraMappingHeight, "z": armorStand.location.z + 0.6 });
					rayArmorStand.addTag("sonar360");
					rayArmorStand.setRotation({ "x": 0, "y": (0 - sonar360FOV / 2) + (sonar360FOV * i / (maxCount - 1)) });
				}
				for (var i = 0; i < maxCount; i++) {
					var rayArmorStand = Utilities.dimensions.overworld.spawnEntity("minecraft:armor_stand", { "x": armorStand.location.x, "y": cameraMappingHeight, "z": armorStand.location.z - 0.6 });
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
			let armorStandLocationAbove = Vector.from({ "x": armorStand.location.x, "y": Utilities.levelHeight + 1, "z": armorStand.location.z });
			let armorStandLocationBelow = Vector.from({ "x": armorStand.location.x, "y": Utilities.cameraMappingHeight - 5, "z": armorStand.location.z });
			if (sonarCanSeeThrough(armorStandLocationAbove)) {
				let floorBlock = Utilities.dimensions.overworld.getBlock({ "x": armorStand.location.x, "y": Utilities.floorCloneHeight, "z": armorStand.location.z })!.typeId;
				if ("minecraft:air" != floorBlock && floorBlock != "theheist:forcefield_bridge")
					Utilities.setBlock(armorStandLocationBelow, "theheist:sonar_sight");
			} else armorStand.remove();
		});
	}
}