const { Router } = require("express");

const usersRouter = require("./users.routes");
const notesRouter = require("./dishes.routes.js/index.js");
const tagsRouter = require("./ingredients.routes.js/index.js");
const sessionsRouter = require("./sessions.routes.js");

const routes = Router();
routes.use("/users", usersRouter);
routes.use("/dishes", dishesRouter);
routes.use("/ingredients", ingredientsRouter);
routes.use("/sessions", sessionsRouter);

module.exports = routes;
