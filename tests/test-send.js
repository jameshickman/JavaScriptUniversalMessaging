import {multicall} from '../lib/jsum.js';

class EventSenderComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.innerHTML = `
        <style></style>
        <div id='event-sender'>
            <button data-selector="#top-component" data-value="1">Send to First</button>
            <button data-selector="#middle-component" data-value="2">Send to Second</button>
            <button data-selector="#bottom-component" data-value="3">Send to Third</button>
            <button data-selector=".test-set" data-value="321">Send to Second and Third</button>
        </div>
        `;
    }

    connectedCallback() {
        Array.from(this.shadowRoot.querySelectorAll("BUTTON")).map((el) => {
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
}

customElements.define("event-send-test", EventSenderComponent);

export {EventSenderComponent};