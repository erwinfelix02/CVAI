// src/services/settingsService.ts (or similar path)
import { API_BASE_URL } from "../config"; // Adjust the relative path to config.ts if needed

// Combine shared API_BASE_URL with the /settings endpoint
const SETTINGS_URL = `${API_BASE_URL}/settings`;

export type GeneralSettingsDTO = {
  siteName: string;
  supportEmail: string;
  siteDescription: string;
  schoolPhoneNumber: string;
  schoolLocation: string;
};

const DEFAULT_GENERAL_SETTINGS: GeneralSettingsDTO = {
  siteName: "Graystone Institute of the Philippines",
  supportEmail: "support@university.edu",
  siteDescription: "Campus Virtual Assistance for Information",
  schoolPhoneNumber: "+63 912 345 6789",
  schoolLocation: "Cebu City, Philippines",
};

export async function getGeneralSettings(): Promise<GeneralSettingsDTO> {
  const res = await fetch(`${SETTINGS_URL}/general`);
  const data = await res.json().catch(() => null);

  if (!res.ok) throw new Error(data?.message || "Failed to load settings.");

  return {
    ...DEFAULT_GENERAL_SETTINGS,
    ...(data || {}),
  };
}

export async function updateGeneralSettings(
  payload: GeneralSettingsDTO,
): Promise<{ message: string; general: GeneralSettingsDTO }> {
  const res = await fetch(`${SETTINGS_URL}/general`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) throw new Error(data?.message || "Failed to update settings.");
  return data;
}