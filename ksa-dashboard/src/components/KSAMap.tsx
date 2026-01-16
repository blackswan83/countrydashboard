import React, { useState, useCallback, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, Source, Layer } from 'react-map-gl';
import type { MapRef } from 'react-map-gl';
import { provinces, tierDefinitions, type ProvinceData } from '../data/ksaData';

// Mapbox public token - for production use environment variable
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

interface KSAMapProps {
  selectedProvince: string | null;
  onProvinceSelect: (provinceId: string | null) => void;
  colorMode?: 'tier' | 'diabetes' | 'obesity' | 'infrastructure';
}

// Saudi Arabia GeoJSON boundaries (simplified regions as circles for demo)
const getRegionColor = (province: ProvinceData, colorMode: string): string => {
  if (colorMode === 'tier') {
    return tierDefinitions[province.tier].color;
  }
  if (colorMode === 'diabetes') {
    if (province.diabetes > 8.5) return '#EF4444';
    if (province.diabetes > 7.5) return '#F59E0B';
    return '#10B981';
  }
  if (colorMode === 'obesity') {
    if (province.obesity > 29) return '#EF4444';
    if (province.obesity > 28) return '#F59E0B';
    return '#10B981';
  }
  if (colorMode === 'infrastructure') {
    if (province.bedsPerCapita < 23) return '#EF4444';
    if (province.bedsPerCapita < 27) return '#F59E0B';
    return '#10B981';
  }
  return '#3B82F6';
};

export const KSAMap: React.FC<KSAMapProps> = ({
  selectedProvince,
  onProvinceSelect,
  colorMode = 'tier',
}) => {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [popupInfo, setPopupInfo] = useState<ProvinceData | null>(null);

  const mapRef = React.useRef<MapRef>(null);

  // Initial viewport centered on Saudi Arabia
  const [viewState, setViewState] = useState({
    longitude: 45.0,
    latitude: 24.0,
    zoom: 4.8,
    pitch: 0,
    bearing: 0,
  });

  const handleMarkerClick = useCallback((provinceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const province = provinces[provinceId];
    setPopupInfo(province);
    onProvinceSelect(provinceId);

    // Fly to province
    mapRef.current?.flyTo({
      center: province.coordinates,
      zoom: 6,
      duration: 1500,
    });
  }, [onProvinceSelect]);

  const handleMapClick = useCallback(() => {
    setPopupInfo(null);
    onProvinceSelect(null);

    // Reset view
    mapRef.current?.flyTo({
      center: [45.0, 24.0],
      zoom: 4.8,
      duration: 1000,
    });
  }, [onProvinceSelect]);

  // Generate GeoJSON for region circles
  const regionsGeoJSON = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: Object.values(provinces).map(p => ({
      type: 'Feature' as const,
      properties: {
        id: p.id,
        name: p.name,
        tier: p.tier,
        color: getRegionColor(p, colorMode),
        population: p.population,
        radius: Math.sqrt(p.population / 100000) * 15000, // Scale radius by population
      },
      geometry: {
        type: 'Point' as const,
        coordinates: p.coordinates,
      },
    })),
  }), [colorMode]);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Kingdom of Saudi Arabia - Interactive Health Map</span>
        <span className="card-badge live">LIVE DATA</span>
      </div>
      <div className="map-container">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          onClick={handleMapClick}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
          attributionControl={false}
          maxBounds={[[30, 12], [60, 35]]}
        >
          <NavigationControl position="top-right" />

          {/* Circle layer for regions */}
          <Source id="regions" type="geojson" data={regionsGeoJSON}>
            <Layer
              id="region-circles"
              type="circle"
              paint={{
                'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['get', 'population'],
                  300000, 15,
                  1000000, 25,
                  5000000, 40,
                  8000000, 50,
                ],
                'circle-color': ['get', 'color'],
                'circle-opacity': [
                  'case',
                  ['==', ['get', 'id'], selectedProvince || ''],
                  0.9,
                  0.6,
                ],
                'circle-stroke-width': [
                  'case',
                  ['==', ['get', 'id'], selectedProvince || ''],
                  3,
                  1,
                ],
                'circle-stroke-color': [
                  'case',
                  ['==', ['get', 'id'], selectedProvince || ''],
                  '#F1F5F9',
                  'rgba(148, 163, 184, 0.3)',
                ],
              }}
            />
          </Source>

          {/* Province Markers */}
          {Object.values(provinces).map((province) => {
            const isSelected = selectedProvince === province.id;
            const isHovered = hoveredProvince === province.id;
            const color = getRegionColor(province, colorMode);

            return (
              <Marker
                key={province.id}
                longitude={province.coordinates[0]}
                latitude={province.coordinates[1]}
                anchor="center"
                onClick={(e) => handleMarkerClick(province.id, e as unknown as React.MouseEvent)}
              >
                <div
                  onMouseEnter={() => setHoveredProvince(province.id)}
                  onMouseLeave={() => setHoveredProvince(null)}
                  style={{
                    width: isSelected ? 16 : isHovered ? 14 : 12,
                    height: isSelected ? 16 : isHovered ? 14 : 12,
                    borderRadius: '50%',
                    backgroundColor: isSelected ? '#F1F5F9' : color,
                    border: `2px solid ${isSelected ? color : '#0A0F1A'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected || isHovered ? `0 0 12px ${color}` : 'none',
                  }}
                />
              </Marker>
            );
          })}

          {/* Popup for selected province */}
          {popupInfo && (
            <Popup
              longitude={popupInfo.coordinates[0]}
              latitude={popupInfo.coordinates[1]}
              anchor="bottom"
              onClose={() => {
                setPopupInfo(null);
                onProvinceSelect(null);
              }}
              closeButton={true}
              closeOnClick={false}
              offset={20}
            >
              <div style={{ minWidth: 200 }}>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: '#64748B' }}>{popupInfo.nameAr}</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{popupInfo.name}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>
                    Capital: {popupInfo.capital} | {(popupInfo.population / 1000000).toFixed(1)}M pop.
                  </div>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 8,
                  marginTop: 12,
                }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#64748B' }}>Diabetes</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: popupInfo.diabetes > 8 ? '#EF4444' : '#F1F5F9' }}>
                      {popupInfo.diabetes}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#64748B' }}>Obesity</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: popupInfo.obesity > 29 ? '#EF4444' : '#F1F5F9' }}>
                      {popupInfo.obesity}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#64748B' }}>Beds/10K</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: popupInfo.bedsPerCapita < 23 ? '#EF4444' : '#10B981' }}>
                      {popupInfo.bedsPerCapita}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#64748B' }}>Priority</div>
                    <div style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: tierDefinitions[popupInfo.tier].color,
                      background: `${tierDefinitions[popupInfo.tier].color}20`,
                      padding: '2px 8px',
                      borderRadius: 4,
                      display: 'inline-block',
                    }}>
                      {tierDefinitions[popupInfo.tier].label}
                    </div>
                  </div>
                </div>
              </div>
            </Popup>
          )}
        </Map>

        {/* Legend Overlay */}
        <div className="map-overlay bottom-left">
          <div className="map-legend">
            <div className="map-legend-title">
              {colorMode === 'tier' ? 'Priority Tier' :
               colorMode === 'diabetes' ? 'Diabetes Prevalence' :
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
                  <div className="map-legend-dot" style={{ backgroundColor: '#EF4444' }} />
                  <span>High Risk</span>
                </div>
                <div className="map-legend-item">
                  <div className="map-legend-dot" style={{ backgroundColor: '#F59E0B' }} />
                  <span>Moderate</span>
                </div>
                <div className="map-legend-item">
                  <div className="map-legend-dot" style={{ backgroundColor: '#10B981' }} />
                  <span>Lower Risk</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Province Label Overlay */}
        <div className="map-overlay top-right" style={{ marginTop: 50 }}>
          {selectedProvince && (
            <div className="map-legend" style={{
              background: 'rgba(22, 32, 50, 0.95)',
              textAlign: 'right',
            }}>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>
                {provinces[selectedProvince].nameAr}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9' }}>
                {provinces[selectedProvince].name}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KSAMap;
