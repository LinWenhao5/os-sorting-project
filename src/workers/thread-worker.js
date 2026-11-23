import {
    parentPort,
    workerData,
} from "node:worker_threads";

import { bubbleSort } from "../algorithms/bubble-sort.js";
import { merge } from "../algorithms/merge.js";

const task = workerData;

if (!parentPort) {
    throw new Error("This file must run inside a Worker Thread.");
}

try {
    let result;

    if (task.type === "bubble") {
        result = bubbleSort(task.numbers);
    } else {
        result = merge(task.left, task.right);
    }

    parentPort.postMessage({
        success: true,
        result,
    });
} catch (error) {
    parentPort.postMessage({
        success: false,
        error: error instanceof Error
            ? error.message
            : String(error),
    });
}
