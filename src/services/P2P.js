import { errorLogger } from "../utilities/logger";
import DataChannel from "./DataChannel";
import Stream from "./Stream";

class P2P {
  static ICE_CANDIDATES_BATCH = 5;

  constructor(roomId, p2pConfig) {
    this.roomId = roomId;
    this.sourceId = null; // my WS Gateway Id
    this.destinationId = null; // peer WS Gateway Id
    this.amIPolite = null; // my assigned role => polite or impolite
    this.makingOffer = false; // bool to indicate if an offer is being built and sent
    this.ignoreOffer = false; // bool to indicate if we ignored an offer
    this.isSettingRemoteAnswerPending = false; // bool to indicate if we are setting the remote answer
    this.turnIsReady = false; // bool to indicate when TURN credentials have been received
    this.iceCandidatesToSend = [];
    this.iceCandidatesReceived = [];
    this.sendSignalingMessage = null; // callback function to send a message
    this.peerConnection = new RTCPeerConnection();
    this.dataChannel = new DataChannel(this.peerConnection); // Do we open a channel from the start?
    this.stream = new Stream(this.peerConnection); // To handle local and remote media streams and tracks
    this.p2pConfig = p2pConfig; // CoTURN config object
    this.setEventHandlers();
  }

  setTurnIsReady() {
    this.turnIsReady = true;
    this.peerConnection.dispatchEvent(new Event("negotiationneeded")); // if turn credentials arrive after setting the assigned role
  }

  handleConnectionStateChange(event) {
    // Not sure if this is relevant for us
  }

  handleIceCandidate(iceEvent) {
    const { candidate } = iceEvent;
    // Null candidate indicates the end of ICE
    if (candidate === null) return;

    this.iceCandidatesToSend.push(candidate);

    if (candidate === "" || this.readyToSendIceCandidates()) {
      this.sendSignalingMessage(
        this.buildMessageStructure({ candidates: this.iceCandidatesToSend })
      );
      this.resetIceCandidatesToSend();
      return;
    }
  }

  handleIceCandidateError(iceErrorEvent) {
    console.log("IceErrorEvent", iceErrorEvent);
    this.restartIce();
  }

  handleIceConnectionStateChange(event) {
    switch (this.peerConnection.iceConnectionState) {
      case "new":
        return;
      case "checking":
        return;
      case "connected":
        return;
      case "completed":
        return;
      case "failed":
        this.restartIce();
        return;
      case "disconnected":
        return;
      case "closed":
        return;
    }
  }

  handleIceGatheringStateChange(event) {
    // Possible states
    // new
    // gathering
    // complete - equivalent to receiving a candidate with null
  }

  async handleNegotiationNeeded() {
    if (!this.turnIsReady || !this.roleIsAssigned()) return;

    try {
      this.makingOffer = true;
      await this.peerConnection.setLocalDescription();
      this.sendSignalingMessage(
        this.buildMessageStructure({
          description: this.peerConnection.localDescription,
        })
      );
    } catch (error) {
      errorLogger(error);
    } finally {
      this.makingOffer = false;
    }
  }

  handleSignalingStateChange(event) {
    // Possible states
    // stable
    // have-local-offer
    // have-remote-offer
    // have-local-pranswer
    // have-remote-pranswer
    // closed
  }

  async handleSignalingMessage(message) {
    const {
      source: destination,
      destination: source,
      polite: isMyPeerPolite,
      payload,
    } = message;

    // The endConnection Lambda should send the same message as the Connect Lambda but with source set to null to indicate that the other peer is no longer available
    // This is temporary
    if (!destination) {
      this.setDestinationId(destination);
      return;
    }

    this.setSourceId(source);
    this.setDestinationId(destination);
    this.setAssignedRole(isMyPeerPolite);

    // When the first message is received, the source can be:
    // The $connect Lambda in which case you are the first peer to connect (i.e., impolite peer)
    // From the other peer in which case you are the second peer to connect (i.e., polite peer)

    // The first peer starts the offer once it can
    if (!this.amIPolite && !payload) {
      this.peerConnection.dispatchEvent(new Event("negotiationneeded"));
      return;
    }

    await this.processPayload(payload);
  }

  async processPayload({ description, candidates }) {
    try {
      if (description) {
        const readyForOffer =
          !this.makingOffer &&
          (this.peerConnection.signalingState === "stable" ||
            this.isSettingRemoteAnswerPending);

        const offerCollision = description.type === "offer" && readyForOffer;

        this.ignoreOffer = !this.amIPolite && offerCollision;
        if (this.ignoreOffer) return;

        this.isSettingRemoteAnswerPending = description.type === "answer";
        await this.peerConnection.setRemoteDescription(description);
        this.isSettingRemoteAnswerPending = false;

        if (description.type === "offer") {
          await this.peerConnection.setLocalDescription();
          this.sendSignalingMessage(
            this.buildMessageStructure({
              description: this.peerConnection.localDescription,
            })
          );
        }
        await this.startIceProcess();
      } else if (candidates) {
        await this.processRemoteIceCandidates(candidates);
      }
    } catch (error) {
      errorLogger(error);
    }
  }

  async processRemoteIceCandidates(candidates) {
    if (this.peerConnection.remoteDescription === null) {
      candidates.forEach((candidate) => {
        this.iceCandidatesReceived.push(candidate);
      });
    } else {
      await this.startIceProcess();
    }
  }

  async startIceProcess() {
    this.iceCandidatesReceived.forEach(async (candidate, idx) => {
      try {
        await this.peerConnection.addIceCandidate(candidate);
        if (idx === this.iceCandidatesReceived.length) {
          this.resetIceCandidatesReceived();
        }
      } catch (error) {
        if (!this.ignoreOffer) {
          throw error;
        }
      }
    });
  }

  setSourceId(sourceId) {
    this.sourceId = sourceId;
  }

  setDestinationId(destinationId) {
    this.destinationId = destinationId;
  }

  setAssignedRole(isMyPeerPolite) {
    this.amIPolite = !isMyPeerPolite;
  }

  roleIsAssigned() {
    return this.amIPolite !== null;
  }

  setConfiguration(turnCredentials) {
    const currentConfig = this.p2pConfig.iceServers[0];
    this.p2pConfig.iceServers = [
      {
        ...currentConfig,
        ...turnCredentials,
      },
    ];
    this.peerConnection.setConfiguration(this.p2pConfig);
  }

  buildMessageStructure(payload) {
    return {
      roomId: this.roomId,
      source: this.sourceId,
      destination: this.destinationId,
      polite: this.amIPolite,
      payload,
    };
  }

  restartIce() {
    this.resetIceCandidatesToSend();
    this.resetIceCandidatesReceived();
    this.peerConnection.restartIce();
  }

  readyToSendIceCandidates() {
    return this.iceCandidatesToSend.length >= P2P.ICE_CANDIDATES_BATCH;
  }

  resetIceCandidatesToSend() {
    this.iceCandidatesToSend = [];
  }

  resetIceCandidatesReceived() {
    this.iceCandidatesReceived = [];
  }

  setSendSignalingMessageCb(func) {
    this.sendSignalingMessage = func;
  }

  setEventHandlers() {
    this.peerConnection.onconnectionstatechange =
      this.handleConnectionStateChange.bind(this);

    this.peerConnection.onicecandidate = this.handleIceCandidate.bind(this);

    this.peerConnection.onicecandidateerror =
      this.handleIceCandidateError.bind(this);

    this.peerConnection.oniceconnectionstatechange =
      this.handleIceConnectionStateChange.bind(this);

    this.peerConnection.onicegatheringstatechange =
      this.handleIceGatheringStateChange.bind(this);

    this.peerConnection.onnegotiationneeded =
      this.handleNegotiationNeeded.bind(this);

    this.peerConnection.onsignalingstatechange =
      this.handleSignalingStateChange.bind(this);
  }
}

export default P2P;
