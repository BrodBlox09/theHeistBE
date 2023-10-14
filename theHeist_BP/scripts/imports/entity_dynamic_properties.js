import { DynamicPropertiesDefinition, ItemStack, EntityTypes, EffectTypes, Vector, system, world } from "@minecraft/server";

function getData(entity, dataNodeName) {
    var dataStr;
    try {
        dataStr = entity.getDynamicProperty("data");
    } catch (err) {
        //console.warn("Error found with entity name " + entity.nameTag);
        return undefined;
    }
    
    if (dataStr == undefined) return undefined;
    // Array of data nodes
    var /** @type {Array} */ dataNodes = JSON.parse(dataStr).map((x) => { return JSON.parse(x); });
    var dataNode = dataNodes.find((x) => (x.name == dataNodeName));
    if (dataNode == undefined) return undefined;
    else return dataNode;
}

function setData(entity, dataNodeName, object) {
    var dataStr = entity.getDynamicProperty("data");
    if (dataStr == undefined) {
        entity.setDynamicProperty("data", JSON.stringify([JSON.stringify(object)]));
        //console.warn("0_" + entity.getDynamicProperty("data"));
        return true;
    }
    // Array of data nodes
    var /** @type {Array} */ dataNodes = JSON.parse(dataStr).map((x) => { return JSON.parse(x); });
    var dataNodeIndex = dataNodes.findIndex((x) => (x.name == dataNodeName));
    if (dataNodeIndex == -1) {
        dataNodes.push(object);
        entity.setDynamicProperty("data", JSON.stringify(dataNodes.map((x) => { return JSON.stringify(x); })));
        //console.warn("1_0_" + entity.getDynamicProperty("data"));
        //console.warn("1_1_" + JSON.stringify(dataNodes.map((x) => { return JSON.stringify(x); })));
        return true;
    }
    dataNodes[dataNodeIndex] = object;
    entity.setDynamicProperty("data", JSON.stringify(dataNodes.map((x) => { return JSON.stringify(x); })));
    //console.warn("2_" + entity.getDynamicProperty("data"));
    return true;
}

function clearData(entity) {
    entity.removeDynamicProperty("data");
    return true;
}

export { getData, setData, clearData };