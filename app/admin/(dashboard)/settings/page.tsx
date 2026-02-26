import SettingsClient from "@/components/admin/SettingsClient";
import { getWeddingConfig, toPublicConfig } from "@/lib/config";

export default async function SettingsPage() {
  const raw = await getWeddingConfig();
  const config = toPublicConfig(raw);
  return <SettingsClient initial={config} />;
}
