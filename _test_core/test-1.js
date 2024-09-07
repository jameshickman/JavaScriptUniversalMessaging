class HydrationAwareComponent extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ccc;
            border-radius: 4px;
          }
        </style>
        <slot></slot>
      `;
      
      // Initialize in an unhydrated state
      this._hydrated = false;
    }
  
    connectedCallback() {
      console.log(`${this.id || 'Anonymous component'} connected to the DOM`);
    }
  
    _start() {
      if (this._hydrated) {
        console.log(`${this.id || 'Anonymous component'} is already hydrated`);
        return;
      }
  
      console.log(`Hydrating ${this.id || 'Anonymous component'}`);
      
      // Simulate some hydration logic
      this._hydrated = true;
      this.style.backgroundColor = '#e6f7ff';
      
      // Log the hydration event
      console.log(`${this.id || 'Anonymous component'} has been hydrated`);
    }
  
    // Method that can be called by multicall
    testMethod(param) {
      console.log(`Test method called on ${this.id || 'Anonymous component'} with param: ${param}`);
      return `${this.id || 'Anonymous component'}: ${param}`;
    }
  }
  
  // Register the custom element
  customElements.define('hydration-aware-component', HydrationAwareComponent);

  export {HydrationAwareComponent};