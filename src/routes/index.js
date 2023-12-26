const { Router } = require("express");

const usersRouter = require("./users.routes");
const dishesRouter = require("./dishes.routes.js");
const sessionsRouter = require("./sessions.routes.js");

const routes = Router();
routes.use("/users", usersRouter);
routes.use("/dishes", dishesRouter);
routes.use("/sessions", sessionsRouter);

module.exports = routes;
