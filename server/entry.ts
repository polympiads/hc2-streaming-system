
import express from 'express';
import http from 'http';
import { DefaultEventsMap, Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

import { ClientToServerEvents as AClientToServerEvents, ServerToClientEvents as AServerToClientEvents } from './net/interface';
import { Client } from 'socket.io/dist/client';
import { add_authentication_handlers } from './net/session';

interface ClientToServerEvents {
	/// The admin request a specific camera. Should be sent directly
	/// To the camera.
	cameraOffer: (data: RTCSessionDescription) => void,
	/// The camera respond
	cameraResponse: (data: RTCSessionDescription) => void,
	/// The camera send an ice Candidate to the client. Should be sent directly to
	/// the client.
	iceCandidate: (data: RTCIceCandidate) => void,
}
interface ServerToClientEvents {
	/// The admin request a specific camera
	cameraOffer: (data: RTCSessionDescription) => void,

	/// Send the ICE candidate to the linked Camera / Client
	iceCandidate: (data: RTCIceCandidate) => void
}

type CLV = ClientToServerEvents & AClientToServerEvents;
type CLS = ServerToClientEvents & AServerToClientEvents;

const app = express();

const server = http.createServer(app);
const io     = new Server<CLV, CLS>(server);

app.use(express.static('public'))

io.on('connection', socket => {
		add_authentication_handlers(socket);

		// remove the auth id when the socket disconnects
		socket.on("disconnect", _ => {
			
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
