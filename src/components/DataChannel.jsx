import { useState, useEffect } from "react";

const DataChannel = ({ room }) => {
  const [readyToSendMessages, setReadyToSendMessages] = useState(false);

  const [localMessages, setLocalMessages] = useState([]);
  const [remoteMessages, setRemoteMessages] = useState([]);

  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    room.p2p.dataChannel.setStateUpdatingFunc(
      setRemoteMessages,
      setReadyToSendMessages
    );
  }, []);

  const handleMessageChange = (e) => {
    setCurrentMessage(e.target.value);
  };

  const handleSendMessage = () => {
    room.p2p.dataChannel.send(currentMessage);
    setCurrentMessage("");
    setLocalMessages([...localMessages, currentMessage]);
  };

  return (
    <div>
      <div>
        <p>Local text</p>
        <ul>
          {localMessages.map((text, idx) => {
            return <li key={idx}>{text}</li>;
          })}
        </ul>
      </div>
      <div>
        <p>Remote text</p>
        <ul>
          {remoteMessages.map((text, idx) => {
            return <li key={idx}>{text}</li>;
          })}
        </ul>
      </div>
      {readyToSendMessages ? (
        <div>
          <label>Text message:</label>
          <input value={currentMessage} onChange={handleMessageChange} />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      ) : null}
    </div>
  );
};

export default DataChannel;
