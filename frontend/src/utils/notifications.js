import { createElement } from "react";
import toast from "react-hot-toast";
import MessageToast from "../components/MessageToast.jsx";

export const isAppActive = () =>
  document.visibilityState === "visible" && document.hasFocus();

// Browser Notification permission
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
};

export const showBrowserNotification = ({ title, body, icon, onClick }) => {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }
  if (isAppActive()) return;

  const n = new Notification(title, {
    body,
    icon: icon || "/vite.svg",
    badge: "/vite.svg",
    tag: "chat-message", // same tag = replace old notification
  });

  n.onclick = () => {
    window.focus();
    n.close();
    if (onClick) onClick();
  };

  // Auto close after 5s
  setTimeout(() => n.close(), 5000);
};

export const showInAppNotification = ({ title, body, onClick }) => {
  toast.custom(
    (notification) =>
      createElement(MessageToast, {
        toastId: notification.id,
        title,
        body,
        onOpen: onClick,
      }),
    { duration: 5000 },
  );
};
