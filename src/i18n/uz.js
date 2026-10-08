export const uz = {
    // common
    appName: 'GasPay',
    loading: 'Yuklanmoqda...',
    cancel: 'Bekor qilish',
    save: 'Saqlash',
    send: 'Yuborish',
    edit: 'Tahrirlash',
    delete: 'O‘chirish',
    close: 'Yopish',
    yes: 'Ha',
    no: 'Yo‘q',
    from: 'dan',
    to: 'gacha',
    date: 'Sana',
    time: 'Vaqt',
    amount: 'Summa',
    sum: 'so‘m',
    volume: "Hajm, m³",
    column: 'Kolonka',
    columnShort: 'Kol.',
    count: 'Soni',
    total: 'Jami',
    source: 'Manba',
    acceptedBy: 'Qabul qildi',
    method: 'To‘lov turi',
    vehicle: 'Mashina',
    none: '—',
    logout: 'Chiqish',
    profile: 'Profil',
    statistics: 'Statistika',
    accounting: 'Hisob',
    users: 'Foydalanuvchilar',
    home: 'Asosiy',
    theme: 'Mavzu',
    themeLight: 'Yorug‘',
    themeDark: 'Tungi',
    password: 'Parol',
    newPassword: 'Yangi parol',
    confirmPassword: 'Parolni tasdiqlash',
    oldPassword: 'Eski parol',
    changePassword: 'Parolni almashtirish',
    passwordChanged: 'Parol muvaffaqiyatli o‘zgartirildi',
    passwordsDontMatch: 'Parollar mos kelmadi',
    passwordTooShort: 'Parol kamida 6 belgidan iborat bo‘lishi kerak',
    wrongOldPassword: 'Eski parol noto‘g‘ri',
  
    // login
    loginTitle: 'Tizimga kirish',
    loginButton: 'Kirish',
    loginError: 'Email yoki parol xato',
    email: 'Email',
  
    // roles
    roleAdmin: 'Administrator',
    roleOperator: 'Operator',
    roleAttendant: 'Kolonkachi',
  
    // dashboards
    adminPanel: 'Administrator paneli',
    operatorPanel: 'Operator paneli',
    myStatistics: 'Mening statistikam',
    paymentsToday: 'Bugungi to‘lovlar',
    totalSum: 'Umumiy summa',
    cash: 'Naqd',
    card: 'Karta',
    qr: 'QR',
    cashShort: 'Naqd',
    cardShort: 'Karta',
    qrShort: 'QR',
    lastPayments: 'Oxirgi to‘lovlar',
    noPayments: 'Hozircha to‘lovlar yo‘q',
    latest: 'Oxirgi to‘lov',
    goToAccounting: 'Hisobga o‘tish',
    goToStatistics: 'Statistikaga o‘tish',
  
    // attendant
    acceptPayment: 'To‘lovni qabul qilish',
    myPayments: 'Mening to‘lovlarim',
    newPayment: 'Yangi to‘lov',
    pickColumn: 'Kolonkani tanlang',
    amountLabel: 'Summa',
    submit: 'Yuborish',
    paymentAccepted: 'To‘lov qabul qilindi ✓',
    paymentError: 'Saqlashda xatolik',
    noColumns:
      'Stansiyada kolonkalar soni ko‘rsatilmagan. stations/{sid} hujjatidagi columns maydonini tekshiring.',
  
    // accounting (operator/admin)
    accountingTitle: 'Bugungi to‘lovlar hisobi',
    quickPay: 'Kolonka bo‘yicha tezkor to‘lov',
    sound: 'Ovoz',
    onlineFeed: 'Onlayn lenta',
    paymentsCount: 'To‘lovlar soni',
    noColumnsHint:
      'Stansiyada kolonkalar soni ko‘rsatilmagan. stations/{sid} hujjatini tekshiring.',
  
    // statistics
    statsTitle: 'Statistika',
    statsByDate: 'Sana bo‘yicha',
    resetFilter: 'Qabul qiluvchi filtrini tiklash',
    acceptors: 'Qabul qiluvchilar',
    operatorCash: 'Operator (kassa)',
    payments: 'To‘lovlar',
    byAcceptors: 'Qabul qiluvchilar bo‘yicha',
    details: 'Batafsil',
    exportCsv: 'CSV eksport',
    noData: 'Tanlangan davr uchun ma’lumot yo‘q',
    noRecords: 'Yozuvlar yo‘q',
    colCash: 'Naqd',
    colColumn: 'Kolonka',
    colCashBadge: 'Kassa',
    shownFirst: 'Jami {total} dan birinchi 200 yozuv ko‘rsatildi. Sana oralig‘ini aniqlang.',
  
    // users
    usersTitle: 'Foydalanuvchilar',
    addUser: 'Foydalanuvchi qo‘shish',
    fullName: 'F.I.Sh.',
    role: 'Rol',
    station: 'Stansiya',
    active: 'Faol',
    disabled: 'O‘chirilgan',
    enable: 'Yoqish',
    disable: 'O‘chirish',
    noUsers: 'Foydalanuvchilar yo‘q',
    createUser: 'Yaratish',
    creating: 'Yaratilmoqda...',
    pickStation: '— tanlang —',
    adminPasswordPrompt: 'Tasdiqlash uchun administrator parolini kiriting',
  
    // profile
    profileTitle: 'Profil',
    profileEmail: 'Email',
    profileRole: 'Rol',
    profileStation: 'Stansiya',
    profileColumn: 'Kolonka',
  };
  
  export function t(key, vars) {
    let s = uz[key] ?? key;
    if (vars) {
      for (const k of Object.keys(vars)) {
        s = s.replace(`{${k}}`, vars[k]);
      }
    }
    return s;
  }