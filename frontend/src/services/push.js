import api from "./api";

const publicKey =
  "TA_CLE_PUBLIQUE_VAPID";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export async function subscribeToPush() {
  const registration =
    await navigator.serviceWorker.ready;

  const subscription =
    await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey:
        urlBase64ToUint8Array(publicKey),
    });

  const token = localStorage.getItem("token");

  await api.post(
    "/push/subscribe",
    subscription,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}