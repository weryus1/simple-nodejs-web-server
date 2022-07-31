const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
const stdin = require('process');
const MimeLookup = require('mime-lookup');
const mime = new MimeLookup(require('mime-db'));

const baseDir = __dirname + '/pages';
var requests = [];
// var stdin = process.openStdin();

const port = 80;

var server = http.createServer(function(req, res) {
    var q = url.parse(req.url, true);

    if (!req.connection || !res.connection) {
        res.end();
    } else {
        if (req.method === "GET") {
            var fsPath = baseDir + path.normalize(q.pathname);
            fsPath = fsPath.replace(/%20/g, " ");

            if (q.pathname === "/") {
                fsPath = baseDir + "/index.html";
            } else {
                if (q.pathname.indexOf('.') === -1) {
                    fsPath = baseDir + path.normalize(q.pathname) + ".html";
                }
            }

            var src = fs.createReadStream(fsPath);

            src.on('error', function (err) {
                if (err.code === 'ENOENT') {
                    src = fs.createReadStream(__dirname + "/pages/err/404.html");
                    console.log(req.connection.remoteAddress + " GET " + q.pathname + " 404");
                    res.statusCode = 404;
                } else {
                    src = fs.createReadStream(__dirname + "/pages/err/50x.html");
                    console.log(req.connection.remoteAddress + " GET " + fsPath + " 500");
                    console.err(err);
                    res.statusCode = 500;
                }

                requests[requests.length] = {url: q, address: req.connection.remoteAddress, method: req.method, code: res.statusCode, headers: req.headers};
                res.setHeader("Content-Type", 'text/html');
                src.pipe(res);
            });

            src.on('open', function(err) {
                res.setHeader("Content-Type", mime.lookup(fsPath));
                res.setHeader("Access-Control-Allow-Origin", '*');
                requests[requests.length] = {url: q, address: req.connection.remoteAddress, method: req.method, code: 200, headers: req.headers};
                src.pipe(res);
                console.log(req.connection.remoteAddress + " GET " + q.pathname + " 200");
            });
        }
    }

});

server.listen(port);
console.log("Server listening on port " + port);

/*
console.log("Console listener has started")
stdin.addListener("data", function (d) {
    var cmd = d.toString().trim();

    if (cmd === "stop") {
        stop();
    }
})

function stop() {
    console.log("Stopping server...");
    server.close();
    process.exit();
}*/