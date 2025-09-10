import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";

function EmojiMarkers({ emojis }) {
  const map = useMap();

  useEffect(() => {
    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.MarkerClusterGroup) {
        map.removeLayer(layer);
      }
    });

    if (emojis.length === 0) return;

    // Create marker cluster group with custom options
    const markerClusterGroup = L.markerClusterGroup({
      // Custom cluster icon creation
      iconCreateFunction: function (cluster) {
        const childCount = cluster.getChildCount();
        const markers = cluster.getAllChildMarkers();

        // Get the most common emoji in this cluster
        const emojiCounts = {};
        markers.forEach((marker) => {
          const emoji = marker.options.emoji;
          emojiCounts[emoji] =
            (emojiCounts[emoji] || 0) + (marker.options.count || 1);
        });

        const mostCommonEmoji = Object.keys(emojiCounts).reduce((a, b) =>
          emojiCounts[a] > emojiCounts[b] ? a : b
        );

        return L.divIcon({
          html: `<div style="
            background: rgba(255,255,255,0.9);
            border: 2px solid #3388ff;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            position: relative;
          ">
            ${mostCommonEmoji}
            <span style="
              position: absolute;
              bottom: -5px;
              right: -5px;
              background: #3388ff;
              color: white;
              border-radius: 50%;
              width: 18px;
              height: 18px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              font-weight: bold;
            ">${childCount}</span>
          </div>`,
          className: "custom-cluster-icon",
          iconSize: L.point(40, 40),
        });
      },
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 50,
      disableClusteringAtZoom: 10,
    });

    // Create markers for each emoji
    emojis.forEach((emojiData) => {
      // Create custom emoji icon
      const emojiIcon = L.divIcon({
        html: `<div style="
          font-size: 28px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          position: relative;
        ">
          ${emojiData.emoji}
          ${
            emojiData.count > 1
              ? `
            <span style="
              position: absolute;
              bottom: -5px;
              right: -5px;
              background: #ff6b6b;
              color: white;
              border-radius: 50%;
              width: 16px;
              height: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              font-weight: bold;
              border: 2px solid white;
            ">${emojiData.count}</span>
          `
              : ""
          }
        </div>`,
        className: "emoji-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([emojiData.lat, emojiData.lng], {
        icon: emojiIcon,
        emoji: emojiData.emoji,
        count: emojiData.count,
      });

      // Add tooltip
      const tooltipText =
        emojiData.count > 1
          ? `${emojiData.emoji} Added ${emojiData.count} times`
          : `${emojiData.emoji} Added by 1 user`;

      marker.bindTooltip(tooltipText, {
        direction: "top",
        offset: [0, -10],
        className: "emoji-tooltip",
      });

      markerClusterGroup.addLayer(marker);
    });

    map.addLayer(markerClusterGroup);

    // Cleanup function
    return () => {
      map.eachLayer((layer) => {
        if (layer instanceof L.MarkerClusterGroup) {
          map.removeLayer(layer);
        }
      });
    };
  }, [map, emojis]);

  return null;
}

export default EmojiMarkers;
