import { BlockComponentPlayerBreakEvent, BlockComponentPlayerPlaceBeforeEvent, BlockComponentPlayerInteractEvent, world, system, BlockComponentOnPlaceEvent, BlockPermutation, BlockComponentTickEvent, BlockComponentRegistry, CustomComponentParameters, MolangVariableMap } from "@minecraft/server";
import Utilities from "./Utilities";
import Vector from "./Vector";
import { spawnPortalParticle } from "./gamebands/teleportation";

function portalParticleEmitterTick(event: BlockComponentTickEvent) {
	let location = Vector.from(event.block.location).getCenter().add(new Vector(0, 0.5, 0));
	spawnPortalParticle(location);
}

function robotPathTick(event: BlockComponentTickEvent) {
    let block = event.block;
    if (block.typeId != "theheist:robot_path") return; // For some reason without this non-robot-path blocks run this...
    if (block.north()?.hasTag("robot_path")) Utilities.setBlockState(block, "theheist:north", 1);
    else Utilities.setBlockState(block, "theheist:north", 0);
    if (block.south()?.hasTag("robot_path")) Utilities.setBlockState(block, "theheist:south", 1);
    else Utilities.setBlockState(block, "theheist:south", 0);
    if (block.east()?.hasTag("robot_path")) Utilities.setBlockState(block, "theheist:east", 1);
    else Utilities.setBlockState(block, "theheist:east", 0);
    if (block.west()?.hasTag("robot_path")) Utilities.setBlockState(block, "theheist:west", 1);
    else Utilities.setBlockState(block, "theheist:west", 0);
}

function trapdoorInteract(event: BlockComponentPlayerInteractEvent) {
    let block = event.block;
    let states = block.permutation.getAllStates();
    let locked = states["theheist:locked"];
    if (locked) return;
    let isOpen = states["theheist:isopen"];
    Utilities.setBlockState(block, "theheist:isopen", !isOpen);
    if (isOpen) Utilities.dimensions.overworld.playSound("random.door_close", block.location);
    else Utilities.dimensions.overworld.playSound("random.door_open", block.location);
}

function bottomDoorLPlace(event: BlockComponentOnPlaceEvent) {
    system.runTimeout(() => {
        let block = event.block;
        let blockTypeId = block.typeId;
        let topBlock = block.above();
        let topBlockTypeId = blockTypeId.slice(0, 23) + "top_l";
        let topBlockPermutation = BlockPermutation.resolve(topBlockTypeId, block.permutation.getAllStates());
        topBlock?.setPermutation(topBlockPermutation);
    });
}

function bottomDoorRPlace(event: BlockComponentOnPlaceEvent) {
    system.runTimeout(() => {
        let block = event.block;
        let blockTypeId = block.typeId;
        let topBlock = block.above();
        let topBlockTypeId = blockTypeId.slice(0, 23) + "top_r";
        let topBlockPermutation = BlockPermutation.resolve(topBlockTypeId, block.permutation.getAllStates());
        topBlock?.setPermutation(topBlockPermutation);
    });
}

function bottomDoorPlace(event: BlockComponentOnPlaceEvent) {
    system.runTimeout(() => {
        let block = event.block;
        let blockTypeId = block.typeId;
        let topBlock = block.above()!;
        let topBlockTypeId = blockTypeId.slice(0, 23) + "top";
        let topBlockPermutation = BlockPermutation.resolve(topBlockTypeId, block.permutation.getAllStates());
        topBlock.setType('air');
        topBlock.setPermutation(topBlockPermutation);
    });
}

function bottomDoorBreak(event: BlockComponentPlayerBreakEvent) {
    event.block.above()?.setType("minecraft:air");
}

function topDoorBreak(event: BlockComponentPlayerBreakEvent) {
    event.block.below()?.setType("minecraft:air");
}

function bottomDoorInteract(event: BlockComponentPlayerInteractEvent) {
    let block = event.block;
    let states = block.permutation.getAllStates();
    let unlocked = states["theheist:unlocked"];
    if (!unlocked) return;
    let isOpen = states["theheist:open"];
    if (isOpen) {
        Utilities.setBlockState(block, "theheist:open", false);
        Utilities.setBlockState(block.above()!, "theheist:open", false);
        Utilities.dimensions.overworld.playSound("random.door_close", Vector.from(block.location).add(new Vector(0, 0.5, 0)));
    } else {
        Utilities.setBlockState(block, "theheist:open", true);
        Utilities.setBlockState(block.above()!, "theheist:open", true);
        Utilities.dimensions.overworld.playSound("random.door_open", Vector.from(block.location).add(new Vector(0, 0.5, 0)));
    }
}

function topDoorInteract(event: BlockComponentPlayerInteractEvent) {
    let block = event.block;
    let states = block.permutation.getAllStates();
    let unlocked = states["theheist:unlocked"];
    if (!unlocked) return;
    let isOpen = states["theheist:open"];
    if (isOpen) {
        Utilities.setBlockState(block, "theheist:open", false);
        Utilities.setBlockState(block.below()!, "theheist:open", false);
        Utilities.dimensions.overworld.playSound("random.door_close", Vector.from(block.location).add(new Vector(0, -0.5, 0)));
    } else {
        Utilities.setBlockState(block, "theheist:open", true);
        Utilities.setBlockState(block.below()!, "theheist:open", true);
        Utilities.dimensions.overworld.playSound("random.door_open", Vector.from(block.location).add(new Vector(0, -0.5, 0)));
    }
}

// Remove this component when building is done and we can publish the map
function randBlockNTypes(nTypes: number, event: BlockComponentPlayerPlaceBeforeEvent) {
    event.permutationToPlace = Utilities.permutationWithState(event.permutationToPlace, "theheist:type", Utilities.getRandInt(0, nTypes));
}

system.beforeEvents.startup.subscribe(event => {
    event.blockComponentRegistry.registerCustomComponent('theheist:3_types', {
        beforeOnPlayerPlace: randBlockNTypes.bind(null, 3)
    });
    event.blockComponentRegistry.registerCustomComponent('theheist:6_types', {
        beforeOnPlayerPlace: randBlockNTypes.bind(null, 6)
    });
    event.blockComponentRegistry.registerCustomComponent('theheist:bottom_door', {
        onPlayerBreak: bottomDoorBreak,
        onPlayerInteract: bottomDoorInteract,
        onPlace: bottomDoorPlace
    });
    event.blockComponentRegistry.registerCustomComponent('theheist:top_door', {
        onPlayerBreak: topDoorBreak,
        onPlayerInteract: topDoorInteract
    });
    event.blockComponentRegistry.registerCustomComponent('theheist:bottom_l_door', {
        onPlayerBreak: bottomDoorBreak,
        onPlayerInteract: bottomDoorInteract,
        onPlace: bottomDoorLPlace
    });
    event.blockComponentRegistry.registerCustomComponent('theheist:bottom_r_door', {
        onPlayerBreak: bottomDoorBreak,
        onPlayerInteract: bottomDoorInteract,
        onPlace: bottomDoorRPlace
    });
    event.blockComponentRegistry.registerCustomComponent('theheist:trapdoor', {
        onPlayerInteract: trapdoorInteract
    });
    event.blockComponentRegistry.registerCustomComponent('theheist:robot_path', {
        onTick: robotPathTick
    });
	event.blockComponentRegistry.registerCustomComponent('theheist:portal_particle_emitter', {
		onTick: portalParticleEmitterTick
	});
});