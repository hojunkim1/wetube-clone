import express from "express";
import morgan from "morgan";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import { localsMiddleware, sessionMiddleware } from "./middlewares";

const app = express();
const logger = morgan("dev");

// template engine
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");

// middlewares
app.use(logger);
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(localsMiddleware);

// static
app.use("/static", express.static("assets"));
app.use("/uploads", express.static("uploads"));

// routers
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

export default app;
