import DataChannel from "./DataChannel";
import Stream from "./Stream";

class P2P {
  constructor(roomId, p2pConfig) {
    this.roomId = roomId;
    this.sourceId = null; // my WS Gateway Id
    this.destinationId = null; // peer WS Gateway Id
    this.amIPolite = null; // my assigned role => polite or impolite
    this.turnIsReady = false; // bool to indicate when TURN credentials have been received
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
    console.log(iceEvent);
    // Fired when we call this.peerConnection.setLocalDescription() with a new RTCIceCandidate
    // We need to send the new candidate to the remote peer through the signaling channel
    // Are we able to hold on to the ice candidates and send a couple of them at the same time
    // When ICE runs out of candidates it sends a candidate with an empty string
    // When ICE completes it sends a candidate with null - no need to send this one
  }

  handleIceCandidateError(iceErrorEvent) {
    console.log(iceErrorEvent);
    // Do we want to do anything if ICE negotiation fails with STUN/TURN server?
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
        this.peerConnection.restartIce();
        return;
      case "disconnected":
        return;
      case "closed":
        return;
    }
  }

  handleIceGatheringStateChange(event) {
    console.log(event);
    // Possible states
    // new
    // gathering
    // complete - equivalent to receiving a candidate with null
  }

  handleNegotiationNeeded(event) {
    if (!this.turnIsReady || !this.roleIsAssigned()) return;
    // Fired when negotiation through the signaling channel is required
    // First occurs when media is added to the connection
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

  handleSignalingMessage(message) {
    const {
      source: destination,
      destination: source,
      polite: isMyPeerPolite,
      payload,
    } = message;
    this.setSourceId(source);
    this.setDestinationId(destination);

    // When the first message is received, the source can be:
    // The $connect Lambda in which case you are the first peer to connect (i.e., impolite peer)
    // From the other peer in which case you are the second peer to connect (i.e., polite peer)

    // The first peer needs to send the session-info to the second peer
    // The second peer needs to start the negotiation
    if (!payload) {
      this.setAssignedRole(isMyPeerPolite);
      if (!this.amIPolite) {
        this.sendSignalingMessage(this.buildMessageStructure(null));
      } else {
        this.peerConnection.dispatchEvent(new Event("negotiationneeded"));
      }
      return;
    }

    this.processPayload(payload);
  }

  setSourceId(sourceId) {
    this.sourceId = this.sourceId || sourceId;
  }

  setDestinationId(destinationId) {
    this.destinationId = this.destinationId || destinationId;
  }

  setAssignedRole(isMyPeerPolite) {
    if (this.roleIsAssigned()) return;
    this.amIPolite = !isMyPeerPolite;
  }

  processPayload(payload) {
    // Perfect Negotiation
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
