import { useEffect, useState } from 'react';
import { subscribePaymentsRange } from '../firebase/firestore';
import { useAuthStore } from '../store/authStore';

export function useRangePayments(stationId, from, to) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user, profile } = useAuthStore();
  const attendantId = profile?.role === 'attendant' ? user?.uid : null;

  useEffect(() => {
    if (!stationId || !from || !to) return;
    setLoading(true);
    const unsub = subscribePaymentsRange(
      stationId,
      from,
      to,
      (data) => {
        setItems(data);
        setLoading(false);
      },
      attendantId
    );
    return unsub;
  }, [stationId, from?.getTime(), to?.getTime(), attendantId]);

  return { items, loading };
}