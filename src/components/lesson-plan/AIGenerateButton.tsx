import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function AIGenerateButton({
  onGenerate,
  label = "Generate with AI"
}: {
  onGenerate: () => Promise<void>;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const { online } = useAppStore();
  const isOnline = useOnlineStatus() || online;

  return (
    <button
      type="button"
      title={isOnline ? "Generate with AI" : "Online only"}
      disabled={!isOnline || loading}
      onClick={async () => {
        setLoading(true);
        try {
          await onGenerate();
        } finally {
          setLoading(false);
        }
      }}
      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Sparkles className="h-3.5 w-3.5" />
      )}
      {isOnline ? label : "Online only"}
    </button>
  );
}
