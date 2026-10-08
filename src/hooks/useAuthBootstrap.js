import { useEffect } from 'react';
import { subscribeAuth, ensureUserProfile } from '../firebase/auth';
import { getStation } from '../firebase/firestore';
import { useAuthStore } from '../store/authStore';

export function useAuthBootstrap() {
  const { setUser, setProfile, setStation, setLoading, reset } = useAuthStore();

  useEffect(() => {
    const unsub = subscribeAuth(async (user) => {
      if (!user) {
        reset();
        return;
      }
      setUser(user);
      try {
        const profile = await ensureUserProfile(user);
        setProfile(profile);

        if (profile?.stationId) {
          const station = await getStation(profile.stationId);
          setStation(station);
          console.log('STATION LOADED:', station);
        }
      } catch (e) {
        console.error('bootstrap error:', e);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, [setUser, setProfile, setStation, setLoading, reset]);
}