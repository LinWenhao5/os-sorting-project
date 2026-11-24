import { DataReader } from "./utils/data-loader.js";
import { createSorter } from "./sorters/sorter-factory.js";
import { writeFile, mkdir } from "node:fs/promises";

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
    const inputName = getArgument("--input", "input_1w");
    const k = Number(getArgument("--k", "4"));
    const filePath = `input/${inputName}.txt`;

    const numbers = await DataReader.read(filePath);

    const sorter = createSorter(mode);
    const result = await sorter.run(numbers, k);

    console.log("Mode:", mode);
    console.log("Total count:", numbers.length);
    console.log("K:", k);
    console.log("CPU ms (ms):", result.cpuMs.toFixed(2));
    console.log(
        "First 10 sorted numbers:",
        result.sortedNumbers.slice(0, 10),
    );

    const outputDir = "output";

    await mkdir(outputDir, { recursive: true });

    const outputPath = `${outputDir}/${inputName}_output${mode}.txt`;

    const resultLine = [
        `CPU Time=${result.cpuMs.toFixed(2)} ms`,
        `Output Time=${new Date().toISOString()}`
    ].join("\n");

    const outputContent = [
        result.sortedNumbers.join("\n"),
        resultLine,
    ].join("\n");

    await writeFile(outputPath, outputContent, "utf-8");

    console.log("Sorted result and benchmark saved to:", outputPath);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});