import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase environment variables. Please check your .env file."
  );
  console.log("Required variables:");
  console.log("- REACT_APP_SUPABASE_URL");
  console.log("- REACT_APP_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database helper functions for emoji operations
export const emojiService = {
  // Fetch all emojis from database
  async getAllEmojis() {
    try {
      const { data, error } = await supabase
        .from("emojis")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching emojis:", error);
      return [];
    }
  },

  // Add a new emoji or increment existing one
  async addEmoji(emoji, lat, lng) {
    try {
      // Check if similar emoji exists in the same area (within ~1km)
      const { data: existingEmojis, error: searchError } = await supabase
        .from("emojis")
        .select("*")
        .eq("emoji", emoji)
        .gte("lat", lat - 0.01)
        .lte("lat", lat + 0.01)
        .gte("lng", lng - 0.01)
        .lte("lng", lng + 0.01);

      if (searchError) throw searchError;

      if (existingEmojis && existingEmojis.length > 0) {
        // Increment existing emoji count
        const existingEmoji = existingEmojis[0];
        const { data, error } = await supabase
          .from("emojis")
          .update({
            count: existingEmoji.count + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingEmoji.id)
          .select();

        if (error) throw error;
        return data[0];
      } else {
        // Create new emoji entry
        const { data, error } = await supabase
          .from("emojis")
          .insert([
            {
              emoji: emoji,
              lat: lat,
              lng: lng,
              count: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select();

        if (error) throw error;
        return data[0];
      }
    } catch (error) {
      console.error("Error adding emoji:", error);
      throw error;
    }
  },

  // Subscribe to real-time emoji updates
  subscribeToEmojis(callback) {
    const subscription = supabase
      .channel("emojis")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "emojis",
        },
        (payload) => {
          console.log("Real-time update:", payload);
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  },

  // Unsubscribe from real-time updates
  unsubscribe(subscription) {
    supabase.removeChannel(subscription);
  },
};
