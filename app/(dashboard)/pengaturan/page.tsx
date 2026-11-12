import { getSettingsData } from "@/lib/actions/settings";
import { SettingsView } from "@/components/settings/SettingsView";
import { serialize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PengaturanPage() {
  const data = await getSettingsData();
  return <SettingsView data={serialize(data)} />;
}

