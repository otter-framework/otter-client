class MediaService {
  async getLocalStream() {
    try {
      const local = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { min: 640, ideal: 1920 },
          height: { min: 480, ideal: 1080 },
          frameRate: { ideal: 24 },
        },
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          maxAudioBitrate: 16000,
        },
      });

      return local;
    } catch (e) {
      console.log(e);
    }
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
