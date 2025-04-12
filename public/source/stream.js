
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

        socket.on("swapBuffers", payload => {
            const zI1 = payload.front == 0 ? 0 : 1;
            const zI0 = 1 - zI1;

            document.querySelector("#CAM_buffer_0").style.zIndex = `${zI0}`;
            document.querySelector("#CAM_buffer_1").style.zIndex = `${zI1}`;
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
