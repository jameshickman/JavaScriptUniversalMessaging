/*
 * Generic REST API call interface with deduplication and multiple call-back support.
 * (c) 2024 James Hickman <jamesATjameshickmanDOTnet>
 * MIT License
 */

const HTTP_GET = 'get';
const HTTP_POST_FORM = 'post_form';
const HTTP_POST_JSON = 'post_json';
const HTTP_PUT = 'put';
const HTTP_DELETE = 'delete';

const cyrb53 = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

class API_REST {
    #host_url = '';
    #operations = {};
    #in_flight = {};
    #error_handler = null;

    /**
     * 
     * @param {string} host_url              Base URL, if not provided defaults to '/'
     * @param {CallableFunction} cb_error    Call-back function on an error condition, if not provided error written to console.log()
     */
    constructor(host_url, cb_error) {
        if (host_url === undefined) {
            this.#host_url = '/';
        }
        else {
            this.#host_url = host_url;
        }
        if (cb_error === undefined) {
            this.#error_handler = (err) => {
                console.log(err);
            }
        }
        else {
            this.#error_handler = cb_error;
        }
    }

    /**
     * Define an end-point by it's path and HTTP verb type
     * 
     * @param {string} signature            URL route signature, including {{callouts}}.
     * @param {CallableFunction} callback   Function to call back with value from server
     * @param {string} http_verb            Use constants for the request verb.
     * @returns {this}
     */
    define_endpoint(signature, callback, http_verb) {
        if (http_verb === undefined) http_verb = HTTP_GET;
        const key = http_verb + '|' + signature;
        if (!this.#operations.hasOwnProperty(key)) {
            this.#operations[key] = [callback];
        }
        else {
            this.#operations[key].push(callback);
        }
        return this;
    }

    /**
     * Do a call to a defined endpoint. If an identical request in process, abort the duplicate.
     * If the end point has not been defined throw an exceptiopn.
     * 
     * @param {string} signature        URL route signature, including {{callouts}}.
     * @param {string} http_verb        Use constants for the request verb.
     * @param {object} data             Payload data.
     * @param {object} headers          Headers, key:value.
     * @param {object} path_vars        Values to inject into route.
     * @returns {boolean}               If initiating a network transaction, true.
     *                                  Else if an identical request in in progress, false.
     */
    call(signature, http_verb, data, headers, path_vars) {
        const signature_key = http_verb + '|' + signature;
        let url = signature;
        if (headers === undefined) {
            headers = {};
        }
        if (path_vars !== undefined) {
            url = this.#apply_path_values(signature, path_vars);
        }
        url = this.#host_url + url;
        if (this.#operations.hasOwnProperty(signature_key)) {
            switch(http_verb) {
                case HTTP_POST_FORM:
                    return this.#call_if_not_in_flight(signature_key, url, "POST", data, headers, true);
                case HTTP_POST_JSON:
                    return this.#call_if_not_in_flight(signature_key, url, "POST", data, headers, false);
                case HTTP_DELETE:
                    return this.#call_if_not_in_flight(signature_key, url, "DELETE", null, headers);
                case HTTP_PUT:
                    return this.#call_if_not_in_flight(signature_key, url, "PUT", null, headers);
                default:
                    // HTTP_GET
                    return this.#call_if_not_in_flight(signature_key, url, "GET", null, headers);
            }
        }
        throw new Error(signature_key + " has not been defined.");
    }

    #apply_path_values(path, data) {
        for (const n in data) {
            const token = "{{" + n + "}}";
            path = path.replace(token, data[n]);
        }
        return path;
    }

    #call_if_not_in_flight(signiture, url, verb, data, headers, is_form) {
        const fetch_wrapper = (callbacks_key) => {
            let resolved = false;
            return {
                resolved: () => {
                    return resolved;
                },
                launch: () => {
                    fetch(this.#buld_request(url, verb, data, headers, is_form))
                    .then(async (response) => {
                        resolved = true;
                        if (!response.ok) {
                            // Error!
                            this.#error_handler(response);
                        }
                        else {
                            const payload = await response.json();
                            for (const cb of this.#operations[callbacks_key]) {
                                cb(payload);
                            }
                        }passwords
                        this.#purge();
                    })
                    .catch((err) => {
                        resolved = true;
                        this.#purge();
                        this.#error_handler(err);
                    })
                }
            }
        }

        const key = cyrb53(url + verb + JSON.stringify(data) + JSON.stringify(headers));
        if (this.#in_flight.hasOwnProperty(key)) {
            if (this.#in_flight[key].resolved()) {
                delete this.#in_flight[key];
            }
            else {
                return false;
            }
        }
        this.#in_flight[key] = fetch_wrapper(signiture);
        this.#in_flight[key].launch();
        return true;
    }

    #buld_request(url, verb, data, headers, is_form) {
        if (!is_form && data) {
            headers['Content-Type'] = 'application/json';
        }
        const params = {
            method: verb
        };
        if (headers) {
            const h = new Headers();
            for (let k in headers) {
                h.set(k, headers[k]);
            }
            params['headers'] = h;
        }
        if (data) {
            if (is_form) {
                const fd = FormData();
                for (let k in data) {
                    fd.append(k, data[k]);
                }
                params['body'] = fd;
            }
            else {
                params['body'] = JSON.stringify(data);
            }
        }
        return new Request(url, params);
    }

    #purge() {
        //console.log(this.#in_flight);
        for (const key in this.#in_flight) {
            if (this.#in_flight[key].resolved()) {
                delete this.#in_flight[key];
            }
        }
        //console.log(this.#in_flight);
    }
}

export {API_REST, HTTP_GET, HTTP_POST_FORM, HTTP_POST_JSON, HTTP_DELETE, HTTP_PUT};