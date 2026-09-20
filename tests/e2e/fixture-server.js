// A tiny site for the proxy tests: it has a title, some text, and it fetches a
// sub-resource, so a passing test proves the whole chain (service worker → bare-mux →
// relay → back into the frame) and not just a first HTML response.
import http from "node:http";

const PORT = Number(process.env.FIXTURE_PORT) || 44599;

const PAGE = `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /><title>SG Fixture</title></head>
  <body>
    <h1 id="h">Fixture page</h1>
    <script>
      fetch("/data.json")
        .then((r) => r.json())
        .then((d) => { document.getElementById("h").dataset.fetched = String(d.ok); })
        .catch(() => { document.getElementById("h").dataset.fetched = "error"; });
    </script>
  </body>
</html>`;

http
  .createServer((req, res) => {
    if (req.url === "/data.json") {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: true }));
      return;
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(PAGE);
  })
  .listen(PORT, "127.0.0.1", () => console.log(`fixture listening on ${PORT}`));
