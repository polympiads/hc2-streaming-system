
const rtc_config  = {};
const constraints = { audio: false, video: true };

class RTCController {
    constructor (doc_id, channel, resolution) {
        this.video = document.querySelector(`#${doc_id}`);

        this.channel = channel;
        this.resolution = resolution;

        SOCKET.on("rtcAnswer", answer => {
            console.log("ANSWER", answer, channel)
            if (answer.channel == this.channel) {
                this.peer.setRemoteDescription(new RTCSessionDescription(
                    answer.answer));
            }
        })
        SOCKET.on("rtcIceCandidate", candidate => {
            console.log("CANDIDATE", candidate, channel)
            if (candidate.channel == channel) {
                this.peer.addIceCandidate(
                    new RTCIceCandidate(
                        candidate.packet
                    )
                )
            }
        })
    }

    async enable () {
        if (this.peer) {
            this.peer.close();
            this.video.srcObject = undefined;
        }

        this.peer = new RTCPeerConnection(rtc_config);

        this.peer.onicecandidate = e => {
            if (e.candidate) {
              SOCKET.emit('rtcIceCandidate', { "channel": this.channel, "packet": e.candidate });
            }
        };

        const media = await navigator.mediaDevices.getUserMedia(constraints)
        console.log(media)
        console.log(media.getTracks())
        for (let track of media.getTracks())
            this.peer.addTrack(track, media)

        this.video.srcObject = media

        const offer = await this.peer.createOffer();

        this.peer.setLocalDescription(offer);
        SOCKET.emit('rtcOffer', { channel: this.channel, offer: offer });
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

        this.low_controller  = new RTCController("CAM_low", this.low_feed, undefined);
        this.high_controller = new RTCController("CAM_high", this.high_feed, undefined);

        SOCKET.emit("exposeChannel", { camera: feed  });
        SOCKET.on("enableCamera", payload => this.enableCamera(payload.channel))
    }

    enableCamera (channel) {
        if (channel == this.low_feed)  this.low_controller .enable();
        if (channel == this.high_feed) this.high_controller.enable();
    }
};

const CAMERA_MANAGER = new CameraManager();
