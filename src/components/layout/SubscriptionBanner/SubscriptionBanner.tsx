import { createElement, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdClose,
  MdAccessTime,
  MdOutlineCalendarToday,
  MdWarning,
  MdBlock,
  MdOutlineCancel,
  MdOutlineStorage,
} from "react-icons/md";
import type { IconType } from "react-icons";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import type {
  MySubscription,
  MyStorage,
  StorageThreshold,
} from "@/api/endpoints/subscriptions";

type BannerVariant = "info" | "warning" | "alert" | "error";

interface BannerConfig {
  variant: BannerVariant;
  icon: IconType;
  message: string;
  action?: string;
}

const VARIANT_STYLES: Record<
  BannerVariant,
  { bg: string; text: string; actionBg: string }
> = {
  info: {
    bg: "bg-blue-600",
    text: "text-white",
    actionBg: "bg-black/15 hover:bg-black/25",
  },
  warning: {
    bg: "bg-amber-400",
    text: "text-amber-950",
    actionBg: "bg-black/10 hover:bg-black/20",
  },
  alert: {
    bg: "bg-orange-500",
    text: "text-white",
    actionBg: "bg-black/15 hover:bg-black/25",
  },
  error: {
    bg: "bg-red-600",
    text: "text-white",
    actionBg: "bg-black/15 hover:bg-black/25",
  },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric" });

const daysUntil = (iso: string) =>
  Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);

const getStatusBanner = (sub: MySubscription | null): BannerConfig | null => {
  if (!sub) return null;
  const { status, trial_ends_at, end_date } = sub;

  if (status === "ACTIVE") {
    if (trial_ends_at) {
      const days = daysUntil(trial_ends_at);
      return {
        variant: "info",
        icon: MdAccessTime,
        message: `Trial ends in ${days} day${days === 1 ? "" : "s"} (${formatDate(trial_ends_at)})`,
      };
    }
    if (daysUntil(end_date) <= 7) {
      return {
        variant: "warning",
        icon: MdOutlineCalendarToday,
        message: `Renews ${formatDate(end_date)}`,
        action: "Renew",
      };
    }
    return null;
  }

  if (status === "GRACE")
    return {
      variant: "warning",
      icon: MdWarning,
      message: `Expired ${formatDate(end_date)}. Uploads paused.`,
      action: "Renew",
    };
  if (status === "RESTRICTED")
    return {
      variant: "alert",
      icon: MdBlock,
      message: "Account restricted. Renew to restore uploads.",
      action: "Renew",
    };
  if (status === "CANCELLED")
    return {
      variant: "error",
      icon: MdOutlineCancel,
      message: "Subscription cancelled.",
      action: "Resubscribe",
    };

  return null;
};

const getStorageBanner = (storage: MyStorage | null): BannerConfig | null => {
  if (!storage) return null;
  const map: Partial<Record<StorageThreshold, BannerConfig>> = {
    WARNING_80: {
      variant: "warning",
      icon: MdOutlineStorage,
      message: "You've used 80%+ of your storage.",
      action: "Upgrade",
    },
    WARNING_95: {
      variant: "alert",
      icon: MdOutlineStorage,
      message: "Only 5% storage remaining!",
      action: "Upgrade",
    },
    BLOCKED: {
      variant: "error",
      icon: MdOutlineStorage,
      message: "Storage full. Delete files or upgrade to upload.",
      action: "Upgrade",
    },
  };
  return map[storage.threshold] ?? null;
};

interface BannerRowProps {
  config: BannerConfig;
  onAction: () => void;
  onDismiss: () => void;
}

const BannerRow = ({ config, onAction, onDismiss }: BannerRowProps) => {
  const s = VARIANT_STYLES[config.variant];
  return (
    <div className={`flex items-center gap-2 px-4 py-2 ${s.bg}`}>
      {createElement(config.icon, { size: 12, className: s.text })}
      <p className={`flex-1 min-w-0 text-xs font-medium truncate ${s.text}`}>
        {config.message}
      </p>
      {config.action && (
        <button
          type="button"
          onClick={onAction}
          className={`shrink-0 text-xs font-bold rounded px-2 py-0.5 transition-colors cursor-pointer ${s.text} ${s.actionBg}`}
        >
          {config.action}
        </button>
      )}
      <button
        type="button"
        onClick={onDismiss}
        className={`shrink-0 p-0.5 rounded hover:opacity-60 transition-opacity cursor-pointer ${s.text}`}
      >
        <MdClose size={13} />
      </button>
    </div>
  );
};

const SubscriptionBanner = () => {
  const subscription = useSubscriptionStore((s) => s.subscription);
  const storage = useSubscriptionStore((s) => s.storage);
  const isLoaded = useSubscriptionStore((s) => s.isLoaded);
  const navigate = useNavigate();

  const [statusDismissed, setStatusDismissed] = useState(false);
  const [storageDismissed, setStorageDismissed] = useState(false);

  if (!isLoaded) return null;

  const statusBanner = statusDismissed ? null : getStatusBanner(subscription);
  const storageBanner = storageDismissed ? null : getStorageBanner(storage);

  if (!statusBanner && !storageBanner) return null;

  return (
    <div className="w-full shrink-0">
      {statusBanner && (
        <BannerRow
          config={statusBanner}
          onAction={() => navigate("/subscription")}
          onDismiss={() => setStatusDismissed(true)}
        />
      )}
      {storageBanner && (
        <BannerRow
          config={storageBanner}
          onAction={() => navigate("/subscription")}
          onDismiss={() => setStorageDismissed(true)}
        />
      )}
    </div>
  );
};

export default SubscriptionBanner;
