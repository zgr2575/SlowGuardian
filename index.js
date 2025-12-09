import express from "express";
import basicAuth from "express-basic-auth";
import http from "node:http";
import { createBareServer } from "@tomphttp/bare-server-node";
import path from "node:path";
import cors from "cors";
import { exec } from "node:child_process";
import config from "./config.js";
const __dirname = process.cwd();
const server = http.createServer();
const app = express(server);
const bareServer = createBareServer("/o/");
const PORT = process.env.PORT || 8080;
var v = config.version;
var upd = false;
import readline from "readline";
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, "static")));
if (config.routes !== false) {
  const routes = [
    { path: "/", file: "index.html" },
    { path: "/ap", file: "apps.html" },
    { path: "/g", file: "games.html" },
    { path: "/s", file: "settings.html" },
    { path: "/p", file: "go.html" },
    { path: "/li", file: "login.html" },
    { path: "/tos", file: "tos.html" },
  ];

  routes.forEach((route) => {
    app.get(route.path, (req, res) => {
      res.sendFile(path.join(__dirname, "static", route.file));
    });
  });
}
var serverid = Math.floor(Math.random() * 101);

var db =
  "server: Smarter Back End v5" +
  " | version: " +
  v +
  " | update avalible: " +
  upd +
  "| server uptime:" +
  process.uptime() +
  " | server memory: " +
  process.memoryUsage().heapUsed / 1024 / 1024 +
  "serverid: " +
  serverid +
  "server identity: " +
  "could not get";
app.get("/d/data", (req, res, next) => {
  console.log(
    "[SMARTERBACKEND]: SERVER DATA HAS BEEN REQUESTED | STATUS: PACKAGING",
  );
  db =
    "server: Smarter Back End v5" +
    " | version: " +
    v +
    " | update avalible: " +
    upd +
    "| server uptime:" +
    process.uptime() +
    " | server memory: " +
    process.memoryUsage().heapUsed / 1024 / 1024 +
    " serverid: " +
    serverid +
    " server identity: " +
    "SG SERVER";
  console.log(
    "[SMARTERBACKEND]: SERVER DATA HAS BEEN PACKAGED | STATUS: PACKAGED, SENDING",
  );
  res.send(db);
  console.log("[SMARTERBACKEND]: SERVER DATA HAS BEEN SENT | STATUS: SENT");
});
if (config.local !== false) {
  app.get("/e/*", (req, res, next) => {
    const baseUrls = [
      "https://raw.githubusercontent.com/v-5x/x/fixy",
      "https://raw.githubusercontent.com/ypxa/y/main",
      "https://raw.githubusercontent.com/ypxa/w/master",
    ];
    fetchData(req, res, next, baseUrls);
  });
}
app.get("*", (req, res) => {
  res.status(404).send();
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send();
});

server.on("request", (req, res) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

server.on("upgrade", (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeUpgrade(req, socket, head);
  } else {
    socket.end();
  }
});

// Update Sw
fetch("https://raw.githubusercontent.com/zgr2575/SlowGuardian/main/version.txt")
  .then((response) => response.text())
  .then((data) => {
    console.log("[SLOWGUARDIAN]: CURRENT VERSION: " + data);
    if (v == parseInt(data)) {
      console.log("[SLOWGUARDIAN]: UP TO DATE");
      upd = true;
    } else {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(
        "The current version is out of date. Do you want to update? (yes/no)",
        (answer) => {
          if (answer.toLowerCase() === "yes") {
            exec("npm run upd", (error, stdout, stderr) => {
              if (error) {
                console.error(`Error updating: ${error}`);
                return;
              }
              console.log(`Update: ${stdout}`);
            });
          } else {
            console.log("Okay, exiting...");
            process.exit(0);
          }
          rl.close();
        },
      );
    }
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });

// -------------------------
// Auth

if (config.challenge) {
  console.log("Password protection is enabled");
  console.log("Please set the passwords in the config.js file");
  if (config.envusers) {
    app.use((req, res, next) => {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Basic ")) {
        res.set("WWW-Authenticate", 'Basic realm="Authorization Required"');
        return res.status(401).send("Authorization Required");
      }
      const credentials = Buffer.from(
        authHeader.split(" ")[1],
        "base64",
      ).toString();
      const [username, password] = credentials.split(":");
      if (config.users[username] && config.users[username] === password) {
        return next();
      } else {
        res.set("WWW-Authenticate", 'Basic realm="Authorization Required"');
        return res.status(401).send("Authorization Required");
      }
    });
  } else {
    app.use(
      basicAuth({
        users: config.users,
        challenge: true,
      }),
    );
  }
}
// -------------------------

server.on("listening", () => {
  console.log(`[SBE]: LISTENING ON PORT ${PORT}`);
});

server.listen({
  port: PORT,
});
console.log("[SLOWGUARDIAN]: LOCAL VERSION: " + v);
