export declare const HTTP_GET = "get";
export declare const HTTP_POST_FORM = "post_form";
export declare const HTTP_POST_JSON = "post_json";
export declare const HTTP_PUT = "put";
export declare const HTTP_DELETE = "delete";
type HttpVerb = typeof HTTP_GET | typeof HTTP_POST_FORM | typeof HTTP_POST_JSON | typeof HTTP_PUT | typeof HTTP_DELETE;
type Callback = (data: any) => void;
type ErrorHandler = (error: any) => void;
type PathVars = Record<string, string>;
type RequestData = Record<string, any>;
type HeadersData = Record<string, string>;
export declare class API_REST {
    #private;
    /**
     * @param host_url - Base URL, if not provided defaults to '/'
     * @param cb_error - Call-back function on an error condition, if not provided error written to console.log()
     */
    constructor(host_url?: string, cb_error?: ErrorHandler);
    /**
     * Define an end-point by it's path and HTTP verb type
     *
     * @param signature - URL route signature, including {{callouts}}.
     * @param callback - Function to call back with value from server
     * @param http_verb - Use constants for the request verb.
     * @returns This instance for method chaining
     */
    define_endpoint(signature: string, callback: Callback, http_verb?: HttpVerb): this;
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
    call(signature: string, http_verb?: HttpVerb, data?: RequestData, headers?: HeadersData, path_vars?: PathVars): boolean;
}
export {};
