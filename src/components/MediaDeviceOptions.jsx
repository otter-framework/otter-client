import SelectOptions from "./SelectOptions";

const MediaDeviceOptions = ({ mediaDevices, onChange }) => {
  return (
    <>
      <SelectOptions
        type="audio-input"
        text="Select a Microphone"
        availableDevices={mediaDevices.audioInputDevices}
        selectedDevice={mediaDevices.selectedAudioInputDevice.deviceId}
        onChange={onChange}
      />
      <SelectOptions
        type="audio-output"
        text="Select a Speaker"
        availableDevices={mediaDevices.audioOutputDevices}
        selectedDevice={mediaDevices.selectedAudioOutputDevice.deviceId}
        onChange={onChange}
      />
      <SelectOptions
        type="video-input"
        text="Select a Camera"
        availableDevices={mediaDevices.videoInputDevices}
        selectedDevice={mediaDevices.selectedVideoInputDevice.deviceId}
        onChange={onChange}
      />
    </>
  );
};

export default MediaDeviceOptions;
