import express from "express";
import http from "http";
import passport from "passport";
import session from "express-session";
import dotenv from "dotenv";
import YAML from "yamljs";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import serviceApi from "../dist";
import { ServiceImplementation } from "./impl";

dotenv.config();

const swaggerDocument = YAML.load("openapi.yaml");

const app = express();
const impl = new ServiceImplementation();

const options: swaggerUi.SwaggerUiOptions = {
	swaggerOptions: {
		url: "/docs/swagger.json",
		displayRequestDuration: true,
	},
};

app.use(
	session({
		resave: false,
		saveUninitialized: true,
		secret: process.env.SECRET ?? "SECRET",
	})
);
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(cors({ origin: "*" }));

app.get("/docs/swagger.json", (_, res) => res.json(swaggerDocument));
app.use("/docs", swaggerUi.serveFiles(undefined, options), swaggerUi.setup(undefined, options));

serviceApi(app, impl);

const PORT: number = Number(process.env.PORT) || 8088;

const httpServer = http.createServer(app);

httpServer.listen(PORT, () => console.log(`Service running at http://localhost:${PORT}/`));
