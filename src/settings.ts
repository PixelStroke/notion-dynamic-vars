import { readJson } from "denoland/jsonfile";
import { load as loadEnv } from "std/dotenv";
import { Logger } from "./logger.ts";

interface Settings {
  Values: {
    [key: string]: string | boolean | number;
  };
  ConnectionStrings: {
    [key: string]: string;
  };
  Host: {
    LocalHttpPort: number;
    CORS: string;
    CORSCredentials: boolean;
  };
}

export enum SettingsType {
  Settings = "settings",
  Env = "env",
}

interface LoadSettingsArgs {
  settingsType?: SettingsType | null;
  settingsPath?: string;
}

const DEFAULT_SETTINGS_PATH = "./settings.json";

export async function loadSettings({ settingsType, settingsPath = DEFAULT_SETTINGS_PATH }: LoadSettingsArgs = {}): Promise<void> {
  const shouldLoadEnv = !settingsType || settingsType === SettingsType.Env;
  const shouldLoadSettingsFile = !settingsType || settingsType === SettingsType.Settings;

  if (shouldLoadEnv) {
    try {
      loadEnvFile();
      return;
    } catch (_envError) {
      Logger.warn(".env file not found. Trying to load settings.json...");
    }
  }

  if (shouldLoadSettingsFile) {
    try {
      await loadSettingsFile(settingsPath);
    } catch (jsonError) {
      Logger.error("Neither .env nor settings.json file could be loaded.", jsonError);
      throw jsonError;
    }
  }
}

async function loadSettingsFile(fileName: string = DEFAULT_SETTINGS_PATH): Promise<void> {
  try {
    const config: Settings = await readJson(fileName) as Settings;
    for (const [key, value] of Object.entries(config.Values)) {
      Deno.env.set(key, String(value));
    }
    Logger.info("settings.json file loaded successfully.", { color: "green" });
  } catch (jsonError) {
    Logger.error("settings.json file could not be loaded.", jsonError);
    throw jsonError;
  }
}

function loadEnvFile(): void {
  try {
    loadEnv({ export: true });
    Logger.info(".env file loaded successfully.");
  } catch (error) {
    Logger.error(".env file could not be loaded.", error);
    throw error;
  }
}
