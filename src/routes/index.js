const { Router } = require('express')

const usersRouter = require('./users.routes')
const notesRouter = require('./dishes.routes')
const tagsRouter = require('./igredients.routes')
const sessionsRouter = require('./sessions.routes')



const routes = Router()
routes.use('/users', usersRouter);
routes.use('/dishes', notesRouter);
routes.use('/igredients', tagsRouter);
routes.use('/sessions', sessionsRouter);



module.exports = routes