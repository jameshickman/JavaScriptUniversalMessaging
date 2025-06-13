/**
 * Return a handler to recreate the Bearer token from the local system and update the API
 * Model.
 * 
 * @param {API_REST} Instance of teh API model
 * @param {string} The full end-point on the local system to create a valid JWT for the Bearer,
 * must include the domain as it is not the same as the remote domain the instance of the
 * API Model is accesing.
 * 
 * @returns {CallableFunction} Handler to start the Bearer token recreation process
 */
function bearer_handler(api, local_system_url) {
    api.define_endpoint(local_system_url, (response) => {
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
        api.call(local_system_url);
    };
}