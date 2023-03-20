import { RTCConfig } from "../configs/configs";
import { dl } from "../utils/DateLog";
import WebSocketService from "./WebSocketService";

class WebRTCService {
  constructor(roomId) {
    this.pc = new RTCPeerConnection(RTCConfig);
    this.signalingChannel = new WebSocketService(roomId);
    this.signalingChannel.setMessageHandler(
      this.signalingChannelDataHandler.bind(this)
    );
    this.candidates = [];
    this.candidatesToSend = [];
    this.roomId = roomId;
    this.connectionId = null;
    this.peerConnectionId = null;
    this.polite = null;
    this.setPCListeners();
    this.makingOffer = false;
    this.ignoreOffer = false;
    this.isSettingRemoteAnswerPending = false;
    this.mediaConnections = {};
  }

  async signalingChannelDataHandler(data) {
    dl("data inside signal handler", data);
    this.setSessionInfo(data);
    if (data.payload) {
      await this.processPayload(data.payload);
    }
  }

  setSessionInfo({ source, destination, polite, payload }) {
    if (source === null) {
      this.mediaConnections = {};
    }

    this.connectionId = destination; // flip source and destination
    this.peerConnectionId = source;
    this.polite = !polite;

    if (!payload) {
      if (!this.polite) {
        dl("inside first message and not polite");
        this.sendToServer(null);
      } else {
        dl("inside firstMessage and polite");
        const event = new Event("negotiationneeded");
        this.pc.dispatchEvent(event);
      }
    }

    if (this.peerConnectionId && this.candidatesToSend.length) {
      this.processCandidatesToSend();
    }
  }

  async processPayload(payload) {
    try {
      if (payload.sdp) {
        // PERFECT NEGOTIATION
        const readyForOffer =
          !this.makingOffer &&
          (this.pc.signalingState == "stable" ||
            this.isSettingRemoteAnswerPending);
        dl("Ready for Offer", readyForOffer);

        const offerCollision = payload.type == "offer" && !readyForOffer;
        dl("offer collision", offerCollision);

        this.ignoreOffer = this.polite && offerCollision;
        dl("ignore Offer", this.ignoreOffer);
        if (this.ignoreOffer) return;

        this.isSettingRemoteAnswerPending = payload.type == "answer";
        await this.pc.setRemoteDescription(payload);
        this.isSettingRemoteAnswerPending = false;
        dl("Remote description set!");

        if (payload.type === "offer") {
          dl("offer received");
          await this.pc.setLocalDescription();
          this.sendToServer(this.pc.localDescription);
        }
        await this.processCandidates();
      } else {
        try {
          await this.addCandidate(payload);
        } catch (e) {
          if (!this.ignoreOffer) throw e;
        }
      }
    } catch (e) {
      this.handleError(e);
    }
  }

  setPCListeners() {
    this.pc.ontrack = this.handleOnTrack.bind(this);
    this.pc.onicecandidate = this.handleIceCandidate.bind(this);
    this.pc.oniceconnectionstatechange =
      this.handleIceConnectionStateChange.bind(this);
    this.pc.onnegotiationneeded = this.handleNegotiationNeeded.bind(this);
    this.pc.onconnectionstatechange =
      this.handleConnectionStateChange.bind(this);
  }

  setLocalStreams(local) {
    if (!local) return;
    this.localStream = local;
  }

  setRemoteStream(remote) {
    this.remoteStream = remote;
  }

  setRemoteScreen(remote) {
    this.remoteScreen = remote;
  }

  setLocalScreen(local) {
    this.localScreen = local;
  }

  handleIceCandidate(event) {
    if (event.candidate) this.candidatesToSend.push(event.candidate);
  }

  processCandidatesToSend() {
    dl("now processing Candidates to send", this.candidatesToSend.length);
    for (let candidate of this.candidatesToSend) {
      this.sendToServer(candidate);
    }
    this.candidatesToSend = [];
  }

  sendToServer(payload) {
    if (this.signalingChannel.websocket.readyState === 1) {
      this.signalingChannel.sendMessage({
        source: this.connectionId,
        destination: this.peerConnectionId,
        roomId: this.roomId,
        polite: this.polite,
        payload: payload,
      });
    } else {
      let that = this;
      dl("web socket not ready yet...", this);
      setTimeout(() => {
        that.sendToServer(payload);
      }, 500);
    }
  }

  handleIceConnectionStateChange() {
    if (this.pc.iceConnectionState === "failed") {
      this.pc.restartIce();
    }
  }

  handleConnectionStateChange() {
    switch (this.pc.connectionState) {
      case "connected":
        dl("we are connected");
        break;
      case "disconnected":
        this.mediaConnections = {};
        dl("we are disconnected");
      // this.pc.close();
      // dl("we have closed the connection");
    }
  }

  async handleNegotiationNeeded() {
    dl("negotiation needed 2");
    if (this.polite === null) {
      dl("this.polite not set yet, negotiation not needed yet");
      return;
    }
    try {
      this.makingOffer = true;
      await this.pc.setLocalDescription();
      this.sendToServer(this.pc.localDescription);
    } catch (e) {
      this.handleError(e);
    } finally {
      this.makingOffer = false;
    }
  }

  async processCandidates() {
    dl("Processing early candidates now");
    for (let candidate of this.candidates) {
      await this.addCandidate(candidate);
    }
    this.candidates = [];
  }

  async addCandidate(candidate) {
    if (this.pc.remoteDescription == null) {
      dl("Remote description still null, adding to candidates list");
      return this.candidates.push(candidate);
    }
    if (candidate) {
      try {
        await this.pc.addIceCandidate(candidate);
      } catch (e) {
        this.handleError(e);
      }
    }
  }

  setupLocalMedia() {
    this.localStream
      .getTracks()
      .forEach((track) => this.pc.addTrack(track, this.localStream));
  }

  setupLocalScreen() {
    this.localScreen
      .getTracks()
      .forEach((track) => this.pc.addTrack(track, this.localScreen));
  }

  handleOnTrack(event) {
    dl("Adding remote track", event);
    // add connection mapping
    let keys = Object.keys(this.mediaConnections);
    let id = event.streams[0].id;
    if (keys.length === 0) {
      this.mediaConnections[id] = this.remoteStream;
    } else if (keys.length > 0 && !keys.includes(id)) {
      this.mediaConnections[id] = this.remoteScreen;
    }
    event.streams[0].getTracks().forEach((track) => {
      this.mediaConnections[id].addTrack(track);
    });
  }

  handleError(error) {
    console.error(`Failure when doing: ${error.name} ${error}`);
  }
}

export default WebRTCService;
