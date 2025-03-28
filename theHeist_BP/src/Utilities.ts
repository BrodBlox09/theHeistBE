import { BlockPermutation, Vector3, Block, world, Player, Container, EntityInventoryComponent, ItemStack, ItemLockMode, BlockVolume, BlockType, BlockFillOptions, Entity, EntityEquippableComponent, EquipmentSlot } from "@minecraft/server";
import DataManager from "./DataManager";
import Vector from "./Vector";
import { BlockStateSuperset } from "@minecraft/vanilla-data";

export default class Utilities {
	static dimensions = {
		overworld: world.getDimension("overworld"),
		nether: world.getDimension("nether"),
		the_end: world.getDimension("the_end")
	}

	static swapKVPs(json: Record<any, any>) {
		var ret: Record<any, any> = {};
		for (var key in json) {
			ret[json[key]] = key;
		}
		return ret;
	}

	static levelToLevelID: Record<number, string> = {
		1: "1-1",
		0.5: "0-1",
		0: "0-2"
	}

	static levelIDToLevel: Record<string, number> = this.swapKVPs(this.levelToLevelID);

	static sin(d: number): number {
		return Math.sin(d * Math.PI / 180);
	}

	static cos(d: number): number {
		return Math.cos(d * Math.PI / 180);
	}

	// Inclusive min, exclusive max
	static getRandInt(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min) + min);
	}

	static spawnEntity(location: Vector3, identitifier: string): Entity {
		return this.dimensions.overworld.spawnEntity(identitifier, location);
	}

	static setBlock(location: Vector3, block: string, permutations: Record<string, string | number | boolean> | undefined = undefined) {
		this.dimensions.overworld.getBlock(location)?.setPermutation(BlockPermutation.resolve(block, permutations));
	}

	static setBlockState(block: Block, stateName: string, stateValue: boolean | number | string, checkForRedundance: boolean = true) {
		if (checkForRedundance && block.permutation.getState(stateName as keyof BlockStateSuperset) === stateValue) return;
		block.setPermutation(block.permutation.withState(stateName as keyof BlockStateSuperset, stateValue));
	}

	static getBlockState(block: Block, stateName: string) {
		return block.permutation.getState(stateName as keyof BlockStateSuperset);
	}

	static permutationWithState(permutation: BlockPermutation, stateName: string, value: string | number  | boolean | undefined) {
		return permutation.withState(stateName as keyof BlockStateSuperset, value);
	}

	static fillBlocks2(location1: Vector3, location2: Vector3, block: BlockPermutation | BlockType | string, options?: BlockFillOptions) {
		this.dimensions.overworld.fillBlocks(new BlockVolume(location1, location2), block, options);
	}

	static fillBlocks(location1: Vector3, location2: Vector3, block: string, permutations: Record<string, string | number | boolean> | undefined = undefined) {
		this.dimensions.overworld.fillBlocks(new BlockVolume(location1, location2), BlockPermutation.resolve(block, permutations), {
			"ignoreChunkBoundErrors": true
		});
	}

	static fillBlocksWithPermutation(location1: Vector3, location2: Vector3, permutation: BlockPermutation) {
		this.dimensions.overworld.fillBlocks(new BlockVolume(location1, location2), permutation, {
			"ignoreChunkBoundErrors": true
		});
	}

	static fillBlocksWithOptions(location1: Vector3, location2: Vector3, block: string, options: BlockFillOptions, permutations: Record<string, string | number | boolean> | undefined = undefined) {
		if (!options.ignoreChunkBoundErrors) options.ignoreChunkBoundErrors = true;
		this.dimensions.overworld.fillBlocks(new BlockVolume(location1, location2), BlockPermutation.resolve(block, permutations), options);
	}

	static reloadPlayerInv(player: Player, levelData: any = null) {
		if (levelData == null) levelData = DataManager.getData(player, "levelInformation");
		var playerInvContainer = (player.getComponent("inventory") as EntityInventoryComponent).container as Container;
		playerInvContainer.clearAll();
		var playerInvData = levelData!.information[2].inventory; // Array of player inventory slots
		playerInvData.forEach((invSlotData: any) => {
			var itemStack: ItemStack = new ItemStack(invSlotData.typeId);
			itemStack.keepOnDeath = true;
			if (invSlotData.lockMode) itemStack.lockMode = ItemLockMode[invSlotData.lockMode as keyof typeof ItemLockMode];
			playerInvContainer.setItem(invSlotData.slot, itemStack);
		});
		(player.getComponent("equippable") as EntityEquippableComponent).setEquipment(EquipmentSlot.Head, new ItemStack("theheist:nv_glasses"));
	}

	/**
	 * @description Saves player's inventory. Ensure this function is run BEFORE whenever you want to enter into a "1 mode only" state.
	 * @param player 
	 * @param stripEnchants Whether or not to remove enchants from all items in the player's inventory
	 * @returns 
	 */
	static savePlayerInventory(player: Player, stripEnchants: Boolean = false): LevelInformation {
		var playerInvContainer = (player.getComponent("inventory") as EntityInventoryComponent).container as Container;
		var playerLevelData: LevelInformation = DataManager.getData(player, "levelInformation");
		var newPlayerInvData = [];
		for (var i = 0; i < playerInvContainer.size; i++) {
			var itemStack = playerInvContainer.getItem(i);
			if (itemStack) {
				let typeId = itemStack.typeId;
				if (stripEnchants && typeId.endsWith("_enchanted")) typeId = typeId.substring(0, typeId.length - "_enchanted".length);
				newPlayerInvData.push({
					"slot": i,
					"typeId": typeId,
					"lockMode": itemStack.lockMode
				});
			}
		}
		playerLevelData.information[2].inventory = newPlayerInvData;
		// Update player information
		DataManager.setData(player, playerLevelData);
		return playerLevelData;
	}

	static clearPlayerInventory(player: Player) {
		var playerInvContainer = (player.getComponent("inventory") as EntityInventoryComponent).container as Container;
		playerInvContainer.clearAll();
	}

	static inventoryContainerHasItem(container: Container, item: string): boolean {
		for (var i = 0; i < container.size; i++) {
			if (container.getItem(i)?.typeId == item) return true;
		}
		return false;
	}

	static inventoryContainerIndexOf(container: Container, item: string): number | null {
		for (var i = 0; i < container.size; i++) {
			if (container.getItem(i)?.typeId == item) return i;
		}
		return null;
	}

	static gamebandInfo: Record<string, Record<number, Record<string, any>>> = {
		"rechargeMode": {
			1: {
				"speed": 20.0,
				"max": 100.0
			},
			2: {
				"speed": 20.0,
				"max": 150.0
			},
			3: {
				"speed": 20.0,
				"max": 200.0
			}
		},
		"hackingMode": {
			1: {
				"cost": 15.0
			},
			2: {
				"cost": 10.0
			},
			3: {
				"cost": 5.0
			}
		},
		"sensorMode": {
			1: {
				"cost": 1.0
			},
			2: {
				"cost": 0.4
			}
		},
		"xrayMode": {
			1: {
				"cost": 1.33
			},
			2: {
				"cost": 0.67
			}
		},
		"magnetMode": {
			1: {
				"cost": 1.6
			}
		},
		"stealthMode": {
			1: {
				"cost": 40
			}
		},
		"stunMode": {
			1: {
				"cost": 10
			}
		},
		"drillMode": {
			1: {
				"cost": 30
			}
		}
	}

	static levelCloneInfo: Record<string, ILevelCloneInfo> = {
		"level_0": {
			"startX": 1975,
			"startZ": 42,
			"endX": 2022,
			"endZ": 77,
			"prisonLoc": new Vector(0,0,0),
			"mapLoc": new Vector(0,0,0)
		},
		"level_-1": {
			"startX": 3028,
			"startZ": 97,
			"endX": 3109,
			"endZ": 161,
			"prisonLoc": new Vector(3109.5, -59, 91.5),
			"mapLoc": new Vector(0,0,0)
		},
		"level_-2": {
			"startX": 4060,
			"startZ": 91,
			"endX": 4133,
			"endZ": 159,
			"prisonLoc": new Vector(4075.5, -59, 151.5),
			"mapLoc": new Vector(4098, -55, 115)
		},
		"level_-3": {
			"startX": 4963,
			"startZ": 89,
			"endX": 5031,
			"endZ": 182,
			"prisonLoc": new Vector(5011.5, -59, 151.5),
			"mapLoc": new Vector(4986, -55, 131)
		},
		"level_-4": {
			"startX": 5843,
			"startZ": 99,
			"endX": 5928,
			"endZ": 183,
			"prisonLoc": new Vector(5916.5, -59, 99.5),
			"mapLoc": new Vector(5906, -55, 141)
		},
		"level_-5": {
			"startX": 6864,
			"startZ": 69,
			"endX": 6948,
			"endZ": 166,
			"prisonLoc": new Vector(6966.5, -59, 82.5),
			"mapLoc": new Vector(6911, -55, 131)
		}
	}

	static levelMapHeight = 20;
	static floorCloneHeight = 18;
	static drilledBlocksHeight = 15;
	static consolesHeight = -15;
	static rechargeHeight = -20;
	static cameraHeight = -25;
	static cameraMappingHeight = -30;
	static magnetModeMagnetBlocksHeight = -51;
	static levelHeight = -60;
}