const ChatBubble = ({ sender, msg, time }) => {
  if (sender === "You") {
    return (
      <div className="flex w-full justify-end items-center">
        <span className="px-4 py-1 bg-blue-600 text-white rounded-xl">
          {msg}
        </span>
        <span className="ps-1 text-xs text-gray-600">{sender}</span>
      </div>
    );
  } else if (sender === "Remote") {
    return (
      <div className="flex w-full justify-start items-center">
        <span className="px-4 py-1 bg-gray-500 text-white rounded-xl">
          {msg}
        </span>
      </div>
    );
  } else {
    return (
      <div className="flex w-full justify-center items-center">
        <span className="px-4 py-1 text-gray-500 text-xs rounded-xl text-center">
          {msg}
        </span>
      </div>
    );
  }
};

export default ChatBubble;
