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
                    execArgv: process.execArgv,
                    stdio: ["inherit", "inherit", "inherit", "ipc"],
                },
            );

            let settled = false;

            const cleanup = () => {
                if (child.connected) {
                    child.disconnect();
                }
            };

            const fail = (error) => {
                if (settled) return;

                settled = true;
                cleanup();
                child.kill();

                reject(error);
            };

            child.once("error", fail);

            child.once("exit", (code, signal) => {
                if (!settled) {
                    fail(
                        new Error(
                            `Worker exited unexpectedly: code=${code}, signal=${signal}`,
                        ),
                    );
                }
            });

            child.once("message", (message) => {
                if (settled) return;

                if (!message.success || !message.result) {
                    fail(
                        new Error(
                            message.error ?? "Worker task failed.",
                        ),
                    );
                    return;
                }

                settled = true;
                cleanup();
                resolve(message.result);
            });

            child.send(task, (error) => {
                if (error) {
                    fail(error);
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

        // Phase 1: K processes independently perform Bubble Sort.
        const chunks = splitArray(numbers, k);

        let current = await Promise.all(
            chunks.map((chunk) =>
                this.runWorker({
                    type: "bubble",
                    numbers: chunk,
                }),
            ),
        );

        // Phase 2: Merge sorted chunks using child processes.
        // Each round reduces the number of arrays until only one remains.
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
                    // Carry an unmatched array into the next round.
                    tasks.push(Promise.resolve(left));
                }
            }

            current = await Promise.all(tasks);
        }

        return current[0];
    }
}
