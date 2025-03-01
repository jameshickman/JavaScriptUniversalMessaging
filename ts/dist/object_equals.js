/**
 * Counts the number of own properties in an object
 * @param obj - The object to count properties on
 * @returns The number of own properties
 */
const countProps = (obj) => {
    let count = 0;
    for (const k in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) {
            count++;
        }
    }
    return count;
};
/**
 * Deep comparison between two values
 * @param v1 - First value to compare
 * @param v2 - Second value to compare
 * @returns True if values are deeply equal, false otherwise
 */
const objectEquals = (v1, v2) => {
    if (typeof v1 !== typeof v2) {
        return false;
    }
    if (typeof v1 === "function") {
        return v1.toString() === v2.toString();
    }
    if (v1 instanceof Object && v2 instanceof Object) {
        if (countProps(v1) !== countProps(v2)) {
            return false;
        }
        for (const k in v1) {
            if (!objectEquals(v1[k], v2[k])) {
                return false;
            }
        }
        return true;
    }
    else {
        return v1 === v2;
    }
};
export { objectEquals };
