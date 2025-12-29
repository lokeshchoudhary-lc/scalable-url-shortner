import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

// API Routes
app.use("/", routes);

export default app;
