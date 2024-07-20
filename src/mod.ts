import { loadSettings, SettingsType } from "./settings.ts";
import { updateWorkspaceContent } from "./notion.ts";
import { Logger } from "./logger.ts";

async function main() {
  await loadSettings({ settingsType: SettingsType.Settings });
  await updateWorkspaceContent();
}

function showHelp() {
  Logger.info("Usage: deno run --allow-net --allow-env --allow-read --allow-write src/mod.ts [--poll, --verbose, --help]");
}

const args = Deno.args;

async function enablePolling() {
  if (args.includes("--verbose"))
    Logger.info("Polling mode enabled. Fetching updates from Notion every minute.");
  const { fetchNotionUpdates } = await import("./scheduler.ts");
  await fetchNotionUpdates();
}




switch (true) {
  case args.includes("--help"):
    showHelp();
    break;
  case args.includes("--poll"):
    await enablePolling();
    break;
  default:
    await main().catch(error => {
      Logger.error("An error occurred during the main execution", error);
    });
    break;
}
