import { fetchNotionUpdates } from "./notion.ts";
import { everyMinute } from "@deno_cron/cron";

// Schedule the polling function to run every minute
everyMinute(fetchNotionUpdates);

// Run the function immediately on start
export { fetchNotionUpdates };
