import { loadSettings, SettingsType } from "./settings.ts";
import { updateWorkspaceContent } from "./notion.ts";
import { Logger } from "./logger.ts";

async function main() {
  await loadSettings({ settingsType: SettingsType.Settings });
  await updateWorkspaceContent();
}

main().catch(error => {
  Logger.error("An error occurred during the main execution", error);
});
