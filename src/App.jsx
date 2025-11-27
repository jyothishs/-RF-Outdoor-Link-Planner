import React from "react";
import MapView from './components/MapView';
import BackgroundAnimation from "./components/BackgroundAnimation";
import "remixicon/fonts/remixicon.css";
import './index.css'
import 'leaflet/dist/leaflet.css'


function App() {
  return (
    <main>
     
        <div className="container w-full max-w-full">
          <BackgroundAnimation />s
          <div className="heading  top-0 left-0 w-full  p-4 z-20 shadow">
                <h1 className="text-center text-primary  text-white text-2xl md:text-4xl">RF Outdoor Link Planner </h1>
      
          </div>
          <div className="left-bar fixed left-0 w-[100px] bg-blue-800/30 top-0  z-20 h-full h md:block hidden">

          </div>
            
            <div className="z-10 relative h-[100vh] w-full md:ml-[100px]">
              <MapView />
            </div>
        </div>
    </main>
  );
}

export default App;