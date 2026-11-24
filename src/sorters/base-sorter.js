export class BaseSorter {
    async run(numbers, k) {
        const start = performance.now();

        const sortedNumbers = await this.execute(
            [...numbers],
            k
        );

        const end = performance.now();

        return {
            sortedNumbers,
            cpuMs: end - start,
        };
    }

    async execute(_numbers, _k) {
        throw new Error("execute() must be implemented by a subclass.");
    }
}
