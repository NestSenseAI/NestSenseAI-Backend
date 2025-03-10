const { createClient } = require("@supabase/supabase-js");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback", // Fix redirect_uri_mismatch
      },
      async (accessToken, refreshToken, profile, done) => {
        const { id: googleId, displayName, emails } = profile;

        try {
          console.log("🔹 Google Profile:", profile); // Debugging

          // Check if user exists in Supabase `login` table
          let { data: user, error } = await supabase
            .from("login")
            .select("id, google_id, name, email")
            .eq("google_id", googleId)
            .single();

          if (error && error.code !== "PGRST116") {
            console.error("❌ Supabase error:", error);
            return done(error, null);
          }

          if (!user) {
            console.log("ℹ️ User not found. Creating new user...");

            // Insert new user into the `login` table
            const { data: newUser, error: insertError } = await supabase
              .from("login")
              .insert([
                {
                  google_id: googleId,
                  name: displayName,
                  email: emails[0].value,
                  password_hash: "", // Google-authenticated users don’t need a password
                },
              ])
              .select("id, google_id, name, email")
              .single();

            if (insertError) {
              console.error("❌ Error inserting user:", insertError);
              return done(insertError, null);
            }

            user = newUser;
            console.log("✅ New user created:", user);
          } else {
            console.log("✅ Existing user logged in:", user);
          }

          return done(null, user);
        } catch (err) {
          console.error("❌ Error during Google authentication:", err);
          return done(err, null);
        }
      }
    )
  );

  // Serialize user by storing `google_id` in session
  passport.serializeUser((user, done) => {
    console.log("ℹ️ Serializing user:", user.google_id);
    done(null, user.google_id);
  });

  // Deserialize user by fetching from Supabase using `google_id`
  passport.deserializeUser(async (googleId, done) => {
    try {
      console.log("ℹ️ Deserializing user:", googleId);

      const { data: user, error } = await supabase
        .from("login")
        .select("id, google_id, name, email")
        .eq("google_id", googleId)
        .single();

      if (error) {
        console.error("❌ Error fetching user during deserialization:", error);
        return done(error, null);
      }

      console.log("✅ User deserialized:", user);
      return done(null, user);
    } catch (err) {
      console.error("❌ Error during deserialization:", err);
      return done(err, null);
    }
  });
};
