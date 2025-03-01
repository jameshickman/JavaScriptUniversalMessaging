/**
 * NavigationView component that provides a container for multiple switchable views
 * Supports persistence via URL hash
 */
export declare class NavigationView extends HTMLElement {
    #private;
    constructor();
    connectedCallback(): void;
    /**
     * Public method to switch views with optional persistence
     */
    goto_view(view_to_show: string): Promise<void>;
}
