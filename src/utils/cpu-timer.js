import { performance } from "node:perf_hooks";

export class CpuTimer {
    static measure(task) {
        const start = performance.now();

        const result = task();

        const end = performance.now();

        return {
            result,
            elapsedMs: end - start,
        };
    }
}
