// import "./App.css";
import { Routes, Route } from "react-router-dom";
import Room from "./components/Room";
import Fin from "./components/Fin";
import toast, { Toaster } from "react-hot-toast";
import logoUrl from "./assets/otter-logo.svg";

function App() {
  return (
    <div className="bg-zinc-900 h-screen ps-4">
      <Toaster
        toastOptions={{
          className: "bg-gray-700 text-white",
        }}
      />
      <div className="flex flex-col relative">
        <div className="absolute w-full top-0 left-0 z-10">
          <img src={logoUrl} alt="otter-logo" className="w-32 py-6 px-4" />
        </div>
        <Routes>
          <Route
            path="/otter-meet/:roomId"
            element={<Room toaster={toast} />}
          />
          <Route path="/otter-meet/fin" element={<Fin />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
