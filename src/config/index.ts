import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || "development",

  database: {
    url: process.env.DATABASE_URL!,
  },

  jwt: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
    accessTokenExpiry: "15m" as const,
    refreshTokenExpiry: "7d" as const,
  },

  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },

  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
    domain: undefined, // Let the browser handle it
    path: "/", // Make sure cookies are accessible on all paths
  },
};
