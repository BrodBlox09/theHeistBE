import { Player } from '@minecraft/server'

export default class VoiceOverManager {
	static play(player: Player, part: string) {
		player.playSound(`map.${part}`);
		player.sendMessage([{ text: '§5§oVoice:§r ' }, { translate: `map.sub.${part}` }]);
	}
}