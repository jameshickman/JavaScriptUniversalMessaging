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
var _NavigationMenu_navigation_control;
import { multicall } from "./jsum.js";
/**
 * NavigationMenu component that provides clickable items to control navigation views
 */
export class NavigationMenu extends HTMLElement {
    constructor() {
        super();
        _NavigationMenu_navigation_control.set(this, void 0);
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <slot></slot>
        `;
    }
    connectedCallback() {
        __classPrivateFieldSet(this, _NavigationMenu_navigation_control, this.dataset.target, "f");
        if (!__classPrivateFieldGet(this, _NavigationMenu_navigation_control, "f")) {
            console.warn('NavigationMenu: No target navigation controller specified via data-target');
            return;
        }
        for (let i = 0; i < this.children.length; i++) {
            const el_item = this.children[i];
            el_item.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const view_name = target.dataset.view;
                if (!view_name) {
                    console.warn('NavigationMenu: Menu item clicked without data-view attribute');
                    return;
                }
                multicall({
                    'target': 'goto_view',
                    'query': __classPrivateFieldGet(this, _NavigationMenu_navigation_control, "f"),
                    'params': [view_name]
                });
            });
        }
    }
}
_NavigationMenu_navigation_control = new WeakMap();
customElements.define('navigation-menu', NavigationMenu);
