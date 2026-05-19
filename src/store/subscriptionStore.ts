import { create } from "zustand";
import type {
  MySubscription,
  MyStorage,
  SubscriptionData,
} from "@/api/endpoints/subscriptions";

// Pure helper — used inside selectors to avoid calling get() recursively
const statusIsActive = (sub: MySubscription | null): sub is MySubscription =>
  sub?.status === "ACTIVE";

interface SubscriptionState {
  subscription: MySubscription | null;
  storage: MyStorage | null;
  isLoaded: boolean;

  // Actions
  setData: (data: SubscriptionData) => void;
  markLoaded: () => void;
  clear: () => void;

  // Derived selectors — call these anywhere, even outside React
  isActive: () => boolean;
  isWriteBlocked: () => boolean;
  canUpload: () => boolean;
  isUploadRestricted: () => boolean;
  canManageFamily: () => boolean;
  canAddFamilyMember: (currentCount: number) => boolean;
  canAddDirectoryMember: (currentCount: number) => boolean;
  canGrantUploadAccess: (currentCount: number) => boolean;
  canGrantDownloadAccess: (currentCount: number) => boolean;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: null,
  storage: null,
  isLoaded: false,

  setData: ({ subscription, storage }) =>
    set({ subscription, storage, isLoaded: true }),

  markLoaded: () => set({ isLoaded: true }),

  clear: () => set({ subscription: null, storage: null, isLoaded: false }),

  isActive: () => statusIsActive(get().subscription),

  isWriteBlocked: () => {
    const { subscription } = get();
    if (!subscription) return true;
    return (
      subscription.status === "ARCHIVED" || subscription.status === "CANCELLED"
    );
  },

  canUpload: () => {
    const { subscription, storage } = get();
    return statusIsActive(subscription) && storage?.threshold !== "BLOCKED";
  },

  isUploadRestricted: () => {
    const status = get().subscription?.status;
    return status === "GRACE" || status === "RESTRICTED";
  },

  canManageFamily: () => {
    const { subscription } = get();
    return (
      statusIsActive(subscription) &&
      subscription.subscriptionPlan.allow_family_connections
    );
  },

  canAddFamilyMember: (currentCount: number) => {
    const { subscription } = get();
    if (!statusIsActive(subscription)) return false;
    if (!subscription.subscriptionPlan.allow_family_connections) return false;
    const max = subscription.subscriptionPlan.max_family_connections;
    return max === null || currentCount < max;
  },

  canAddDirectoryMember: (currentCount: number) => {
    const { subscription } = get();
    if (!statusIsActive(subscription)) return false;
    const max = subscription.subscriptionPlan.max_directory_members;
    return max === null || currentCount < max;
  },

  canGrantUploadAccess: (currentCount: number) => {
    const { subscription } = get();
    if (!statusIsActive(subscription)) return false;
    const max = subscription.subscriptionPlan.max_upload_members;
    return max === null || currentCount < max;
  },

  canGrantDownloadAccess: (currentCount: number) => {
    const { subscription } = get();
    if (!statusIsActive(subscription)) return false;
    const max = subscription.subscriptionPlan.max_download_members;
    return max === null || currentCount < max;
  },
}));
