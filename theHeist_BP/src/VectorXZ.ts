import Vector from "./Vector";

export default class VectorXZ {
    constructor(public x: number, public z: number) {}

	clone() {
		return new VectorXZ(this.x, this.z);
	}

	getCentered(): VectorXZ {
		let centered = this.clone();
		centered.x = Math.floor(centered.x) + 0.5;
		centered.z = Math.floor(centered.z) + 0.5;
		return centered;
	}

	/**
	 * Converts a VectorXZ to a Vector
	 * @param y The y value the new vector will have. Default value is 0.
	 * @returns The new vector with the provided y value.
	 */
	toVector(y: number = 0): Vector {
		return new Vector(this.x, y, this.z);
	}

    /**
     * 
     * @param oV Other VectorXZ to add
     */
    add(oV: VectorXZ): VectorXZ {
        return new VectorXZ(this.x + oV.x, this.z + oV.z);
    }

	distanceTo(oV: VectorXZ): number {
		return Math.sqrt(
			(this.x - oV.x) ** 2 +
			(this.z - oV.z) ** 2
		);
	}

    /**
     * 
     * @param oV Other VectorXZ to subtract
     */
    subtract(oV: VectorXZ): VectorXZ {
        return new VectorXZ(this.x - oV.x, this.z - oV.z);
    }
    
    toString() {
        return `${this.x} ${this.z}`;
    }

	static zero = new VectorXZ(0, 0);
}