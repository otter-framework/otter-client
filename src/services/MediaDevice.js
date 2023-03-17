import { errorLogger } from "../utilities/logger";

class MediaDevice {
  constructor() {
    this.audioInputDevices = [];
    this.audioOutputDevices = [];
    this.videoInputDevices = [];
    this.selectedAudioInputDevice = null;
    this.selectedAudioOutputDevice = null;
    this.selectedVideoInputDevice = null;
    this.updateState = null;
    this.setEventHandlers();
  }

  async startMediaStream() {
    // Need to handle error if user denies permission
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        ...this.getAudioConstraints(),
        ...this.getVideoConstraints(),
      });
      return mediaStream;
    } catch (error) {
      errorLogger(error);
    }
  }

  getAudioConstraints() {
    return {
      audio: {
        deviceId: this.selectedAudioInputDevice?.deviceId,
        noiseSuppression: true,
        echoCancellation: true,
      },
    };
  }

  getVideoConstraints() {
    return {
      video: {
        deviceId: this.selectedVideoInputDevice?.deviceId,
        width: { min: 1280, ideal: 1920, max: 1920 },
        // width: 1920,
        // height: 1080,
        height: { min: 720, ideal: 1080, max: 1080 },
        aspectRatio: 1.777777778,
      },
    };
  }

  async getAllMediaDevices() {
    const mediaDevices = await navigator.mediaDevices.enumerateDevices();
    this.updateMediaDevices(mediaDevices);
    this.setDefaultMediaDevices();
    this.setState();
  }

  setEventHandlers() {
    navigator.mediaDevices.ondevicechange = this.getAllMediaDevices.bind(this);
  }

  updateMediaDevices(mediaDevices) {
    this.audioInputDevices = this.filterMediaDevices(
      mediaDevices,
      "audioinput"
    );
    this.audioOutputDevices = this.filterMediaDevices(
      mediaDevices,
      "audiooutput"
    );
    this.videoInputDevices = this.filterMediaDevices(
      mediaDevices,
      "videoinput"
    );
  }

  setDefaultMediaDevices() {
    this.selectedAudioInputDevice = this.isSelectedMediaDeviceStillAvailable(
      "audio-input"
    )
      ? this.selectedAudioInputDevice
      : this.audioInputDevices[0];

    this.selectedAudioOutputDevice = this.isSelectedMediaDeviceStillAvailable(
      "audio-output"
    )
      ? this.selectedAudioOutputDevice
      : this.audioOutputDevices[0];

    this.selectedVideoInputDevice = this.isSelectedMediaDeviceStillAvailable(
      "video-input"
    )
      ? this.videoInputDevices
      : this.videoInputDevices[0];
  }

  isSelectedMediaDeviceStillAvailable(kind) {
    switch (kind) {
      case "audio-input":
        return this.audioInputDevices.some(
          (device) => device === this.selectedAudioInputDevice
        );
      case "audio-output":
        return this.audioOutputDevices.some(
          (device) => device === this.selectedAudioOutputDevice
        );

      case "video-input":
        return this.videoInputDevices.some(
          (device) => device === this.selectedVideoInputDevice
        );
    }
  }

  setSelectedMediaDevice({ kind, deviceId }) {
    let selectedDevice;
    switch (kind) {
      case "audio-input":
        selectedDevice = this.findMediaDeviceById(
          this.audioInputDevices,
          deviceId
        );
        this.selectedAudioInputDevice = selectedDevice;
        break;
      case "audio-output":
        selectedDevice = this.findMediaDeviceById(
          this.audioOutputDevices,
          deviceId
        );
        this.selectedAudioOutputDevice = selectedDevice;
        break;
      case "video-input":
        selectedDevice = this.findMediaDeviceById(
          this.videoInputDevices,
          deviceId
        );
        this.selectedVideoInputDevice = selectedDevice;
        break;
    }
    this.setState();
  }

  findMediaDeviceById(devices, deviceId) {
    return devices.find((device) => device.deviceId === deviceId);
  }

  filterMediaDevices(devices, kind) {
    return devices.filter((device) => {
      return device.kind === kind;
      // && device.deviceId !== "default";
    });
  }

  setState() {
    this.updateState({
      audioInputDevices: this.audioInputDevices,
      audioOutputDevices: this.audioOutputDevices,
      videoInputDevices: this.videoInputDevices,
      selectedAudioInputDevice: this.selectedAudioInputDevice,
      selectedAudioOutputDevice: this.selectedAudioOutputDevice,
      selectedVideoInputDevice: this.selectedVideoInputDevice,
    });
  }

  setStateUpdatingFunc(callback) {
    this.updateState = callback;
  }
}

export default MediaDevice;
