import { Player } from "@minecraft/server";
import * as RechargeModeFunc from "./recharge";
import * as HackingModeFunc from "./hacking";
import * as SensorModeFunc from "./sensor";
import * as XRayModeFunc from "./xray";
import * as MagnetModeFunc from "./magnet";
import * as StealthModeFunc from "./stealth";
import * as StunModeFunc from "./stun";
import * as DrillModeFunc from "./drill";
import { LevelInformation, PlayerEnergyTracker, ModeData, InventoryTracker } from "../TypeDefinitions";

export default class GamebandManager {
	static tickAllGamebands(player: Player, playerLevelInformation: LevelInformation, playerEnergyTracker: PlayerEnergyTracker, inventoryTracker: InventoryTracker) {
		RechargeModeFunc.rechargeTick(player, playerLevelInformation, playerEnergyTracker, inventoryTracker);
		SensorModeFunc.sensorTick(player, playerLevelInformation, playerEnergyTracker, inventoryTracker);
		XRayModeFunc.xrayTick(player, playerLevelInformation, playerEnergyTracker, inventoryTracker);
		MagnetModeFunc.magnetTick(player, playerLevelInformation, playerEnergyTracker, inventoryTracker);
		StealthModeFunc.stealthTick(player, playerLevelInformation, playerEnergyTracker, inventoryTracker);
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