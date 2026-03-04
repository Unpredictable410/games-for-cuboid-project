import React from 'react';
import { MAPS_CONFIG } from '../data/maps';

const MapSelect = ({ onSelectMap }) => (
  <div className="menu-screen">
    <h2>Select Arena</h2>
    <div className="card-grid">
      {MAPS_CONFIG.map(map => (
        <button key={map.id} className="map-card" onClick={() => onSelectMap(map)}>
          {map.name}
        </button>
      ))}
    </div>
  </div>
);

export default MapSelect;