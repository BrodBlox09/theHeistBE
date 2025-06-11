import { Player } from "@minecraft/server";
import * as SensorModeFunc from "./sensor";
import * as XRayModeFunc from "./xray";
import * as MagnetModeFunc from "./magnet";
import * as StealthModeFunc from "./stealth";
import * as StunModeFunc from "./stun";
import * as DrillModeFunc from "./drill";

export default class GamebandManager {
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