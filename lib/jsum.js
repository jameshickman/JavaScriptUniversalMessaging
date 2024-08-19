const hydration = {};

const throttle = (func, limit) => {
    let lastFunc;
    let lastRan;
    return function() {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    }
}

/**
 * The visibility_check function is available in the case
 * that regions of the page have visibility changes that
 * are unrelated to scrolling. Call from complex navigation between
 * views.
 */
const visibility_check = () => {
    const is_visible = (el) => {
        const bbox = el.getBoundingClientRect();
		const h = window.innerHeight;
		if (bbox.y < h) {
			let el_current = el;
			while(el_current.parentElement) {
				if (
                    el_current.style.display === 'none'
                    || el_current.style.visibility === 'collapse'
                    || el_current.style.visibility === 'hidden'
                ) {
					return false;
				}
				el_current = el_current.parentElement;
			}
		}
		else {
			return false;
		}
		return true;
    }
    for (const element_id in hydration) {
        if (hydration[element_id] === false) {
            const el = document.getElementById(element_id)
            if (is_visible(el)) {
                if ('_start' in el) {
                    hydration[element_id] = true;
                    el._start.bind(el)();
                }
            }
        }
    }
}

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
    }
    visibility_check();
    const throttled_handler = throttle(visibility_check, 100);
    document.addEventListener('scroll', throttled_handler);
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

export {multicall, init_hydration_lifecycle, visibility_check};