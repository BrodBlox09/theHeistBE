import { Entity } from "@minecraft/server";

function getData(entity: Entity, dataNodeName: string) {
	const dataStr = entity.getDynamicProperty("data") as string;
	if (!dataStr) return console.error("Data string is undefined");
	// Array of data nodes
	const dataNodes = JSON.parse(dataStr).map((x: any) => { return JSON.parse(x); });
	const dataNode = dataNodes.find((x: any) => (x.name == dataNodeName));
	if (!dataNode) return undefined;
	else return dataNode;
}

function setData(entity: Entity, dataNodeName: string, object: object) {
	const dataStr = entity.getDynamicProperty("data") as string;
	if (!dataStr) {
		entity.setDynamicProperty("data", JSON.stringify([JSON.stringify(object)]));
		//console.warn("0_" + entity.getDynamicProperty("data"));
		return true;
	}
	// Array of data nodes
	const dataNodes = JSON.parse(dataStr).map((x: any) => { return JSON.parse(x); });
	const dataNodeIndex = dataNodes.findIndex((x: any) => (x.name == dataNodeName));
	if (dataNodeIndex == -1) {
		dataNodes.push(object);
		entity.setDynamicProperty("data", JSON.stringify(dataNodes.map((x: any) => { return JSON.stringify(x); })));
		//console.warn("1_0_" + entity.getDynamicProperty("data"));
		//console.warn("1_1_" + JSON.stringify(dataNodes.map((x) => { return JSON.stringify(x); })));
		return true;
	}
	dataNodes[dataNodeIndex] = object;
	entity.setDynamicProperty("data", JSON.stringify(dataNodes.map((x: any) => { return JSON.stringify(x); })));
	//console.warn("2_" + entity.getDynamicProperty("data"));
	return true;
}

function clearData(entity: Entity) {
	entity.removeDynamicProperty("data");
	return true;
}

export { getData, setData, clearData };