interface JSUMElement extends HTMLElement {
    _start?: () => Promise<void> | void;
    [key: string]: any;
}
interface MultiCallParams {
    target: string;
    query: string;
    root?: ParentNode;
    params?: any[];
}
interface MultiCallResult {
    result?: any;
    error?: Error;
    source: JSUMElement;
}
/**
 * Start the component hydration support.
 * Any component with the jsum attribute
 * will be tracked, and when it becomes visible the
 * _start() method is called for the component to fully
 * activate
 */
export declare const init_hydration_lifecycle: () => void;
/**
 * Call a method on multiple Custom Elements instances by query-selector.
 * @param callData - Configuration object for the multicall
 * @param callData.target - Required, name of the method to find and call
 * @param callData.query - Required, selector to find elements
 * @param callData.root - Optional, element to query
 * @param callData.params - Optional, parameters to pass to the target methods
 * @returns Promise resolving to an array of results from each element
 */
export declare const multicall: (co: MultiCallParams) => Promise<MultiCallResult[]>;
/**
 * In the case of dynamic elements added to the DOM
 * delete the cached query results so the cache list
 * is recreated for the operation.
 *
 * @param method_name - The method name to clear from cache
 */
export declare const clear_cache_for: (method_name: string) => void;
export {};
