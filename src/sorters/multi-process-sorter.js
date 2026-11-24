import { fork } from "node:child_process";
import { fileURLToPath } from "node:url";

import { BaseSorter } from "./base-sorter.js";
import { splitArray } from "../algorithms/merge.js";

export class MultiProcessSorter extends BaseSorter {
    workerPath = fileURLToPath(
        new URL("../workers/sort-worker.js", import.meta.url),
    );

    runWorker(task) {
        return new Promise((resolve, reject) => {
            const child = fork(
                this.workerPath,
                [],
                {
                    stdio: ["inherit", "inherit", "inherit", "ipc"],
                },
            );

            child.once("error", reject);

            child.once("message", (message) => {
                if (child.connected) {
                    child.disconnect();
                }

                if (!message.success) {
                    reject(
                        new Error(message.error ?? "Worker task failed."),
                    );
                    return;
                }

                resolve(message.result);
            });
            
            child.once("exit", (code) => {
                if (code !== 0) {
                    reject(
                        new Error(`Worker stopped with exit code ${code}.`),
                    );
                }
            });

            child.send(task);
        });
    }

    async execute(numbers, k) {
        const chunks = splitArray(numbers, k);

        let current = await Promise.all(
            chunks.map((chunk) =>
                this.runWorker({
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
                        this.runWorker({
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
