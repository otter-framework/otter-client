import { useState, useEffect } from "react";

const DataChannel = ({ connection }) => {
  const [readyToSendMessages, setReadyToSendMessages] = useState(false);
  const [messages, setMessages] = useState([]); // list of objects with form {text, sender, date}
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
    setLocalMessages(
      localMessages.concat({
        text: currentMessage,
        time: new Date(),
      })
    );
  };

  useEffect(() => {
    let messages = [
      ...localMessages.map((m) => ({ ...m, sender: "Me" })),
      ...remoteMessages.map((m) => ({ ...m, sender: "You" })),
    ];

    messages = messages.sort((a, b) => a.time.getTime() - b.time.getTime());

    setMessages(messages);
  }, [localMessages, remoteMessages]);

  return (
    <div>
      <div>
        {messages.map((msg, idx) => {
          return (
            <li key={idx} style={{ listStyle: "none" }}>
              {msg.sender} @ {msg.time.toLocaleTimeString()}:{" "}
              <strong>{msg.text}</strong>
            </li>
          );
        })}
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
