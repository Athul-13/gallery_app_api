import { App } from './app'
import { Server } from './server'
import { createRoutes } from './routes'

const routes = createRoutes()
const app = new App(routes)
const server = new Server(app)

server.start()
