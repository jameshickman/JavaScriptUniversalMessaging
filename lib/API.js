/*
 * Generic REST API call interface with Mocking support
 */

const HTTP_GET = 'get';
const HTTP_POST_FORM = 'post_form';
const HTTP_POST_JSON = 'post_json';
const HTTP_PUT = 'put';
const HTTP_DELETE = 'delete';

class API_REST {
    #host_url = '';
    #operations = {};
    #mocks = {};
    constructor(host_url) {
        if (host_url === undefined) {
            this.#host_url = '/';
        }
        else {
            this.#host_url = host_url;
        }
    }

    /**
     * Define an end-point by it's path and HTTP verb type
     * 
     * @param {*} signature 
     * @param {*} callback 
     * @param {*} http_verb 
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
    }

    call(signature, http_verb, data, path_vars) {
        const key = http_verb + '|' + signature;
        if (path_vars !== undefined) {
            signature = this.#apply_path_values(signature, path_vars);
        }
        if (this.#operations.hasOwnProperty(key)) {
            switch(http_verb) {
                case HTTP_POST_FORM:
                    break;
                case HTTP_POST_JSON:
                    break;
                case HTTP_DELETE:
                    break;
                case HTTP_PUT:
                    break;
                default:
                    // HTTP_GET
            }
            return true;
        }
        return false;
    }

    #apply_path_values(path, data) {
        for (const n in data) {
            const token = "{{" + n + "}}";
            path = path.replace(token, data[n]);
        }
        return path;
    }
}