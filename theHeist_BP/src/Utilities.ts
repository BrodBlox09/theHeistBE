import { BlockPermutation, Vector3, world, Player, Container, EntityEquippableComponent, EntityInventoryComponent, ItemStack, EquipmentSlot, ItemLockMode } from "@minecraft/server";

export default class Utilities {
	static dimensions = {
		overworld: world.getDimension("overworld"),
		nether: world.getDimension("nether"),
		the_end: world.getDimension("the_end")
	}

	static swapKVPs(json: Record<any, any>) {
		var ret: Record<any, any> = {};
		for(var key in json){
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

	static sin(d: number) {
		return Math.sin(d * Math.PI / 180);
	}

	static cos(d: number) {
		return Math.cos(d * Math.PI / 180);
	}

	static setBlock(location: Vector3, block: string, permutations: Record<string, string | number | boolean> | undefined = undefined) {
		this.dimensions.overworld.fillBlocks(location, location, BlockPermutation.resolve(block, permutations));
	}

	static reloadPlayerInv(player: Player, levelData: any) {
		var playerInvContainer = (player.getComponent("inventory") as EntityInventoryComponent).container as Container;
		playerInvContainer.clearAll();
		var playerInvData = levelData.information[2].inventory; // Array of player inventory slots
		playerInvData.forEach((invSlotData: any) => {
			var itemStack: ItemStack = new ItemStack(invSlotData.typeId);
			itemStack.keepOnDeath = true;
			itemStack.lockMode = ItemLockMode[invSlotData.lockMode as keyof typeof ItemLockMode];
			playerInvContainer.setItem(invSlotData.slot, itemStack);
		});
	}

	static gamebandInfo: Record<string, Record<number, Record<string, any>>> = {
		"rechargeMode": {
			1: {
				"speed": 20.0,
				"max": 100.0
			}
		},
		"hackingMode": {
			1: {
				"cost": 15.0
			}
		}
	}
}