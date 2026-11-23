import { DataReader } from "./utils/data-loader.js";
import { createSorter } from "./sorters/sorter-factory.js";

const FILES = {
    "1w": "input/input_1w.txt",
    "10w": "input/input_10w.txt",
    "50w": "input/input_50w.txt",
    "100w": "input/input_100w.txt",
};

function getArgument(name, defaultValue) {
    const index = process.argv.indexOf(name);

    if (index === -1) {
        return defaultValue;
    }

    const value = process.argv[index + 1];

    if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for ${name}`);
    }

    return value;
}

async function main() {
    const mode = Number(getArgument("--mode", "1"));
    const size = getArgument("--size", "1w");
    const k = Number(getArgument("--k", "4"));

    if (!Number.isInteger(mode) || mode < 1 || mode > 4) {
        throw new Error("Mode must be between 1 and 4.");
    }

    if (!Number.isInteger(k) || k < 1) {
        throw new Error("K must be a positive integer.");
    }

    const filePath = FILES[size];

    if (!filePath) {
        throw new Error(
            `Unsupported size: ${size}. Use 1w, 10w, 50w or 100w.`,
        );
    }

    const numbers = await DataReader.read(filePath);

    const expectedSize = Number(size.replace("w", "")) * 10000;

    if (numbers.length !== expectedSize) {
        throw new Error(
            `Expected ${expectedSize} numbers, but found ${numbers.length}.`,
        );
    }

    const sorter = createSorter(mode);
    const result = await sorter.run(numbers, k);

    console.log("Mode:", mode);
    console.log("Data size:", size);
    console.log("Total count:", numbers.length);
    console.log("K:", k);
    console.log("Elapsed time (ms):", result.elapsedMs.toFixed(2));
    console.log(
        "First 10 sorted numbers:",
        result.sortedNumbers.slice(0, 10),
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
