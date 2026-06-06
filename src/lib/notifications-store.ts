import { toast } from "sonner";

export interface NotificationItem {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  title: string;
  message: string;
  service: string;
  time: string;
  read: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    type: "critical",
    title: "Database Connection Failure",
    message: "prod-rds-us-east scaled and is rejecting connection bursts from checkout service.",
    service: "prod-rds-us-east",
    time: "4m ago",
    read: false,
  },
  {
    id: "notif-2",
    type: "warning",
    title: "Cost Forecast Spike (+37%)",
    message: "AI Cloud CFO predicts a $18,500 bill (+$4,900 from baseline) due to RDS autoscale.",
    service: "Billing Agent",
    time: "22m ago",
    read: false,
  },
  {
    id: "notif-3",
    type: "info",
    title: "Weekly Optimization Report Ready",
    message: "Acme Corp cost optimization metrics are compiled. $4,200/mo savings identified.",
    service: "Reporting Engine",
    time: "1h ago",
    read: false,
  },
  {
    id: "notif-4",
    type: "success",
    title: "Resolved: S3 latency in us-west-2",
    message: "S3 object requests latency returned to normal (avg 42ms). Recovery verified.",
    service: "S3 Storage US-West",
    time: "3h ago",
    read: true,
  },
];

let notificationsList: NotificationItem[] = [...initialNotifications];
const listeners = new Set<() => void>();

let ws: WebSocket | null = null;

export const notificationsStore = {
  initWebSocket() {
    if (typeof window === "undefined" || ws) return;
    try {
      ws = new WebSocket("ws://localhost:8000/ws/notifications");
      
      ws.onmessage = (event) => {
        try {
          const notif = JSON.parse(event.data);
          notificationsList = [notif, ...notificationsList];
          
          const type = notif.type;
          const toastFn = type === "critical" ? toast.error : type === "success" ? toast.success : type === "warning" ? toast.warning : toast.info;
          toastFn(`${notif.title}`, {
            description: notif.message,
            duration: 5000,
          });
          
          this.emit();
        } catch (err) {
          console.error("Error parsing websocket message", err);
        }
      };

      ws.onclose = () => {
        ws = null;
        setTimeout(() => this.initWebSocket(), 3000);
      };
    } catch (e) {
      console.error("WebSocket connection failed", e);
    }
  },

  getNotifications() {
    return notificationsList;
  },

  getUnreadCount() {
    return notificationsList.filter((n) => !n.read).length;
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  emit() {
    listeners.forEach((l) => l());
  },

  addNotification(type: NotificationItem["type"], title: string, message: string, service: string) {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type,
      title,
      message,
      service,
      time: "Just now",
      read: false,
    };
    notificationsList = [newNotif, ...notificationsList];
    
    // Trigger toast notification
    const toastFn = type === "critical" ? toast.error : type === "success" ? toast.success : type === "warning" ? toast.warning : toast.info;
    toastFn(`${title}`, {
      description: message,
      duration: 5000,
    });

    this.emit();
  },

  markAsRead(id: string) {
    notificationsList = notificationsList.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.emit();
  },

  markAllAsRead() {
    notificationsList = notificationsList.map((n) => ({ ...n, read: true }));
    this.emit();
  },

  clearAll() {
    notificationsList = [];
    this.emit();
  },
};

// Initialize connection on client side
if (typeof window !== "undefined") {
  notificationsStore.initWebSocket();
}
