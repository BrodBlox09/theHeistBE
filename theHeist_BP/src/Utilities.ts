import { BlockPermutation, Vector3, world } from "@minecraft/server";

export default class Utilities {
	static dimensions = {
		overworld: world.getDimension("overworld"),
		nether: world.getDimension("nether"),
		the_end: world.getDimension("the_end")
	}

	static sin(d: number) {
		return Math.sin(d * Math.PI / 180);
	}

	static cos(d: number) {
		return Math.cos(d * Math.PI / 180);
	}

	static setBlock(location: Vector3, block: string, permutations: Record<string, string | number | boolean> | undefined) {
		this.dimensions.overworld.fillBlocks(location, location, BlockPermutation.resolve(block, permutations));
	}
}