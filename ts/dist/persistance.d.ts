declare global {
    interface Window {
        persist: PersistInterface;
    }
}
interface PersistInterface {
    register: (name: string, callback: (values: Record<string, any>) => void) => void;
    set: (name: string, values: Record<string, any>) => void;
    get: (name: string, key: string) => any;
}
/**
 * Once you know that all components using hash-persistance have initlized,
 * call the init() to read the current hash-string state and dispatch callbacks.
 *
 * This is for the case of persistenace is a link or a bookmark URL.
 */
export declare const init: () => void;
export {};
