const STORAGE_KEY = "research_notifications_v1";
const UPDATE_EVENT = "research-notifications-updated";

const isClient = () => typeof window !== "undefined";

const safeParse = (value) => {
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const emitUpdate = () => {
    if (!isClient()) return;
    window.dispatchEvent(new Event(UPDATE_EVENT));
};

export function getNotifications() {
    if (!isClient()) return [];
    const items = safeParse(window.localStorage.getItem(STORAGE_KEY));
    return items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export function saveNotifications(items) {
    if (!isClient()) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    emitUpdate();
}

export function upsertNotification(notification) {
    const items = getNotifications();
    const index = items.findIndex((item) => item.id === notification.id);
    const nextItem = {
        ...notification,
        updatedAt: Date.now(),
    };

    if (index >= 0) {
        items[index] = {
            ...items[index],
            ...nextItem,
        };
    } else {
        items.unshift({
            read: false,
            createdAt: Date.now(),
            ...nextItem,
        });
    }

    saveNotifications(items);
}

export function updateNotificationStatus(id, status, message) {
    const items = getNotifications();
    const index = items.findIndex((item) => item.id === id);
    if (index < 0) return;

    items[index] = {
        ...items[index],
        status,
        message: message ?? items[index].message,
        updatedAt: Date.now(),
    };

    saveNotifications(items);
}

export function markAllNotificationsRead() {
    const items = getNotifications().map((item) => ({ ...item, read: true }));
    saveNotifications(items);
}

export function markNotificationRead(id) {
    const items = getNotifications();
    const index = items.findIndex((item) => item.id === id);
    if (index < 0) return;
    items[index] = { ...items[index], read: true };
    saveNotifications(items);
}

export function getUnreadNotificationsCount() {
    return getNotifications().filter((item) => !item.read).length;
}

export function notificationsUpdateEventName() {
    return UPDATE_EVENT;
}
