import { Bell, Clock, FileText, Megaphone } from "lucide-react";

export const mockNotices = [
  {
    id: 1,
    title: "Mid-Term Break",
    message:
      "School will be closed for mid-term break from Monday 20th to Friday 24th.",
    postedBy: "Admin",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    type: "holiday",
  },
  {
    id: 2,
    title: "PTA Meeting",
    message:
      "All parents are invited for the emergency PTA meeting scheduled for Saturday.",
    postedBy: "Principal",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    type: "meeting",
  },
  {
    id: 3,
    title: "Inter-house Sports",
    message:
      "Inter-house sports practice begins this Wednesday at the main field.",
    postedBy: "Mr. Olasunkanmi",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    type: "sports",
  },
];

// Simple helper for "time ago"
export const getTimeAgo = (dateString: string) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffInMs = now.getTime() - past.getTime();

  const minutes = Math.floor(diffInMs / (1000 * 60));
  const hours = Math.floor(diffInMs / (1000 * 60 * 60));
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export const noticeIcons: Record<string, any> = {
  holiday: Bell,
  meeting: Megaphone,
  sports: FileText,
  default: FileText,
};
