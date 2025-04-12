
function create_feed_div (channel) {
    const div = document.createElement("div")
    div.innerHTML = `<div>
        <div>Channel : <span id="ucont"></span></div>
        <video id="tvideo" width="320" height="180" autoplay muted>
        <button id="buffer0">EmitBuffer0</button>
        <button id="buffer1">EmitBuffer1</button>
    </div>`

    const ucont = div.querySelector("#ucont")
    ucont.innerText = channel;

    const video = div.querySelector("#tvideo")
    video.id = `tvideo-${channel}`;

    const bf0 = div.querySelector("#buffer0");
    const bf1 = div.querySelector("#buffer1");

    const cont = div.children.item(0);
    div.removeChild(cont)

    return [ cont, video.id, bf0, bf1 ];
}

class AdminManager {
    constructor () {
        this.channels = new Set();
        this.channel_properties = {};
    }
    createChannel (channel) {
        this.channels.add(channel);

        const [cont, video, bf0, bf1] = create_feed_div(channel);
        document.querySelector("#admin-list").appendChild(cont);

        const viewer = new RTCViewer(video, channel + "_low");
        this.channel_properties[channel] = [ viewer ];

        bf0.onclick = () => SOCKET.emit("enableCamera", { channel: channel + "_high", buffer: 1 })
        bf1.onclick = () => SOCKET.emit("enableCamera", { channel: channel + "_high", buffer: 2 })
    }
    exposeChannel (channel) {
        if (!this.channels.has(channel))
            this.createChannel(channel)
        console.log("EXPOSING CHANNEL", channel)
        SOCKET.emit("enableCamera", { "channel": `${channel}_low`, "buffer": 0 })
    }
};

const ADMIN_MANAGER = new AdminManager();

function adminBindSocket (socket) {
    socket.on("exposeChannel", channel => ADMIN_MANAGER.exposeChannel(channel.camera))
}
