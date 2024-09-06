const data = {};
const shadow = {};
let hash_flag = 0;

window.persist = {};

window.persist.register = (name, callback) => {
    if (!data.hasOwnProperty(name)) {
        data[name] = {
            'callback': callback,
            'values': {}
        };
    }
    else {
        data[name]['callback'] = callback;
    }
};

window.persist.set = (nme, values) => {
    for (const k in values) {
        data[n]['values'][k] = values[k];
    }
    value_changed();
};

window.persist.get = (nme, key) => {
    if (data.hasOwnProperty(nme) && data[n]['values'].hasOwnProperty(key)) {
        return data[nme]['values'][key];
    }
    return undefined;
};

const dispatch_change = () => {
    if (hash_flag == 0) {
        sync_shadow();
        hash_decode();
        const changes = find_changes();
        for (let i = 0; i < changes.length; i++) {
            if (typeof data[changes[i]]['callback'] === 'function') data[changes[i]]['callback'](data[changes[i]]['values']);
        }
    }
    hash_flag = 0;
};

const value_changed = () => {
    hash_flag = 1;
    hash_encode();
};

const find_changes = () => {
    const changed = [];
    const add_to_changed = (n) => {
        if (!changed.includes(n)) changed.push(n);
    };
    for (const n in data) {
        if (!shadow.hasOwnProperty(n)) {
            add_to_changed(n);
        }
        else if (Object.keys(shadow[n]).length != Object.keys(data[n]['values']).length) {
            add_to_changed(n);
        }
        else {
            for (const k in data[n]['values']) {
                if (data[n]['values'][k] != shadow[n][k]) {
                    add_to_changed(n);
                    break;
                }
            }
        }
    }
    return changed;
};

const sync_shadow = () => {
    for (const n in data) {
        if (!shadow.hasOwnProperty(n)) {
            shadow[n] = {};
        }
        for (const k in data[n]['values']) {
            shadow[n][k] = data[n]['values'][k];
        }
    }
};

const hash_encode = () => {
    const cstates = [];
    for (const name in data) {
        const parts = [name];
        for (const k in data[name]['values']) {
            parts.push(k);
            let v = data[name]['values'][k].toString();
            v = v.replace(new RegExp(':', 'g'), ':CO:');
            v = v.replace(new RegExp('/', 'g'), ':SL:');
            v = v.replace(new RegExp('\\\\', 'g'), ':BA:');
            v = v.replace(new RegExp(' ', 'g'), ':SP:');
            v = v.replace(new RegExp('[|]', 'g'), ':PI:');
            v = v.replace(new RegExp('#', 'g'), ':HA:');
            v = v.replace(new RegExp('&', 'g'), ':AM:');
            parts.push(v);
        }
        cstates.push(parts.join('/'));
    }
    const hashed = cstates.join('|');
    const urlp = window.location.href.split('#');
    window.location.href = urlp[0] + '#' + hashed;
};

const hash_decode = () => {
    const urlp = window.location.href.split('#')[1];
    for (const name in data) {
        data[name]['values'] = {};
    }
    try {
        if (urlp.length > 0) {
            const cs = urlp.split('|');
            for (const n in cs) {
                const values = cs[n].split('/');
                const component_name = values[0];
                for (let i = 1; i < values.length; i += 2) {
                    const k = values[i];
                    let v = values[i + 1];
                    v = v.replace(new RegExp(':AM:', 'g'), '&');
                    v = v.replace(new RegExp(':HA:', 'g'), '#');
                    v = v.replace(new RegExp(':PI:', 'g'), '|');
                    v = v.replace(new RegExp(':SP:', 'g'), ' ');
                    v = v.replace(new RegExp(':BA:', 'g'), '\\');
                    v = v.replace(new RegExp(':SL:', 'g'), '/');
                    v = v.replace(new RegExp(':CO:', 'g'), ':');
                    if (!data.hasOwnProperty(component_name)) {
                        data[component_name] = {
                            'values': {}
                        };
                    }
                    data[component_name]['values'][k] = v;
                }
            }
        }
    }
    catch (err) {
        // Log a warning.
        console.log("WARNING: Unable to parse URL string after the hash.");
    }
};

const init = () => {
    dispatch_change();
};

window.addEventListener('hashchange', dispatch_change());

export {init};