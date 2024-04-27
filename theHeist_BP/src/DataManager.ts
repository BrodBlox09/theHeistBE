import { Entity, world } from '@minecraft/server';

export default class DataManager {
	static getData(entity: Entity, dataNodeName: string) {
		const dataStr = entity.getDynamicProperty('data') as string;
		if (!dataStr) return;
		const dataNodes = JSON.parse(dataStr);
		const dataNode = dataNodes.find((x: any) => (x.name == dataNodeName));
		if (!dataNode) return;
		else return dataNode;
	}

	static GetDataRaw(entity: Entity): string | undefined {
		const dataStr = entity.getDynamicProperty('data') as string;
		if (!dataStr) return;
		return dataStr;
	}

	static setData(entity: Entity, object: Record<string, any>) {
		const dataStr = entity.getDynamicProperty('data') as string;
		if (!dataStr) {
			entity.setDynamicProperty('data', JSON.stringify([object]));
			return true;
		}
		const dataNodes = JSON.parse(dataStr);
		const dataNodeIndex = dataNodes.findIndex((x: Record<string, any>) => (x.name == object.name));
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