/// <reference types="node" />
/**
* http2Server.js
* Copyright(c) 2018 Aaron Hedges <aaron@dashron.com>
* MIT Licensed
 */
import http2, { Http2Server, ServerHttp2Stream } from "http2";
import { Road, Response } from 'roads';
/**
 * [exports description]
 * @type {[type]}
 */
export default class Server {
    /**
     * This is the node.js http2 server from the http2 library.
     * @todo  support HTTPS
     * @type HTTPServer
     */
    protected server: Http2Server;
    /**
     * This is the road object that will handle all requests
     * @type {Road}
     */
    protected road: Road;
    /**
     * Constructs a new Server object that helps create Roads servers.
     *
     * @param {Road} road The Road that handles all the routes
     */
    constructor(road: Road);
    /**
     * Helper function to write a roads Response object to an HTTPResponse object
     *
     * @param {ServerHttp2Stream} stream
     * @param {Response} response
     */
    protected sendResponse(stream: ServerHttp2Stream, response: Response): void;
    /**
     * Standard logic for turning each request into a road request, and communicating the response
     * back to the client
     *
     * @param {ServerHttp2Stream} stream
     * @param {object} headers
     */
    protected onStream(stream: ServerHttp2Stream, headers: {
        [x: string]: any;
    }): void;
    /**
     * Start the http server. Accepts the same parameters as HttpServer.listen
     *
     * @param {number} port
     * @param {string} hostname
     */
    listen(port: number, hostname: string): http2.Http2Server;
}
