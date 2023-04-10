import { RTCConfig } from "../configs/configs";
import { dl } from "../utils/DateLog";
import DataChannel from "./DataChannelService";
import WebSocketService from "./WebSocketService";

class WebRTCService {
  constructor(roomId, queryToken) {
    this.pc = new RTCPeerConnection(RTCConfig);
    this.signalingChannel = new WebSocketService(roomId, queryToken);
    this.signalingChannel.setMessageHandler(
      this.signalingChannelDataHandler.bind(this)
    );
    this.dataChannel = new DataChannel(this.pc);
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
    this.mediaConnections = {}; // id: MediaStream
    this.isTurnReady = false;
    this.setPeerConnected = null;
    this.toaster = null;
  }

  setPeerConnectedHandler(func) {
    this.setPeerConnected = func;
  }

  setToaster(func) {
    this.toaster = func;
  }

  async signalingChannelDataHandler(data) {
    dl("data inside signal handler", data);
    this.setSessionInfo(data);
    dl("session info set");
    if (data.payload) {
      await this.processPayload(data.payload);
    }
  }

  setConfiguration(credentials) {
    const currentConfig = RTCConfig.iceServers[0];
    RTCConfig.iceServers = [
      {
        ...currentConfig,
        ...credentials,
      },
    ];
    this.pc.setConfiguration(RTCConfig);
    this.setIsTurnReady();
  }

  setIsTurnReady() {
    this.isTurnReady = true;
  }

  isRoleAssigned() {
    return this.polite !== null;
  }

  setSessionInfo({ source, destination, polite, payload }) {
    this.peerConnectionId = source;

    if (source === null) {
      // Disconnect?
      this.mediaConnections = {};
      this.polite = null;
      this.setPeerConnected(false);
      this.dataChannel.handlePeerLeave();
      this.toaster("Remote peer disconnected.", { icon: "🫥" });
      return;
    }

    this.connectionId = destination; // flip source and destination
    this.polite = !polite;
    dl(!payload, this.polite);
    if (!payload && this.polite === false) {
      dl("negotiationneeded");
      const event = new Event("negotiationneeded");
      this.pc.dispatchEvent(event);
      dl("dispatched the event");
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
        // dl("Ready for Offer", readyForOffer);

        const offerCollision = payload.type == "offer" && !readyForOffer;
        // dl("offer collision", offerCollision);

        this.ignoreOffer = this.polite && offerCollision;
        // dl("ignore Offer", this.ignoreOffer);
        if (this.ignoreOffer) return;

        this.isSettingRemoteAnswerPending = payload.type == "answer";
        await this.pc.setRemoteDescription(payload);
        this.isSettingRemoteAnswerPending = false;
        // dl("Remote description set!");

        if (payload.type === "offer") {
          // dl("offer received");
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
        // dl("we are connected");
        break;
      case "disconnected":
        this.mediaConnections = {};
      // dl("we are disconnected");
      // this.pc.close();
      // dl("we have closed the connection");
    }
  }

  async handleNegotiationNeeded() {
    if (!this.isRoleAssigned() || !this.isTurnReady) {
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
    // dl("Processing early candidates now");
    for (let candidate of this.candidates) {
      await this.addCandidate(candidate);
    }
    this.candidates = [];
  }

  async addCandidate(candidate) {
    if (this.pc.remoteDescription == null) {
      // dl("Remote description still null, adding to candidates list");
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
    // dl("Adding remote track", event);
    // add connection mapping
    let keys = Object.keys(this.mediaConnections);
    let id = event.streams[0].id;
    if (keys.length === 0) {
      this.mediaConnections[id] = this.remoteStream;
      this.toaster("Remote peer connected.", { icon: "👋" });
    } else if (keys.length > 0 && !keys.includes(id)) {
      // TODO: disable my screen share button
      this.mediaConnections[id] = this.remoteScreen;
    }
    event.streams[0].getTracks().forEach((track) => {
      this.mediaConnections[id].addTrack(track);
    });
    this.setPeerConnected(true);
    this.dataChannel.handleDataChannelOpen();
  }

  handleError(error) {
    dl(`Failure when doing: ${error.name} ${error}`);
  }
}

export default WebRTCService;
