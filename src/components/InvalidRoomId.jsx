const InvalidRoomId = ({ room }) => {
  return (
    <div>
      <p>The provided room identifier "{room.getId()}" is not valid.</p>
    </div>
  );
};

export default InvalidRoomId;
