# 🌍 Emoji World Map

An interactive global emoji world map where users can explore countries and contribute by placing emojis that represent the vibe, culture, or stereotypes of each place.

## ✨ Features

- **Interactive World Map**: Built with Leaflet.js using minimalist CartoDB Light tiles
- **Emoji Placement**: Click anywhere on the map to add emojis
- **Smart Clustering**: Emojis cluster together at different zoom levels with the most common emoji shown
- **Emoji Search**: Search and filter emojis by categories (Popular, Food, Culture, Nature, Travel, Flags, Fun)
- **Real-time Updates**: See emoji additions from other users instantly with Supabase real-time
- **Count Tracking**: Multiple users adding the same emoji in the same area increments the count
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account (free tier available)

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up Supabase:**

   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `database/schema.sql` in your Supabase SQL Editor
   - Copy `env.example` to `.env` and add your Supabase credentials:
     ```bash
     cp env.example .env
     ```
   - Edit `.env` with your Supabase URL and anon key

3. **Start the development server:**

   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🎮 How to Use

1. **Explore the Map**: Zoom and pan around the world map
2. **Add Emojis**: Click anywhere on the map to open the emoji picker
3. **Search Emojis**: Use the search bar or category filters to find the perfect emoji
4. **View Clusters**: Zoom out to see emoji clusters, zoom in to see individual emojis
5. **See Counts**: Emojis with multiple contributions show a count badge

## 🛠️ Technical Details

### Tech Stack

- **Frontend**: React 18 (no TypeScript, as requested)
- **Backend**: Supabase (PostgreSQL database with real-time subscriptions)
- **Mapping**: Leaflet.js with react-leaflet
- **Clustering**: Leaflet.markercluster
- **Storage**: Supabase database with localStorage fallback
- **Styling**: Pure CSS with modern design

### Project Structure

```
src/
├── components/
│   ├── EmojiModal.js      # Emoji picker modal
│   └── EmojiMarkers.js    # Map markers and clustering logic
├── App.js                 # Main application component
├── index.js              # React entry point
└── index.css             # Global styles
```

### Key Features Implementation

- **Clustering**: Custom cluster icons show the most common emoji with a count
- **Emoji Categories**: 7 categories with popular emojis for each
- **Search**: Simple keyword-based emoji search
- **Persistence**: All emoji data stored in localStorage
- **Responsive**: Mobile-friendly design with touch support

## 🔮 Future Enhancements

The current MVP includes the core functionality. Potential future features could include:

- **Backend Integration**: Replace localStorage with Supabase/Firebase
- **Real-time Updates**: Live emoji additions from other users
- **Voting System**: Upvote/downvote emojis
- **User Profiles**: Optional login to track contributions
- **Moderation**: Rate limiting and spam prevention
- **Analytics**: Popular emojis and locations
- **Export**: Download emoji data as JSON

## 🎨 Design Philosophy

- **Minimalist**: Clean, uncluttered interface
- **Playful**: Fun emoji interactions with smooth animations
- **Accessible**: Good contrast, keyboard navigation, screen reader friendly
- **Fast**: Lightweight with efficient clustering for performance

## 📱 Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled

## 🤝 Contributing

This is an MVP built for demonstration. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Built with ❤️ for the global community to share their local vibes through emojis!**
