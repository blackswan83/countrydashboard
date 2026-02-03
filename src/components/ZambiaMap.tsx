import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { provinces, tierDefinitions, type ProvinceData } from '../data/zambiaData';
import 'leaflet/dist/leaflet.css';

interface ZambiaMapProps {
  selectedProvince: string | null;
  onProvinceSelect: (provinceId: string | null) => void;
  colorMode?: 'tier' | 'hiv' | 'malaria' | 'infrastructure';
  darkMode?: boolean;
}

// Theme-aware colors
const getThemeColors = (darkMode: boolean) => ({
  textPrimary: darkMode ? '#E8E6E3' : '#3D3D3D',
  textSecondary: darkMode ? '#9CA3AF' : '#6B6B6B',
  textMuted: darkMode ? '#6B7280' : '#8B8B8B',
  gold: darkMode ? '#D4B896' : '#C4A77D',
  danger: darkMode ? '#E06B6B' : '#C75B5B',
  success: darkMode ? '#5B9A6E' : '#4A7C59',
  warning: darkMode ? '#E8B584' : '#D4A574',
  popupBg: darkMode ? '#1E2A3A' : '#FFFFFF',
});

const getRegionColor = (province: ProvinceData, colorMode: string): string => {
  if (colorMode === 'tier') {
    return tierDefinitions[province.tier].color;
  }
  if (colorMode === 'hiv') {
    if (province.hiv > 13) return '#C75B5B';
    if (province.hiv > 10) return '#D4A574';
    return '#4A7C59';
  }
  if (colorMode === 'malaria') {
    if (province.malaria > 350) return '#C75B5B';
    if (province.malaria > 250) return '#D4A574';
    return '#4A7C59';
  }
  if (colorMode === 'infrastructure') {
    if (province.bedsPerCapita < 8) return '#C75B5B';
    if (province.bedsPerCapita < 12) return '#D4A574';
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

export const ZambiaMap: React.FC<ZambiaMapProps> = ({
  selectedProvince,
  onProvinceSelect,
  colorMode = 'tier',
  darkMode = false,
}) => {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const colors = getThemeColors(darkMode);

  const selectedProvinceData = selectedProvince ? provinces[selectedProvince] : null;

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Republic of Zambia - Health Map</span>
        <span className="card-badge live">LIVE DATA</span>
      </div>
      <div className="map-container">
        <MapContainer
          center={[-13.1, 27.8]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          maxBounds={[[-18, 22], [-8, 33.5]]}
        >
          <TileLayer
            attribution={darkMode
              ? '&copy; <a href="https://carto.com/">CARTO</a>'
              : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }
            url={darkMode
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            }
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
                  color: isSelected ? (darkMode ? '#E4E8EC' : '#3D3D3D') : (darkMode ? '#E4E8EC' : color),
                  fillColor: color,
                  fillOpacity: isSelected ? 0.9 : isHovered ? 0.85 : 0.75,
                  weight: isSelected ? 3 : isHovered ? 2 : 1.5,
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
                  <div style={{ minWidth: 180, background: colors.popupBg, margin: -13, padding: 13, borderRadius: 4 }}>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: colors.textPrimary }}>{province.name}</div>
                      <div style={{ fontSize: 12, color: colors.textSecondary }}>
                        Capital: {province.capital} | {(province.population / 1000000).toFixed(1)}M
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 10, color: colors.textMuted }}>HIV Prev.</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: province.hiv > 13 ? colors.danger : colors.textPrimary }}>
                          {province.hiv}%
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: colors.textMuted }}>Malaria</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: province.malaria > 350 ? colors.danger : colors.textPrimary }}>
                          {province.malaria}/1K
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: colors.textMuted }}>Beds/10K</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: province.bedsPerCapita < 8 ? colors.danger : colors.success }}>
                          {province.bedsPerCapita}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: colors.textMuted }}>Priority</div>
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
               colorMode === 'hiv' ? 'HIV Prevalence' :
               colorMode === 'malaria' ? 'Malaria Incidence' : 'Infrastructure'}
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
              <div style={{ fontSize: 16, fontWeight: 600, color: colors.textPrimary }}>
                {provinces[selectedProvince].name}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZambiaMap;
