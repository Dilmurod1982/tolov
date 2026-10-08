import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp,
  } from 'firebase/firestore';
  import { db } from './config';
  
  /* ============================================================
   * USERS
   * ============================================================ */
  
  export const usersCol = collection(db, 'users');
  
  export async function listUsers(stationId) {
    const q = stationId
      ? query(usersCol, where('stationId', '==', stationId))
      : query(usersCol, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
  }
  
  export async function updateUser(uid, data) {
    await updateDoc(doc(db, 'users', uid), data);
  }
  
  export async function deleteUserDoc(uid) {
    await deleteDoc(doc(db, 'users', uid));
  }
  
  /* ============================================================
   * STATIONS
   * ============================================================ */
  
  export async function listStations() {
    const snap = await getDocs(collection(db, 'stations'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  
  export async function getStation(stationId) {
    if (!stationId) return null;
    const snap = await getDoc(doc(db, 'stations', stationId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  }
  
  export async function createStation(data) {
    const ref = await addDoc(collection(db, 'stations'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  }
  
  export async function updateStation(stationId, data) {
    await updateDoc(doc(db, 'stations', stationId), data);
  }
  
  /* ============================================================
   * PAYMENTS
   * ============================================================ */
  
  export const paymentsCol = collection(db, 'payments');
  
  export async function createPayment({
    stationId,
    columnId,
    attendantId,
    attendantName,
    amount,
    volume = 0,
    vehicleNumber = '',
    method = 'cash',
    status = 'confirmed',
  }) {
    return addDoc(paymentsCol, {
      stationId,
      columnId: columnId != null ? String(columnId) : null,
      attendantId,
      attendantName,
      operatorId: null,
      operatorName: null,
      method,
      amount: Number(amount),
      volume: Number(volume),
      vehicleNumber: vehicleNumber.trim(),
      status,
      source: 'attendant',
      createdAt: serverTimestamp(),
    });
  }
  
  export async function createOperatorPayment({
    stationId,
    columnId,
    operatorId,
    operatorName,
    amount,
    method = 'cash',
  }) {
    return addDoc(paymentsCol, {
      stationId,
      columnId: columnId != null ? String(columnId) : null,
      attendantId: null,
      attendantName: null,
      operatorId,
      operatorName,
      method,
      amount: Number(amount),
      volume: 0,
      vehicleNumber: '',
      status: 'confirmed',
      source: 'operator',
      createdAt: serverTimestamp(),
    });
  }
  
  /**
   * ВАЖНО:
   * Фильтр по дате берём "с запасом" — 30 дней назад.
   * Это защищает от расхождения часов клиента и Firebase.
   * Точный день фильтруется уже на клиенте (или в Statistics по выбору).
   */
  const LOOKBACK_DAYS = 30;
  
  export function subscribeTodayPayments(stationId, cb, attendantId = null) {
    if (!stationId) return () => {};
  
    const start = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  
    const constraints = [
      where('stationId', '==', stationId),
      where('createdAt', '>=', Timestamp.fromDate(start)),
    ];
  
    if (attendantId) {
      constraints.push(where('attendantId', '==', attendantId));
    }
  
    const q = query(
      paymentsCol,
      ...constraints,
      orderBy('createdAt', 'desc')
    );
  
    return onSnapshot(
      q,
      (snap) => {
        cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => {
        console.error('[subscribeTodayPayments] ERROR:', err.code, err.message);
      }
    );
  }
  
  export function subscribePaymentsRange(
    stationId,
    from,
    to,
    cb,
    attendantId = null
  ) {
    if (!stationId || !from || !to) return () => {};
  
    const constraints = [
      where('stationId', '==', stationId),
      where('createdAt', '>=', Timestamp.fromDate(from)),
      where('createdAt', '<=', Timestamp.fromDate(to)),
    ];
  
    if (attendantId) {
      constraints.push(where('attendantId', '==', attendantId));
    }
  
    const q = query(
      paymentsCol,
      ...constraints,
      orderBy('createdAt', 'desc')
    );
  
    return onSnapshot(
      q,
      (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) =>
        console.error('[subscribePaymentsRange] ERROR:', err.code, err.message)
    );
  }
  
  export async function getPaymentsRange(stationId, from, to) {
    const q = query(
      paymentsCol,
      where('stationId', '==', stationId),
      where('createdAt', '>=', Timestamp.fromDate(from)),
      where('createdAt', '<=', Timestamp.fromDate(to)),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }