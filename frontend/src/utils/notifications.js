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

export const showBrowserNotification = ({
  title,
  body,
  icon,
  tag,
  onClick,
}) => {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }
  if (isAppActive()) return;

  const options = {
    body,
    icon: icon || "/vite.svg",
    badge: "/vite.svg",
    // Per-conversation tag: alag chats ki notifications ek dusre ko
    // overwrite nahi karengi (default: "chat-message")
    tag: tag || "chat-message",
    renotify: true,
  };

  const n = new Notification(title, options);

  n.onclick = () => {
    window.focus();
    n.close();
    if (onClick) onClick();
  };
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
