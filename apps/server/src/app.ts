import express, { type Request } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import { env } from "./config/env.config";
import { APP_NAME } from "./config/constants.config";
import { apiLimiter } from "./middlewares/rate-limiter.middleware";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import routes from "./routes/index.route";

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (env.clientOrigins.includes(origin)) return callback(null, true);
      try {
        const host = new URL(origin).hostname;
        const allowed =
          host === env.platformDomain ||
          host === env.devPlatformDomain ||
          host.endsWith(`.${env.platformDomain}`) ||
          host.endsWith(`.${env.devPlatformDomain}`);
        return callback(null, allowed);
      } catch {
        return callback(null, false);
      }
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(morgan(env.isProd ? "combined" : "dev"));

app.use((req, res, next) => {
  if (req.originalUrl.includes("/webhooks/paystack")) {
    express.raw({ type: "application/json" })(req, res, (err) => {
      if (err) return next(err);
      const raw = req.body as Buffer;
      (req as Request & { rawBody?: Buffer }).rawBody = raw;
      try {
        req.body = JSON.parse(raw.toString("utf8") || "{}");
      } catch {
        req.body = {};
      }
      next();
    });
    return;
  }
  express.json({ limit: "10mb" })(req, res, next);
});
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use("/api", apiLimiter, routes);

app.get("/", (_req, res) => {
  res.json({ success: true, message: `${APP_NAME} API`, data: { docs: "/api/health" } });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
