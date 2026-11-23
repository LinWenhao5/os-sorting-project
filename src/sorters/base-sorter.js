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
            elapsedMs: end - start,
        };
    }

    // 由子类实现具体的排序逻辑。
    async execute(_numbers, _k) {
        throw new Error("execute() must be implemented by a subclass.");
    }
}
