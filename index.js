import express from "express";
import basicAuth from "express-basic-auth";
import http from "node:http";
import { createBareServer } from "@tomphttp/bare-server-node";
import path from "node:path";
import cors from "cors";
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
var serverid = Math.floor(Math.random() * 101);

var db =
  "server: Smarter Back End OPTIMUS v1 " +
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
  "Rasphberry Pi Optimized";
app.get("/d/data", (req, res, next) => {
  console.log(
    "[SMARTERBACKEND-OPTIMUS]: SERVER DATA HAS BEEN REQUESTED | STATUS: PACKAGING",
  );
  db =
    "server: Smarter Back End OPTIMUS v1" +
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
    "OPTIMAL PI SG SERVER";
  console.log(
    "[SMARTERBACKEND-OPTIMUS]: SERVER DATA HAS BEEN PACKAGED | STATUS: PACKAGED, SENDING",
  );
  res.send(db);
  console.log(
    "[SMARTERBACKEND-OPTIMUS]: SERVER DATA HAS BEEN SENT | STATUS: SENT",
  );
});
app.get("*", (req, res) => {
  res.status(404).send("404 - Page Not Found");
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
fetch(
  "https://github.com/zgr2575/SlowGuardian/raw/raspherry-pi-support/version.txt",
)
  .then((response) => response.text())
  .then((data) => {
    console.log("[SLOWGUARDIAN-Pi]: CURRENT VERSION: " + data);
    if (v == parseInt(data)) {
      console.log("[SLOWGUARDIAN-Pi]: UP TO DATE");
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
            console.log("Okay, exiting boostrape...");
            // We will not exit with Pi Version
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
server.on("listening", () => {
  console.log(`[SBE]: LISTENING ON PORT ${PORT}`);
});

server.listen({
  port: PORT,
});
console.log("[SLOWGUARDIAN-Pi]: LOCAL VERSION: " + v);
