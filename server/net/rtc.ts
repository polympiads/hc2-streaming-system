import { Socket } from "socket.io";
import { RTCClientToServerEvents, RTCServerToClientEvents } from "./packets/rtc";

export function add_rtc_handlers (socket: Socket<RTCClientToServerEvents, RTCServerToClientEvents>) {
    socket.on("rtcOffer", offer => {
        socket.broadcast.emit("rtcOffer", offer);
    })

    socket.on("rtcAnswer", offer => {
        socket.broadcast.emit("rtcAnswer", offer);
    })

    socket.on("rtcIceCandidate", offer => {
        socket.broadcast.emit("rtcIceCandidate", offer);
    })
    
    socket.on("enableCamera", offer => {
        socket.emit("enableCamera", offer);
        socket.broadcast.emit("enableCamera", offer);
    })
}
