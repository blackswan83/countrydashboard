import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { provinces, tierDefinitions, type ProvinceData } from '../data/ksaData';
import 'leaflet/dist/leaflet.css';

interface KSAMapProps {
  selectedProvince: string | null;
  onProvinceSelect: (provinceId: string | null) => void;
  colorMode?: 'tier' | 'diabetes' | 'obesity' | 'infrastructure';
}

const getRegionColor = (province: ProvinceData, colorMode: string): string => {
  if (colorMode === 'tier') {
    return tierDefinitions[province.tier].color;
  }
  if (colorMode === 'diabetes') {
    if (province.diabetes > 8.5) return '#C75B5B';
    if (province.diabetes > 7.5) return '#D4A574';
    return '#4A7C59';
  }
  if (colorMode === 'obesity') {
    if (province.obesity > 29) return '#C75B5B';
    if (province.obesity > 28) return '#D4A574';
    return '#4A7C59';
  }
  if (colorMode === 'infrastructure') {
    if (province.bedsPerCapita < 23) return '#C75B5B';
    if (province.bedsPerCapita < 27) return '#D4A574';
    return '#4A7C59';
  }
  return '#8B7355';
};

// Component to handle map click for deselecting
function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  const map = useMap();
  map.on('click', onMapClick);
  return null;
}

// Component to fly to selected province
function FlyToProvince({ province }: { province: ProvinceData | null }) {
  const map = useMap();
  if (province) {
    map.flyTo([province.coordinates[1], province.coordinates[0]], 7, { duration: 1 });
  }
  return null;
}

export const KSAMap: React.FC<KSAMapProps> = ({
  selectedProvince,
  onProvinceSelect,
  colorMode = 'tier',
}) => {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  const selectedProvinceData = selectedProvince ? provinces[selectedProvince] : null;

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Kingdom of Saudi Arabia - Health Map</span>
        <span className="card-badge live">LIVE DATA</span>
      </div>
      <div className="map-container">
        <MapContainer
          center={[24.0, 45.0]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          maxBounds={[[12, 30], [35, 60]]}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onMapClick={() => onProvinceSelect(null)} />
          <FlyToProvince province={selectedProvinceData} />

          {Object.values(provinces).map((province) => {
            const isSelected = selectedProvince === province.id;
            const isHovered = hoveredProvince === province.id;
            const color = getRegionColor(province, colorMode);
            const radius = Math.sqrt(province.population / 100000) * 2.5;

            return (
              <CircleMarker
                key={province.id}
                center={[province.coordinates[1], province.coordinates[0]]}
                radius={isSelected ? radius + 5 : isHovered ? radius + 3 : radius}
                pathOptions={{
                  color: isSelected ? '#3D3D3D' : color,
                  fillColor: color,
                  fillOpacity: isSelected ? 0.9 : isHovered ? 0.8 : 0.6,
                  weight: isSelected ? 3 : isHovered ? 2 : 1,
                }}
                eventHandlers={{
                  click: (e) => {
                    e.originalEvent.stopPropagation();
                    onProvinceSelect(province.id);
                  },
                  mouseover: () => setHoveredProvince(province.id),
                  mouseout: () => setHoveredProvince(null),
                }}
              >
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 11, color: '#C4A77D' }}>{province.nameAr}</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#3D3D3D' }}>{province.name}</div>
                      <div style={{ fontSize: 12, color: '#6B6B6B' }}>
                        Capital: {province.capital} | {(province.population / 1000000).toFixed(1)}M
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 10, color: '#8B8B8B' }}>Diabetes</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: province.diabetes > 8 ? '#C75B5B' : '#3D3D3D' }}>
                          {province.diabetes}%
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#8B8B8B' }}>Obesity</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: province.obesity > 29 ? '#C75B5B' : '#3D3D3D' }}>
                          {province.obesity}%
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#8B8B8B' }}>Beds/10K</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: province.bedsPerCapita < 23 ? '#C75B5B' : '#4A7C59' }}>
                          {province.bedsPerCapita}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#8B8B8B' }}>Priority</div>
                        <div style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: tierDefinitions[province.tier].color,
                          background: `${tierDefinitions[province.tier].color}20`,
                          padding: '2px 6px',
                          borderRadius: 4,
                          display: 'inline-block',
                        }}>
                          {tierDefinitions[province.tier].label}
                        </div>
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Legend */}
        <div className="map-overlay bottom-left">
          <div className="map-legend">
            <div className="map-legend-title">
              {colorMode === 'tier' ? 'Priority Tier' :
               colorMode === 'diabetes' ? 'Diabetes Rate' :
               colorMode === 'obesity' ? 'Obesity Rate' : 'Infrastructure'}
            </div>
            {colorMode === 'tier' ? (
              Object.entries(tierDefinitions).map(([tier, def]) => (
                <div key={tier} className="map-legend-item">
                  <div className="map-legend-dot" style={{ backgroundColor: def.color }} />
                  <span>{def.label}</span>
                </div>
              ))
            ) : (
              <>
                <div className="map-legend-item">
                  <div className="map-legend-dot" style={{ backgroundColor: '#C75B5B' }} />
                  <span>High Risk</span>
                </div>
                <div className="map-legend-item">
                  <div className="map-legend-dot" style={{ backgroundColor: '#D4A574' }} />
                  <span>Moderate</span>
                </div>
                <div className="map-legend-item">
                  <div className="map-legend-dot" style={{ backgroundColor: '#4A7C59' }} />
                  <span>Lower Risk</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Selected Province Label */}
        {selectedProvince && (
          <div className="map-overlay top-right">
            <div className="map-legend" style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#C4A77D' }}>
                {provinces[selectedProvince].nameAr}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#3D3D3D' }}>
                {provinces[selectedProvince].name}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KSAMap;
