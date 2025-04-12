
class RTCStream {
    constructor () {
        this.viewer0 = undefined;
        this.viewer1 = undefined;
    }
    bindSocket (socket) {
        socket.on("enableCamera", payload => {
            if (payload.buffer == 1) {
                if (this.viewer0 !== undefined)
                    this.viewer0.close();
                this.viewer0 = new RTCViewer( "CAM_buffer_0", payload.channel );
            }
            if (payload.buffer == 2) {
                if (this.viewer1 !== undefined)
                    this.viewer1.close();
                this.viewer1 = new RTCViewer( "CAM_buffer_1", payload.channel );
            }
        })
    }
};

const RTC_STREAM = new RTCStream();

function streamBindSocket (socket) {
    RTC_STREAM.bindSocket(socket);
}
function authenticateFromURL () {
    const urlParams = new URLSearchParams(window.location.search);

    const pass = urlParams.get('pass');
    const user = urlParams.get('user');

    authenticate(user, pass);
}
