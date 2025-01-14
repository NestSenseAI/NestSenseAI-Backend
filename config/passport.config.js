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
          // Check if user exists in Supabase
          let { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("google_id", googleId)
            .single();

          if (error && error.code !== "PGRST116") {
            // Handle unexpected database errors
            console.error("Supabase error:", error);
            return done(error, null);
          }

          if (!user) {
            // If user doesn't exist, create a new user
            const { data: newUser, error: insertError } = await supabase
              .from("users")
              .insert([
                {
                  google_id: googleId,
                  name: displayName,
                  email: emails[0].value,
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
          console.error("Error in Google authentication:", err);
          done(err, null);
        }
      }
    )
  );

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id); // Save the user ID in the session
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      // Fetch the user by ID from Supabase
      const { data: user, error } = await supabase
        .from("users")
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

