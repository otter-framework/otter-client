// import "./App.css";
import { Routes, Route } from "react-router-dom";
import Room from "./components/Room";

function App() {
  return (
    <div className="App bg-gray-100">
      <div className="container mx-auto">
        <div>
          <div id="nav">
            <h1 className="text-3xl font-bold underline">
              Peer to Peer Video Chat
            </h1>
          </div>
          <Routes>
            <Route path="/otter-meet/:roomId" element={<Room />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
