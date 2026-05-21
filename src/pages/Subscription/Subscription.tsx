import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdOutlineCreditCard, MdOutlineRefresh } from "react-icons/md";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useCancelSubscription } from "@/hooks/useSubscriptionPlans";
import { parseBytes } from "@/api/endpoints/subscriptions";
import { handleApiError } from "@/errors/errorHandler";
import { toast } from "@/lib/toast";
import Button from "@/components/common/Button/Button";
import ConfirmModal from "@/components/common/ConfirmModal/ConfirmModal";
import PlanHeroCard from "./components/PlanHeroCard";
import BillingCard from "./components/BillingCard";
import StorageCard from "./components/StorageCard";
import SubscriptionSkeleton from "./components/SubscriptionSkeleton";

const Subscription = () => {
  const navigate = useNavigate();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const subscription = useSubscriptionStore((s) => s.subscription);
  const storage = useSubscriptionStore((s) => s.storage);
  const isLoaded = useSubscriptionStore((s) => s.isLoaded);

  const { mutate: cancel, isPending: isCancelling } = useCancelSubscription();

  if (!isLoaded) return <SubscriptionSkeleton />;

  if (!subscription) {
    return (
      <div className="h-full flex flex-col overflow-hidden px-4 md:px-8 py-6">
        <div className="mb-5 shrink-0">
          <h1 className="text-xl font-bold text-slate-900 mb-1">
            Subscription
          </h1>
          <p className="text-xs text-slate-400">
            Manage your subscription plan
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-2xl border border-slate-100 p-8 max-w-sm w-full text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
              <MdOutlineCreditCard size={26} className="text-primary" />
            </div>
            <p className="text-sm font-bold text-slate-900 mb-2">
              No Active Subscription
            </p>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Subscribe to unlock all features — family connections, larger
              storage, and more.
            </p>
            <Button
              label="Browse Plans"
              variant="contained"
              className="w-full"
              onClick={() => navigate("/subscription/plans")}
            />
          </div>
        </div>
      </div>
    );
  }

  const totalBytes = parseBytes(
    subscription.subscriptionPlan.max_storage_bytes,
  );
  const canCancel =
    subscription.status === "ACTIVE" || subscription.status === "GRACE";

  const handleCancel = () => {
    cancel(undefined, {
      onSuccess: () => {
        toast.success(
          "Subscription cancelled",
          "Your access continues until the current period ends.",
        );
        setConfirmCancel(false);
      },
      onError: handleApiError,
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden px-4 md:px-8 py-6">
      {/* Header */}
      <div className="mb-5 shrink-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h1 className="text-xl font-bold text-slate-900">Subscription</h1>
          <Button
            label="Change Plan"
            variant="outlined"
            startIcon={<MdOutlineRefresh size={14} />}
            className="h-auto! py-1.5! px-3! text-xs! shrink-0"
            onClick={() => navigate("/subscription/plans")}
          />
        </div>
        <p className="text-xs text-slate-400">
          Manage your current plan and billing
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PlanHeroCard subscription={subscription} />
          <BillingCard
            subscription={subscription}
            canCancel={canCancel}
            onCancelClick={() => setConfirmCancel(true)}
          />
          {storage && <StorageCard storage={storage} totalBytes={totalBytes} />}
        </div>
      </div>

      {confirmCancel && (
        <ConfirmModal
          title="Cancel Subscription"
          message="Are you sure you want to cancel? You'll retain access until the current billing period ends."
          confirmLabel="Yes, Cancel"
          onConfirm={handleCancel}
          onCancel={() => setConfirmCancel(false)}
          loading={isCancelling}
          destructive
        />
      )}
    </div>
  );
};

export default Subscription;
