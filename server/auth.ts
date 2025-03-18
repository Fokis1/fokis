import { getAuth, signInWithRedirect, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, getRedirectResult } from "firebase/auth";
import session from "express-session";
import createMemoryStore from "memorystore";
import express, { Request, Response, NextFunction } from "express";
import { auth, googleProvider } from "./firebase.config"; // Inpòte Firebase Auth ak Google Provider

const MemoryStore = createMemoryStore(session);

// Ekstann tip SessionData pou ajoute atribi userId
declare module "express-session" {
  interface SessionData {
    userId?: string; // Ajoute atribi userId nan sesyon an
  }
}

// Konfigirasyon sesyon
export function setupAuth(app: express.Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "nouvel-ayiti-secret", // Sekrè pou sesyon an
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000, // Netwaye sesyon ki ekspire chak 24 èdtan
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // Sesyon an dure 1 semèn
      secure: process.env.NODE_ENV === "production", // Cookie secure nan pwodiksyon
      httpOnly: true, // Cookie pa aksesib nan JavaScript
    },
  };

  app.set("trust proxy", 1); // Sipoze ke w dèyè yon proxy (pa egzanp, Heroku)
  app.use(session(sessionSettings)); // Enstale middleware sesyon an

  // === GOOGLE SIGN-IN ===
  app.post("/api/auth/google", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider); // Konekte ak Google Sign-In
      res.status(200).json({ message: "Redirecting to Google sign-in." });
    } catch (error) {
      next(error); // Pase erè a nan middleware erè a
    }
  });

  app.get("/api/auth/google/callback", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        const user = result.user;

        // Stòk ID itilizatè nan sesyon an
        req.session.userId = user.uid;

        // Renmen yon repons JSON ak enfòmasyon itilizatè a
        res.status(200).json({
          id: user.uid,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
        });
      } else {
        res.status(400).json({ message: "No redirect result found." });
      }
    } catch (error) {
      next(error); // Pase erè a nan middleware erè a
    }
  });

  // === REGISTER WITH EMAIL/PASSWORD ===
  app.post("/api/auth/register", async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Verifye si email ak modpas yo egziste
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Stòk ID itilizatè nan sesyon an
      req.session.userId = user.uid;

      // Renmen yon repons JSON ak enfòmasyon itilizatè a
      res.status(201).json({
        id: user.uid,
        email: user.email,
      });
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        return res.status(400).json({ message: "Email already in use." });
      }
      next(error); // Pase erè a nan middleware erè a
    }
  });

  // === LOGIN WITH EMAIL/PASSWORD ===
  app.post("/api/auth/login", async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Verifye si email ak modpas yo egziste
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Stòk ID itilizatè nan sesyon an
      req.session.userId = user.uid;

      // Renmen yon repons JSON ak enfòmasyon itilizatè a
      res.status(200).json({
        id: user.uid,
        email: user.email,
      });
    } catch (error: any) {
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        return res.status(401).json({ message: "Invalid email or password." });
      }
      next(error); // Pase erè a nan middleware erè a
    }
  });

  // === LOGOUT ===
  app.post("/api/auth/logout", (req: Request, res: Response, next: NextFunction) => {
    req.session.destroy((err) => {
      if (err) return next(err); // Pase erè a nan middleware erè a

      // Dekonekte itilizatè a nan Firebase
      signOut(auth)
        .then(() => res.sendStatus(200)) // Renmen yon repons 200 OK
        .catch(next); // Pase erè a nan middleware erè a
    });
  });

  // === GET CURRENT USER ===
  app.get("/api/auth/user", (req: Request, res: Response) => {
    const userId = req.session.userId;

    // Verifye si itilizatè a konekte
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    // Renmen enfòmasyon itilizatè a
    const user = auth.currentUser;
    if (user) {
      res.json({
        id: user.uid,
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
      });
    } else {
      res.status(401).json({ message: "User not found." });
    }
  });

  // === LISTEN FOR AUTH STATE CHANGES ===
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User signed in:", user.uid);
    } else {
      console.log("User signed out.");
    }
  });
}

export { app as authApp };