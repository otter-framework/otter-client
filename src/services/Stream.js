import { errorLogger } from "../utilities/logger";

class Stream {
  constructor(peerConnection) {
    this.peerConnection = peerConnection;
    this.audioAndVideoStream = null;
    this.localTracks = { audio: null, video: null, screenShare: null };
    this.remoteTracks = { audio: null, video: null, screenShare: null };
    this.updateLocalMediaTracks = null;
    this.updateRemoteMediaTracks = null;
    this.setEventHandlers();
  }

  addLocalTracks(mediaStream) {
    const tracks = mediaStream.getTracks();
    this.audioAndVideoStream = mediaStream;
    tracks.forEach((track) => {
      this.peerConnection.addTrack(track, mediaStream);
      this.localTracks[track.kind] = track;
      // this.setMediaStreamTrackEventHandlers(track, "local");
    });

    // this.muteAudio(); // Only for testing purposes so there's no echo - We can determine what the initial state should be like
  }

  addLocalScreenShare(track) {
    this.localTracks["screenShare"] = track;
    // this.setMediaStreamTrackEventHandlers(track, "local");
  }

  addRemoteTracks(track) {
    this.remoteTracks[track.kind] = track;
    this.setRemoteStreams();
    // this.setMediaStreamTrackEventHandlers(track, "remote");
  }

  addRemoteScreenShare(track) {
    this.remoteTracks["screenShare"] = track;
    this.setRemoteStreams();
    // this.setMediaStreamTrackEventHandlers(track, "remote");
  }

  // Still need to work on this
  async switchTrack(mediaStream) {
    const trackToAdd = mediaStream.getTracks()[0];
    const trackToRemove = this.localTracks[trackToAdd.kind];

    // This only works if no negotiation is needed
    try {
      const rtpSender = this.getRTPSenderBy(trackToRemove);
      await rtpSender.replaceTrack(trackToAdd);
      trackToRemove.stop();
    } catch (error) {
      errorLogger(error);
    } finally {
      this.localTracks[trackToAdd.kind] = trackToAdd;
    }

    // How do we handle removing a track?
    // Do we want to add the new track first ... wait X seconds ... then remove the first track?
    // audioVideoStream.addTrack(trackToAdd);
    // audioVideoStream.removeTrack(trackToRemove);

    // console.log(this.peerConnection.getTransceivers());
    // this.peerConnection.addTrack(trackToAdd, audioVideoStream);
    // console.log(this.peerConnection.getTransceivers());
    // this.peerConnection.removeTrack(RTCRtpSender);
  }

  muteAudio() {
    const audioTrack = this.getAudioTrack(this.localTracks);
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
    }
  }

  stopVideo() {
    const videoTrack = this.getVideoTrack(this.localTracks);
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
    }
  }

  // Event handler when we receive a track from the peer
  handleOnTrack(trackEvent) {
    const { streams, track } = trackEvent;
    const nbOfTracks = streams[0].getTracks().length;
    if (nbOfTracks === 2) {
      this.addRemoteTracks(track);
    } else {
      this.addRemoteScreenShare(track);
    }
  }

  // Event handlers for a MediaStreamTrack
  // Not sure if these are relevant for our purpose
  handleEnded(_, localOrRemote) {}

  handleMute(_, localOrRemote) {
    // What do we do when the media can't be displayed anymore
  }

  handleUnMute(_, localOrRemote) {
    if (localOrRemote === "local") {
      this.setLocalStreams();
    } else {
      this.setRemoteStreams();
    }
  }

  setLocalStreams() {
    this.updateLocalMediaTracks(this.buildStreams("local"));
  }

  setRemoteStreams() {
    this.updateRemoteMediaTracks(this.buildStreams("remote"));
  }

  buildStreams(localOrRemote) {
    const tracks =
      localOrRemote === "local" ? this.localTracks : this.remoteTracks;

    const audioVideoStream = [];
    const screeShareStream = [];

    const audioTrack = this.getAudioTrack(tracks);
    const videoTrack = this.getVideoTrack(tracks);
    const screenShareTrack = this.getScreenShareTrack(tracks);

    if (audioTrack instanceof MediaStreamTrack) {
      audioVideoStream.push(audioTrack);
    }

    if (videoTrack instanceof MediaStreamTrack) {
      audioVideoStream.push(videoTrack);
    }

    if (screenShareTrack instanceof MediaStreamTrack) {
      screeShareStream.push(screenShareTrack);
    }

    const audioVideo = new MediaStream(audioVideoStream);
    const screenShare = new MediaStream(screeShareStream);

    return { audioVideo, screenShare };
  }

  getRTPSenderBy(track) {
    const senders = this.peerConnection.getSenders();
    const targetSender = senders.find((sender) => sender.track === track);
    return targetSender;
  }

  getAudioTrack(tracks) {
    return tracks["audio"] || {};
  }

  getVideoTrack(tracks) {
    return tracks["video"] || {};
  }

  getScreenShareTrack(tracks) {
    return tracks["screenShare"] || {};
  }

  setEventHandlers() {
    this.peerConnection.ontrack = this.handleOnTrack.bind(this);
  }

  setMediaStreamTrackEventHandlers(track, localOrRemote) {
    track.onended = this.handleEnded.bind(this, localOrRemote);
    track.onmute = this.handleMute.bind(this, localOrRemote);
    track.onunmute = this.handleUnMute.bind(this, localOrRemote);
  }

  setStateUpdatingFunc(localFunc, remoteFunc) {
    this.updateLocalMediaTracks = localFunc;
    this.updateRemoteMediaTracks = remoteFunc;
  }

  // Event handlers for a MediaStream
  // These two handlers don't seem to actually work
  // I've tested it and I'm not able to get them to work
  // handleAddTrack(mediaStreamTrackEvent) {
  //   console.log(mediaStreamTrackEvent);
  // }

  // handleRemoveTrack(mediaStreamTrackEvent) {
  //   console.log(mediaStreamTrackEvent);
  // }

  // setMediaStreamEventHandlers(mediaStream) {
  //   mediaStream.onaddtrack = this.handleAddTrack.bind(this);
  //   mediaStream.onremovetrack = this.handleRemoveTrack.bind(this);
  // }
}

export default Stream;
