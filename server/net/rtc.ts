import { Socket } from "socket.io";
import { RTCClientToServerEvents, RTCServerToClientEvents } from "./packets/rtc";

class RTCManager {
    feeds: Set<string> = new Set();

    addFeed (feed: string) {
        this.feeds.add(feed);
    }
    getFeeds () {
        return this.feeds;
    }
};

const RTC_MANAGER = new RTCManager();

export function get_rtc_feeds () {
    return RTC_MANAGER.getFeeds();
}

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
    
    socket.on("exposeChannel", offer => {
        RTC_MANAGER.addFeed(offer.camera);

        socket.broadcast.emit("exposeChannel", offer);
    })

    for (let feed of get_rtc_feeds())
        socket.emit("exposeChannel", { "camera": feed })
}
