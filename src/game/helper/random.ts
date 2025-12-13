export function weightedRandom(options: { item: any; weight: number }[]) {
    // options = [{ item: "A", weight: 10 }, { item: "B", weight: 2 }]

    let totalWeight = 0;
    for (const opt of options) {
        totalWeight += opt.weight;
    }

    let random = Math.random() * totalWeight;

    for (const opt of options) {
        if (random < opt.weight) {
            return opt.item;
        }
        random -= opt.weight;
    }
}

