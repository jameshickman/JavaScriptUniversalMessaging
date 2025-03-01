/*
 * Low-level global module to manage persistant data encoded into the hash component of the URL.
 *
 * Useful for navigation "virtual routing" that respects link value, bookmark, forward, and back navigation.
 * But is a general purpose seralization of sets of key:value pairs for use-cases other than virtual routes.
 * 
 * (c) 2024 James Hickman <jamesATjameshickmanDOTnet>
 * MIT License
 */

declare global {
    interface Window {
        persist: PersistInterface;
    }
}

interface DataSet {
    callback?: (values: Record<string, any>) => void;
    values: Record<string, any>;
}

interface PersistInterface {
    register: (name: string, callback: (values: Record<string, any>) => void) => void;
    set: (name: string, values: Record<string, any>) => void;
    get: (name: string, key: string) => any;
}

const data: Record<string, DataSet> = {};
const shadow: Record<string, Record<string, any>> = {};
let hash_flag = 0;

// Initialize the global persist object
window.persist = {} as PersistInterface;

/**
 * Define a data-set and the on change callback.
 * 
 * @param name - Name of the data-set
 * @param callback - Function to call when data changes
 */
window.persist.register = (name: string, callback: (values: Record<string, any>) => void): void => {
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

/**
 * Add data to a tracked data-set
 * 
 * @param name - Name of the data-set 
 * @param values - key:value pairs to add to the data-set
 */
window.persist.set = (name: string, values: Record<string, any>): void => {
    if (!data.hasOwnProperty(name)) {
        console.error(`Persistence: Cannot set values for unregistered dataset '${name}'`);
        return;
    }
    
    for (const k in values) {
        data[name]['values'][k] = values[k];
    }
    value_changed();
};

/**
 * Get a value from a data-set
 * 
 * @param name - dataset name
 * @param key - name of the data item
 * @returns The value if found, undefined otherwise
 */
window.persist.get = (name: string, key: string): any => {
    if (data.hasOwnProperty(name) && data[name]['values'].hasOwnProperty(key)) {
        return data[name]['values'][key];
    }
    return undefined;
};

/**
 * Handle changes detected in the URL hash
 */
const dispatch_change = (): void => {
    if (hash_flag == 0) {
        sync_shadow();
        const hash_exists = hash_decode();
        if (hash_exists) {
            const changes = find_changes();
            for (let i = 0; i < changes.length; i++) {
                if (data[changes[i]]['callback']) {
                    data[changes[i]]['callback']!(data[changes[i]]['values']);
                }
            }
        }
        else {
            for (const name in shadow) {
                delete shadow[name];
            }
            for (const component in data) {
                if (data[component]['callback']) {
                    data[component]['callback']!({});
                }
            }
        }
    }
    hash_flag = 0;
};

/**
 * Trigger hash encoding when values change
 */
const value_changed = (): void => {
    hash_flag = 1;
    hash_encode();
};

/**
 * Find which datasets have changed compared to shadow copy
 */
const find_changes = (): string[] => {
    const changed: string[] = [];
    const add_to_changed = (n: string): void => {
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

/**
 * Synchronize shadow copy with current data state
 */
const sync_shadow = (): void => {
    for (const n in data) {
        if (!shadow.hasOwnProperty(n)) {
            shadow[n] = {};
        }
        for (const k in data[n]['values']) {
            shadow[n][k] = data[n]['values'][k];
        }
    }
};

/**
 * Encode current state to URL hash
 */
const hash_encode = (): void => {
    const cstates: string[] = [];
    for (const name in data) {
        const parts: string[] = [name];
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

/**
 * Decode URL hash to data state
 */
const hash_decode = (): boolean => {
    try {
        for (const name in data) {
            data[name]['values'] = {};
        }
        const urlParts = window.location.href.split('#');
        if (urlParts.length < 2 || !urlParts[1]) {
            return false;
        }
        
        const urlp = urlParts[1];
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
        console.error("Error decoding hash:", err);
        return false;
    }
    return true;
};

/**
 * Once you know that all components using hash-persistance have initlized,
 * call the init() to read the current hash-string state and dispatch callbacks.
 * 
 * This is for the case of persistenace is a link or a bookmark URL.
 */
export const init = (): void => {
    dispatch_change();
};

window.addEventListener('hashchange', dispatch_change);