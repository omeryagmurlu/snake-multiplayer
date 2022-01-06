import { App } from "./App";
import { ConnectionManager } from "./ConnectionManager";
import { options } from "./utils/Logger";

options({
    level: 8,
    date: true,
})

const connman = new ConnectionManager()
const app = new App(connman);

connman.listen()