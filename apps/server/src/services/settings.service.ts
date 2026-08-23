import { APP_NAME, SUPPORT_EMAIL } from "../config/constants.config";
import { Settings, type ISettings } from "../models/settings.model";

let cache: ISettings | null = null;
let cacheAt = 0;

export async function getSettings(): Promise<ISettings> {
  if (cache && Date.now() - cacheAt < 30_000) return cache;
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({
      platformName: APP_NAME,
      supportEmail: SUPPORT_EMAIL,
    });
  }
  cache = settings;
  cacheAt = Date.now();
  return settings;
}

export async function updateSettings(patch: Partial<ISettings>): Promise<ISettings> {
  const current = await getSettings();
  Object.assign(current, patch);
  await current.save();
  cache = current;
  cacheAt = Date.now();
  return current;
}

export function clearSettingsCache(): void {
  cache = null;
  cacheAt = 0;
}
