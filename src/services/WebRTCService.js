import { RTCConfig } from "../configs/configs";
import { dl } from "../utils/DateLog";
import { setMediaBitrates } from "../utils/SetMediaBitrates";

class WebRTCService {
  constructor() {
    this.pc = new RTCPeerConnection(RTCConfig);
    this.pc.ontrack = this.handleOnTrack.bind(this);
    this.pc.onicecandidate = this.handleIceCandidate.bind(this);
    this.pc.oniceconnectionstatechange =
      this.handleIceConnectionStateChange.bind(this);
    this.candidates = [];
    this.screenShare = null;
  }

  joinOrCreateRoom(roomId) {
    if (!this.pc.currentRemoteDescription) {
      this.ws.sendMessage("joinOrCreate", roomId);
    } else {
      console.log("You are already connected to a peer");
    }
  }

  setWebSocket(ws) {
    this.ws = ws;
  }

  setStreams(local, remote) {
    this.localStream = local;
    this.remoteStream = remote;
  }

  async setRemoteDescription(rdp) {
    dl("start setting up remoteDescription...");
    await this.pc.setRemoteDescription(rdp);
    dl("remoteDescription set!");
  }

  async createAndSendAnswer() {
    dl("creating and sending answer...");
    try {
      let answer = await this.pc.createAnswer();
      answer.sdp = setMediaBitrates(answer.sdp);
      await this.pc.setLocalDescription(answer);
      this.sendAnswer(this.pc.localDescription);
    } catch (e) {
      this.handleError(e);
    }
    dl("Answer created and sent...");
  }

  async createAndSendOffer() {
    dl("creating and sending offer...");
    try {
      let offer = await this.pc.createOffer();
      offer.sdp = setMediaBitrates(offer.sdp);
      await this.pc.setLocalDescription(offer);
      this.sendOffer(this.pc.localDescription);
    } catch (e) {
      this.handleError(e);
    }
    dl("Offer created and sent...");
  }

  handleIceCandidate(event) {
    dl("ICE", event);
    this.sendIceCandidate(event.candidate);
  }

  handleIceConnectionStateChange() {
    if (this.pc.iceConnectionState === "failed") {
      this.pc.restartIce();
    }
  }

  async processCandidates() {
    for (let candidate of this.candidates) {
      console.log("Processing early candidates now");
      await this.addCandidate(candidate);
    }
    this.candidates = [];
  }

  async addCandidate(candidate) {
    if (this.pc.remoteDescription == null) {
      console.log("Remote description still null, adding to candidates list");
      return this.candidates.push(candidate);
    }
    if (candidate) {
      try {
        dl(candidate);
        await this.pc.addIceCandidate(candidate);
      } catch (e) {
        this.handleError(e);
      }
    }
  }

  sendAnswer(answer) {
    this.ws.sendMessage("answer", answer);
  }

  sendOffer(offer) {
    this.ws.sendMessage("offer", offer);
  }

  sendIceCandidate(candidate) {
    this.ws.sendMessage("candidate", candidate);
  }

  setupLocalMedia() {
    this.localStream
      .getTracks()
      .forEach((track) => this.pc.addTrack(track, this.localStream));
  }

  setupLocalScreen(feed) {
    this.screenShare = feed;
    this.screenShare.getTracks().forEach((track) => {
      console.log(track);
      this.pc.addTrack(track, this.screenShare);
    });
  }

  handleOnTrack(event) {
    console.log(event);
    dl(event);
    event.streams[0].getTracks().forEach((track) => {
      console.log(track);
      this.remoteStream.addTrack(track);
    });
  }

  handleError(error) {
    console.error(`Failure when doing: ${error.name} ${error}`);
  }
}

export default WebRTCService;
