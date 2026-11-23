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

            let settled = false;

            const fail = (error) => {
                if (settled) return;

                settled = true;
                void worker.terminate();
                reject(error);
            };

            worker.once("error", fail);

            worker.once("message", (message) => {
                if (settled) return;

                if (!message.success || !message.result) {
                    fail(
                        new Error(
                            message.error ?? "Thread task failed.",
                        ),
                    );
                    return;
                }

                settled = true;
                resolve(message.result);
            });

            worker.once("exit", (code) => {
                if (!settled) {
                    fail(
                        new Error(
                            `Worker exited unexpectedly with code ${code}.`,
                        ),
                    );
                }
            });
        });
    }

    async execute(numbers, k) {
        if (!Number.isInteger(k) || k < 1) {
            throw new Error("K must be a positive integer.");
        }

        if (numbers.length === 0) {
            return [];
        }

        if (k > numbers.length) {
            throw new Error(
                "K cannot be greater than the number of input values.",
            );
        }

        // Phase 1: K threads perform Bubble Sort concurrently.
        const chunks = splitArray(numbers, k);

        let current = await Promise.all(
            chunks.map((chunk) =>
                this.runThread({
                    type: "bubble",
                    numbers: chunk,
                }),
            ),
        );

        // Phase 2: Merge sorted arrays using threads.
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
                    // Carry an unmatched array into the next round.
                    tasks.push(Promise.resolve(left));
                }
            }

            current = await Promise.all(tasks);
        }

        return current[0];
    }
}
