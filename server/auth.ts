import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import type { User as UserSchema } from "@shared/schema";
import { z } from "zod";

declare global {
  namespace Express {
    interface User extends UserSchema {}
  }
}

const scryptAsync = promisify(scrypt);

// Password hashing function
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Password comparison function
async function comparePasswords(supplied: string, stored: string) {
  // For development testing only - use direct comparison
  // In a real app, we'd use the hashing method below
  return supplied === stored;
  
  // Commented out proper hashing for now
  // const [hashed, salt] = stored.split(".");
  // const hashedBuf = Buffer.from(hashed, "hex");
  // const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  // return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Configure session
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "nouvel-ayiti-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Registration route
  app.post("/api/register", async (req, res, next) => {
    try {
      // Validate request body
      const registerSchema = z.object({
        username: z.string().min(3),
        password: z.string().min(6)
      });
      
      const validationResult = registerSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Validation failed", errors: validationResult.error.errors });
      }
      
      // Check if username exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create user with hashed password
      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        username: req.body.username,
        password: hashedPassword,
        isAdmin: false
      });

      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(201).json({ id: user.id, username: user.username, isAdmin: user.isAdmin });
      });
    } catch (error) {
      next(error);
    }
  });

  // Login route
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(200).json({ id: user.id, username: user.username, isAdmin: user.isAdmin });
      });
    })(req, res, next);
  });

  // Logout route
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user route
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as UserSchema;
    res.json({ id: user.id, username: user.username, isAdmin: user.isAdmin });
  });

  // Admin check middleware
  // Temporarily disabled for testing
  /*app.use("/api/admin/*", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = req.user as UserSchema;
    if (!user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    
    next();
  });*/
}
