/**
* httpServer.ts
* Copyright(c) 2021 Aaron Hedges <aaron@dashron.com>
* MIT Licensed
 */
/// <reference types="node" />
import { Road, Response } from 'roads';
import { Server as HttpServer, ServerResponse, IncomingMessage } from 'http';
import { Server as HttpsServer, ServerOptions as HttpsServerOptions } from 'https';
interface RoadsServerOptions {
    https?: {
        enabled: boolean;
        options: HttpsServerOptions;
    };
    maxRequestBodySize?: number;
}
/**
 * [exports description]
 * @type {[type]}
 */
export default class Server {
    /**
     * This is the node.js http server from the http library.
     * @todo  support HTTPS
     * @type HTTPServer
     */
    protected server: HttpServer | HttpsServer;
    /**
     * This is the road object that will handle all requests
     * @type Road
     */
    protected road: Road;
    /**
     * If set, this holds the custom error handler defined by the user in the constructor
     *
     * @type null|function
     */
    protected custom_error_handler?: Function;
    /**
     * The maximum sizze we should allow for any incoming request body. We will stop reading incoming data at this point.
     */
    protected maxRequestBodySize: number;
    /**
     * Constructs a new Server object that helps create Roads servers.
     *
     * @todo  tests
     * @param {Roads} road The Road that handles all the routes
     * @param {Function} error_handler An overwrite to the standard error handler. Accepts a single parameter (the error) and should return a Roads.Response object.
     * @param {Object} httpsOptions HTTPS servers require additional data. You can pass all of those parameters here. Valid values can be found in the node docs: https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener
     */
    constructor(road: Road, error_handler?: Function, options?: RoadsServerOptions);
    /**
     * Standard logic to handle any errors thrown in the roads request.
     * If a custom error handler was provided in the constructor, it will use that. Otherwise
     * it will fall back to the roads default logic.
     *
     * The roads default logic is
     *  - If the error is a roads.HttpError, display the error message and status code exactly as thrown.
     *  - If the error is anything else, display a 500 error with the message "Server Error: ".
     *
     * @param  HTTPResponse http_response
     * @param  Error error
     */
    protected error_handler(http_response: ServerResponse, error: Error): void;
    /**
     * Helper function to write a roads Response object to an HTTPResponse object
     *
     * @param  HTTPResponse http_response
     * @param  Response response
     */
    protected sendResponse(http_response: ServerResponse, response: Response): void;
    /**
     * Standard logic for turning each request into a road request, and communicating the response
     * back to the client
     *
     * @param  HTTPRequest http_request
     * @param  HTTPResponse http_response

     */
    protected onRequest(http_request: IncomingMessage, http_response: ServerResponse): void;
    /**
     * Start the http server.
     *
     * @param int port
     * @param string host
     */
    listen(port: number, host: string, callback?: (error?: Error) => void): void;
}
export {};
