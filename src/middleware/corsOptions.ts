import { CorsOptions } from "cors";

export const corsOptions: CorsOptions = {
  origin: ["https://23.137.104.65:4000", "*"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
