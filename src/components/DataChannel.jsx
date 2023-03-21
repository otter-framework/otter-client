import { useState, useEffect } from "react";

const DataChannel = ({ connection }) => {
  const [readyToSendMessages, setReadyToSendMessages] = useState(false);

  const [localMessages, setLocalMessages] = useState([]);
  const [remoteMessages, setRemoteMessages] = useState([]);

  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    connection &&
      connection.dataChannel.setStateUpdatingFunc(
        setRemoteMessages,
        setReadyToSendMessages
      );
  }, [connection]);

  const handleMessageChange = (e) => {
    setCurrentMessage(e.target.value);
  };

  const handleSendMessage = () => {
    connection.dataChannel.send(currentMessage);
    setCurrentMessage("");
    setLocalMessages(localMessages.concat(currentMessage));
  };

  return (
    <div>
      <div>
        <h1>Chat</h1>
        <h2>Me</h2>
        <ul>
          {localMessages.map((text, idx) => {
            return <li key={idx}>{text}</li>;
          })}
        </ul>
      </div>
      <div>
        <h2>You:</h2>
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
