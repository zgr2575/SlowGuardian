import express from "express";
import basicAuth from "express-basic-auth";
import http from "node:http";
import { createBareServer } from "@tomphttp/bare-server-node";
import path from "node:path";
import cors from "cors";
import config from "./config.js";
import Database from "@replit/database";
const __dirname = process.cwd();
const server = http.createServer();
const app = express(server);
const bareServer = createBareServer("/o/");
const PORT = process.env.PORT || 8080;
var v = config.version;
var upd = false;
import readline from "readline";
const db = new Database();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, "static")));
var suurl = Math.floor(Math.random() * 10001);
if (config.routes !== false) {
  const routes = [
    { path: "/ap", file: "apps.html" },
    { path: "/g", file: "games.html" },
    { path: "/s", file: "settings.html" },
    { path: "/p", file: "go.html" },
    { path: "/li", file: "login.html" },
    { path: "/tos", file: "tos.html" },
    { path: "/" + suurl.toString(), file: "signup.html" },
  ];

  routes.forEach((route) => {
    app.get(route.path, (req, res) => {
      res.sendFile(path.join(__dirname, "static", route.file));
    });
  });
}
console.log("Sign up vanity is: " + suurl.toString());
var serverid = Math.floor(Math.random() * 101);
db.list().then(keys => {
  console.log(keys);
});
db.set(
  "serverinfodata",
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
    "could not get",
);
app.get("/d/data", (req, res, next) => {
  db.set(
    "serverinfodata",
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
      "SG SERVER",
  );
  db.get("serverinfodata").then((value) => {
    res.send(value);
    console.log("Server data has been reqested and sent");
  });
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
fetch(
  "https://0146ffeb-79d3-40bc-93c8-e4607c4938c0-00-pfqi1187e2z7.kirk.replit.dev/d/data",
)
  .then((response) => response.text())
  .then((data) => {
    console.log("Main server data: " + data);
  });

const fetchData = async (req, res, next, baseUrls) => {
  try {
    const reqTarget = baseUrls.map((baseUrl) => `${baseUrl}/${req.params[0]}`);
    let data;
    let asset;

    for (const target of reqTarget) {
      asset = await fetch(target);
      if (asset.ok) {
        data = await asset.arrayBuffer();
        break;
      }
    }

    if (data) {
      res.end(Buffer.from(data));
    } else {
      res.status(404).send();
    }
  } catch (error) {
    console.error(`Error fetching ${req.url}:`, error);
    res.status(500).send();
  }
};

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
    console.log("New version: " + data); 
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
app.get("/", (req, res) => {
  const loggedIn = req.cookies.loggedIn;
  const username = req.cookies.username;

  if (loggedIn === "true") {
    db.list().then(keys => {
      if (keys.includes(username)) {
        res.render("index.html", { username: username }); 
        
      } else {
        res.redirect("/si");
      }
    });
  } else {
    res.render("si.html");
  }
});
// -------------------------
// Auth
app.get("/logout", (req, res) => {
  res.cookie("loggedIn", "false");
  res.clearCookie("username");
  res.redirect("/");
  console.log("successfully logged out")
});
app.post("/loginsubmit", (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  db.list().then(keys => {
      if (Array.isArray(keys) && keys.includes(username)) {
      db.get(username).then(value => {
        if(password == value){
          res.cookie("loggedIn", "true");
          res.cookie("username", username);
          console.log("logged in successfully")
          alert("Log-in successful");
          res.redirect("/");
        } else{
          res.send("Wrong password.");
        }
      });
    } else{
      res.send("Account not found.");
    }
  });
});

app.post("/createaccount", (req, res) => {
  var newusername = req.body.newusername;
  var newpassword = req.body.newpassword;
 var letters = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ];
  var cap_letters = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];
  var numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  var allchars = letters + cap_letters + numbers + ["_"];
 var goodusername = true;
  for (let i of newusername) {
    if (!allchars.includes(i)) {
      goodusername = false;
    }
  }
  if (goodusername) {
    db.list().then((keys) => {
      if (Array.isArray(keys) && keys.includes(newusername)) {
        res.send("Username taken.");
      } else if (newusername == "") {
        res.send("Please enter a username.");
      } else if (newpassword == "") {
        res.send("Please enter a password.");
      } else {
        db.set(newusername, newpassword).then(() =>
          console.log("new account created"),
        );
        res.cookie("loggedIn", "true");
        res.cookie("username", newusername);
        res.redirect("/");
      }
    });
  } else {
    res.send(
      "Username can only contain alphanumeric characters and underscores.",
    );
  }
});
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
      if (users[username] && users[username] === password) {
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

if (upd === true) {
  server.on("listening", () => {
    console.log(`Running at http://localhost:${PORT}`);
  });
}

server.listen({
  port: PORT,
});
console.log("Current Version: " + v);
