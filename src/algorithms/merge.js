export function splitArray(numbers, k) {
    if (!Number.isInteger(k) || k < 1) {
        throw new Error("K must be a positive integer.");
    }

    const chunks = [];
    const baseSize = Math.floor(numbers.length / k);
    const remainder = numbers.length % k;

    let start = 0;

    for (let i = 0; i < k; i++) {
        const size = baseSize + (i < remainder ? 1 : 0);

        chunks.push(numbers.slice(start, start + size));
        start += size;
    }

    return chunks;
}

export function merge(left, right) {
    const result = [];
    let i = 0;
    let j = 0;

    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i]);
            i++;
        } else {
            result.push(right[j]);
            j++;
        }
    }

    while (i < left.length) {
        result.push(left[i]);
        i++;
    }

    while (j < right.length) {
        result.push(right[j]);
        j++;
    }

    return result;
}
