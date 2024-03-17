import { Vector3 } from "@minecraft/server";

export default class Vector implements Vector3 {
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
}