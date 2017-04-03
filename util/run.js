'use strict';

const log = require("./log.js");
const spawn = require("child_process").spawn;

module.exports = (command, args, options) => {
    args = args || []
    options = options || {}
    return new Promise((resolve, reject) => {
        log(spawn(command, args), options)
        .then(resolve)
    })
}
