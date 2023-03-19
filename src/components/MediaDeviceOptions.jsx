import SelectOptions from "./SelectOptions";

const MediaDeviceOptions = ({ mediaDevices, onChange }) => {
  return (
    <>
      {mediaDevices ? (
        <>
          <SelectOptions
            type="audioinput"
            text="Select a Microphone"
            availableDevices={mediaDevices.audioInputDevices}
            selectedDevice={mediaDevices.selectedAudioInputDevice.label}
            onChange={onChange}
          />
          <SelectOptions
            type="audiooutput"
            text="Select a Speaker"
            availableDevices={mediaDevices.audioOutputDevices}
            selectedDevice={mediaDevices.selectedAudioOutputDevice.label}
            onChange={onChange}
          />
          <SelectOptions
            type="videoinput"
            text="Select a Camera"
            availableDevices={mediaDevices.videoInputDevices}
            selectedDevice={mediaDevices.selectedVideoInputDevice.label}
            onChange={onChange}
          />
        </>
      ) : null}
    </>
  );
};

export default MediaDeviceOptions;
