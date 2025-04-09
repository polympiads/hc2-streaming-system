
import express from 'express';
import http from 'http';
import { DefaultEventsMap, Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

import { ClientToServerEvents as AClientToServerEvents, ServerToClientEvents as AServerToClientEvents } from './net/interface';
import { Client } from 'socket.io/dist/client';

interface ClientToServerEvents {
	/// The admin request a specific camera. Should be sent directly
	/// To the camera.
	cameraOffer: (data: RTCSessionDescription) => void,
	/// The camera respond
	cameraResponse: (data: RTCSessionDescription) => void,
	/// The camera send an ice Candidate to the client. Should be sent directly to
	/// the client.
	iceCandidate: (data: RTCIceCandidate) => void,

	authCallback: (data: AuthCallback) => void,
}
interface ServerToClientEvents {
	auth: (data: Auth) => void;

	/// The admin request a specific camera
	cameraOffer: (data: RTCSessionDescription) => void,

	/// Send the ICE candidate to the linked Camera / Client
	iceCandidate: (data: RTCIceCandidate) => void
}

interface SocketData {
	/// The id of the session
	auth_id: string
}

type Auth = {
	id: string
}

type AuthCallback = {
	id: string,
	type: AuthCallbackType
}

enum AuthCallbackType {
	Camera,
	Admin
}

type AdminAuthChallenge = {
	id: string
}

type AdminAuthChallengeClientResponse = {
	id: string,
	username: string,
	password: string
}

type AdminAuthChallengeServerResponse = {
	
}

type CLV = ClientToServerEvents & AClientToServerEvents;
type CLS = ServerToClientEvents & AServerToClientEvents;

const app = express();

const server = http.createServer(app);
const io     = new Server<CLV, CLS, DefaultEventsMap, SocketData>(server);

app.use(express.static('public'))

const socket_ids = new Set();
io.on('connection', socket => {
    console.log('New client connected:', socket.id);

		// get a new data
		let auth_id = null;
		do {
			auth_id = uuidv4();
		} while(socket_ids.has(auth_id));
		socket_ids.add(auth_id);
		socket.data.auth_id = auth_id;

		socket.emit("auth", { id: auth_id });
		socket.on("authCallback", auth_callback => {
			if (!socket_ids.has(auth_callback.id)) {
				socket.disconnect();
			}

			switch (auth_callback.type) {
				case AuthCallbackType.Admin: {

				};
				case AuthCallbackType.Camera: {
					
				};
			}
		});

		// remove the auth id when the socket disconnects
		socket.on("disconnect", _ => {
			socket_ids.delete(socket.data.auth_id)
		});

		// The admin request a specific camera
    socket.on('cameraOffer', data => {
			
		});

		// The camera respond
		socket.on('cameraResponse', data => {

		})

		// 
		socket.on('iceCandidate', data => {

		});
});
  
server.listen(3000, () => {
    console.log('Signaling server running on http://localhost:3000');
});
