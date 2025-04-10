import { Socket } from "socket.io";
import { Response, RTCClientToServerEvents, RTCServerToClientEvents } from "./packets/rtc";
import { validate_session_admin } from "./session";
import { get_user, UserType } from "./users";

export function add_camera_management_functions(socket: Socket<RTCClientToServerEvents, RTCServerToClientEvents>) {
    const ip = socket.handshake.address;
    
    socket.on("enableCamera", data => {
        if (!validate_session_admin(data.session_id, ip)) {
            socket.emit("onEnableCamera", Response.NotAuthorized);
            socket.disconnect();

            return;
        }

        const camera = get_user(data.camera);
        if (camera == undefined) {
            socket.emit("onEnableCamera", Response.BadCamera);
            socket.disconnect();

            return;
        }
        if (camera.get_type() != UserType.Camera) {
            socket.emit("onEnableCamera", Response.BadCamera);
            socket.disconnect();

            return;
        }

        // TODO : RTC
    })
    socket.on("exposeChannel", data => {
        if (!validate_session_admin(data.session_id, ip)) {
            socket.emit("onEnableCamera", Response.NotAuthorized);
            socket.disconnect();
        }

        const camera = get_user(data.camera);
        if (camera == undefined) {
            socket.emit("onEnableCamera", Response.BadCamera);
            socket.disconnect();

            return;
        }
        if (camera.get_type() != UserType.Camera) {
            socket.emit("onEnableCamera", Response.BadCamera);
            socket.disconnect();

            return;
        }

        // TODO : RTC
    })
}