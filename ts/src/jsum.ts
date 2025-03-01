/*
 * Minimal async message bus for custom-element-based components
 * system and optional visibility-based hydration.
 * (c) 2024 James Hickman <jamesATjameshickmanDOTnet>
 * MIT License
 */

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

const hydration: Record<string, boolean> = {};
const cache: Record<string, JSUMElement[]> = {};

/**
 * Intersection observer for visibility-based component hydration
 */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target as JSUMElement;
            if (el.id && hydration[el.id] === false) {
                hydration[el.id] = true;
                if (el._start) {
                    el._start.bind(el)();
                }
                observer.unobserve(el);
            }
        }
    });
}, {
    root: null, // Use the viewport as the root
    rootMargin: '0px',
    threshold: 0.1 // Trigger when at least 10% of the target is visible
});

/**
 * Start the component hydration support.
 * Any component with the jsum attribute
 * will be tracked, and when it becomes visible the
 * _start() method is called for the component to fully
 * activate
 */
export const init_hydration_lifecycle = (): void => {
    const els_components = document.querySelectorAll("[jsum]");
    for (let i = 0; i < els_components.length; i++) {
        const el_component = els_components[i] as JSUMElement;
        if (el_component.id) {
            hydration[el_component.id] = false;
            observer.observe(el_component);
        } else {
            console.warn('JSUM: Component with jsum attribute has no id attribute and cannot be hydrated');
        }
    }
};

/**
 * Call a method on multiple Custom Elements instances by query-selector.
 * @param callData - Configuration object for the multicall
 * @param callData.target - Required, name of the method to find and call
 * @param callData.query - Required, selector to find elements
 * @param callData.root - Optional, element to query
 * @param callData.params - Optional, parameters to pass to the target methods
 * @returns Promise resolving to an array of results from each element
 */
export const multicall = async (co: MultiCallParams): Promise<MultiCallResult[]> => {
    let is_root_document = false;
    let cached = false;
    let key: string | null = null;
    
    if (co.root === undefined) {
        co.root = document;
        is_root_document = true;
    }
    
    if (co.params === undefined) {
        co.params = [];
    }
    
    let els: NodeListOf<Element> | JSUMElement[] = [];
    
    if (is_root_document) {
        key = co.query + '/' + co.target;
        if (cache.hasOwnProperty(key)) {
            cached = true;
            els = cache[key];
        } else {
            els = co.root.querySelectorAll(co.query);
        }
    } else {
        els = co.root.querySelectorAll(co.query);
    }

    // Create an array of promises for each matching element
    const promises = Array.from(els).map(async (el) => {
        const element = el as JSUMElement;
        
        if (co.target in element && typeof element[co.target] === 'function') {
            if (is_root_document && !cached && key) {
                if (!cache.hasOwnProperty(key)) {
                    cache[key] = [];
                }
                cache[key].push(element);
            }
            
            if (element.id) {
                if (element.id in hydration && hydration[element.id] === false) {
                    hydration[element.id] = true;
                    observer.unobserve(element);
                    if (element._start) await element._start.bind(element)();
                }
            }
            
            try {
                const result = await element[co.target].bind(element)(...(co.params || []));
                return { result, source: element };
            } catch (error) {
                console.error(`Error in multicall for element ${element.id || 'unknown'}:`, error);
                return { error: error as Error, source: element };
            }
        }
        return null;
    });

    // Wait for all promises to resolve
    const results = await Promise.all(promises);

    // Filter out null results (elements that didn't match the criteria)
    return results.filter((result): result is MultiCallResult => result !== null);
};

/**
 * In the case of dynamic elements added to the DOM
 * delete the cached query results so the cache list
 * is recreated for the operation.
 * 
 * @param method_name - The method name to clear from cache
 */
export const clear_cache_for = (method_name: string): void => {
    for (const key in cache) {
        const method = key.split('/')[1];
        if (method === method_name) {
            delete cache[key];
        }
    }
};