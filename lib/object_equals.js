const countProps = (obj) => {
    let count = 0;
    for (const k in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) {
            count++;
        }
    }
    return count;
};

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
    } else {
        return v1 === v2;
    }
};

export { objectEquals };