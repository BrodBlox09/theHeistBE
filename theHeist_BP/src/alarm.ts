import { world, system, GameMode } from "@minecraft/server";
import * as SensorModeFunc from "./gamebands/sensor";
import DataManager from "./DataManager";
import Utilities from "./Utilities";

/**
 * The alarm XP bar texture can sometimes, seemingly at random, break and use a strange default-looking one. Just reload the world until you get the custom xp bar.
 */

const levelMapHeight = 20;
const consolesHeight = -15;
const rechargeHeight = -20;
const cameraHeight = -25;
const cameraMappingHeight = -30;
const levelHeight = -59;

const cameraFOV = 40;

// Robots take exactly 1 second to turn 90 degrees
// Robots move at a speed of 1 blocks per 20 ticks

system.runInterval(() => {
	// Only include adventure mode players
	var player = world.getPlayers({"gameMode": GameMode.adventure}).filter((x) => (x != undefined && x != null))[0];
	if (player == undefined) return;

	var playerLevelInformationDataNode = DataManager.getData(player, "levelInformation");
	var level = undefined;
	if (playerLevelInformationDataNode) level = playerLevelInformationDataNode.information[1].level;
	if (playerLevelInformationDataNode == undefined || level == undefined || level > 0) return;
	
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
			//armorStand.setRotation({"x": 0, "y": yRot - 5});
			var maxCount = 11;
			for (var i = 0; i < maxCount; i++) {
				var rayArmorStand = Utilities.dimensions.overworld.spawnEntity("armor_stand", { "x": armorStand.location.x, "y": cameraMappingHeight, "z": armorStand.location.z });
				rayArmorStand.setRotation({ "x": 0, "y": (yRot - cameraFOV / 2) + (cameraFOV * i / (maxCount - 1)) });
			}
			// Before we save the mapped out camera sight area, make sure we remove the block below the camera if there is one
			Utilities.setBlock({"x": armorStand.location.x, "y": cameraMappingHeight - 2, "z": armorStand.location.z}, "air");
		});
		Utilities.dimensions.overworld.runCommandAsync(`clone ${Utilities.levelCloneInfo["level_" + level].startX} ${cameraMappingHeight - 2} ${Utilities.levelCloneInfo["level_" + level].startZ} ${Utilities.levelCloneInfo["level_" + level].endX} ${cameraMappingHeight - 2} ${Utilities.levelCloneInfo["level_" + level].endZ} ${Utilities.levelCloneInfo["level_" + level].startX} ${cameraMappingHeight - 3} ${Utilities.levelCloneInfo["level_" + level].startZ}`);
		Utilities.dimensions.overworld.runCommandAsync(`fill ${Utilities.levelCloneInfo["level_" + level].startX} ${cameraMappingHeight - 2} ${Utilities.levelCloneInfo["level_" + level].startZ} ${Utilities.levelCloneInfo["level_" + level].endX} ${cameraMappingHeight - 2} ${Utilities.levelCloneInfo["level_" + level].endZ} air`);
		system.runTimeout(()=>{SensorModeFunc.updateSensorDisplay();}, 2); // Ensure the new blocks load before we update sensor display
	} else {
		//X: sin(player.getRotation().x) * 0.7
		const tpDistance = 0.7;
		cameraMappingArmorStands.forEach((armorStand) => {
			// x sin() needs to be inverted to work properly for some reason
			armorStand.teleport({ "x": armorStand.location.x + -(Utilities.sin(armorStand.getRotation().y) * tpDistance), "y": cameraMappingHeight, "z": armorStand.location.z + (Utilities.cos(armorStand.getRotation().y) * tpDistance) }, { 'dimension': Utilities.dimensions.overworld });
			var blockAtLevel = Utilities.dimensions.overworld.getBlock({ "x": armorStand.location.x, "y": levelHeight, "z": armorStand.location.z });
			//player.sendMessage(`Block: ${blockAtLevel.typeId}`);
			//-----------------------------------------------------------------------Utilities.dimensions.overworld.fillBlocks
			var belowBlock = { "x": armorStand.location.x, "y": armorStand.location.y - 2, "z": armorStand.location.z };
			if (blockAtLevel && blockAtLevel.typeId == "minecraft:air") Utilities.setBlock(belowBlock, "theheist:camera_sight");
			else armorStand.kill();
			//player.sendMessage(`X: ${armorStand.location.x + -(sin(armorStand.getRotation().y) * tpDistance)} Y: ${cameraMappingHeight} Z: ${armorStand.location.z + (cos(armorStand.getRotation().y) * tpDistance)}`);
		});
	}

});