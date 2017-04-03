'use strict';

// TODO: Currently for testing purposes, need a way to pipe actual errors to user
let LOG_ERRS = false;

module.exports = (child, options) => {
    // We dont "reject" due to the nature of some docker commands returning errors
    //   when we're checking for instances of a network/volume/container
    return new Promise((resolve, reject) => {
        let out = "";
        child.stdout.on("data", (data) => {
            if(options.logStdOut) { console.log(data.toString().trim()); }
            out += data.toString().trim()
        })
        child.stderr.on("data", (data) => {
            if(options.logStdErr || LOG_ERRS) { console.log("log.err:", data.toString().trim()); }
        })
        child.on("close", (code) => resolve(out))
    })
}
