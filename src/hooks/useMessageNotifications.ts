import { useCallback, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/api';

type MessageListItem = {
  id: number;
  user_response: 'pending' | 'accepted' | 'rejected' | string;
  reward_given: boolean;
};

function safeParseJSON<T>(v: string | null, fallback: T): T {
  if (!v) return fallback;
  try {
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

export function useMessageNotifications(userId?: number) {
  const navigate = useNavigate();
  const pollingRef = useRef<number | null>(null);
  const isFetchingRef = useRef(false);

  const storageKey = useMemo(() => {
    if (!userId) return null;
    return `seen_message_ids_user_${userId}`;
  }, [userId]);

  const getSeenIds = useCallback(() => {
    if (!storageKey) return new Set<number>();
    const arr = safeParseJSON<number[]>(localStorage.getItem(storageKey), []);
    return new Set(arr.filter((n) => Number.isFinite(n)));
  }, [storageKey]);

  const saveSeenIds = useCallback(
    (ids: Set<number>) => {
      if (!storageKey) return;
      localStorage.setItem(storageKey, JSON.stringify(Array.from(ids)));
    },
    [storageKey]
  );

  const checkNewMessages = useCallback(async () => {
    if (!userId || !storageKey) return;
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    try {
      const res = await api.get('/customer/messages/');
      const list: MessageListItem[] = res.data?.data ?? [];

      const pending = (Array.isArray(list) ? list : []).filter(
        (m) => String(m.user_response).toLowerCase() === 'pending'
      );

      if (pending.length === 0) return;

      const seen = getSeenIds();

      // ابحث عن أول pending غير مُشاهَد
      const firstNew = pending.find((m) => !seen.has(m.id));
      if (!firstNew) return;

      // اعتبرها "seen" فوراً حتى لا يطلع نفس الإشعار كل polling
      seen.add(firstNew.id);
      saveSeenIds(seen);

      toast('New offer from admin', {
        description: 'You have a new task/offer. Open Messages to review and respond.',
        action: {
          label: 'Open',
          onClick: () => navigate('/app/messages'),
        },
      });
    } catch {
      // لا نزعج المستخدم برسائل خطأ على polling
    } finally {
      isFetchingRef.current = false;
    }
  }, [userId, storageKey, getSeenIds, saveSeenIds, navigate]);

  useEffect(() => {
    if (!userId) return;

    // أول check فوراً
    checkNewMessages();

    // Polling
    pollingRef.current = window.setInterval(() => {
      checkNewMessages();
    }, 30000); // 30s

    return () => {
      if (pollingRef.current) window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    };
  }, [userId, checkNewMessages]);
}
