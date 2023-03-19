class Stream {
  constructor(peerConnection) {
    this.peerConnection = peerConnection;
    this.localMediaStreams = {};
    this.remoteMediaStreams = {};
    this.updateLocalMediaTracks = null;
    this.updateRemoteMediaTracks = null;
    this.setEventHandlers();
  }

  addLocal(mediaStream) {
    this.localMediaStreams[mediaStream.type] = mediaStream;
    this.muteAudio(); // Only for testing purposes so there's no echo - We can determine what the initial state should be like
    // this.setMediaStreamEventHandlers(mediaStream);
  }

  addRemote(mediaStream) {
    this.remoteMediaStreams[mediaStream.type] = mediaStream;
    // this.setMediaStreamEventHandlers(mediaStream);
  }

  switchLocalTrack(mediaStream) {
    const audioVideoStream = this.getAudioVideoStream();

    const trackToAdd = mediaStream.getTracks()[0];
    const trackToRemove = audioVideoStream
      .getTracks()
      .find((track) => track.kind === trackToAdd.kind);

    audioVideoStream.removeTrack(trackToRemove);
    audioVideoStream.addTrack(trackToAdd);
    this.setLocalStreams();
  }

  setLocalStreams() {
    this.updateLocalMediaTracks({ ...this.localMediaStreams });
  }

  setRemoteStreams() {
    this.updateRemoteMediaTracks({ ...this.remoteMediaStreams });
  }

  muteAudio() {
    const audioVideoStream = this.getAudioVideoStream();
    const audioTrack = audioVideoStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
    }
    this.setLocalStreams();
  }

  stopVideo() {
    const audioVideoStream = this.getAudioVideoStream();
    const videoTrack = audioVideoStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
    }
    this.setLocalStreams();
  }

  getAudioVideoStream() {
    return this.localMediaStreams["audio-video"];
  }

  getScreenShareStream() {
    return this.localMediaStreams["screen-share"];
  }

  // Event handler when we receive a track from the peer
  handleOnTrack(trackEvent) {
    console.log(trackEvent);
  }

  // Event handlers for a MediaStream
  // These two handlers don't seem to actually work
  // I've tested it and I'm not able to get them to work
  handleAddTrack(mediaStreamTrackEvent) {
    console.log(mediaStreamTrackEvent);
  }

  handleRemoveTrack(mediaStreamTrackEvent) {
    console.log(mediaStreamTrackEvent);
  }

  // Event handlers for a MediaStreamTrack
  // Not sure if these are relevant for our purpose or if they actually work
  handleEnded(event) {
    console.log(event);
  }

  handleMute(event) {
    console.log(event);
  }

  handleUnmute(event) {
    console.log(event);
  }

  setEventHandlers() {
    this.peerConnection.ontrack = this.handleOnTrack.bind(this);
  }

  setMediaStreamEventHandlers(mediaStream) {
    mediaStream.onaddtrack = this.handleAddTrack.bind(this);
    mediaStream.onremovetrack = this.handleRemoveTrack.bind(this);
    mediaStream
      .getTracks()
      .forEach(this.setMediaStreamTrackEventHandlers.bind(this));
  }

  setMediaStreamTrackEventHandlers(track) {
    track.onended = this.handleEnded.bind(this);
    track.onmute = this.handleMute.bind(this);
    track.onunmute = this.handleUnmute.bind(this);
  }

  setStateUpdatingFunc(localFunc, remoteFunc) {
    this.updateLocalMediaTracks = localFunc;
    this.updateRemoteMediaTracks = remoteFunc;
  }
}

export default Stream;
