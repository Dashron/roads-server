"use strict";
/**
* httpServer.js
* Copyright(c) 2018 Aaron Hedges <aaron@dashron.com>
* MIT Licensed
 */

import { Road, Response } from 'roads';
import *  as http from 'http';
import * as https from 'https';
import { Server as HttpServer, ServerResponse, IncomingMessage } from 'http';
import { Server as HttpsServer, ServerOptions as HttpsServerOptions } from 'https';

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
	protected server: HttpServer;

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
	 * Constructs a new Server object that helps create Roads servers.
	 *
	 * @todo  tests
	 * @param {Roads} road The Road that handles all the routes
	 * @param {Function} error_handler An overwrite to the standard error handler. Accepts a single parameter (the error) and should return a Roads.Response object.
	 * @param {Object} httpsOptions HTTPS servers require additional data. You can pass all of those parameters here. Valid values can be found in the node docs: https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener
	 */
	constructor(road: Road, error_handler?: Function, httpsOptions?: HttpsServerOptions) {
		this.road = road;

		if (error_handler) {	
			this.custom_error_handler = error_handler;
		}

		if (httpsOptions && httpsOptions.key && httpsOptions.cert) {
			this.server = https.createServer(httpsOptions, this.onRequest.bind(this));
		} else {
			this.server = http.createServer(this.onRequest.bind(this));
		}

		this.server.on('error', this.error_handler.bind(this, new Response('Unknown error', 500)));
	}

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
	protected error_handler (http_response: ServerResponse, error: Error) {
		if (this.custom_error_handler) {
			return this.sendResponse(http_response, this.custom_error_handler(error));
		}
		else {
			return this.sendResponse(http_response, new Response(JSON.stringify({"error" : "An unknown error has occured"}), 500));
		}
	}

	/**
	 * Helper function to write a roads Response object to an HTTPResponse object
	 * 
	 * @param  HTTPResponse http_response
	 * @param  Response response
	 */
	protected sendResponse (http_response: ServerResponse, response: Response) {
		// wrap up and write the response to the server
		if (typeof(response.headers['content-type']) !== "string" && typeof(response.body) === "object") {
			response.headers['content-type'] = 'application/json';
		}

		http_response.writeHead(response.status, response.headers);
		
		if (response.body === null) {
			return;
		}	
		else if (typeof(response.body) === "object") {
			http_response.write(JSON.stringify(response.body));
		} else if (response.body !== undefined) {
			http_response.write(response.body);
		}

		http_response.end();
	}

	/**
	 * Standard logic for turning each request into a road request, and communicating the response
	 * back to the client
	 * 
	 * @param  HTTPRequest http_request
	 * @param  HTTPResponse http_response

	 */
	protected onRequest (http_request: IncomingMessage, http_response: ServerResponse) {
		let bodyFound = false;
		let body: string | undefined = '';
		let _self = this;

		let error_handler = _self.error_handler.bind(_self, http_response);
		let success_handler = _self.sendResponse.bind(_self, http_response);

		http_request.on('readable', () => {
			bodyFound = true;
	  		let chunk = null;
			while (null !== (chunk = http_request.read())) {
				body += chunk;
			}
		});

		if (!http_request.method) {
			return _self.sendResponse(http_response, new Response("Invalid HTTP Method", 405));
		}

		http_request.on('end', () => {
			// can we get an empty string body separate from "no body sent"? 
			// todo: find out. In the meanwhile, this will handle that case and use undefined
			// for no body ever sent
			// todo: unit test
			if (!bodyFound) {
				body = undefined;
			}

			// execute the api logic and retrieve the appropriate response object
			_self.road.request(http_request.method ? http_request.method : '', http_request.url  ? http_request.url : '', body, http_request.headers)
				.then(success_handler)
				.catch(error_handler)
				.catch((err: Error) => {
					console.log('An error has been encountered in the roads HTTP Server error handler');
					console.log(err.stack);
					// If the error handler throws errors, raise a 500
					_self.sendResponse(http_response, new Response(JSON.stringify({"error" : "An unknown error has occured"}), 500));
				})
				.catch((err: Error) => {
					console.log('A serious error has occurred in the roads HTTP Server error handler');
					console.log('We were unable to send a response to notify the end user');
					http_response.writeHead(500);
					http_response.end();
				});
		});

		// server request errors go to the unknown error representation
		http_request.on('error', error_handler);
	}

	/**
	 * Start the http server. Accepts the same parameters as HttpServer.listen
	 * 
	 * @param int port
	 * @param string hostname
	 */
	listen (port: number, hostname: string) {
		this.server.listen(port, hostname);
	}
};