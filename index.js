  import express from "express";
  import basicAuth from "express-basic-auth";
  import http from "node:http";
  import { exec } from "child_process"
  import { createBareServer } from "@tomphttp/bare-server-node";
  import path from "node:path";
  import cors from "cors";
  import config from "./config.js";
  const __dirname = process.cwd();
  const server = http.createServer();
  const app = express(server);
  const bareServer = createBareServer("/o/");
  import fetch from "node-fetch";
  const PORT = process.env.PORT || 8080;
var v=config.version;
var upd = false;
  import readline from "readline";
  fetch("https://raw.githubusercontent.com/zgr2575/SlowGuardian/main/version.txt")
    .then((response) => response.text())
    .then((data) => {
      console.log("New version: " + data); // Log the content of the text file (version number)
      if (v == parseInt(data)) {
        console.log("The current version is up to date");
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
              conosle.log("Okay, exiting...");
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
  console.log("Current Version: " + v);
  if (config.challenge) {
    console.log("Password protection is enabled");
    console.log("Please set the passwords in the config.js file");
  }
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
  app.use(express.static(path.join(__dirname, "static")));

  if (config.routes !== false) {
    const routes = [
      { path: '/ap', file: 'apps.html' },
        { path: '/g', file: 'games.html' },
        { path: '/s', file: 'settings.html' },
        { path: '/t', file: 'tabs.html' },
        { path: '/p', file: 'go.html' },
        { path: '/', file: 'index.html' },
        { path: '/tos', file: 'tos.html' },

    ];

    routes.forEach((route) => {
      app.get(route.path, (req, res) => {
        res.sendFile(path.join(__dirname, "static", route.file));
      });
    });
  }
  if (config.local !== false) {
    app.get("/y/*", (req, res, next) => {
      const baseUrl = "https://raw.githubusercontent.com/ypxa/y/main";
      fetchData(req, res, next, baseUrl);
    });

    app.get("/f/*", (req, res, next) => {
      const baseUrl = "https://raw.githubusercontent.com/4x-a/x/fixy";
      fetchData(req, res, next, baseUrl);
    });
  }

  const fetchData = async (req, res, next, baseUrl) => {
    try {
      const reqTarget = `${baseUrl}/${req.params[0]}`;
      const asset = await fetch(reqTarget);

      if (asset.ok) {
        const data = await asset.arrayBuffer();
        res.end(Buffer.from(data));
      } else {
        next();
      }
    } catch (error) {
      console.error("Error fetching:", error);
      next(error);
    }
  };
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
if (v === 7) {
  console.log("Version 7 is the long term support version and does not require update");
  
  app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'Version 7');
    next();
  });
}
if (v===7){
  upd=true;
}
if(upd===true){
  server.on("listening", () => {
    console.log(`Running at http://localhost:${PORT}`);
  });

  server.listen({
    port: PORT,
  });
} else{
  console.log("The static server was stopped");
}