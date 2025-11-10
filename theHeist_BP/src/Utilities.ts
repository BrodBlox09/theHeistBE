import { BlockPermutation, Vector3, Block, world, Player, Container, EntityInventoryComponent, ItemStack, ItemLockMode, BlockVolume, BlockFillOptions, Entity, EntityEquippableComponent, EquipmentSlot, EntityType, Dimension } from "@minecraft/server";
import DataManager from "./managers/DataManager";
import Vector from "./Vector";
import LoreItem from "./LoreItem";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { LevelInformation, IInventorySlotData, InventoryTracker } from "./TypeDefinitions";

export default class Utilities {
	static levelMapHeight = 20;
	static floorCloneHeight = 18;
	static drilledBlocksHeight = 15;
	static consolesHeight = -15;
	static rechargeHeight = -20;
	static cameraHeight = -25;
	static raycastHeight = -30;
	static cameraBlockCacheMappingHeight = -32;
	static cameraBlockMappingHeight = -33;
	static robotPathDisplayMapHeight = -34;
	static sonarBlockMappingHeight = -35;
	static robotPathMapHeight = -49;
	static magnetModeMagnetBlocksHeight = -51;
	static ventHeight = -57;
	static cameraDisplayHeight = -58;
	static levelPlayingHeight = -60;
	static levelFloorHeight = -61;
	static SECOND = 20;
	static dimensions: Record<string, Dimension> = {};

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

	static spawnEntity(location: Vector3, identitifier: EntityType | string): Entity {
		return this.dimensions.overworld.spawnEntity(identitifier, location);
	}

	static setBlock(location: Vector3, blockType: string, permutations?: Record<string, string | number | boolean>) {
		this.dimensions.overworld.setBlockType(location, "air"); // Ensure onPlace events run when the actual block is placed
		this.dimensions.overworld.setBlockPermutation(location, BlockPermutation.resolve(blockType, permutations));
	}

	static setBlockState(block: Block, stateName: string, stateValue: boolean | number | string | undefined, checkForRedundance: boolean = true) {
		if (checkForRedundance && block.permutation.getState(stateName as keyof BlockStateSuperset) === stateValue) return;
		block.setPermutation(block.permutation.withState(stateName as keyof BlockStateSuperset, stateValue));
	}

	static getBlockState(block: Block, stateName: string) {
		return block.permutation.getState(stateName as keyof BlockStateSuperset);
	}

	static permutationWithState(permutation: BlockPermutation, stateName: string, value: string | number  | boolean | undefined) {
		return permutation.withState(stateName as keyof BlockStateSuperset, value);
	}

	static fillBlocks(location1: Vector3, location2: Vector3, block: string, permutations?: Record<string, string | number | boolean>) {
		this.dimensions.overworld.fillBlocks(new BlockVolume(location1, location2), BlockPermutation.resolve(block, permutations), {
			"ignoreChunkBoundErrors": true
		});
	}

	static fillBlocksWithPermutation(location1: Vector3, location2: Vector3, permutation: BlockPermutation) {
		this.dimensions.overworld.fillBlocks(new BlockVolume(location1, location2), permutation, {
			"ignoreChunkBoundErrors": true
		});
	}

	static fillBlocksWithOptions(location1: Vector3, location2: Vector3, block: string, options: BlockFillOptions, permutations?: Record<string, string | number | boolean>) {
		if (!options.ignoreChunkBoundErrors) options.ignoreChunkBoundErrors = true;
		this.dimensions.overworld.fillBlocks(new BlockVolume(location1, location2), BlockPermutation.resolve(block, permutations), options);
	}

	static reloadPlayerInv(player: Player, inventoryTracker?: InventoryTracker) {
		if (inventoryTracker == null) inventoryTracker = DataManager.getData(player, "inventoryTracker")!;
		const playerInvContainer = player.getComponent("inventory")!.container;
		playerInvContainer.clearAll();
		const playerInvData = inventoryTracker.slots; // Array of player inventory slots
		playerInvData.forEach((invSlotData: IInventorySlotData) => {
			const typeId = invSlotData.typeId;
			const itemStack = new ItemStack(typeId);
			itemStack.keepOnDeath = true;
			if (invSlotData.lockMode) itemStack.lockMode = ItemLockMode[invSlotData.lockMode as keyof typeof ItemLockMode];
			LoreItem.setLoreOfItemStack(itemStack);
			playerInvContainer.setItem(invSlotData.slot, itemStack);
		});
		const nvGlasses = new ItemStack("theheist:nv_glasses");
		LoreItem.setLoreOfItemStack(nvGlasses);
		player.getComponent("equippable")!.setEquipment(EquipmentSlot.Head, nvGlasses);
	}

	/**
	 * Saves player's inventory. Ensure this function is run BEFORE whenever you want to enter into a "1 mode only" state.
	 * @param player 
	 * @param stripEnchants Whether or not to remove enchants from all items in the player's inventory
	 * @returns 
	 */
	static savePlayerInventory(player: Player, stripEnchants: Boolean = false): InventoryTracker {
		var playerInvContainer = player.getComponent("inventory")!.container;
		var inventoryTracker = DataManager.getData(player, "inventoryTracker")!;
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
		inventoryTracker.slots = newPlayerInvData;
		// Update player information
		DataManager.setData(player, inventoryTracker);
		return inventoryTracker;
	}

	static clearPlayerInventory(player: Player) {
		var playerInvContainer = player.getComponent("inventory")!.container;
		playerInvContainer.clearAll();
		var playerEquippable = player.getComponent("equippable")!;
		playerEquippable.setEquipment(EquipmentSlot.Head);
		playerEquippable.setEquipment(EquipmentSlot.Chest);
		playerEquippable.setEquipment(EquipmentSlot.Legs);
		playerEquippable.setEquipment(EquipmentSlot.Feet);
		playerEquippable.setEquipment(EquipmentSlot.Offhand);
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
}

world.afterEvents.worldLoad.subscribe(event => {
	Utilities.dimensions.overworld = world.getDimension("overworld");
	Utilities.dimensions.nether = world.getDimension("nether");
	Utilities.dimensions.the_end = world.getDimension("the_end");
});