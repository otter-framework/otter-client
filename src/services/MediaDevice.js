import { errorLogger } from "../utilities/logger";

class MediaDevice {
  constructor() {
    this.audioInputDevices = [];
    this.audioOutputDevices = [];
    this.videoInputDevices = [];
    this.selectedAudioOutputDevice = null;
    this.selectedVideoInputDevice = null;
    this.updateState = null;
    this.setEventHandlers();
  }

  async getUserMedia(mediaRequired) {
    // Need to handle error if user denies permission
    let audioConstraints = this.getAudioConstraints();
    let videoConstraints = this.getVideoConstraints();

    if (!/audio/.test(mediaRequired)) {
      audioConstraints = {};
    } else if (!/video/.test(mediaRequired)) {
      videoConstraints = {};
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        ...audioConstraints,
        ...videoConstraints,
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
        height: { min: 720, ideal: 1080, max: 1080 },
        aspectRatio: 1.777777778,
      },
    };
  }

  async getAllMediaDevices() {
    const mediaDevices = await navigator.mediaDevices.enumerateDevices();
    this.updateMediaDevices(mediaDevices);
    this.setDefaultMediaDevices();
  }

  // This event handler needs to be improved
  // Two scenarios:
  // Device(s) is/are added
  // Device(s) is/are removed
  // If the device being used is removed then we need to getUserMedia and change the track
  // If the device being used is not affected then we just list the new media devices
  async handleDeviceChange() {
    // const mediaDevices = await navigator.mediaDevices.enumerateDevices();
    // this.updateMediaDevices(mediaDevices);
    // this.setDefaultMediaDevices();
    // this.setState();
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
      "audioinput"
    )
      ? this.selectedAudioInputDevice
      : this.audioInputDevices[0];

    this.selectedAudioOutputDevice = this.isSelectedMediaDeviceStillAvailable(
      "audiooutput"
    )
      ? this.selectedAudioOutputDevice
      : this.audioOutputDevices[0];

    this.selectedVideoInputDevice = this.isSelectedMediaDeviceStillAvailable(
      "videoinput"
    )
      ? this.videoInputDevices
      : this.videoInputDevices[0];
  }

  isSelectedMediaDeviceStillAvailable(kind) {
    switch (kind) {
      case "audioinput":
        return this.audioInputDevices.some(
          (device) => device.label === this.selectedAudioInputDevice?.label
        );
      case "audiooutput":
        return this.audioOutputDevices.some(
          (device) => device.label === this.selectedAudioOutputDevice?.label
        );
      case "videoinput":
        return this.videoInputDevices.some(
          (device) => device.label === this.selectedVideoInputDevice?.label
        );
    }
  }

  setSelectedMediaDevice(kind, label) {
    let selectedDevice;
    switch (kind) {
      case "audioinput":
        selectedDevice = this.findMediaDeviceByLabel(
          this.audioInputDevices,
          label
        );
        this.selectedAudioInputDevice = selectedDevice;
        break;
      case "audiooutput":
        selectedDevice = this.findMediaDeviceByLabel(
          this.audioOutputDevices,
          label
        );
        this.selectedAudioOutputDevice = selectedDevice;
        break;
      case "videoinput":
        selectedDevice = this.findMediaDeviceByLabel(
          this.videoInputDevices,
          label
        );
        this.selectedVideoInputDevice = selectedDevice;
        break;
    }
  }

  findMediaDeviceById(devices, deviceId) {
    return devices.find((device) => device.deviceId === deviceId);
  }

  findMediaDeviceByLabel(devices, label) {
    return devices.find((device) => device.label === label);
  }

  filterMediaDevices(devices, kind) {
    return devices.filter((device) => {
      return device.kind === kind;
    });
  }

  setState() {
    this.updateState({
      ...this.getAvailableMediaDevices(),
      ...this.getSelectedMediaDevices(),
    });
  }

  getAvailableMediaDevices() {
    return {
      audioInputDevices: this.audioInputDevices,
      audioOutputDevices: this.audioOutputDevices,
      videoInputDevices: this.videoInputDevices,
    };
  }

  getSelectedMediaDevices() {
    return {
      selectedAudioInputDevice: this.selectedAudioInputDevice,
      selectedAudioOutputDevice: this.selectedAudioOutputDevice,
      selectedVideoInputDevice: this.selectedVideoInputDevice,
    };
  }

  setStateUpdatingFunc(callback) {
    this.updateState = callback;
  }

  setEventHandlers() {
    navigator.mediaDevices.ondevicechange = this.handleDeviceChange.bind(this);
  }
}

export default MediaDevice;
