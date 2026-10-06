import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '@/services/api';
import type { AffectedArea, Warehouse } from '@/types';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix for default Leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

export const DisasterMap = () => {
  const [areas, setAreas] = useState<AffectedArea[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  useEffect(() => {
    Promise.all([api.getAffectedAreas(), api.getWarehouses()]).then(([a, w]) => {
      setAreas(a);
      setWarehouses(w);
    });
  }, []);

  const getSeverityHex = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return '#F87171'; // Red
      case 'high': return '#F97316'; // Orange
      case 'medium': return '#EAB308'; // Yellow
      case 'low': return '#22C55E'; // Green
      default: return '#38BDF8';
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="text-[11px] font-semibold text-[#94A3B8] tracking-widest uppercase">
        DISASTER MAP - Live affected zones
      </div>
      <div className="h-[340px] md:h-[400px] lg:h-[460px] w-full rounded-xl overflow-hidden bg-[#0B0F19]">
        <MapContainer
          center={[12.5, 79.5]}
          zoom={8}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        
        <style>{`
          .map-tiles {
            filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
          }
        `}</style>

        {areas.map(area => (
          <CircleMarker
            key={area.id}
            center={area.coordinates as [number, number]}
            radius={area.severity.toLowerCase() === 'critical' ? 12 : 8}
            pathOptions={{ 
              color: getSeverityHex(area.severity),
              fillColor: getSeverityHex(area.severity),
              fillOpacity: 0.6
            }}
          >
            <Popup className="bg-[#1E293B] text-gray-900 font-sans p-1">
              <h3 className="font-bold">{area.name}</h3>
              <p className="text-sm">Pop: {area.population.toLocaleString()}</p>
              <p className="text-sm">Priority Score: {area.priorityScore.toFixed(1)}</p>
              <p className="text-sm font-semibold mt-1">Shortage:</p>
              <ul className="text-xs list-disc pl-4">
                {Object.entries(area.shortage || {}).slice(0,2).map(([item, val]) => (
                  <li key={item}>{item}: {String(val)}</li>
                ))}
              </ul>
            </Popup>
          </CircleMarker>
        ))}

        {warehouses.map(wh => (
          <Marker 
            key={wh.id}
            position={wh.coordinates as [number, number]}
          >
            <Popup>
              <div className="font-sans text-gray-900">
                <h3 className="font-bold">{wh.name}</h3>
                <p className="text-sm">Status: {wh.operationalStatus}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
    </div>
  );
};
