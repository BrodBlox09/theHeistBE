import { DisplaySlotId, world } from '@minecraft/server'

const objectivesObjective = world.scoreboard.getObjective('objectives') ?? world.scoreboard.addObjective('objectives', 'Objectives')

export default class GameObjectiveManager {
	static addObjective(objective: string, sortOrder: number) {
		objectivesObjective.setScore(`§c${objective}§r`, sortOrder)
		world.sendMessage([{ "text": `§o§7New objective: §r§c${objective}§r` }])
		this.reloadSidebar()
	}

	static completeObjective(objective: string, sortOrder: number) {
		objectivesObjective.removeParticipant(`§c${objective}§r`)
		objectivesObjective.setScore(`§a${objective}§r`, sortOrder)
		world.sendMessage([{ "text": `§o§7Completed objective: §r§a${objective}§r` }])
		this.reloadSidebar()
	}

	static removeObjective(objective: string) {
		objectivesObjective.removeParticipant(`§c${objective}§r`)
		objectivesObjective.removeParticipant(`§a${objective}§r`)
		this.reloadSidebar()
	}

	static reloadSidebar() {
		this.hideSidebar()
		this.showSidebar()
	}

	static showSidebar() {
		world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, { objective: objectivesObjective })
	}

	static hideSidebar() {
		world.scoreboard.clearObjectiveAtDisplaySlot(DisplaySlotId.Sidebar)
	}
}