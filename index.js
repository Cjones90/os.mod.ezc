#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
// const db = require("./commands/db.js");
// const help = require("./commands/help.js");
// const upgrade = require("./commands/upgrade.js");
const swarm = require("./commands/swarm.js");

try { fs.statSync(process.cwd()+"/ezc.config.js") }
catch(e) {
    console.log("Missing 'ezc.config.js' in project root");
    console.log("Creating 'ezc.config.js' in project root")
    fs.writeFileSync(process.cwd()+'/ezc.config.js', fs.readFileSync(__dirname+'/template.config.js'))
    console.log("Edit 'ezc.config.js' and run again")
    console.log("Usage: ezc COMMAND [OPTION] [-r] [args]")
    console.log("Run 'ezc help' for a list of commands and options")
    process.exit(0)
}

process.argv.splice(0, 2)
const args = process.argv
let config = require(path.resolve(process.cwd(), "ezc.config.js"));
config = config ? config : require(path.resolve(process.cwd(), "app.config.js"));

let settings = {
    MOUNT_POINT: "",
    SERVER_NAME: "",
    DB_IMAGE_NAME: "",
    CONTAINER_PORT: ""
}


if (config.DB_TYPE === "mongo") {
    settings.MOUNT_POINT = "/data/db"             // Where to mount the volume inside the container
    settings.SERVER_NAME = "mongo_server"         // Name of the db server
    settings.DB_IMAGE_NAME = "mongo"              // Name of the image to use for db
    settings.CONTAINER_PORT = "27017"             // Port to connect to inside the container
}

if (config.DB_TYPE === "postgres") {
    settings.MOUNT_POINT = "/var/lib/postgresql/data"
    settings.SERVER_NAME = "pg_server"
    settings.DB_IMAGE_NAME = "postgres:9.4"
    settings.CONTAINER_PORT = "5432"
}

settings.PORTS = `${settings.CONTAINER_PORT}:${settings.CONTAINER_PORT}`    // What ports to use/expose    HOST:CONTAINER to map host to docker instance

switch(args[0]) {
    // case "db": db(settings, config, args)
    // break;
    // case "help": help(settings, config, args)
    // break;
    // case "upgrade": upgrade(settings, config, args)
    // break;
    case "swarm": swarm(settings, config, args)
    break;
    default: console.log("Usage: ezc {db {start|dump|import|reload}}");
}
