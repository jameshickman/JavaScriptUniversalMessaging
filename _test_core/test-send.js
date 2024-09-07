import {multicall} from '../lib/jsum.js';

class EventSenderComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.innerHTML = `
        <style></style>
        <div id='event-sender'>
            <slot></slot>
        </div>
        `;
    }

    connectedCallback() {
        Array.from(this.querySelectorAll("BUTTON")).map((el) => {
            el.addEventListener('click', (e) => {
                const el_btn = e.currentTarget;
                const selector = el_btn.dataset.selector;
                const v = el_btn.dataset.value;
                console.log(multicall({
                    target: "testMethod",
                    query: selector,
                    params: [v]
                }));
            });
        });
    }

    global_config(config) {
        console.log(`${this.id || 'Anonymous component'} recieved global configuration object`);
        console.log(config);
    }
}

customElements.define("event-send-test", EventSenderComponent);

export {EventSenderComponent};