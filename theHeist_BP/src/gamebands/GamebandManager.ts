import { ItemStack, Player } from "@minecraft/server";
import * as RechargeModeFunc from "./recharge";
import * as HackingModeFunc from "./hacking";
import * as SensorModeFunc from "./sensor";
import * as XRayModeFunc from "./xray";
import * as MagnetModeFunc from "./magnet";
import * as StealthModeFunc from "./stealth";
import * as StunModeFunc from "./stun";
import * as DrillModeFunc from "./drill";
import * as TeleportationModeFunc from "./teleportation";
import { ModeData, InventoryTracker, GamebandTracker } from "../TypeDefinitions";

export default class GamebandManager {
	static tickAllGamebands(player: Player, gamebandTracker: GamebandTracker, inventoryTracker: InventoryTracker, selectedItemStack: ItemStack | undefined) {
		RechargeModeFunc.rechargeTick(player, gamebandTracker, inventoryTracker, selectedItemStack);
		SensorModeFunc.sensorTick(player, gamebandTracker, inventoryTracker);
		XRayModeFunc.xrayTick(player, gamebandTracker, inventoryTracker);
		MagnetModeFunc.magnetTick(player, gamebandTracker, inventoryTracker);
		StealthModeFunc.stealthTick(player, gamebandTracker, inventoryTracker);
		TeleportationModeFunc.teleportationTick(player, gamebandTracker, inventoryTracker, selectedItemStack);
	}

    static cancelMode(player: Player, modeData: ModeData | null) {
        switch (modeData?.mode) {
            case "sensor":
                SensorModeFunc.toggleSensorMode(player, 0);
                break;
            case "magnet":
                MagnetModeFunc.toggleMagnetMode(player, 0);
                break;
            case "stealth":
                StealthModeFunc.toggleStealthMode(player, 0);
                break;
            case "xray":
                XRayModeFunc.toggleXRayMode(player, 0);
                break;
        }
    }
}