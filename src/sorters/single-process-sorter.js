import { BaseSorter } from "./base-sorter.js";
import { bubbleSort } from "../algorithms/bubble-sort.js";
import { splitArray, merge } from "../algorithms/merge.js";

export class SingleProcessSorter extends BaseSorter {
    async execute(numbers, k) {
        const chunks = splitArray(numbers, k);

        const sortedChunks = chunks.map(
            (chunk) => bubbleSort(chunk)
        );

        let current = sortedChunks;

        while (current.length > 1) {
            const next = [];

            for (let i = 0; i < current.length; i += 2) {
                const left = current[i];

                if (i + 1 < current.length) {
                    next.push(merge(left, current[i + 1]));
                } else {
                    next.push(left);
                }
            }

            current = next;
        }

        return current[0] ?? [];
    }
}
