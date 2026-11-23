import { bubbleSort } from "../algorithms/bubble-sort.js";
import { merge } from "../algorithms/merge.js";

process.on("message", (task) => {
    try {
        let result;

        if (task.type === "bubble") {
            result = bubbleSort(task.numbers);
        } else {
            result = merge(task.left, task.right);
        }

        process.send?.({
            success: true,
            result,
        });
    } catch (error) {
        process.send?.({
            success: false,
            error: error instanceof Error
                ? error.message
                : String(error),
        });
    }
});
