import { type Express, type Request, type Response, type NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import MemoryStore from "memorystore";

export function setupAuth(app: Express) {
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      secret: "secret-key",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({ checkPeriod: 86400000 }),
      cookie: { secure: false },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // 1. Setup Google Strategy
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env");
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const username = profile.displayName || profile.emails?.[0]?.value || "user";
          const email = profile.emails?.[0]?.value || "";

          // Check if user exists
          let [user] = await db.select().from(users).where(eq(users.username, googleId));

          if (!user) {
            // Create new user if not found
            [user] = await db.insert(users).values({
              username: googleId, // We use Google ID as the unique username
              password: "google-login", // Placeholder password
              email: email,
              isVerified: true,
            }).returning();
          }
          return done(null, user);
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // 2. Define Routes
  
  // Start Login (This redirects you to Google)
  app.get("/api/login", passport.authenticate("google", { scope: ["profile", "email"] }));

  // Google Callback (Google sends you back here)
  app.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
      res.redirect("/"); // Success! Go to dashboard
    }
  );

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not logged in" });
    }
    res.json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  console.log("✅ Google Auth initialized successfully");
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}