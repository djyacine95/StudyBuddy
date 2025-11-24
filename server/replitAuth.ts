import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { Express } from "express";
import { storage } from "./storage";

// 🔴 IMPORTANT: Update this to your ACTUAL Frontend URL (No trailing slash)
// Example: "https://studybuddy-client.onrender.com"
const FRONTEND_URL = "https://studybuddy-client-vxmb.onrender.com/"; 

export function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  const PgSession = connectPg(session);
  
  // 1. Setup Session (Database storage for login cookies)
  app.use(session({
   store: new PgSession({ 
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,  // 🟢 Force creation
      tableName: 'user_sessions'   // 🟢 New unique name to avoid conflicts
    }),
    secret: process.env.SESSION_SECRET || "super_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: app.get("env") === "production" // True if on HTTPS (Render)
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // 2. Setup Google Login Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "https://studybuddy-f5rz.onrender.com/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Save or update user in your database
      // We map Google's data fields to your database fields
      const user = await storage.upsertUser({
        id: profile.id,
        email: profile.emails?.[0].value || "",
        firstName: profile.name?.givenName || "",
        lastName: profile.name?.familyName || "",
        profileImageUrl: profile.photos?.[0].value || ""
      });
      done(null, user);
    } catch (err) {
      done(err);
    }
  }));

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  // 3. Define Routes
  
  // When user clicks "Login", send them to Google
  app.get("/api/login", passport.authenticate("google", { scope: ["profile", "email"] }));

  // When Google sends them back, handle it
  app.get("/api/auth/google/callback",
    passport.authenticate("google", { 
      failureRedirect: FRONTEND_URL + "/" 
    }),
    (req, res) => {
      // Success! Go back to the Frontend Dashboard
      res.redirect(FRONTEND_URL + "/");
    }
  );

  app.get("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.redirect(FRONTEND_URL + "/");
    });
  });
}
// Helper function to check if user is logged in
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}