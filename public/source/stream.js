
class RTCStream {
    bindSocket (socket) {

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
