import { useEffect, useState } from 'react';
import { subscribeTodayPayments } from '../firebase/firestore';
import { useAuthStore } from '../store/authStore';

/**
 * Realtime-подписка на оплаты за сегодня для указанной станции.
 *
 * ВАЖНО:
 * - Для роли attendant фильтр по attendantId уходит прямо в Firestore,
 *   чтобы правила безопасности пропускали чтение.
 * - Для admin/operator фильтр по attendantId не нужен, они видят всё.
 */
export function useTodayPayments(stationId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user, profile } = useAuthStore();

  const attendantId =
    profile?.role === 'attendant' ? user?.uid : null;

  useEffect(() => {
    console.log('[useTodayPayments] effect, stationId =', stationId, 'attendantId =', attendantId);

    if (!stationId) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsub = subscribeTodayPayments(
      stationId,
      (data) => {
        console.log('[useTodayPayments] snapshot, count =', data.length);
        setItems(data);
        setLoading(false);
      },
      attendantId
    );

    return () => {
      console.log('[useTodayPayments] cleanup');
      unsub();
    };
  }, [stationId, attendantId]);

  return { items, loading };
}