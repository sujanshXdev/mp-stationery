// filepath: /home/sujan-shrestha/Documents/mp-stationery/backend/server.js
import express from "express";
import dotenv from "dotenv";
import { connectDatabase } from "./config/dbConnect.js";
import errorMiddleware from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import logger from "./utils/logger.js";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
// Security middlewares
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xssClean from "xss-clean";
import hpp from "hpp";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Handle Uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  logger.error("Shutting down server due to uncaught exception");
  process.exit(1);
});

// Load environment variables
dotenv.config({ path: "backend/config/config.env" });

const app = express();

// CORS should be the first middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.1.7:5173",
  "http://localhost:5000"
];

// Add this function to allow any 192.168.1.x:5173 origin
function customCors(origin, callback) {
  if (
    !origin ||
    allowedOrigins.includes(origin) ||
    /^http:\/\/192\.168\.1\.\d+:5173$/.test(origin)
  ) {
    return callback(null, true);
  }
  return callback(new Error("Not allowed by CORS"));
}

app.use(
  cors({
    origin: customCors,
    credentials: true,
  })
);

// Morgan HTTP request logging
app.use(morgan("dev", { stream: { write: (msg) => logger.http(msg.trim()) } }));

// Security: Set secure HTTP headers, allowing frontend origins for images
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'img-src': [
          "'self'", 
          'data:',
          'http://localhost:5173', 
          'http://192.168.1.7:5173'
        ],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

// Security: Rate limiting to prevent brute-force attacks
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'DEVELOPMENT' ? 1000 : 100, // 1000 for dev, 100 for prod
    message: "Too many requests from this IP, please try again later."
  })
);

// Security: Prevent NoSQL injection
app.use(mongoSanitize());

// Security: Prevent XSS attacks
app.use(xssClean());

// Security: Prevent HTTP parameter pollution
app.use(hpp());

// Swagger/OpenAPI setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MP Stationery API",
      version: "1.0.0",
      description: "API documentation for MP Stationery backend",
    },
    servers: [
      {
        url: "http://localhost:" + process.env.PORT + "/api/v1",
        description: "Development server",
      },
    ],
  },
  apis: [
    path.join(process.cwd(), "backend/routes/*.js"),
    path.join(process.cwd(), "backend/controllers/*.js"),
  ],
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Connecting to database
connectDatabase();

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(cookieParser());

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Import all routes
import productRoutes from "./routes/product.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/order.js";
import wishlistRoutes from "./routes/wishlist.js";
import cartRoutes from "./routes/cart.js";
import notificationRoutes from "./routes/notification.js";
import messageRoutes from "./routes/message.js";
import posterRoutes from "./routes/poster.js";

// Mount all routes
app.use("/api/v1", authRoutes);
app.use("/api/v1", productRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", notificationRoutes);
app.use("/api/v1", wishlistRoutes);
app.use("/api/v1", cartRoutes);
app.use("/api/v1", messageRoutes);
app.use("/api/v1", posterRoutes);

// Using error middleware
app.use(errorMiddleware);

const server = app.listen(process.env.PORT, "0.0.0.0", () => {
  logger.info(
    `Server is running on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
  logger.error("Shutting down server due to unhandled promise rejection");
  server.close(() => {
    process.exit(1);
  });
});
