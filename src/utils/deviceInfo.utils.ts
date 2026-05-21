const DEVICE_ID_KEY = "device_id";

const getOrCreateDeviceId = (): string => {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
};

const getOSVersion = (): string => {
  const ua = navigator.userAgent;
  const windows = ua.match(/Windows NT ([\d.]+)/);
  if (windows) return `Windows ${windows[1]}`;
  const mac = ua.match(/Mac OS X ([\d_]+)/);
  if (mac) return `macOS ${mac[1].replace(/_/g, ".")}`;
  const android = ua.match(/Android ([\d.]+)/);
  if (android) return `Android ${android[1]}`;
  const ios = ua.match(/OS ([\d_]+) like Mac OS X/);
  if (ios) return `iOS ${ios[1].replace(/_/g, ".")}`;
  const linux = ua.match(/Linux/);
  if (linux) return "Linux";
  return "Unknown";
};

export const getDeviceId = (): string => getOrCreateDeviceId();

export const getDeviceHeaders = (): Record<string, string> => ({
  "X-Device-Id": getOrCreateDeviceId(),
  "X-Device-Type": "web",
  "X-Device-OS-Version": getOSVersion(),
  "X-App-Version": import.meta.env.VITE_APP_VERSION ?? "0.0.0",
});
