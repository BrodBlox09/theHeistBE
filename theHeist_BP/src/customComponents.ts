import { BlockComponentPlayerDestroyEvent, BlockComponentPlayerPlaceBeforeEvent, BlockComponentPlayerInteractEvent, world, system, BlockComponentOnPlaceEvent, BlockPermutation, BlockComponentTickEvent } from "@minecraft/server";
import Utilities from "./Utilities";
import Vector from "./Vector";

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
    if (isOpen) {
        Utilities.setBlockState(block, "theheist:isopen", false);
        Utilities.dimensions.overworld.playSound("random.door_close", block.location);
    } else {
        Utilities.setBlockState(block, "theheist:isopen", true);
        Utilities.dimensions.overworld.playSound("random.door_open", block.location);
    }
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
        let topBlock = block.above();
        let topBlockTypeId = blockTypeId.slice(0, 23) + "top";
        let topBlockPermutation = BlockPermutation.resolve(topBlockTypeId, block.permutation.getAllStates());
        topBlock?.setPermutation(topBlockPermutation);
    });
}

function bottomDoorBreak(event: BlockComponentPlayerDestroyEvent) {
    event.block.above()?.setType("minecraft:air");
}

function topDoorBreak(event: BlockComponentPlayerDestroyEvent) {
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
        Utilities.dimensions.overworld.playSound("random.door_close", Vector.v3ToVector(block.location).add(new Vector(0, 0.5, 0)));
    } else {
        Utilities.setBlockState(block, "theheist:open", true);
        Utilities.setBlockState(block.above()!, "theheist:open", true);
        Utilities.dimensions.overworld.playSound("random.door_open", Vector.v3ToVector(block.location).add(new Vector(0, 0.5, 0)));
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
        Utilities.dimensions.overworld.playSound("random.door_close", Vector.v3ToVector(block.location).add(new Vector(0, -0.5, 0)));
    } else {
        Utilities.setBlockState(block, "theheist:open", true);
        Utilities.setBlockState(block.below()!, "theheist:open", true);
        Utilities.dimensions.overworld.playSound("random.door_open", Vector.v3ToVector(block.location).add(new Vector(0, -0.5, 0)));
    }
}

function directionalBlockOnPlaceEvent(event: BlockComponentPlayerPlaceBeforeEvent) {
    system.runTimeout(() => {
    let block = event.block;
    let playerRot = event.player!.getRotation().y;
        if (-45 < playerRot && playerRot <= 45) { // South
            block.setPermutation(block.permutation.withState("theheist:rotation", 3));
        } else if (45 < playerRot && playerRot <= 135) { // West
            block.setPermutation(block.permutation.withState("theheist:rotation", 4));
        } else if ((135 < playerRot && playerRot <= 180) || (-180 <= playerRot && playerRot <= -135)) { // North
            block.setPermutation(block.permutation.withState("theheist:rotation", 2));
        } else if (-135 < playerRot && playerRot <= -45) { // East
            block.setPermutation(block.permutation.withState("theheist:rotation", 5));
        }
    });
}

function randBlock3Types(event: BlockComponentPlayerPlaceBeforeEvent) {
    system.runTimeout(() => {
    let block = event.block;
        block.setPermutation(block.permutation.withState("theheist:type", Utilities.getRandInt(0, 3)));
    });
}

function randBlock6Types(event: BlockComponentPlayerPlaceBeforeEvent) {
    system.runTimeout(() => {
    let block = event.block;
        block.setPermutation(block.permutation.withState("theheist:type", Utilities.getRandInt(0, 6)));
    });
}

world.beforeEvents.worldInitialize.subscribe(event => {
    event.blockComponentRegistry.registerCustomComponent('theheist:directional_block', {
        beforeOnPlayerPlace: directionalBlockOnPlaceEvent
    });
    event.blockComponentRegistry.registerCustomComponent('theheist:3_types', {
        beforeOnPlayerPlace: randBlock3Types
    });
    event.blockComponentRegistry.registerCustomComponent('theheist:6_types', {
        beforeOnPlayerPlace: randBlock6Types
    });
    event.blockComponentRegistry.registerCustomComponent('theheist:bottom_door', {
        beforeOnPlayerPlace: directionalBlockOnPlaceEvent,
        onPlayerDestroy: bottomDoorBreak,
        onPlayerInteract: bottomDoorInteract,
        onPlace: bottomDoorPlace
    });
    event.blockComponentRegistry.registerCustomComponent('theheist:top_door', {
        beforeOnPlayerPlace: directionalBlockOnPlaceEvent,
        onPlayerDestroy: topDoorBreak,
        onPlayerInteract: topDoorInteract
    });
    event.blockComponentRegistry.registerCustomComponent('theheist:bottom_l_door', {
        beforeOnPlayerPlace: directionalBlockOnPlaceEvent,
        onPlayerDestroy: bottomDoorBreak,
        onPlayerInteract: bottomDoorInteract,
        onPlace: bottomDoorLPlace
    });
    event.blockComponentRegistry.registerCustomComponent('theheist:bottom_r_door', {
        beforeOnPlayerPlace: directionalBlockOnPlaceEvent,
        onPlayerDestroy: bottomDoorBreak,
        onPlayerInteract: bottomDoorInteract,
        onPlace: bottomDoorRPlace
    });
    event.blockComponentRegistry.registerCustomComponent('theheist:trapdoor', {
        onPlayerInteract: trapdoorInteract
    });
    event.blockComponentRegistry.registerCustomComponent('theheist:robot_path', {
        onTick: robotPathTick
    })
});