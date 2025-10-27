import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        claims: {
          sub: string;
          email?: string;
        };
      };
    }
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Simple login endpoint - for Railway deployment, this would be connected to your auth provider
  app.post("/api/login", async (req, res) => {
    try {
      const { email, userId } = req.body;
      
      if (!email || !userId) {
        return res.status(400).json({ message: "Email and userId required" });
      }

      // Upsert user in database
      const user = await storage.upsertUser({
        id: userId,
        email: email,
        firstName: null,
        lastName: null,
        profileImageUrl: null,
      });

      // Store user in session
      (req.session as any).user = {
        id: user.id,
        email: user.email,
      };

      res.json(user);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = (req.session as any)?.user;

  if (!user || !user.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Attach user info to request for convenience
  req.user = {
    claims: {
      sub: user.id,
      email: user.email,
    },
  } as any;

  next();
};
