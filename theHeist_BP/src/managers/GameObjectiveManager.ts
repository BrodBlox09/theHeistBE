import { DisplaySlotId, ScoreboardObjective, ScoreboardIdentity, Entity, world, Player, HudElement } from '@minecraft/server';

/**
 * Unfinished objectives color: §c (Red)
 * Finished objectives color: §a (Green)
 */

let objectivesObjective: ScoreboardObjective;

world.afterEvents.worldLoad.subscribe(event => {
	objectivesObjective = world.scoreboard.getObjective('objectives') ?? world.scoreboard.addObjective('objectives', 'Objectives');
});

type ScoreboardParticipant = string | ScoreboardIdentity | Entity;

export default class GameObjectiveManager {
	static addObjective(objective: ScoreboardParticipant, sortOrder: number, sendMessage: boolean = true) {
		if (objectivesObjective.hasParticipant(`§a${objective}§r`)) return; // Ensure no duplicate objectives are made
		if (objectivesObjective.hasParticipant(`§c${objective}§r`)) return;
		objectivesObjective.setScore(`§c${objective}§r`, sortOrder);
		if (sendMessage) world.sendMessage([{ "text": `§o§7New objective: §r§c${objective}§r` }]);
		this.reloadSidebar();
	}

	static completeObjective(objective: ScoreboardParticipant) {
		if (!objectivesObjective.hasParticipant(`§c${objective}§r`)) return; // Ensure no errors are thrown
		var sortOrder: number = objectivesObjective.getScore(`§c${objective}§r`)!;
		objectivesObjective.removeParticipant(`§c${objective}§r`);
		objectivesObjective.setScore(`§a${objective}§r`, sortOrder);
		world.sendMessage([{ "text": `§o§7Completed objective: §r§a${objective}§r` }]);
		this.reloadSidebar();
	}

	static completeObjectiveNonStrict(objective: ScoreboardParticipant, sortOrder: number) {
		if (objectivesObjective.hasParticipant(`§a${objective}§r`)) return; // Ensure this objective is not set to complete multiple times
		if (!objectivesObjective.hasParticipant(`§c${objective}§r`)) this.addObjective(objective, sortOrder, false); // Ensure objective is made
		objectivesObjective.removeParticipant(`§c${objective}§r`);
		objectivesObjective.setScore(`§a${objective}§r`, sortOrder);
		world.sendMessage([{ "text": `§o§7Completed objective: §r§a${objective}§r` }]);
		this.reloadSidebar();
	}

	static removeObjective(objective: ScoreboardParticipant) {
		objectivesObjective.removeParticipant(`§c${objective}§r`);
		objectivesObjective.removeParticipant(`§a${objective}§r`);
		objectivesObjective.removeParticipant(objective);
		this.reloadSidebar();
	}

	static objectiveIsComplete(objective: ScoreboardParticipant) {
		var objectives = objectivesObjective.getParticipants().map(x => x.displayName);
		var objComplete = false;
		objectives.forEach((obj) => {
			if (obj.startsWith("§a") && obj.slice(2, obj.length - 2) == objective) objComplete = true;
		});
		return objComplete;
	}

	static getAllObjectives() {
		return objectivesObjective.getParticipants().map(x => x.displayName);
	}

	static removeAllObjectives() {
		objectivesObjective.getParticipants().forEach(participant => {
			this.removeObjective(participant);
		});
	}

	static reloadSidebar() {
		this.hideSidebar();
		this.showSidebar();
	}

	static showSidebar() {
		world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, { objective: objectivesObjective });
	}

	static hideSidebar() {
		world.scoreboard.clearObjectiveAtDisplaySlot(DisplaySlotId.Sidebar);
	}

	static setTimeRemaining(player: Player, timeRemaining: number) {
		player.onScreenDisplay.setActionBar(`Time Remaining - ${formatSeconds(timeRemaining)}`);
	}
}

function formatSeconds(totalSeconds: number) {
	let minutes = Math.floor(totalSeconds / 60).toString();
	if (minutes.length < 2) minutes = "0" + minutes;
	let seconds = Math.floor(totalSeconds % 60).toString();
	if (seconds.length < 2) seconds = "0" + seconds;
	return `${minutes}:${seconds}`;
}