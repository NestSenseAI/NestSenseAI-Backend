const { createClient } = require("@supabase/supabase-js");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        const { id: googleId, displayName, emails } = profile;

        try {
          console.log(profile); // Debugging line to check profile data

          // Check if user exists in Supabase `login` table
          let { data: user, error } = await supabase
            .from("login")
            .select("*")
            .eq("google_id", googleId)
            .single();

          if (error && error.code !== "PGRST116") {
            console.error("Supabase error:", error);
            return done(error, null);
          }

          if (!user) {
            // If user doesn't exist, insert a new record
            const { data: newUser, error: insertError } = await supabase
              .from("login")
              .insert([
                {
                  google_id: googleId,
                  name: displayName,
                  email: emails[0].value,
                  password_hash: "", // Use an empty string or placeholder for Google-authenticated users
                },
              ])
              .select()
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

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id); // Save user ID in session
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const { data: user, error } = await supabase
        .from("login")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching user:", error);
        return done(error, null);
      }

      done(null, user);
    } catch (err) {
      console.error("Error during deserialization:", err);
      done(err, null);
    }
  });
};
