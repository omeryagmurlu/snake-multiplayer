import { Vector } from "protocol/dist/classes/Game";
import { Player } from "..";

export const pointToCollidable = (v: Vector, c: Collidable): boolean => {
    for (const v2 of c.getCollidableVectors()) {
        if (v.equals(v2)) return true;
    }

    return false;
}

export const collidableToCollidable = (c: Collidable, c2: Collidable): boolean => {
    for (const v of c.getCollidableVectors()) {
        if (pointToCollidable(v, c2)) return true;
    }

    return false;
}

export interface Collidable {
    getCollidableVectors(): Vector[]
    collidesWith(c: Collidable): boolean
}

export const getCollision = (c: Collidable, cs: Collidable[]): Collidable | null => {
    for (const coll of cs) {
        if (c.collidesWith(coll)) return coll;
    }

    return null;
}