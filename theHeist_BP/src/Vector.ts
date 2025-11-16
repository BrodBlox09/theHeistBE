import { Vector3 } from "@minecraft/server";
import Utilities from "./Utilities";

export default class Vector implements Vector3 {
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

	getCenter(): Vector {
		let centered = this.clone();
		centered.x = Math.floor(centered.x) + 0.5;
		centered.y = Math.floor(centered.y) + 0.5;
		centered.z = Math.floor(centered.z) + 0.5;
		return centered;
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

	static getRandom(): Vector {
		return new Vector(Utilities.getRandPN(), Utilities.getRandPN(), Utilities.getRandPN());
	}

    static from(v3: Vector3) {
        return new Vector(v3.x, v3.y, v3.z);
    }

    static up = new Vector(0, 1, 0);
    static down = new Vector(0, -1, 0);
	static zero = new Vector(0, 0, 0);
}