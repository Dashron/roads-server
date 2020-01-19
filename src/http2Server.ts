"use strict";

/**
* http2Server.js
* Copyright(c) 2018 Aaron Hedges <aaron@dashron.com>
* MIT Licensed
 */

import http2, { constants, Http2Server, ServerHttp2Stream } from "http2";
import { Road, Response } from 'roads';

const {
    HTTP2_HEADER_METHOD,
    HTTP2_HEADER_PATH,
    HTTP2_HEADER_STATUS
} = constants;

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
	constructor(road: Road) {
		this.road = road;

		// @todo: support HTTPS
        this.server = http2.createServer();
        this.server.on('stream', this.onStream.bind(this));
        this.server.on('error', (error) => {
            // todo: allow the implementor to provide this
            console.log('http2 server error', error);
        });
	}

	/**
	 * Helper function to write a roads Response object to an HTTPResponse object
	 * 
	 * @param {ServerHttp2Stream} stream
	 * @param {Response} response
	 */
	protected sendResponse (stream: ServerHttp2Stream, response: Response): void {
        let response_body;

		// wrap up and write the response to the server
		if (typeof(response.headers['content-type']) !== "string" && typeof(response.body) === "object") {
			response.headers['content-type'] = 'application/json';
		}

        response.headers[HTTP2_HEADER_STATUS] = response.status;
        stream.respond(response.headers);
		
		if (response.body === null) {
            response_body = undefined;
		}	
		else if (typeof(response.body) === "object") {
            response_body = JSON.stringify(response.body);
		} else if (response.body !== undefined) {
			response_body = response.body;
		}

		stream.end(response_body);
	}

	/**
	 * Standard logic for turning each request into a road request, and communicating the response
	 * back to the client
	 * 
	 * @param {ServerHttp2Stream} stream
	 * @param {object} headers
	 */
	protected onStream (stream: ServerHttp2Stream, headers: {[x: string]: any}): void {
        let body = '';
        let method = headers[HTTP2_HEADER_METHOD];
        let path = headers[HTTP2_HEADER_PATH];

		stream.on('readable', () => {
            let chunk = null;
			while (null !== (chunk = stream.read())) {
				body += chunk;
			}
		});

		stream.on('end', () => {
			// execute the api logic and retrieve the appropriate response object
			this.road.request(method, path, body, headers)
				.then((response: Response) => {
                    this.sendResponse(stream, response);
                }).catch((err: Error) => {
					console.log('We have encountered an unexpected error within the road assigned to this http2 server');
                    console.log(err.stack);
                    
                    stream.respond({
                        [HTTP2_HEADER_STATUS]: 500
                    });
                    stream.end(JSON.stringify({"error" : "An unknown error has occured"}));
				});
		});

		// server request errors go to the unknown error representation
		stream.on('error', (error: Error) => {
            // todo: allow the implementor to provide this
            console.log('http2 server error', error);
        });
	}

	/**
	 * Start the http server. Accepts the same parameters as HttpServer.listen
	 * 
	 * @param {number} port
	 * @param {string} hostname
	 */
	listen (port: number, hostname: string) {
		return this.server.listen(port, hostname);
	}
};