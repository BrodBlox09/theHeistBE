import { Entity, world } from '@minecraft/server';

export default class DataManager {
	static getData(entity: Entity, dataNodeName: string) {
		const dataStr = entity.getDynamicProperty('data') as string;
		if (!dataStr) return;
		const dataNodes = JSON.parse(dataStr);
		const dataNode = dataNodes.find((x: any) => (x.name == dataNodeName));
		if (!dataNode) return undefined;
		else return dataNode;
	}

	static setData(entity: Entity, dataNodeName: string, object: object) {
		const dataStr = entity.getDynamicProperty('data') as string;
		if (!dataStr) {
			entity.setDynamicProperty('data', JSON.stringify([object]));
			return true;
		}
		const dataNodes = JSON.parse(dataStr);
		const dataNodeIndex = dataNodes.findIndex((x: any) => (x.name == dataNodeName));
		if (dataNodeIndex == -1) {
			dataNodes.push(object);
			entity.setDynamicProperty('data', JSON.stringify(dataNodes));
			return true;
		}
		dataNodes[dataNodeIndex] = object;
		entity.setDynamicProperty('data', JSON.stringify(dataNodes));
		return true;
	}

	static clearData(entity: Entity) {
		entity.setDynamicProperty('data', "");
		return true;
	}
}