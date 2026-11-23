
import { DataReader } from "./utils/data-loader.js";
import { bubbleSort } from "./algorithms/bubble-sort.js";
import { CpuTimer } from "./utils/cpu-timer.js";

async function main(): Promise<void> {
    const numbers = await DataReader.read("input/input_1w.txt");

    const { result: sortedNumbers, elapsedMs } =
        CpuTimer.measure(() => bubbleSort(numbers));

    console.log("Total count:", numbers.length);
    console.log("Elapsed time (ms):", elapsedMs);
    console.log("First 10 sorted numbers:", sortedNumbers.slice(0, 10));
}

main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
});
