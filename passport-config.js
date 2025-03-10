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
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        const { id: googleId, displayName, emails } = profile;

        try {
          console.log("Google Profile:", profile);

          // Check if user exists in Supabase `login` table
          let { data: user, error } = await supabase
            .from("login")
            .select("id, google_id, name, email")
            .eq("google_id", googleId)
            .single();

          if (error && error.code !== "PGRST116") {
            console.error("Supabase error:", error);
            return done(error, null);
          }

          if (!user) {
            // Insert a new user
            const { data: newUser, error: insertError } = await supabase
              .from("login")
              .insert([
                {
                  google_id: googleId,
                  name: displayName,
                  email: emails[0].value,
                  password_hash: "", // No password needed for Google-authenticated users
                },
              ])
              .select("id, google_id, name, email")
              .single();

            if (insertError) {
              console.error("Error inserting user:", insertError);
              return done(insertError, null);
            }

            user = newUser;
          }

          done(null, user);
        } catch (err) {
          console.error("Error during Google authentication:", err);
          done(err, null);
        }
      }
    )
  );

  // Serialize user by storing `google_id`
  passport.serializeUser((user, done) => {
    done(null, user.google_id);
  });

  // Deserialize user by fetching from Supabase using `google_id`
  passport.deserializeUser(async (googleId, done) => {
    try {
      const { data: user, error } = await supabase
        .from("login")
        .select("id, google_id, name, email")
        .eq("google_id", googleId)
        .single();

      if (error) {
        console.error("Error fetching user during deserialization:", error);
        return done(error, null);
      }

      done(null, user);
    } catch (err) {
      console.error("Error during deserialization:", err);
      done(err, null);
    }
  });
};
