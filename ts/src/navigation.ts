/**
 * NavigationView component that provides a container for multiple switchable views
 * Supports persistence via URL hash
 */
export class NavigationView extends HTMLElement {
    #views: Record<string, HTMLElement> = {};

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = `
            <div class='view_container'>
                <slot></slot>
            </div>
        `;
    }

    connectedCallback(): void {
        this.#views = {};
        let first_view: string | false = false;
        let default_view: string | false = false;
        
        for (let i = 0; i < this.children.length; i++) {
            const el_view = this.children[i] as HTMLElement;
            const view_name = el_view.dataset.name;
            
            if (!view_name) {
                throw new Error('A view must define a value for the data-name property');
            }
            
            if (first_view === false) first_view = view_name;
            if (el_view.dataset.hasOwnProperty('default')) default_view = view_name;
            
            if (this.#views.hasOwnProperty(view_name)) {
                throw new Error('A view must define a unique value for the data-name property');
            }
            
            this.#views[view_name] = el_view;
        }
        
        if ('persist' in window && this.id) {
            window.persist.register(this.id, (values) => {
                if ('view' in values) {
                    this.#goto_view(values['view']);
                }
                else {
                    if (default_view !== false) {
                        this.#goto_view(default_view);
                    }
                    else if (first_view !== false) {
                        this.#goto_view(first_view);
                    }
                }
            });
        }
        
        if (default_view !== false) {
            this.#goto_view(default_view);
        }
        else if (first_view !== false) {
            this.#goto_view(first_view);
        }
    }

    /**
     * Internal method to switch views without persistence
     */
    #goto_view(view_to_show: string): void {
        for (const view_name in this.#views) {
            if (view_name === view_to_show) {
                this.#views[view_name].style.display = 'block';
            }
            else {
                this.#views[view_name].style.display = 'none';
            }
        }
    }

    /**
     * Public method to switch views with optional persistence
     */
    async goto_view(view_to_show: string): Promise<void> {
        this.#goto_view(view_to_show);
        if ('persist' in window && this.id) {
            window.persist.set(this.id, {
                view: view_to_show
            });
        }
    }
}

customElements.define('navigation-views', NavigationView);