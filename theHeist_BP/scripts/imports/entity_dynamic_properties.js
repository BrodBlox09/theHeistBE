function getData(entity, dataNodeName) {
    const dataStr = entity.getDynamicProperty("data");
    if (!dataStr)
        return console.error("Data string is undefined");
    const dataNodes = JSON.parse(dataStr).map((x) => { return JSON.parse(x); });
    const dataNode = dataNodes.find((x) => (x.name == dataNodeName));
    if (!dataNode)
        return undefined;
    else
        return dataNode;
}
function setData(entity, dataNodeName, object) {
    const dataStr = entity.getDynamicProperty("data");
    if (!dataStr) {
        entity.setDynamicProperty("data", JSON.stringify([JSON.stringify(object)]));
        return true;
    }
    const dataNodes = JSON.parse(dataStr).map((x) => { return JSON.parse(x); });
    const dataNodeIndex = dataNodes.findIndex((x) => (x.name == dataNodeName));
    if (dataNodeIndex == -1) {
        dataNodes.push(object);
        entity.setDynamicProperty("data", JSON.stringify(dataNodes.map((x) => { return JSON.stringify(x); })));
        return true;
    }
    dataNodes[dataNodeIndex] = object;
    entity.setDynamicProperty("data", JSON.stringify(dataNodes.map((x) => { return JSON.stringify(x); })));
    return true;
}
function clearData(entity) {
    entity.removeDynamicProperty("data");
    return true;
}
export { getData, setData, clearData };
