import chalk from "chalk";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import fetch from "node-fetch";

interface ProxyOpts {
  address: string;
  port: number;
}

async function startProxy({ address, port }: ProxyOpts, serverPort = 8080) {
  const host = `${address}:${port}`;

  await new Promise((resolve) => {
    const app = express();
    app.set("trust proxy", ["loopback", "uniquelocal"]);

    const playwrightProxy = createProxyMiddleware({
      target: `http://${host}`,
      ws: true,
      changeOrigin: true,
    });

    app.get("/json/version", async (req, res) => {
      const response = await fetch(`http://${host}/json/version`);
      const data = await response.json();

      const next = {
        ...data,
        webSocketDebuggerUrl: data.webSocketDebuggerUrl.replace(
          host,
          req.get("host")
        ),
      };

      if (req.secure) {
        next.webSocketDebuggerUrl = next.webSocketDebuggerUrl.replace(
          "ws",
          "wss"
        );
      }

      res.status(200).send(next);
    });

    const server = app.listen(serverPort, address, () => resolve(null));
    server.on("upgrade", playwrightProxy.upgrade);

    return server;
  })
    .then(() => {
      console.log(
        chalk.green(`Proxy to ${host} is listening on ${serverPort}`)
      );
    })
    .catch(console.error.bind(console));
}

export default startProxy;
