import { Player } from '@minecraft/server'

export default class VoiceOverManager {
	static play(player: Player, part: string | number) {
		let permanentTag = "p_" + part;
		if (!player.hasTag(permanentTag)) {
			// Player has not heard the song already
			player.playSound(`map.${part}`);
			player.addTag(permanentTag);
		}
		player.sendMessage([{ text: '§5§oVoice:§r ' }, { translate: `map.sub.${part}` }]);
	}
}