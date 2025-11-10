import { Player } from "@minecraft/server";
import * as RechargeModeFunc from "./recharge";
import * as HackingModeFunc from "./hacking";
import * as SensorModeFunc from "./sensor";
import * as XRayModeFunc from "./xray";
import * as MagnetModeFunc from "./magnet";
import * as StealthModeFunc from "./stealth";
import * as StunModeFunc from "./stun";
import * as DrillModeFunc from "./drill";
import { PlayerEnergyTracker, ModeData, InventoryTracker, GamebandTracker } from "../TypeDefinitions";

export default class GamebandManager {
	static tickAllGamebands(player: Player, gamebandTracker: GamebandTracker, playerEnergyTracker: PlayerEnergyTracker, inventoryTracker: InventoryTracker) {
		RechargeModeFunc.rechargeTick(player, gamebandTracker, playerEnergyTracker, inventoryTracker);
		SensorModeFunc.sensorTick(player, gamebandTracker, playerEnergyTracker, inventoryTracker);
		XRayModeFunc.xrayTick(player, gamebandTracker, playerEnergyTracker, inventoryTracker);
		MagnetModeFunc.magnetTick(player, gamebandTracker, playerEnergyTracker, inventoryTracker);
		StealthModeFunc.stealthTick(player, gamebandTracker, playerEnergyTracker, inventoryTracker);
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