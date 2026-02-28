const SETTINGS_URL = "http://localhost:5000/api/settings";

export type GeneralSettingsDTO = {
  siteName: string;
  supportEmail: string;
  siteDescription: string;
  aiWelcomeMessage: string;
};

const DEFAULT_GENERAL_SETTINGS: GeneralSettingsDTO = {
  siteName: "Graystone Institute of the Philippines",
  supportEmail: "support@university.edu",
  siteDescription: "Campus Virtual Assistance for Information",
  aiWelcomeMessage: "Hello! I'm your campus assistant. How can I help you today?",
};

export async function getGeneralSettings(): Promise<GeneralSettingsDTO> {
  const res = await fetch(`${SETTINGS_URL}/general`);
  const data = await res.json().catch(() => null);

  if (!res.ok) throw new Error(data?.message || "Failed to load settings.");

  // ✅ ensure always returns valid object
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