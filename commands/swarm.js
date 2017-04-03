"use strict";

const path = require("path");
const run = require("../util/run.js")

module.exports = function(settings, config, args) {

    if (!args[1]) {
        console.log("Usage: ezc swarm {build|init}");
        process.exit(0)
    }

    let swarmManagerIp = config.SWARM_MANAGER_IP.split("@")[1];

    function buildSwarmImages() {
        let swarmIps = config.SWARM_WORKER_IPS.slice();
        swarmIps.unshift(config.SWARM_MANAGER_IP);

        let env = args[2] ? args[2] : "prod";

        return swarmIps.map((ip) => {
            return run(`ssh`, [`${ip}`, `set -e;
            cd ~/${config.SERVER_DIR_NAME};
            git fetch;
            git reset --hard origin/master;
            docker-compose build;
            docker rmi \$(docker images -f 'dangling=true' -q);`],
            {logStdOut: true, logStdErr: true});
        });
    }

    function initSwarm() {
        return run(`docker-machine`, [`ssh`, config.SWARM_MANAGER_IP,
        `docker swarm init --advertise-addr ${config.ADVT_IP} | grep -- --token;`],
        {logStdErr: true});
    }

    function joinSwarm(swarmToken) {
        return config.SWARM_WORKER_IPS.map((workerIP) => {
            let cmd = `docker swarm join \\
                ${swarmToken}
                ${config.ADVT_IP}:2377`;
            return run(`docker-machine`, [`ssh`, workerIP, `set -e; ${cmd}`],
            {logStdOut: true, logStdErr: true})
        });
    }

    function deploy() {
        console.log("Deploy");
        let stackName = args[2] ? args[2] : "default"
        return run(`docker`, ['stack', 'deploy', '--compose-file', `docker-compose.yml`, stackName, "--with-registry-auth"],
        {logStdOut: true, logStdErr: true})
    }

    if(args[1] === "build") {
        buildSwarmImages();
    }

    if(args[1] === "create") {
        initSwarm()
        .then(joinSwarm);
    }

    if(args[1] === "init") {
        Promise.all(buildSwarmImages())
        .then(initSwarm)
        .then(joinSwarm)
    }

    if(args[1] === "deploy") {
        if(args[3] && args[3] === 'clean') {
            Promise.all(buildSwarmImages())
            .then(initSwarm)
            .then((token) => Promise.all(joinSwarm(token)))
            .then(deploy)
            .then((r) => console.log("r:", r))
            .catch((e) => console.log("e:", e))
        }
        else { deploy() }

    }

}
