class RTCViewer {
    constructor (doc_id, channel) {
        this.video = document.querySelector(`#${doc_id}`);

        SOCKET.on("rtcOffer", async offer => {
            if (offer.channel != channel) return ;
            this.video.pause();
            this.video.srcObject = null;
            if (this.peer)
                this.peer.close();
            this.peer = new RTCPeerConnection({  });
            this.peer.ontrack = event => {
                this.video.srcObject = event.streams[0];
                this.video.play();
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