import { BlockPermutation, Vector3, world, Player, Container, EntityEquippableComponent, EntityInventoryComponent, ItemStack, EquipmentSlot, ItemLockMode } from "@minecraft/server";

export default class Utilities {
	static dimensions = {
		overworld: world.getDimension("overworld"),
		nether: world.getDimension("nether"),
		the_end: world.getDimension("the_end")
	}

	static sin(d: number) {
		return Math.sin(d * Math.PI / 180);
	}

	static cos(d: number) {
		return Math.cos(d * Math.PI / 180);
	}

	static setBlock(location: Vector3, block: string, permutations: Record<string, string | number | boolean> | undefined) {
		this.dimensions.overworld.fillBlocks(location, location, BlockPermutation.resolve(block, permutations));
	}

	static reloadPlayerInv(player: Player, levelData: any) {
		var playerInvContainer: Container;
		var playerEquipInv: EntityEquippableComponent;
		var playerInvData = levelData.information[2].inventory; // Array of player inventory slots
		playerInvData.forEach((invSlotData: any) => {
			switch (invSlotData.containerType) {
				case "normal":
					if (!playerInvContainer) playerInvContainer = (player.getComponent("inventory") as EntityInventoryComponent).container;
					var itemStack: ItemStack = new ItemStack(invSlotData.typeId);
					itemStack.keepOnDeath = true;
					itemStack.lockMode = ItemLockMode[invSlotData.lockMode as keyof typeof ItemLockMode];
					playerInvContainer.setItem(invSlotData.slot, itemStack);
					break;
				case "equipment":
					if (!playerEquipInv) playerEquipInv = player.getComponent("equippable") as EntityEquippableComponent;
					var itemStack: ItemStack = new ItemStack(invSlotData.typeId);
					itemStack.keepOnDeath = true;
					itemStack.lockMode = ItemLockMode[invSlotData.lockMode as keyof typeof ItemLockMode];
					playerEquipInv.setEquipment(EquipmentSlot[invSlotData.slot as keyof typeof EquipmentSlot], itemStack);
					break;
			}
		});
	}
}