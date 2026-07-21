export class Random {
    /**
     * Returns a random float between min and max (inclusive of min, exclusive of max)
     */
    static float(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Returns a random integer between min and max (inclusive of min and max)
     */
    static int(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Returns a random boolean with the given chance of being true (0.0 to 1.0)
     */
    static chance(prob) {
        return Math.random() < prob;
    }

    /**
     * Returns a random element from the provided array
     */
    static item(array) {
        if (!array || array.length === 0) return null;
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Returns a random sign (-1 or 1)
     */
    static sign() {
        return Math.random() < 0.5 ? -1 : 1;
    }
}
