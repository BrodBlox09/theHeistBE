import { ItemStack } from "@minecraft/server";

class LoreItem {
	id: string;
	nameTag: string;
	lore: string[];

	constructor(id: string, nameTag: string, lore: string[]) {
		this.id = id;
		this.nameTag = nameTag;
		this.lore = lore;
	}

	static setLoreOfItemStack(itemStack: ItemStack): ItemStack {
		const typeId = itemStack.typeId;
		const strippedItemTypeId = typeId.endsWith("_enchanted") ? typeId.substring(0, typeId.length - "_enchanted".length) : typeId;
		const foundItem = LoreItem.loreDefinitions.find(x => x.id == strippedItemTypeId)!;
		if (foundItem) {
			itemStack.setLore(foundItem.lore);
			itemStack.nameTag = foundItem.nameTag;
		}
		return itemStack;
	}

	private static loreDefinitions = [
		new LoreItem("theheist:recharge_mode_lvl_1", "§r§9Recharge mode Lvl. 1", ["Use item to §r§6toggle", "Energy: 1.0 units/second", "Select to show objectives"]),
		new LoreItem("theheist:recharge_mode_lvl_2", "§r§9Recharge mode Lvl. 2", ["Use item to §r§6toggle", "Energy: 1.0 units/second", "Select to show objectives"]),
		new LoreItem("theheist:recharge_mode_lvl_3", "§r§9Recharge mode Lvl. 3", ["Use item to §r§6toggle", "Energy: 1.0 units/second", "Select to show objectives"]),
		new LoreItem("theheist:hacking_mode_lvl_1", "§r§2Hacking mode Lvl. 1", ["Use item to §r§6use", "Energy: 15 units"]),
		new LoreItem("theheist:hacking_mode_lvl_2", "§r§2Hacking mode Lvl. 2", ["Use item to §r§6use", "Energy: 10 units"]),
		new LoreItem("theheist:hacking_mode_lvl_3", "§r§2Hacking mode Lvl. 3", ["Use item to §r§6use", "Energy: 5 units"]),
		new LoreItem("theheist:sensor_mode_lvl_1", "§r§6Sensor mode Lvl. 1", ["Use item to §r§6toggle", "Energy: 1.0 units/second"]),
		new LoreItem("theheist:sensor_mode_lvl_2", "§r§6Sensor mode Lvl. 2", ["Use item to §r§6toggle", "Energy: 0.4 units/second"]),
		new LoreItem("theheist:xray_mode_lvl_1", "§r§4Xray mode Lvl. 1", ["Use item to §r§6toggle", "Energy: 1.33 units/second"]),
		new LoreItem("theheist:xray_mode_lvl_2", "§r§4Xray mode Lvl. 2", ["Use item to §r§6toggle", "Energy: 0.67 units/second"]),
		new LoreItem("theheist:magnet_mode_lvl_1", "§r§5Magnet mode Lvl. 1", ["Use item to §r§6toggle", "Energy: 1.6 units/second"]),
		new LoreItem("theheist:stealth_mode_lvl_1", "§r§fStealth mode Lvl. 1", ["Use item to §r§6toggle", "Energy: 40 units/second"]),
		new LoreItem("theheist:stealth_mode_lvl_2", "§r§fStealth mode Lvl. 2", ["Use item to §r§6toggle", "Energy: 10 units/second"]),
		new LoreItem("theheist:stun_mode_lvl_1", "§r§eStun mode Lvl. 1", ["Use item to §r§6use", "Energy: 10 units"]),
		new LoreItem("theheist:drill_mode_lvl_1", "§r§3Drill mode Lvl. 1", ["Use item to §r§6use", "Energy: 30 units"]),
		new LoreItem('minecraft:paper', '§oUse Keycard§r', ['Can trigger any Keycard reader', 'for which you own a matching card']),
		new LoreItem('minecraft:red_dye', '§oRed Keycard§r', ['Used on matching Keycard reader']),
		new LoreItem('minecraft:yellow_dye', '§oYellow Keycard§r', ['Used on matching Keycard reader']),
		new LoreItem('minecraft:green_dye', '§oGreen Keycard§r', ['Used on matching Keycard reader']),
		new LoreItem('minecraft:lapis_lazuli', '§oBlue Keycard§r', ['Used on matching Keycard reader']),
		new LoreItem('theheist:phone', '§oCall the authorities§r', ['Drop to restart level']),
		new LoreItem('theheist:nv_glasses', '§oNV Goggles§r', ['Drop to regain items'])
	]
}

export default LoreItem;