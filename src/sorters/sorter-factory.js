import { DirectSorter } from "./direct-sorter.js";
import { MultiProcessSorter } from "./multi-process-sorter.js";
import { SingleProcessSorter } from "./single-process-sorter.js";
import { MultiThreadSorter } from "./multi-thread-sorter.js";

export function createSorter(mode) {
    switch (mode) {
        case 1:
            return new DirectSorter();

        case 2:
            return new SingleProcessSorter();

        case 3:
            return new MultiProcessSorter();

        case 4:
            return new MultiThreadSorter();

        default:
            throw new Error(`Unsupported sorting mode: ${mode}`);
    }
}
