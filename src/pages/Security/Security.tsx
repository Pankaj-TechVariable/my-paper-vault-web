import { useSubscriptionStore } from "@/store/subscriptionStore";
import ChangePasswordCard from "./components/ChangePasswordCard";
import TwoFactorCard from "./components/TwoFactorCard";
import DisableLinksCard from "./components/DisableLinksCard";

const Security = () => {
  const hasActiveSubscription = useSubscriptionStore((s) => s.isActive());

  return (
    <div className="h-full flex flex-col overflow-hidden px-4 md:px-8 py-6">
      <div className="mb-5 shrink-0">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Security</h1>
        <p className="text-xs text-slate-400">Manage your password and account security settings</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3 max-w-2xl">
          <ChangePasswordCard />
          <TwoFactorCard />
          <DisableLinksCard disabled={!hasActiveSubscription} />
        </div>
      </div>
    </div>
  );
};

export default Security;
