import { FiMessageCircle, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

/** @typedef {{ toastId: string, title: string, body: string, onOpen?: () => void }} MessageToastProps */

/** @param {MessageToastProps} props */
const MessageToast = (props) => {
  const { toastId, title, body, onOpen } = props;
  const initials = title
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div
      role="status"
      className="pointer-events-auto flex w-[min(380px,calc(100vw-32px))] items-start gap-3 rounded-2xl border border-[#dce9e2] bg-white p-3.5 text-[#17211f] shadow-[0_16px_45px_rgba(16,40,31,0.2)]"
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open conversation with ${title}`}
        className="flex min-w-0 flex-1 items-start gap-3 text-left"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e5f4ef] text-sm font-bold text-[#087f68]">
          {initials || <FiMessageCircle aria-hidden="true" />}
        </span>
        <span className="min-w-0 flex-1 pt-0.5">
          <span className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#087f68]">
            <FiMessageCircle aria-hidden="true" size={12} />
            New message
          </span>
          <span className="block truncate text-sm font-bold">{title}</span>
          <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-[#71807b]">{body}</span>
        </span>
      </button>
      <button
        type="button"
        onClick={() => toast.dismiss(toastId)}
        aria-label="Dismiss notification"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[#71807b] transition hover:bg-[#f1f5f3] hover:text-[#17211f]"
      >
        <FiX aria-hidden="true" size={15} />
      </button>
    </div>
  );
};

export default MessageToast;