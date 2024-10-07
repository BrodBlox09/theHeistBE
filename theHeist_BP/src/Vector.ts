import { Vector3 } from "@minecraft/server";

export default class Vector implements Vector3, IVector3 {
    x: number;
    y: number;
    z: number;

    constructor(_x: number, _y: number, _z: number) {
        this.x = _x;
        this.y = _y;
        this.z = _z;
    }

    /**
     * 
     * @param oV Other vector to add
     */
    add(oV: Vector): Vector {
        return new Vector(this.x + oV.x, this.y + oV.y, this.z + oV.z);
    }

    /**
     * 
     * @param oV Other vector to subtract
     */
    subtract(oV: Vector): Vector {
        return new Vector(this.x - oV.x, this.y - oV.y, this.z - oV.z);
    }

    static v3ToVector(v3: Vector3) {
        return new Vector(v3.x, v3.y, v3.z);
    }

    static up = new Vector(0, 1, 0);
    static down = new Vector(0, -1, 0);
}