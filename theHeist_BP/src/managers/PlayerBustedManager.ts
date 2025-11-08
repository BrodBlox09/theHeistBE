import { ScoreboardObjective, world, Player } from "@minecraft/server";

let bustedCounterObjective: ScoreboardObjective;

world.afterEvents.worldLoad.subscribe(event => {
	bustedCounterObjective = world.scoreboard.getObjective("bustedCounter")  ?? world.scoreboard.addObjective('bustedCounter', 'bustedCounter');
});

export default class PlayerBustedManager {
	static playerBusted(player: Player): void {
		bustedCounterObjective.setScore(player, (bustedCounterObjective.getScore(player) ?? 0) + 1);
	}

	static setTimesBusted(player: Player, bustedCount: number): void {
		bustedCounterObjective.setScore(player, bustedCount);
	}

	static getTimesBustedFromPlayer(player: Player): number {
		return bustedCounterObjective.getScore(player) ?? 0;
	}
}