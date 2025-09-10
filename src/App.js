import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import EmojiModal from "./components/EmojiModal";
import EmojiMarkers from "./components/EmojiMarkers";
import { emojiService } from "./lib/supabase";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}

function App() {
  const [emojis, setEmojis] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingEmoji, setAddingEmoji] = useState(false);

  // Load emojis from Supabase on component mount
  useEffect(() => {
    const loadEmojis = async () => {
      try {
        setLoading(true);
        const data = await emojiService.getAllEmojis();
        setEmojis(data);
        setError(null);
      } catch (err) {
        console.error("Error loading emojis from Supabase:", err);
        setError("Failed to load emojis. Using offline mode.");

        // Fallback to localStorage if Supabase fails
        const savedEmojis = localStorage.getItem("emojiWorldMap");
        if (savedEmojis) {
          try {
            setEmojis(JSON.parse(savedEmojis));
          } catch (parseError) {
            console.error("Error parsing localStorage emojis:", parseError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadEmojis();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = emojiService.subscribeToEmojis((payload) => {
      console.log("Real-time update received:", payload);

      if (payload.eventType === "INSERT") {
        setEmojis((prev) => {
          // Check if we already have this emoji to avoid duplicates
          const exists = prev.some((emoji) => emoji.id === payload.new.id);
          if (exists) return prev;
          return [...prev, payload.new];
        });
      } else if (payload.eventType === "UPDATE") {
        setEmojis((prev) =>
          prev.map((emoji) =>
            emoji.id === payload.new.id ? payload.new : emoji
          )
        );
      } else if (payload.eventType === "DELETE") {
        setEmojis((prev) =>
          prev.filter((emoji) => emoji.id !== payload.old.id)
        );
      }
    });

    // Cleanup subscription on component unmount
    return () => {
      emojiService.unsubscribe(subscription);
    };
  }, []);

  // Backup to localStorage (fallback for offline use)
  useEffect(() => {
    if (emojis.length > 0) {
      localStorage.setItem("emojiWorldMap", JSON.stringify(emojis));
    }
  }, [emojis]);

  const handleMapClick = (latlng) => {
    setClickedLocation(latlng);
    setShowModal(true);
  };

  const handleAddEmoji = async (emoji) => {
    if (emoji && clickedLocation) {
      setAddingEmoji(true);
      try {
        // Add emoji to Supabase (handles deduplication automatically)
        const result = await emojiService.addEmoji(
          emoji,
          clickedLocation.lat,
          clickedLocation.lng
        );

        // Immediately update local state for instant feedback
        if (result) {
          // Check if this is an update (existing emoji) or new emoji
          const existingEmojiIndex = emojis.findIndex(
            (e) => e.id === result.id
          );

          if (existingEmojiIndex !== -1) {
            // Update existing emoji
            setEmojis((prev) =>
              prev.map((e) => (e.id === result.id ? result : e))
            );
          } else {
            // Add new emoji
            setEmojis((prev) => [...prev, result]);
          }
        }
      } catch (error) {
        console.error("Error adding emoji to Supabase:", error);
        setError("Failed to add emoji. Please try again.");

        // Fallback to localStorage behavior
        const newEmoji = {
          id: Date.now() + Math.random(),
          emoji: emoji,
          lat: clickedLocation.lat,
          lng: clickedLocation.lng,
          created_at: new Date().toISOString(),
          count: 1,
        };

        const existingEmojiIndex = emojis.findIndex(
          (e) =>
            e.emoji === emoji &&
            Math.abs(e.lat - clickedLocation.lat) < 0.01 &&
            Math.abs(e.lng - clickedLocation.lng) < 0.01
        );

        if (existingEmojiIndex !== -1) {
          const updatedEmojis = [...emojis];
          updatedEmojis[existingEmojiIndex].count += 1;
          setEmojis(updatedEmojis);
        } else {
          setEmojis((prev) => [...prev, newEmoji]);
        }
      } finally {
        setAddingEmoji(false);
      }
    }

    setShowModal(false);
    setClickedLocation(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setClickedLocation(null);
  };

  return (
    <div className="App">
      <div className="app-header">
        <h1>🌍 Emoji World Map</h1>
        <p>Click anywhere to add an emoji!</p>
        {loading && (
          <p style={{ fontSize: "12px", color: "#666" }}>Loading emojis...</p>
        )}
        {error && <p style={{ fontSize: "12px", color: "#ff6b6b" }}>{error}</p>}
      </div>

      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={18}
        style={{ height: "100vh", width: "100vw" }}
        worldCopyJump={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        <MapClickHandler onMapClick={handleMapClick} />
        <EmojiMarkers emojis={emojis} />
      </MapContainer>

      {showModal && (
        <EmojiModal
          onAddEmoji={handleAddEmoji}
          onClose={handleCloseModal}
          isLoading={addingEmoji}
        />
      )}
    </div>
  );
}

export default App;
