import ReactPlayer from "react-player";

const DisplayMediaStreams = ({
  localStreams,
  remoteStreams,
  onMuteAudio,
  onStopVideo,
}) => {
  if (!localStreams) return;

  const audioVideoStream = localStreams["audio-video"];
  const audioStatus = audioVideoStream.getAudioTracks()[0].enabled;
  const videoStatus = audioVideoStream.getVideoTracks()[0].enabled;

  const handleStopAudio = () => {
    // The stop button could be an icon
    onMuteAudio();
  };

  const handleStopVideo = () => {
    // The stop button could be an icon
    // We can display the Otter logo in the middle of the screen
    onStopVideo();
  };

  return (
    <div>
      <>
        <ReactPlayer
          url={audioVideoStream}
          playing={true}
          // width={640}
          // height={360}
          // wrapper={} // This is the component that will be used as the container of the player
          playsinline={true}
        />
        <button onClick={handleStopAudio}>
          {audioStatus ? "Mute audio" : "Unmute audio"}
        </button>
        <button onClick={handleStopVideo}>
          {videoStatus ? "Stop camera" : "Start camera"}
        </button>
      </>
      {remoteStreams ? (
        <ReactPlayer
          url={remoteStreams["audio-video"]}
          playing={true}
          // width={640}
          // height={360}
          // wrapper={} // This is the component that will be used as the container of the player
          playsinline={true}
        />
      ) : null}
    </div>
  );
};

export default DisplayMediaStreams;
