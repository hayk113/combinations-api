function generateCombinations(items, length) {
    const result = [];

    function combine(current, start, prefixes) {
        if (current.length === length) {
            result.push([...current]);
            return;
        }

        for (let i = start; i < items.length; i++) {
            const item = items[i];
            const prefix = item[0]; // e.g., 'A' from 'A1'
            if (!prefixes.has(prefix)) { // Ensure distinct prefixes
                current.push(item);
                prefixes.add(prefix);
                combine(current, i + 1, prefixes);
                current.pop();
                prefixes.delete(prefix);
            }
        }
    }

    combine([], 0, new Set());
    return result;
}

module.exports = { generateCombinations };