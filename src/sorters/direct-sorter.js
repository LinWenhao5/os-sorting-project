import { BaseSorter } from "./base-sorter.js";
import { bubbleSort } from "../algorithms/bubble-sort.js";

export class DirectSorter extends BaseSorter {
    async execute(numbers, _k) {
        return bubbleSort(numbers);
    }
}
