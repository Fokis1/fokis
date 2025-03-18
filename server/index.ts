import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from "cors"; // Enpòte CORS middleware
import { setupAuth } from "./auth"; // Enpòte setupAuth pou ajoute wout otantifikasyon yo
import winston from "winston";

// Configurez winston pour enregistrer les logs
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'server.log' })
    ]
});

// Exemple de log
logger.info('Serveur démarré...');

const app = express();

// === MIDDLEWARE ===
app.use(cors()); // Pèmèt demann ki soti nan lòt domèn
app.use(express.json()); // Pèmèt analize kò JSON nan demann yo
app.use(express.urlencoded({ extended: false })); // Pèmèt analize kò URL-encoded

// Middleware pou log demann yo
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// === DEMARE SÈVÈ A ===
(async () => {
  try {
    const server = await registerRoutes(app); // Enrejistre tout wout yo

    // Middleware pou jere erè
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      log(`Error: ${message}`);
      res.status(status).json({ message }); // Renmen yon repons JSON ak mesaj erè a
    });

    // Configure Vite oswa static serving
    if (app.get("env") === "development") {
      await setupVite(app, server); // Sèvi ak Vite nan devlopman
    } else {
      serveStatic(app); // Sèvi ak fichye statik nan pwodiksyon
    }

    // Defini pò
    const port = 5000;
    server.listen(port, "127.0.0.1", () => {
      log(`Server is running on http://127.0.0.1:${port}`);
    });
  } catch (error) {
    log("Error starting server:", error);
    process.exit(1);
  }
})();