import { Worker } from "node:worker_threads";

import { BaseSorter } from "./base-sorter.js";
import { splitArray } from "../algorithms/merge.js";

export class MultiThreadSorter extends BaseSorter {
    workerUrl = new URL(
        "../workers/thread-worker.js",
        import.meta.url,
    );

    runThread(task) {
        return new Promise((resolve, reject) => {
            const worker = new Worker(this.workerUrl, {
                workerData: task,
            });

            worker.once("error", reject);

            worker.once("message", (message) => {
                if (!message.success) {
                    reject(
                        new Error(message.error ?? "Thread task failed."),
                    );
                    return;
                }

                resolve(message.result);
            });

            worker.once("exit", (code) => {
                if (code !== 0) {
                    reject(
                        new Error(`Worker stopped with exit code ${code}.`),
                    );
                }
            });
        });
    }

    async execute(numbers, k) {
        const chunks = splitArray(numbers, k);

        let current = await Promise.all(
            chunks.map((chunk) =>
                this.runThread({
                    type: "bubble",
                    numbers: chunk,
                }),
            ),
        );

        while (current.length > 1) {
            const tasks = [];

            for (let i = 0; i < current.length; i += 2) {
                const left = current[i];

                if (i + 1 < current.length) {
                    tasks.push(
                        this.runThread({
                            type: "merge",
                            left,
                            right: current[i + 1],
                        }),
                    );
                } else {
                    tasks.push(Promise.resolve(left));
                }
            }

            current = await Promise.all(tasks);
        }

        return current[0];
    }
}
