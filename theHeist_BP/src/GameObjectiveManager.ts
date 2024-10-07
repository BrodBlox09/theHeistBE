import { DisplaySlotId, world } from '@minecraft/server';

const objectivesObjective = world.scoreboard.getObjective('objectives') ?? world.scoreboard.addObjective('objectives', 'Objectives');

export default class GameObjectiveManager {
	static addObjective(objective: string, sortOrder: number, sendMessage: boolean = true) {
		if (objectivesObjective.hasParticipant(`§a${objective}§r`)) return; // Ensure no duplicate objectives are made
		if (objectivesObjective.hasParticipant(`§c${objective}§r`)) return;
		objectivesObjective.setScore(`§c${objective}§r`, sortOrder);
		if (sendMessage) world.sendMessage([{ "text": `§o§7New objective: §r§c${objective}§r` }]);
		this.reloadSidebar();
	}

	static completeObjective(objective: string) {
		if (!objectivesObjective.hasParticipant(`§c${objective}§r`)) return; // Ensure no errors are thrown
		var sortOrder: number = objectivesObjective.getScore(`§c${objective}§r`) as number;
		objectivesObjective.removeParticipant(`§c${objective}§r`);
		objectivesObjective.setScore(`§a${objective}§r`, sortOrder);
		world.sendMessage([{ "text": `§o§7Completed objective: §r§a${objective}§r` }]);
		this.reloadSidebar();
	}

	static completeObjectiveNonStrict(objective: string, sortOrder: number) {
		if (!objectivesObjective.hasParticipant(`§c${objective}§r`)) this.addObjective(objective, sortOrder, false); // Ensure objective is made
		objectivesObjective.removeParticipant(`§c${objective}§r`);
		objectivesObjective.setScore(`§a${objective}§r`, sortOrder);
		world.sendMessage([{ "text": `§o§7Completed objective: §r§a${objective}§r` }]);
		this.reloadSidebar();
	}

	static removeObjective(objective: string) {
		objectivesObjective.removeParticipant(`§c${objective}§r`);
		objectivesObjective.removeParticipant(`§a${objective}§r`);
		this.reloadSidebar();
	}

	static objectiveIsComplete(objective: string) {
		var objectives = objectivesObjective.getParticipants().map(x => x.displayName);
		var objComplete = false;
		objectives.forEach((obj) => {
			if (obj.startsWith("§a") && obj.slice(2, obj.length - 2) == objective) objComplete = true;
		});
		return objComplete;
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
}