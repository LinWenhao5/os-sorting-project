import { readFile } from "node:fs/promises";

export class DataReader {
    static async read(filePath: string): Promise<number[]> {
        const content = await readFile(filePath, "utf-8");

        return content
            .trim()
            .split(/\s+/)
            .map(Number);
    }
}