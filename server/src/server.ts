import { APP_NAME } from "./config/constants.config";
import { env } from "./config/env.config";
import { connectDatabase } from "./config/db.config";
import { getSettings } from "./services/settings.service";
import { startCronJobs } from "./jobs/cron.job";
import app from "./app";

async function bootstrap(): Promise<void> {
  await connectDatabase();
  await getSettings();
  startCronJobs();
  app.listen(env.port, () => {
    console.log(`[${APP_NAME}] API listening on port ${env.port} (${env.nodeEnv})`);
  });
}

bootstrap().catch((error) => {
  console.error(`[${APP_NAME}] failed to start`, error);
  process.exit(1);
});
