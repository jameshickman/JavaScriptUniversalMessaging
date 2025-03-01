/*
 * Generic REST API call interface with deduplication and multiple call-back support.
 * (c) 2024 James Hickman <jamesATjameshickmanDOTnet>
 * MIT License
 */
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
var _API_REST_instances, _API_REST_host_url, _API_REST_operations, _API_REST_in_flight, _API_REST_error_handler, _API_REST_apply_path_values, _API_REST_call_if_not_in_flight, _API_REST_build_request, _API_REST_purge;
export const HTTP_GET = 'get';
export const HTTP_POST_FORM = 'post_form';
export const HTTP_POST_JSON = 'post_json';
export const HTTP_PUT = 'put';
export const HTTP_DELETE = 'delete';
/**
 * Hash function for request deduplication
 */
const cyrb53 = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};
export class API_REST {
    /**
     * @param host_url - Base URL, if not provided defaults to '/'
     * @param cb_error - Call-back function on an error condition, if not provided error written to console.log()
     */
    constructor(host_url, cb_error) {
        _API_REST_instances.add(this);
        _API_REST_host_url.set(this, '');
        _API_REST_operations.set(this, {});
        _API_REST_in_flight.set(this, {});
        _API_REST_error_handler.set(this, void 0);
        if (host_url === undefined) {
            __classPrivateFieldSet(this, _API_REST_host_url, '/', "f");
        }
        else {
            __classPrivateFieldSet(this, _API_REST_host_url, host_url, "f");
        }
        __classPrivateFieldSet(this, _API_REST_error_handler, cb_error || ((err) => {
            console.log(err);
        }), "f");
    }
    /**
     * Define an end-point by it's path and HTTP verb type
     *
     * @param signature - URL route signature, including {{callouts}}.
     * @param callback - Function to call back with value from server
     * @param http_verb - Use constants for the request verb.
     * @returns This instance for method chaining
     */
    define_endpoint(signature, callback, http_verb) {
        if (http_verb === undefined)
            http_verb = HTTP_GET;
        const key = http_verb + '|' + signature;
        if (!__classPrivateFieldGet(this, _API_REST_operations, "f").hasOwnProperty(key)) {
            __classPrivateFieldGet(this, _API_REST_operations, "f")[key] = [callback];
        }
        else {
            __classPrivateFieldGet(this, _API_REST_operations, "f")[key].push(callback);
        }
        return this;
    }
    /**
     * Do a call to a defined endpoint. If an identical request in process, abort the duplicate.
     * If the end point has not been defined throw an exception.
     *
     * @param signature - URL route signature, including {{callouts}}.
     * @param http_verb - Use constants for the request verb.
     * @param data - Payload data.
     * @param headers - Headers, key:value.
     * @param path_vars - Values to inject into route.
     * @returns If initiating a network transaction, true. Else if an identical request in in progress, false.
     */
    call(signature, http_verb = HTTP_GET, data, headers, path_vars) {
        const signature_key = http_verb + '|' + signature;
        let url = signature;
        headers = headers || {};
        if (path_vars !== undefined) {
            url = __classPrivateFieldGet(this, _API_REST_instances, "m", _API_REST_apply_path_values).call(this, signature, path_vars);
        }
        url = __classPrivateFieldGet(this, _API_REST_host_url, "f") + url;
        if (__classPrivateFieldGet(this, _API_REST_operations, "f").hasOwnProperty(signature_key)) {
            switch (http_verb) {
                case HTTP_POST_FORM:
                    return __classPrivateFieldGet(this, _API_REST_instances, "m", _API_REST_call_if_not_in_flight).call(this, signature_key, url, "POST", data || null, headers, true);
                case HTTP_POST_JSON:
                    return __classPrivateFieldGet(this, _API_REST_instances, "m", _API_REST_call_if_not_in_flight).call(this, signature_key, url, "POST", data || null, headers, false);
                case HTTP_DELETE:
                    return __classPrivateFieldGet(this, _API_REST_instances, "m", _API_REST_call_if_not_in_flight).call(this, signature_key, url, "DELETE", null, headers);
                case HTTP_PUT:
                    return __classPrivateFieldGet(this, _API_REST_instances, "m", _API_REST_call_if_not_in_flight).call(this, signature_key, url, "PUT", null, headers);
                default:
                    // HTTP_GET
                    return __classPrivateFieldGet(this, _API_REST_instances, "m", _API_REST_call_if_not_in_flight).call(this, signature_key, url, "GET", null, headers);
            }
        }
        throw new Error(signature_key + " has not been defined.");
    }
}
_API_REST_host_url = new WeakMap(), _API_REST_operations = new WeakMap(), _API_REST_in_flight = new WeakMap(), _API_REST_error_handler = new WeakMap(), _API_REST_instances = new WeakSet(), _API_REST_apply_path_values = function _API_REST_apply_path_values(path, data) {
    for (const n in data) {
        const token = "{{" + n + "}}";
        path = path.replace(token, data[n]);
    }
    return path;
}, _API_REST_call_if_not_in_flight = function _API_REST_call_if_not_in_flight(signature, url, verb, data, headers, is_form = false) {
    const fetch_wrapper = (callbacks_key) => {
        let resolved = false;
        return {
            resolved: () => {
                return resolved;
            },
            launch: () => {
                fetch(__classPrivateFieldGet(this, _API_REST_instances, "m", _API_REST_build_request).call(this, url, verb, data, headers, is_form))
                    .then(async (response) => {
                    resolved = true;
                    if (!response.ok) {
                        // Error!
                        __classPrivateFieldGet(this, _API_REST_error_handler, "f").call(this, response);
                    }
                    else {
                        const payload = await response.json();
                        for (const cb of __classPrivateFieldGet(this, _API_REST_operations, "f")[callbacks_key]) {
                            cb(payload);
                        }
                    }
                    __classPrivateFieldGet(this, _API_REST_instances, "m", _API_REST_purge).call(this);
                })
                    .catch((err) => {
                    resolved = true;
                    __classPrivateFieldGet(this, _API_REST_instances, "m", _API_REST_purge).call(this);
                    __classPrivateFieldGet(this, _API_REST_error_handler, "f").call(this, err);
                });
            }
        };
    };
    const key = cyrb53(url + verb + JSON.stringify(data) + JSON.stringify(headers)).toString();
    if (__classPrivateFieldGet(this, _API_REST_in_flight, "f").hasOwnProperty(key)) {
        if (__classPrivateFieldGet(this, _API_REST_in_flight, "f")[key].resolved()) {
            delete __classPrivateFieldGet(this, _API_REST_in_flight, "f")[key];
        }
        else {
            return false;
        }
    }
    __classPrivateFieldGet(this, _API_REST_in_flight, "f")[key] = fetch_wrapper(signature);
    __classPrivateFieldGet(this, _API_REST_in_flight, "f")[key].launch();
    return true;
}, _API_REST_build_request = function _API_REST_build_request(url, verb, data, headers, is_form = false) {
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
            const fd = new FormData();
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
}, _API_REST_purge = function _API_REST_purge() {
    for (const key in __classPrivateFieldGet(this, _API_REST_in_flight, "f")) {
        if (__classPrivateFieldGet(this, _API_REST_in_flight, "f")[key].resolved()) {
            delete __classPrivateFieldGet(this, _API_REST_in_flight, "f")[key];
        }
    }
};
