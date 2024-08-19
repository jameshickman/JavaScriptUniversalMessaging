const hydration = {};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            if (el.id && hydration[el.id] === false) {
                hydration[el.id] = true;
                if ('_start' in el) {
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
 * Any component with the data-hydration attribute
 * will be tracked, and when it becomes visiable the
 * _start() method is caled for the component to fully
 * activate
 */
const init_hydration_lifecycle = () => {
    const els_components = document.querySelectorAll("[jsum]");
    for (const el_component of els_components) {
        hydration[el_component.id] = false;
        observer.observe(el_component);
    }
}

const multicall = (co) => {
    /**
     * Call a method on multiple Web Component instances by query-selector.
     * @param {object} callData
     * @param {string} callData.target - required, name of the method to find and call
     * @param {string} callData.query - required, selector to find elements
     * @param {HTMLElement} callData.root - optional, element to query
     * @param {Array} callData.params - optional, parameters to pass to the target methods
     */
    if (co.root === undefined) {
        co.root = document;
    }
    if (co.params === undefined) {
        co.params = [];
    }
    const els = co.root.querySelectorAll(co.query);
    const results = [];
    for (const el of els) {
        if (co.target in el && typeof el[co.target] === 'function') {
            if (el.id) {
                if (el.id in hydration && hydration[el.id] === false) {
                    hydration[el.id] = true;
                    observer.unobserve(el);
                    if ("_start" in el) el._start.bind(el)();
                }
            }
            
            results.push(
                {
                    result: el[co.target].bind(el)(...co.params),
                    source: el
                }
            );
        }
    }
    return results;
}

export {multicall, init_hydration_lifecycle};