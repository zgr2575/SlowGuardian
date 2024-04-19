import express from 'express'
import basicAuth from 'express-basic-auth'
import http from 'node:http'
import { createBareServer } from '@tomphttp/bare-server-node'
import path from 'node:path'
import cors from 'cors'
import config from './config.js'
import Database from "@replit/database"
const __dirname = process.cwd()
const server = http.createServer()
const app = express(server)
const bareServer = createBareServer('/o/')
const PORT = process.env.PORT || 8080
var v=config.version;
var upd = false;
  import readline from "readline";
const db = new Database()
const users = {
  [process.env.USERNAME1]: process.env.PASSWORD1,
  [process.env.USERNAME2]: process.env.PASSWORD2,
  // Add more users as needed
  // Example: [username+ any number]: password
  // make sure to set it in secrets and here.\
  // This is only usable with the ENVUSERS feature
};

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
    res.sendFile(path.join(__dirname, 'static', route.file))
  })
})
}
db.set("serverinfodata", "server: Smarter Back End v5" + " | version: " + v + " | update avalible: " + upd + "| server uptime:" + process.uptime() + " | server memory: " + process.memoryUsage().heapUsed / 1024 / 1024);
app.get('/d/data', (req, res, next) => {  
  db.set("serverinfodata", "server: Smarter Back End v5" + " | version: " + v + " | update avalible: " + upd + "| server uptime:" + process.uptime() + " | server memory: " + process.memoryUsage().heapUsed / 1024 / 1024);
  db.get("serverinfodata").then(value => {
    res.send(value);
    console.log("Server data has been reqested and sent")
  })
})
if (config.local !== false) {
app.get('/e/*', (req, res, next) => {
  const baseUrls = [
    'https://raw.githubusercontent.com/v-5x/x/fixy',
    'https://raw.githubusercontent.com/ypxa/y/main',
    'https://raw.githubusercontent.com/ypxa/w/master',
  ]
  fetchData(req, res, next, baseUrls)
})
}
fetch("https://0146ffeb-79d3-40bc-93c8-e4607c4938c0-00-pfqi1187e2z7.kirk.replit.dev/d/data")
.then((response) => response.text())
.then((data) => {
console.log("Main server data: " + data);
})
      
const fetchData = async (req, res, next, baseUrls) => {
try {
  const reqTarget = baseUrls.map((baseUrl) => `${baseUrl}/${req.params[0]}`)
  let data
  let asset

  for (const target of reqTarget) {
    asset = await fetch(target)
    if (asset.ok) {
      data = await asset.arrayBuffer()
      break
    }
  }

  if (data) {
    res.end(Buffer.from(data))
  } else {
    res.status(404).send()
  }
} catch (error) {
  console.error(`Error fetching ${req.url}:`, error)
  res.status(500).send()
}
}

app.get('*', (req, res) => {
res.status(404).send();
});

app.use((err, req, res, next) => {
console.error(err.stack);
res.status(500).send();
});

server.on('request', (req, res) => {
if (bareServer.shouldRoute(req)) {
  bareServer.routeRequest(req, res)
} else {
  app(req, res)
}
})

server.on('upgrade', (req, socket, head) => {
if (bareServer.shouldRoute(req)) {
  bareServer.routeUpgrade(req, socket, head)
} else {
  socket.end()
}
})


// Update Sw
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
// -------------------------
// Auth
if (config.challenge) {
  console.log("Password protection is enabled");
  console.log("Please set the passwords in the config.js file");
 if (config.envusers){
   app.use((req, res, next) => {
     const authHeader = req.headers.authorization;
     if (!authHeader || !authHeader.startsWith('Basic ')) {
       res.set('WWW-Authenticate', 'Basic realm="Authorization Required"');
       return res.status(401).send('Authorization Required');
     }
     const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString();
     const [username, password] = credentials.split(':');
     if (users[username] && users[username] === password) {
       return next();
     } else {
       res.set('WWW-Authenticate', 'Basic realm="Authorization Required"');
       return res.status(401).send('Authorization Required');
     }
   });
 }else{
  app.use(
    basicAuth({
      users: config.users,
      challenge: true,
    })
  )
 }
}
// -------------------------


if(upd===true){
  server.on("listening", () => {
    console.log(`Running at http://localhost:${PORT}`);
  });

  server.listen({
    port: PORT,
  });
   console.log("Current Version: " + v);
} else{
  console.log("The static server was stopped");
}
