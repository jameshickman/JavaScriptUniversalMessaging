var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _NavigationView_instances, _NavigationView_views, _NavigationView_goto_view;
/**
 * NavigationView component that provides a container for multiple switchable views
 * Supports persistence via URL hash
 */
export class NavigationView extends HTMLElement {
    constructor() {
        super();
        _NavigationView_instances.add(this);
        _NavigationView_views.set(this, {});
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <div class='view_container'>
                <slot></slot>
            </div>
        `;
    }
    connectedCallback() {
        __classPrivateFieldSet(this, _NavigationView_views, {}, "f");
        let first_view = false;
        let default_view = false;
        for (let i = 0; i < this.children.length; i++) {
            const el_view = this.children[i];
            const view_name = el_view.dataset.name;
            if (!view_name) {
                throw new Error('A view must define a value for the data-name property');
            }
            if (first_view === false)
                first_view = view_name;
            if (el_view.dataset.hasOwnProperty('default'))
                default_view = view_name;
            if (__classPrivateFieldGet(this, _NavigationView_views, "f").hasOwnProperty(view_name)) {
                throw new Error('A view must define a unique value for the data-name property');
            }
            __classPrivateFieldGet(this, _NavigationView_views, "f")[view_name] = el_view;
        }
        if ('persist' in window && this.id) {
            window.persist.register(this.id, (values) => {
                if ('view' in values) {
                    __classPrivateFieldGet(this, _NavigationView_instances, "m", _NavigationView_goto_view).call(this, values['view']);
                }
                else {
                    if (default_view !== false) {
                        __classPrivateFieldGet(this, _NavigationView_instances, "m", _NavigationView_goto_view).call(this, default_view);
                    }
                    else if (first_view !== false) {
                        __classPrivateFieldGet(this, _NavigationView_instances, "m", _NavigationView_goto_view).call(this, first_view);
                    }
                }
            });
        }
        if (default_view !== false) {
            __classPrivateFieldGet(this, _NavigationView_instances, "m", _NavigationView_goto_view).call(this, default_view);
        }
        else if (first_view !== false) {
            __classPrivateFieldGet(this, _NavigationView_instances, "m", _NavigationView_goto_view).call(this, first_view);
        }
    }
    /**
     * Public method to switch views with optional persistence
     */
    async goto_view(view_to_show) {
        __classPrivateFieldGet(this, _NavigationView_instances, "m", _NavigationView_goto_view).call(this, view_to_show);
        if ('persist' in window && this.id) {
            window.persist.set(this.id, {
                view: view_to_show
            });
        }
    }
}
_NavigationView_views = new WeakMap(), _NavigationView_instances = new WeakSet(), _NavigationView_goto_view = function _NavigationView_goto_view(view_to_show) {
    for (const view_name in __classPrivateFieldGet(this, _NavigationView_views, "f")) {
        if (view_name === view_to_show) {
            __classPrivateFieldGet(this, _NavigationView_views, "f")[view_name].style.display = 'block';
        }
        else {
            __classPrivateFieldGet(this, _NavigationView_views, "f")[view_name].style.display = 'none';
        }
    }
};
customElements.define('navigation-views', NavigationView);
