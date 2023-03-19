import "./App.css";
import { Routes, Route } from "react-router-dom";
import Room from "./components/Room";

function App() {
  return (
    <div className="App">
      <h1>Peer to Peer Video Chat</h1>
      <Routes>
        <Route path="/otter-meet/:roomId" element={<Room />} />
      </Routes>
    </div>
  );
}

export default App;
