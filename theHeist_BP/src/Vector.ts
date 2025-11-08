import { Vector3 } from "@minecraft/server";
import { IVector3 } from "./TypeDefinitions";

export default class Vector implements Vector3, IVector3 {
    constructor(public x: number, public y: number, public z: number) {}

	clone() {
		return new Vector(this.x, this.y, this.z);
	}

    above() {
        return this.add(Vector.up);
    }

    below() {
        return this.add(Vector.down);
    }

    /**
     * 
     * @param oV Other vector to add
     */
    add(oV: Vector): Vector {
        return new Vector(this.x + oV.x, this.y + oV.y, this.z + oV.z);
    }

	distanceTo(oV: Vector3): number {
		return Math.sqrt(
			(this.x - oV.x) ** 2 +
			(this.y - oV.y) ** 2 +
			(this.z - oV.z) ** 2
		);
	}

    /**
     * 
     * @param oV Other vector to subtract
     */
    subtract(oV: Vector): Vector {
        return new Vector(this.x - oV.x, this.y - oV.y, this.z - oV.z);
    }
    
    toString() {
        return `${this.x} ${this.y} ${this.z}`;
    }

    static from(v3: Vector3) {
        return new Vector(v3.x, v3.y, v3.z);
    }

    static up = new Vector(0, 1, 0);
    static down = new Vector(0, -1, 0);
	static zero = new Vector(0, 0, 0);
}