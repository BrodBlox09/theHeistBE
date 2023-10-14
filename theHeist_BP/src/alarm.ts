import { BlockPermutation, world, system } from "@minecraft/server";
import * as dataManager from "./imports/entity_dynamic_properties";
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

const levelCloneInfo: Record<string, Record<string, number>> = {
	"level_0": {
		"startX": 1975,
		"startZ": 42,
		"endX": 2022,
		"endZ": 77
	},
	"level_-1": {

	}
}

// Second in ticks
const SECOND = 20;

const overworld = world.getDimension("overworld");

system.runInterval(() => {
	var player = world.getPlayers().filter((x) => (x != undefined && x != null))[0];
	if (player == undefined) return;

	var playerLevelInformationDataNode = dataManager.getData(player, "levelInformation");
	var level = undefined;
	if (playerLevelInformationDataNode) level = playerLevelInformationDataNode.information[1].level;
	if (playerLevelInformationDataNode == undefined || level == undefined || level > 0) return;

	var playerCameraMappingHeightBlock = overworld.getBlock({ "x": player.location.x, "y": cameraMappingHeight - 3, "z": player.location.z });

	if (playerCameraMappingHeightBlock && playerCameraMappingHeightBlock.typeId == "theheist:camera_sight" && player.location.y < -56 && !player.hasTag("BUSTED")) {
		playerLevelInformationDataNode.information[0].level += 2;
		dataManager.setData(player, "levelInformation", playerLevelInformationDataNode);
		//player.sendMessage("You are in the camera's vision!");
	}

	var cameraQuery = {
		"type": "armor_stand",
		"location": { 'x': player.location.x, 'y': cameraHeight, 'z': player.location.z },
		"maxDistance": 50
	};
	const cameraArmorStands = overworld.getEntities(cameraQuery).filter((x) => {
		var cameraTrackerDataNode = dataManager.getData(x, "cameraTracker");
		return (x.location.y == cameraHeight && cameraTrackerDataNode && cameraTrackerDataNode.disabled == false && cameraTrackerDataNode.type == "camera");
	});

	var cameraMappingQuery = {
		"type": "armor_stand",
		"location": { 'x': player.location.x, 'y': cameraMappingHeight, 'z': player.location.z },
		"maxDistance": 50
	};
	const cameraMappingArmorStands = overworld.getEntities(cameraMappingQuery).filter((x) => (x.location.y == cameraMappingHeight));

	if ((system.currentTick % 15 == 0)) {
		// 15 tick interval elapsed
		cameraMappingArmorStands.forEach((armorStand) => {
			armorStand.kill();
		});
		overworld.runCommandAsync(`clone ${levelCloneInfo["level_" + level].startX} ${cameraMappingHeight - 2} ${levelCloneInfo["level_" + level].startZ} ${levelCloneInfo["level_" + level].endX} ${cameraMappingHeight - 2} ${levelCloneInfo["level_" + level].endZ} ${levelCloneInfo["level_" + level].startX} ${cameraMappingHeight - 3} ${levelCloneInfo["level_" + level].startZ}`);
		overworld.runCommandAsync(`fill ${levelCloneInfo["level_" + level].startX} ${cameraMappingHeight - 2} ${levelCloneInfo["level_" + level].startZ} ${levelCloneInfo["level_" + level].endX} ${cameraMappingHeight - 2} ${levelCloneInfo["level_" + level].endZ} air`);
		cameraArmorStands.forEach((armorStand) => {
			var cameraTrackerDataNode = dataManager.getData(armorStand, "cameraTracker");
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
				var displayCamera = overworld.getEntities(displayCameraQuery)[0];
				displayCamera.setRotation({ "x": 0, "y": rotation });
				armorStand.setRotation({ "x": 0, "y": rotation });
				dataManager.setData(armorStand, "cameraTracker", cameraTrackerDataNode);
			}
			var yRot = armorStand.getRotation().y;
			//armorStand.setRotation({"x": 0, "y": yRot - 5});
			var FOV = 60;
			var maxCount = 11;
			for (var i = 0; i < maxCount; i++) {
				var rayArmorStand = overworld.spawnEntity("armor_stand", { "x": armorStand.location.x, "y": cameraMappingHeight, "z": armorStand.location.z });
				rayArmorStand.setRotation({ "x": 0, "y": (yRot - FOV / 2) + (FOV * i / (maxCount - 1)) });
			}
		});
	} else {
		//X: sin(player.getRotation().x) * 0.7
		const tpDistance = 0.7;
		cameraMappingArmorStands.forEach((armorStand) => {
			// x sin() needs to be inverted to work properly for some reason
			armorStand.teleport({ "x": armorStand.location.x + -(Utilities.sin(armorStand.getRotation().y) * tpDistance), "y": cameraMappingHeight, "z": armorStand.location.z + (Utilities.cos(armorStand.getRotation().y) * tpDistance) }, { 'dimension': overworld });
			var blockAtLevel = overworld.getBlock({ "x": armorStand.location.x, "y": levelHeight, "z": armorStand.location.z });
			//player.sendMessage(`Block: ${blockAtLevel.typeId}`);
			//-----------------------------------------------------------------------overworld.fillBlocks
			//var belowBlock = new Vector(armorStand.location.x, armorStand.location.y - 2, armorStand.location.z);
			var belowBlock = { "x": armorStand.location.x, "y": armorStand.location.y - 2, "z": armorStand.location.z };
			if (blockAtLevel && blockAtLevel.typeId == "minecraft:air") overworld.fillBlocks(belowBlock, belowBlock, BlockPermutation.resolve("theheist:camera_sight"));
			//armorStand.runCommandAsync('setblock ~ ~-2 ~ theheist:camera_sight');
			else armorStand.kill();
			//player.sendMessage(`X: ${armorStand.location.x + -(sin(armorStand.getRotation().y) * tpDistance)} Y: ${cameraMappingHeight} Z: ${armorStand.location.z + (cos(armorStand.getRotation().y) * tpDistance)}`);
		});
	}

});