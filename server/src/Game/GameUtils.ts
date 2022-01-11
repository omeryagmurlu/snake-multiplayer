import { Vector } from "protocol/dist/classes/Game";
import { Vector as IVector } from "protocol/dist/interfaces/Game";

export function shuffleArray<T>(array: T[]) { // in place
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const nFarthest = (n: number, size: IVector, pad: Vector): Vector[] => {
    const distance = (l: Vector, l2: Vector) => Math.abs(l.x - l2.x) + Math.abs(l.y - l2.y) // manhattan

    const paddedSize = new Vector(size.x - 2 * pad.x, size.y - 2 * pad.y)
    let solution: Vector[]

    if (paddedSize.x * paddedSize.y >= 50*50) {
        solution = Array(n).fill(1).map(_ => new Vector(getRandomInt(0, paddedSize.x), getRandomInt(0, paddedSize.y)));
    } else {
        solution = [new Vector(getRandomInt(0, paddedSize.x), getRandomInt(0, paddedSize.y))];

        for (let k = solution.length; k < n; k++) {
            let max: Vector = new Vector(-1, -1)
            let maxval = 0;

            for (let i = 0; i < paddedSize.x; i++) {
                for (let j = 0; j < paddedSize.y; j++) {
                    let val = 0;

                    for (const point of solution) {
                        val += distance(new Vector(i, j), point);
                    }
                    if (val > maxval) {
                        maxval = val;
                        max = new Vector(i, j)
                    }
                }
            }

            solution.push(max);
        }
    }


    return solution.map(v => new Vector(v.x + pad.x, v.y + pad.y));
}