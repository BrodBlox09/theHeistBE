import { BlockPermutation, Vector3, world } from "@minecraft/server";

function sin(d: number) {
	return Math.sin(d * Math.PI / 180);
}

function cos(d: number) {
	return Math.cos(d * Math.PI / 180);
}

const overworld = world.getDimension("overworld");

function setBlock(location: Vector3, block: string, permutations: Record<string, string | number | boolean> | undefined) {
	overworld.fillBlocks(location, location, BlockPermutation.resolve(block, permutations));
}

export default {
	sin,
	cos,
	setBlock
};