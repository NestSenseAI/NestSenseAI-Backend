const { createClient } = require("@supabase/supabase-js");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

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
          let { data: user, error } = await supabase
            .from("login")
            .select("*")
            .eq("google_id", googleId)
            .single();

          if (!user) {
            const { data: newUser, error: insertError } = await supabase
              .from("login")
              .insert([{ google_id: googleId, name: displayName, email: emails[0].value }])
              .select()
              .single();

            if (insertError) throw insertError;
            user = newUser;
          }

          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const { data: user, error } = await supabase
      .from("login")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return done(error, null);
    done(null, user);
  });
};
 
