import { multicall } from "./jsum.js";

/**
 * NavigationMenu component that provides clickable items to control navigation views
 */
export class NavigationMenu extends HTMLElement {
    #navigation_control: string | undefined;
    
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = `
            <slot></slot>
        `;
    }

    connectedCallback(): void {
        this.#navigation_control = this.dataset.target;
        
        if (!this.#navigation_control) {
            console.warn('NavigationMenu: No target navigation controller specified via data-target');
            return;
        }
        
        for (let i = 0; i < this.children.length; i++) {
            const el_item = this.children[i] as HTMLElement;
            
            el_item.addEventListener('click', (e: Event) => {
                const target = e.currentTarget as HTMLElement;
                const view_name = target.dataset.view;
                
                if (!view_name) {
                    console.warn('NavigationMenu: Menu item clicked without data-view attribute');
                    return;
                }
                
                multicall({
                    'target': 'goto_view',
                    'query': this.#navigation_control!,
                    'params': [view_name]
                });
            });
        }
    }
}

customElements.define('navigation-menu', NavigationMenu);