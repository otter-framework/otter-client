class MediaService {
  async getLocalStream() {
    const local = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { min: 640, ideal: 1920 },
        height: { min: 480, ideal: 1080 },
      },
      audio: {
        noiseSuppression: true,
        echoCancellation: true,
      },
    });
    return local;
  }

  async getLocalScreen() {
    const local = await navigator.mediaDevices.getDisplayMedia();

    return local;
  }

  initRemoteStream() {
    return new MediaStream();
  }
}

export default MediaService;
