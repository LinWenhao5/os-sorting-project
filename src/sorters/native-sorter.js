import { BaseSorter } from "./base-sorter.js";

export class NativeSorter extends BaseSorter {
    async execute(numbers, k) {
        return numbers.sort((a, b) => a - b);
    }
}