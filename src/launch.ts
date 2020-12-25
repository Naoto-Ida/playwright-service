import { chromium } from "playwright-chromium";
import chalk from "chalk";
import startProxy from "./startProxy";

async function launch(address = "0.0.0.0", port = 9222) {
  const headless = true;
  const browser = await chromium.launch({
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      `--remote-debugging-address=${address}`,
      `--remote-debugging-port=${port}`,
      "--disable-accelerated-2d-canvas",
      "--no-zygote",
      "--disable-gpu",
    ],
    ignoreDefaultArgs: ["--mute-audio", "--hide-scrollbars"],
    headless,
    devtools: false,
  });

  const version = browser.version();
  const host = { address, port };

  console.log(chalk.green(`Running Chromium version ${version}`));

  return host;
}

(async function main() {
  await startProxy(await launch());
})();
