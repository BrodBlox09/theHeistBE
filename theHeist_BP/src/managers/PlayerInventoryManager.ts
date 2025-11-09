import { Container, EntityInventoryComponent, EquipmentSlot, ItemLockMode, ItemStack, Player } from "@minecraft/server";
import DataManager from "./DataManager";
import { IInventorySlotData, LevelInformation } from "../TypeDefinitions";
import LoreItem from "../LoreItem";

export default class PlayerInventoryManager {
	private inventory: EntityInventoryComponent;
	private container: Container;

	constructor(private player: Player) {
		let inventoryComponent = player.getComponent("minecraft:inventory");
		if (!inventoryComponent) throw new Error(`Player ${player.name} has no inventory component.`);
		this.inventory = inventoryComponent;
		this.container = this.inventory.container;
	}

	getPlayer(): Player {
		return this.player;
	}

	reload(player: Player, levelData?: LevelInformation) {
		if (levelData == null) levelData = DataManager.getData(player, "levelInformation")!;
		const playerInvContainer = player.getComponent("inventory")!.container;
		playerInvContainer.clearAll();
		const playerInvData = levelData.playerInventory; // Array of player inventory slots
		playerInvData.forEach((invSlotData: IInventorySlotData) => {
			const typeId = invSlotData.typeId;
			const itemStack: ItemStack = new ItemStack(typeId);
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
	save(player: Player, stripEnchants: Boolean = false): LevelInformation {
		var playerInvContainer = player.getComponent("inventory")!.container;
		var playerLevelData: LevelInformation = DataManager.getData(player, "levelInformation")!;
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
		playerLevelData.playerInventory = newPlayerInvData;
		// Update player information
		DataManager.setData(player, playerLevelData);
		return playerLevelData;
	}

	clear(player: Player) {
		var playerInvContainer = player.getComponent("inventory")!.container;
		playerInvContainer.clearAll();
		var playerEquippable = player.getComponent("equippable")!;
		playerEquippable.setEquipment(EquipmentSlot.Head);
		playerEquippable.setEquipment(EquipmentSlot.Chest);
		playerEquippable.setEquipment(EquipmentSlot.Legs);
		playerEquippable.setEquipment(EquipmentSlot.Feet);
		playerEquippable.setEquipment(EquipmentSlot.Offhand);
	}

	hasItem(item: string): boolean {
		for (var i = 0; i < this.container.size; i++) {
			if (this.container.getItem(i)?.typeId == item) return true;
		}
		return false;
	}

	indexOf(item: string): number | null {
		for (var i = 0; i < this.container.size; i++) {
			if (this.container.getItem(i)?.typeId == item) return i;
		}
		return null;
	}
}