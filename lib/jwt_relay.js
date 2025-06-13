import { API_REST } from "./API";

/**
 * Return a handler to recreate the Bearer token from the local system and update the API
 * Model.
 * 
 * @param {string} 
 * @param {string} 
 * 
 * @returns {CallableFunction} Handler to start the Bearer token recreation process
 */
function bearer_handler(local_domain, local_system_end_point) {
    const api = new API_REST(local_domain);
    api.define_endpoint(local_system_end_point, (response) => {
        if (response.ok) {
            api.set_bearer_token(response.body);
            api.recall();
        }
    });

    /**
     * Curry the state for acessing the local system
     * and return a function to register with the API
     */
    return () => {
        api.call(local_system_end_point);
    };
}