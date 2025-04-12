const RTC_VIEWER_CONF = {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302'
      }
    ]
};

class RTCViewer {
    constructor (doc_id, channel) {
        this.video = document.querySelector(`#${doc_id}`);

        SOCKET.on("rtcOffer", async offer => {
            if (offer.channel != channel) return ;
            console.log("RECEIVED", offer)
            await this.video.pause();
            this.video.srcObject = null;
            if (this.peer)
                this.peer.close();
            this.peer = new RTCPeerConnection(RTC_VIEWER_CONF);
            this.peer.ontrack = async event => {
                this.video.srcObject = event.streams[0];
                await this.video.play();
            };
            this.peer.onicecandidate = e => {
                if (e.candidate) {
                  SOCKET.emit('rtcIceCandidate', { "channel": channel, "packet": e.candidate });
                }
            };

            await this.peer.setRemoteDescription(new RTCSessionDescription(offer.offer));
            
            const answer = await this.peer.createAnswer();
            
            this.peer.setLocalDescription(answer);
            console.log("SEND ANSWER")
            SOCKET.emit("rtcAnswer", { "channel": channel, "answer": answer });
        })
        SOCKET.on("rtcIceCandidate", candidate => {
            console.log("CANDIDATE", candidate, channel)
            if (candidate.channel == this.channel) {
                this.peer.addIceCandidate(
                    new RTCIceCandidate(
                        candidate.packet
                    )
                )
            }
        })
    }
};