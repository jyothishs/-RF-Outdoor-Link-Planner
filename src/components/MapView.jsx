import React, { useEffect, useRef } from "react";

import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMapEvents, SVGOverlay } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";
import { Circle } from "react-leaflet";

import iconUrl from "../images/tower.png";
// import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({ iconUrl});
L.Marker.prototype.options.icon = DefaultIcon;

const c = 3e8;

export default function RFPlannerLeaflet() {
  const [towers, setTowers] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedTower, setSelectedTower] = useState(null);
  const [selectedLink, setSelectedLink] = useState(null);

  function AddTowerOnClick() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setTowers([...towers, { id: Date.now(), lat, lng, freq: 2.4 }]);
      },
    });
    return null;
  }

  const selectTower = (tower) => {
    if (!selectedTower) setSelectedTower(tower);
    else if (selectedTower.id !== tower.id) {
      if (selectedTower.freq === tower.freq) {
        setLinks([...links, { id: Date.now(), t1: selectedTower, t2: tower }]);
      } else alert("Towers must have same channel!");
      setSelectedTower(null);
    }
  };

  const removeTower = (towerId) => {
    setTowers(towers.filter((t) => t.id !== towerId));
    setLinks(links.filter((l) => l.t1.id !== towerId && l.t2.id !== towerId));
  };

  const updateFreq = (towerId, freq) => {
    setTowers(towers.map((t) => (t.id === towerId ? { ...t, freq } : t)));
  };

  const distance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const cDist = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * cDist;
  };

  const fresnelRadius = (t1, t2) => {
    const fHz = t1.freq * 1e9;
    const λ = c / fHz;
    const d = distance(t1.lat, t1.lng, t2.lat, t2.lng);
    return Math.sqrt((λ * d) / 4); // in meters
  };

  const midpoint = (t1, t2) => [(t1.lat + t2.lat) / 2, (t1.lng + t2.lng) / 2];

  const angle = (t1, t2) => {
    const dx = t2.lng - t1.lng;
    const dy = t2.lat - t1.lat;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };

  // Fresnel ellipse overlay
  const FresnelEllipse = ({ link }) => {
    const [lat, lng] = midpoint(link.t1, link.t2);
    const radius = fresnelRadius(link.t1, link.t2);
    const rotation = angle(link.t1, link.t2);

    const bounds = [
      [lat - 0.01, lng - 0.01],
      [lat + 0.01, lng + 0.01],
    ];

    return (
      <SVGOverlay bounds={bounds}>
        <svg width="100%" height="100%">
          <ellipse
            cx="50%"
            cy="50%"
            rx="50%"
            ry={radius / 1000} // scale to map
            fill="blue"
            fillOpacity={0.2}
            transform={`rotate(${rotation},50%,50%)`}
          />
        </svg>
      </SVGOverlay>
    );
  };

  return (
    <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "100vh", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <AddTowerOnClick />


      {towers.map((t) => (
        <Marker key={t.id} position={[t.lat, t.lng]} eventHandlers={{ click: () => selectTower(t) }}>
          <Popup>
            <div className="flex">
                Channel: {" "}
              <input className="ml-1.5 "
              type="number"
              value={t.freq}
              onChange={(e) => updateFreq(t.id, parseFloat(e.target.value))}
              style={{ width: "60px" }}
            />
            <br />
            <button className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                removeTower(t.id);
              }}
            >
           <i class="ri-delete-bin-5-line"></i>
            </button>
            </div>
           
          </Popup>
        </Marker>
      ))}


{links.map((l) => (
  <Polyline
    key={l.id}
    positions={[
      [l.t1.lat, l.t1.lng],
      [l.t2.lat, l.t2.lng],
    ]}
    color="red"
    eventHandlers={{ click: () => setSelectedLink(l) }}
  >
    <Tooltip direction="top" permanent>
      Distance: {(distance(l.t1.lat, l.t1.lng, l.t2.lat, l.t2.lng) / 1000).toFixed(2)} km,
      Channel: {l.t1.freq}
    </Tooltip>
  </Polyline>
))}
  

{selectedTower && (
  <Circle
    center={[selectedTower.lat, selectedTower.lng]}
    radius={500}
    pathOptions={{ color: "blue" }}
  />
)}


{selectedLink && (
  <>
    <Circle
      center={[selectedLink.t1.lat, selectedLink.t1.lng]}
      radius={500}
      pathOptions={{ color: "green" }}
    />

    <Circle
      center={[selectedLink.t2.lat, selectedLink.t2.lng]}
      radius={500}
      pathOptions={{ color: "green" }}
    />
  </>
)}

      

      {selectedLink && <FresnelEllipse link={selectedLink} />}
    </MapContainer>
  );
}
