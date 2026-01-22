import React, { useState, useRef, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet Icon Issue
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationSelector = ({ onLocationSelect, initialLat, initialLon }) => {
    // State for Map Position
    const [position, setPosition] = useState({ 
        lat: parseFloat(initialLat) || 6.9271, 
        lng: parseFloat(initialLon) || 79.8612 
    });
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const markerRef = useRef(null);

    // Notify parent component when position changes
    useEffect(() => {
        onLocationSelect(position.lat.toFixed(5), position.lng.toFixed(5));
    }, [position, onLocationSelect]);

    // --- 1. GET CURRENT LOCATION (Auto-GPS) ---
    const handleGetCurrentLocation = () => {
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPos = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    };
                    setPosition(newPos); // Updates Map & Marker
                    setLoading(false);
                },
                (error) => {
                    console.error("GPS Error:", error);
                    alert("Could not get location. Please allow GPS access or use the search bar.");
                    setLoading(false);
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
            setLoading(false);
        }
    };

    // --- 2. SEARCH FUNCTION (Nominatim) ---
    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const newPos = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                setPosition(newPos);
            } else {
                alert("Location not found. Try a broader search.");
            }
        } catch (error) {
            console.error("Search Error:", error);
            alert("Connection error.");
        }
        setLoading(false);
    };

    // --- 3. DRAGGABLE MARKER LOGIC ---
    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    setPosition(marker.getLatLng());
                }
            },
        }),
        []
    );

    // --- 4. MAP RE-CENTER HELPER ---
    // This moves the camera whenever 'position' state changes (via Search OR GPS)
    function RecenterMap({ lat, lng }) {
        const map = useMapEvents({});
        useEffect(() => {
            map.flyTo([lat, lng], 18); // Smooth animation to new spot
        }, [lat, lng, map]);
        return null;
    }

    return (
        <div className="location-selector" style={{ marginBottom: '20px' }}>
            <label style={{display:'block', marginBottom:'8px', fontWeight:'bold', color: '#2c3e50'}}>
                📍 Step 1: Pinpoint Your Roof
            </label>
            
            {/* CONTROLS CONTAINER */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                
                {/* BUTTON: USE MY LOCATION */}
                <button 
                    onClick={handleGetCurrentLocation}
                    className="btn-location"
                    style={{
                        background: '#27ae60', color: 'white', border: 'none', 
                        padding: '8px 12px', borderRadius: '4px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold'
                    }}
                >
                   ➤ Use Current Location
                </button>

                {/* SEARCH BAR */}
                <div style={{ flex: 1, display: 'flex', gap: '5px' }}>
                    <input 
                        type="text" 
                        placeholder="Or search city (e.g. Kandy)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <button 
                        onClick={handleSearch}
                        disabled={loading}
                        style={{ background: '#3498db', color: 'white', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Find
                    </button>
                </div>
            </div>

            {/* MAP CONTAINER */}
            <div style={{ height: '320px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '2px solid #ddd', position: 'relative' }}>
                {loading && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(255,255,255,0.8)', zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <span style={{fontWeight:'bold', color:'#333'}}>Finding Location...</span>
                    </div>
                )}

                <MapContainer center={position} zoom={18} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker 
                        draggable={true} 
                        eventHandlers={eventHandlers} 
                        position={position} 
                        ref={markerRef}
                    >
                    </Marker>
                    <RecenterMap lat={position.lat} lng={position.lng} />
                </MapContainer>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px', textAlign: 'center' }}>
                * <strong>Drag the blue pin</strong> exactly to the center of your roof for 100% accuracy.
            </p>
        </div>
    );
};

export default LocationSelector;