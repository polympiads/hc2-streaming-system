
class RTCController {
    constructor (channel, resolution) {
        this.channel = channel;
        this.resolution = resolution;
    }

    enable () {
        // TODO create RTC
    }
};

class CameraManager {
    constructor () {
        authWait().then(() => {
            console.log("Expose")
            this.expose();
        })
    }

    expose () {
        const username = getUsername();

        const feed = `CAM_${username}`;
        this.feed  = feed;

        this.low_feed  = `${feed}_low`;
        this.high_feed = `${feed}_high`;

        this.low_controller  = new RTCController(this.low_feed, undefined);
        this.high_controller = new RTCController(this.high_feed, undefined);

        SOCKET.emit("exposeCamera", { camera: feed  });
    }

    enableCamera (channel) {
        if (channel == this.low_feed)  this.low_controller .enable();
        if (channel == this.high_feed) this.high_controller.enable();
    }
};

const CAMERA_MANAGER = new CameraManager();
