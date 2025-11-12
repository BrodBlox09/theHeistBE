import { Entity, world } from '@minecraft/server';
import { WorldDataNodeType, WorldDataNodeName, DataNodeReturnType, DataNode } from '../TypeDefinitions';

export default class DataManager {
	static getWorldData<T extends WorldDataNodeName>(dataNodeName: T): WorldDataNodeType<T> | undefined {
		const dataStr = world.getDynamicProperty(dataNodeName) as string;
		if (!dataStr) return;
		return JSON.parse(dataStr);
	}

	static setWorldData<T extends WorldDataNodeName>(dataNodeName: T, object: WorldDataNodeType<T>) {
		const data = JSON.stringify(object);
		world.setDynamicProperty(dataNodeName, data);
	}

	static clearWorldData() { world.clearDynamicProperties(); }

	static getData<T extends string>(entity: Entity, dataNodeName: T): DataNodeReturnType<T> | undefined {
		const dataStr = entity.getDynamicProperty('data') as string;
		if (!dataStr) return;
		const dataNodes = JSON.parse(dataStr);
		const dataNode = dataNodes.find((x: DataNode) => (x.name == dataNodeName));
		if (!dataNode) return;
		else return dataNode;
	}

	static GetDataRaw(entity: Entity): string | undefined {
		const dataStr = entity.getDynamicProperty('data') as string;
		if (!dataStr) return;
		return dataStr;
	}

	static setData(entity: Entity, object: DataNode) {
		const dataStr = entity.getDynamicProperty('data') as string;
		if (!dataStr) {
			entity.setDynamicProperty('data', JSON.stringify([object]));
			return true;
		}
		const dataNodes = JSON.parse(dataStr);
		const dataNodeIndex = dataNodes.findIndex((x: DataNode) => (x.name == object.name));
		if (dataNodeIndex == -1) {
			dataNodes.push(object);
			entity.setDynamicProperty('data', JSON.stringify(dataNodes));
			return true;
		}
		dataNodes[dataNodeIndex] = object;
		entity.setDynamicProperty('data', JSON.stringify(dataNodes));
		return true;
	}

	static clearData(entity: Entity) { entity.clearDynamicProperties(); }
}