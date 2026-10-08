import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    updateProfile,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
  } from 'firebase/auth';
  import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
  } from 'firebase/firestore';
  import { auth, db } from './config';
  
  /* ============================================================
   * LOGIN / LOGOUT
   * ============================================================ */
  
  export const loginWithEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);
  
  export const logout = () => signOut(auth);
  
  export const subscribeAuth = (cb) => onAuthStateChanged(auth, cb);
  
  /* ============================================================
   * PROFILE
   * ============================================================ */
  
  export async function getUserProfile(uid) {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? { uid, ...snap.data() } : null;
  }
  
  /**
   * Если профиля нет — создаёт его с дефолтными значениями.
   * ВНИМАНИЕ: удобно в dev, но небезопасно в продакшене.
   */
  export async function ensureUserProfile(user) {
    const existing = await getUserProfile(user.uid);
    if (existing) return existing;
  
    const profile = {
      email: user.email || '',
      fullName:
        user.displayName ||
        (user.email ? user.email.split('@')[0] : 'Foydalanuvchi'),
      role: 'attendant',
      stationId: 'station-1',
      columnId: null,
      active: true,
      createdAt: serverTimestamp(),
    };
  
    await setDoc(doc(db, 'users', user.uid), profile);
    return { uid: user.uid, ...profile };
  }
  
  /* ============================================================
   * ADMIN: создание пользователя из браузера
   * ============================================================ */
  
  export async function createUserByAdmin(adminEmail, adminPassword, data) {
    const cred = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );
  
    await updateProfile(cred.user, { displayName: data.fullName });
  
    await setDoc(doc(db, 'users', cred.user.uid), {
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      stationId: data.stationId,
      columnId: data.columnId || null,
      active: true,
      createdAt: serverTimestamp(),
    });
  
    await signOut(auth);
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
  
    return cred.user.uid;
  }
  
  /* ============================================================
   * CHANGE PASSWORD
   * ============================================================ */
  
  /**
   * Смена пароля текущего пользователя.
   * Firebase требует недавней аутентификации, поэтому сначала
   * переаутентифицируемся старым паролем.
   */
  export async function changeUserPassword(oldPassword, newPassword) {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('NO_USER');
  
    const cred = EmailAuthProvider.credential(user.email, oldPassword);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, newPassword);
  }