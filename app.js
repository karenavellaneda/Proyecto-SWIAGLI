(() => {
  'use strict';

  const DAY_NAMES = [
    { key: 'LUNES', label: 'Lunes' },
    { key: 'MARTES', label: 'Martes' },
    { key: 'MIERCOLES', label: 'Miércoles' },
    { key: 'JUEVES', label: 'Jueves' },
    { key: 'VIERNES', label: 'Viernes' },
    { key: 'SABADO', label: 'Sábado' },
    { key: 'DOMINGO', label: 'Domingo' }
  ];

  const EXPENSE_CATEGORIES = [
    'Insumos',
    'Servicios Públicos',
    'Arriendo',
    'Mantenimiento y Aseo',
    'Transporte',
    'Otros Gastos'
  ];

  const CONTRACT_TYPES = [
    { key: 'TERMINO_FIJO', label: 'Término Fijo' },
    { key: 'INDEFINIDO', label: 'Término Indefinido' },
    { key: 'OBRA_LABOR', label: 'Obra o Labor' },
    { key: 'PRESTACION_SERVICIOS', label: 'Prestación de Servicios' }
  ];

  const ROLE_LABELS = {
    ADMIN: 'Administrador',
    VENDEDOR: 'Vendedor',
    TRABAJADOR: 'Trabajador'
  };

  function formatCOP(value) {
    const num = Math.round(Number(value) || 0);
    const abs = Math.abs(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return num < 0 ? `-$${abs}` : `$${abs}`;
  }

  function getLocalDateString(date = new Date()) {
    const d = date instanceof Date ? date : new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function getLocalTimeString(date = new Date()) {
    const d = date instanceof Date ? date : new Date(date);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  function getLocalDateTimeISO(date = new Date()) {
    const d = date instanceof Date ? date : new Date(date);
    return `${getLocalDateString(d)}T${getLocalTimeString(d)}:${String(d.getSeconds()).padStart(2, '0')}`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const p = String(dateStr).slice(0, 10).split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dateStr;
  }

  function formatDateTime(isoStr) {
    if (!isoStr) return '—';
    const [d, t] = String(isoStr).split('T');
    return `${formatDate(d)}${t ? ' ' + t.slice(0, 5) : ''}`;
  }

  function getDayOfWeekKey(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'][new Date(y, m - 1, d).getDay()];
  }

  function diffDays(dateA, dateB) {
    const [y1, m1, d1] = dateA.split('-').map(Number);
    const [y2, m2, d2] = dateB.split('-').map(Number);
    return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
  }

  function timeToMinutes(hhmm) {
    const [h, m] = String(hhmm).split(':').map(Number);
    return h * 60 + m;
  }

  function addDays(dateStr, days) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + days);
    return getLocalDateString(dt);
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function requireNonEmpty(val, name) {
    if (val === null || val === undefined || String(val).trim() === '') {
      throw new Error(`El campo "${name}" es obligatorio.`);
    }
    return String(val).trim();
  }

  function requirePositiveInt(val, name) {
    const n = Number(val);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
      throw new Error(`"${name}" debe ser un número entero mayor a 0.`);
    }
    return n;
  }

  function requireNonNegativeInt(val, name) {
    const n = Number(val);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
      throw new Error(`"${name}" debe ser un número entero mayor o igual a 0.`);
    }
    return n;
  }

  function requireValidEmail(val, name = 'Correo electrónico') {
    const email = requireNonEmpty(val, name).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error(`El campo "${name}" no tiene un formato válido.`);
    }
    return email;
  }

  function validatePasswordStrength(pwd) {
    const s = String(pwd || '');
    if (s.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
    if (!/[A-ZÁÉÍÓÚÑ]/.test(s)) throw new Error('La contraseña debe incluir al menos una letra mayúscula.');
    if (!/[0-9]/.test(s)) throw new Error('La contraseña debe incluir al menos un número.');
  }

  function validateDateRange(from, to, lFrom = 'Desde', lTo = 'Hasta') {
    if (from && to && String(from) > String(to)) {
      throw new Error(`"${lFrom}" no puede ser posterior a "${lTo}".`);
    }
  }

  function validateTimeRange(start, end) {
    if (!start || !end) throw new Error('Indique hora de entrada y salida, o déjelas vacías para día libre.');
    if (start >= end) throw new Error('La hora de entrada debe ser menor que la hora de salida.');
  }

  function bytesToHex(bytes) {
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  function generateSalt(len = 16) {
    const arr = new Uint8Array(len);
    if (globalThis.crypto && globalThis.crypto.getRandomValues) {
      crypto.getRandomValues(arr);
    } else {
      for (let i = 0; i < len; i++) arr[i] = Math.floor(Math.random() * 256);
    }
    return bytesToHex(arr);
  }

  function sha256Fallback(str) {
    const bytes = new TextEncoder().encode(str);
    const K = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];
    const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const l = bytes.length;
    const bitLen = l * 8;
    const padded = new Uint8Array(((l + 9 + 63) >> 6) << 6);
    padded.set(bytes);
    padded[l] = 0x80;
    const dv = new DataView(padded.buffer);
    dv.setUint32(padded.length - 4, bitLen >>> 0, false);
    dv.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000), false);
    const w = new Uint32Array(64);
    const rotr = (n, x) => (x >>> n) | (x << (32 - n));
    for (let i = 0; i < padded.length; i += 64) {
      for (let j = 0; j < 16; j++) w[j] = dv.getUint32(i + j * 4, false);
      for (let j = 16; j < 64; j++) {
        const s0 = rotr(7, w[j - 15]) ^ rotr(18, w[j - 15]) ^ (w[j - 15] >>> 3);
        const s1 = rotr(17, w[j - 2]) ^ rotr(19, w[j - 2]) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0;
      }
      let [a, b, c, d, e, f, g, h] = H;
      for (let j = 0; j < 64; j++) {
        const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
        const ch = (e & f) ^ ((~e) & g);
        const t1 = (h + S1 + ch + K[j] + w[j]) >>> 0;
        const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      [a, b, c, d, e, f, g, h].forEach((v, idx) => { H[idx] = (H[idx] + v) >>> 0; });
    }
    return H.map((x) => x.toString(16).padStart(8, '0')).join('');
  }

  async function hashPassword(password, salt) {
    const text = `${salt}:${password}`;
    if (globalThis.crypto && globalThis.crypto.subtle) {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return bytesToHex(new Uint8Array(digest));
    }
    return sha256Fallback(text);
  }

  async function verifyPassword(password, salt, expectedHash) {
    return (await hashPassword(password, salt)) === expectedHash;
  }

  function exportReportToPDF(report) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error('La librería jsPDF no está disponible. Verifique su conexión a internet.');
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: report.columns.length > 6 ? 'landscape' : 'portrait' });
    doc.setFontSize(15);
    doc.setTextColor(83, 42, 21);
    doc.text('SWIACLI — Cafetería y Panadería Tunja', 14, 16);
    doc.setFontSize(12);
    doc.text(report.title, 14, 24);
    doc.setFontSize(9);
    doc.setTextColor(110, 90, 79);
    doc.text(`${report.subtitle} | Generado: ${formatDateTime(getLocalDateTimeISO())}`, 14, 30);

    let startY = 36;
    if (report.summaryItems && report.summaryItems.length) {
      const line = report.summaryItems.map((s) => `${s.label}: ${s.value}`).join(' | ');
      doc.setFontSize(9.5);
      doc.setTextColor(42, 26, 18);
      const split = doc.splitTextToSize(line, doc.internal.pageSize.getWidth() - 28);
      doc.text(split, 14, startY);
      startY += split.length * 5 + 4;
    }

    doc.autoTable({
      startY,
      head: [report.columns],
      body: report.rows,
      styles: { fontSize: 8.5, cellPadding: 2.5 },
      headStyles: { fillColor: [83, 42, 21], textColor: [255, 250, 244] },
      alternateRowStyles: { fillColor: [250, 244, 236] }
    });
    doc.save(`swiacli_${report.type || 'reporte'}_${getLocalDateString()}.pdf`);
  }

  const ALL_PERMISSIONS_META = [
    { key: 'dashboard.view', label: 'Panel principal' },
    { key: 'users.manage', label: 'Gestionar usuarios y roles' },
    { key: 'inventory.view', label: 'Consultar inventario y alertas' },
    { key: 'inventory.manage', label: 'Productos y movimientos de inventario' },
    { key: 'suppliers.manage', label: 'Proveedores' },
    { key: 'cash.open', label: 'Abrir caja' },
    { key: 'sales.create', label: 'Registrar ventas y operaciones de caja' },
    { key: 'sales.view', label: 'Consultar ventas e historial de cajas' },
    { key: 'cash.movements', label: 'Ingresos y egresos de caja' },
    { key: 'sales.void', label: 'Anular ventas' },
    { key: 'cash.close', label: 'Cerrar caja (arqueo)' },
    { key: 'accounting.manage', label: 'Gastos, pagos y resumen financiero' },
    { key: 'hr.manage', label: 'Trabajadores, hojas de vida y contratos' },
    { key: 'attendance.all', label: 'Gestionar horarios y asistencia de todos' },
    { key: 'attendance.own', label: 'Registrar y consultar la propia asistencia y horario' },
    { key: 'reports.view', label: 'Reportes' }
  ];

  const DEFAULT_ROLE_PERMISSIONS = {
    ADMIN: ALL_PERMISSIONS_META.map((p) => p.key),
    VENDEDOR: ['dashboard.view', 'inventory.view', 'cash.open', 'sales.create', 'sales.view', 'cash.movements', 'attendance.own'],
    TRABAJADOR: ['attendance.own']
  };

  class Repository {
    constructor(key = 'swiacli_db_v1') {
      this.key = key;
      this.sessionKey = `${key}_session`;
    }
    _empty() {
      return {
        initialized: false, meta: { saleCounter: 0 }, rolePermissions: {}, users: [], passwordResetTokens: [],
        auditLogs: [], products: [], inventoryMovements: [], suppliers: [], cashRegisters: [], cashMovements: [],
        sales: [], expenses: [], staffPayments: [], resumes: [], workers: [], contracts: [], schedules: [], attendance: []
      };
    }
    getState() {
      try {
        const raw = localStorage.getItem(this.key);
        return raw ? { ...this._empty(), ...JSON.parse(raw) } : this._empty();
      } catch {
        return this._empty();
      }
    }
    setState(st) { localStorage.setItem(this.key, JSON.stringify(st)); }
    isInitialized() { return Boolean(this.getState().initialized); }
    getCollection(name) { const s = this.getState(); return Array.isArray(s[name]) ? s[name] : []; }
    saveCollection(name, items) { const s = this.getState(); s[name] = items; this.setState(s); }
    getRolePermissions() { return this.getState().rolePermissions || {}; }
    saveRolePermissions(map) { const s = this.getState(); s.rolePermissions = map; this.setState(s); }
    getMeta(k) { return (this.getState().meta || {})[k]; }
    setMeta(k, v) { const s = this.getState(); s.meta = s.meta || {}; s.meta[k] = v; this.setState(s); }
    runTransaction(fn) {
      const snap = localStorage.getItem(this.key);
      try { return fn(); } catch (err) {
        if (snap === null) localStorage.removeItem(this.key); else localStorage.setItem(this.key, snap);
        throw err;
      }
    }
    getSessionUserId() { return localStorage.getItem(this.sessionKey); }
    setSessionUserId(id) { if (id) localStorage.setItem(this.sessionKey, id); else localStorage.removeItem(this.sessionKey); }
    clear() { localStorage.removeItem(this.key); localStorage.removeItem(this.sessionKey); }
  }

  const repo = new Repository(globalThis.SWIACLI_DB_KEY || 'swiacli_db_v1');

  async function createSeedData() {
    const today = getLocalDateString();
    const nowIso = getLocalDateTimeISO();
    const monthStart = `${today.slice(0, 8)}01`;
    const s1 = generateSalt(), s2 = generateSalt(), s3 = generateSalt();
    const [h1, h2, h3] = await Promise.all([
      hashPassword('Admin123', s1),
      hashPassword('Clave1234', s2),
      hashPassword('Clave1234', s3)
    ]);

    return {
      initialized: true,
      meta: { saleCounter: 0 },
      rolePermissions: JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS)),
      users: [
        { id: 'usr-admin', username: 'admin', email: 'admin@swiacli.local', fullName: 'Administrador General', role: 'ADMIN', status: 'ACTIVO', passwordHash: h1, salt: s1, failedAttempts: 0, lockedUntil: null, workerId: null },
        { id: 'usr-vendedor', username: 'vendedor', email: 'vendedor@swiacli.local', fullName: 'Laura Gómez', role: 'VENDEDOR', status: 'ACTIVO', passwordHash: h2, salt: s2, failedAttempts: 0, lockedUntil: null, workerId: 'wrk-1' },
        { id: 'usr-trabajador', username: 'trabajador', email: 'trabajador@swiacli.local', fullName: 'Pedro Rojas', role: 'TRABAJADOR', status: 'ACTIVO', passwordHash: h3, salt: s3, failedAttempts: 0, lockedUntil: null, workerId: 'wrk-2' }
      ],
      passwordResetTokens: [],
      auditLogs: [{ id: 'aud-1', timestamp: nowIso, userId: 'usr-admin', username: 'admin', action: 'INICIALIZACION', detail: 'Datos de ejemplo cargados para SWIACLI Tunja' }],
      suppliers: [
        { id: 'sup-1', name: 'Distribuidora La Sabana', nit: '900123456-1', phone: '3101234567', email: 'ventas@lasabana.co', active: true },
        { id: 'sup-2', name: 'Café Tostado Cordillera', nit: '800456789-2', phone: '3112233445', email: 'pedidos@cafecordillera.co', active: true },
        { id: 'sup-3', name: 'Lácteos del Valle (Inactivo)', nit: '890999111-3', phone: '6087409988', email: 'contacto@lacteos.co', active: false }
      ],
      products: [
        { id: 'prd-1', code: 'PAS-002', name: 'Brownie', description: 'Brownie artesanal de chocolate', category: 'Pastelería', salePrice: 4500, stock: 0, minStock: 6, active: true },
        { id: 'prd-2', code: 'BEB-002', name: 'Café americano', description: 'Café filtrado tradicional 9 oz', category: 'Bebidas', salePrice: 3000, stock: 60, minStock: 15, active: true },
        { id: 'prd-3', code: 'PAN-001', name: 'Croissant', description: 'Croissant hojaldrado de mantequilla', category: 'Panadería', salePrice: 6000, stock: 10, minStock: 12, active: true },
        { id: 'prd-4', code: 'BEB-001', name: 'Limonada', description: 'Limonada natural recién preparada', category: 'Bebidas', salePrice: 5000, stock: 40, minStock: 10, active: true },
        { id: 'prd-5', code: 'PAN-002', name: 'Pan de queso', description: 'Recién horneado con queso campesino', category: 'Panadería', salePrice: 2500, stock: 30, minStock: 10, active: true },
        { id: 'prd-6', code: 'PAS-001', name: 'Torta de chocolate (porción)', description: 'Con cobertura de cacao', category: 'Pastelería', salePrice: 7500, stock: 12, minStock: 5, active: true }
      ],
      inventoryMovements: [
        { id: 'mov-1', date: nowIso, userId: 'usr-admin', username: 'admin', productId: 'prd-2', productCode: 'BEB-002', productName: 'Café americano', type: 'ENTRADA', quantity: 60, reason: 'Carga inicial de barra', supplierId: 'sup-2', supplierName: 'Café Tostado Cordillera' },
        { id: 'mov-2', date: nowIso, userId: 'usr-admin', username: 'admin', productId: 'prd-3', productCode: 'PAN-001', productName: 'Croissant', type: 'ENTRADA', quantity: 10, reason: 'Horneado inicial', supplierId: 'sup-1', supplierName: 'Distribuidora La Sabana' }
      ],
      cashRegisters: [],
      cashMovements: [],
      sales: [],
      expenses: [
        { id: 'exp-1', description: 'Harina de trigo', date: monthStart, category: 'Insumos', amount: 85000, supplierId: 'sup-1', supplierName: 'Distribuidora La Sabana', responsibleUserId: 'usr-admin', responsibleName: 'admin', status: 'ACTIVO', voidReason: null, voidedAt: null, voidedBy: null }
      ],
      staffPayments: [
        { id: 'pay-1', workerId: 'wrk-1', workerName: 'Laura Gómez', date: monthStart, concept: 'Quincena', amount: 600000, status: 'ACTIVO', voidReason: null, voidedAt: null, voidedBy: null }
      ],
      resumes: [
        {
          id: 'res-1', document: '1052001111', fullName: 'Laura Gómez', phone: '3124567890', email: 'laura.gomez@swiacli.local', address: 'Calle 19 # 10-45, Tunja', dataAuthorization: true,
          education: [{ institution: 'SENA Boyacá', title: 'Técnico en Barismo y Atención', startDate: '2022-02-01', endDate: '2023-06-30' }],
          experience: [{ company: 'Café Central Tunja', role: 'Cajera', startDate: '2023-08-01', endDate: '2024-09-30', description: 'Caja y atención en barra.' }]
        },
        {
          id: 'res-2', document: '1052002222', fullName: 'Pedro Rojas', phone: '3109876543', email: 'pedro.rojas@swiacli.local', address: 'Carrera 14 # 22-18, Tunja', dataAuthorization: true,
          education: [{ institution: 'SENA Tunja', title: 'Panadería Artesanal', startDate: '2020-02-01', endDate: '2021-11-30' }],
          experience: [{ company: 'Horno Real', role: 'Panadero', startDate: '2022-01-15', endDate: '2024-08-20', description: 'Producción diaria de panadería.' }]
        }
      ],
      workers: [
        { id: 'wrk-1', resumeId: 'res-1', position: 'Cajera', hireDate: '2024-10-01', status: 'ACTIVO' },
        { id: 'wrk-2', resumeId: 'res-2', position: 'Panadero', hireDate: '2024-09-01', status: 'ACTIVO' }
      ],
      contracts: [
        { id: 'ctr-1', workerId: 'wrk-1', type: 'TERMINO_FIJO', startDate: addDays(today, -200), endDate: addDays(today, 90), position: 'Cajera', salary: 1450000, voided: false, voidReason: null },
        { id: 'ctr-2', workerId: 'wrk-2', type: 'TERMINO_FIJO', startDate: addDays(today, -345), endDate: addDays(today, 20), position: 'Panadero', salary: 1700000, voided: false, voidReason: null }
      ],
      schedules: [
        { workerId: 'wrk-1', days: { LUNES: { startTime: '07:00', endTime: '15:00' }, MARTES: { startTime: '07:00', endTime: '15:00' }, MIERCOLES: { startTime: '07:00', endTime: '15:00' }, JUEVES: { startTime: '07:00', endTime: '15:00' }, VIERNES: { startTime: '07:00', endTime: '15:00' }, SABADO: { startTime: '07:00', endTime: '15:00' }, DOMINGO: null } },
        { workerId: 'wrk-2', days: { LUNES: { startTime: '07:00', endTime: '15:00' }, MARTES: { startTime: '07:00', endTime: '15:00' }, MIERCOLES: { startTime: '07:00', endTime: '15:00' }, JUEVES: { startTime: '07:00', endTime: '15:00' }, VIERNES: { startTime: '07:00', endTime: '15:00' }, SABADO: { startTime: '07:00', endTime: '15:00' }, DOMINGO: null } }
      ],
      attendance: [{ id: 'att-1', workerId: 'wrk-1', workerName: 'Laura Gómez', date: addDays(today, -1), clockIn: '07:02', clockOut: '15:04', observation: 'Puntual' }]
    };
  }

  async function ensureSeeded() {
    if (!repo.isInitialized()) repo.setState(await createSeedData());
  }

  async function resetToSeed() {
    repo.clear();
    repo.setState(await createSeedData());
  }

  // ==========================================================================
  // Servicio de autenticación, usuarios y roles
  // ==========================================================================
  const authService = (() => {
    const LOCK_MS = 15 * 60 * 1000;
    const GENERIC_ERR = 'Usuario o contraseña incorrectos';

    function logAudit(action, detail, actor = null) {
      const current = actor || getCurrentUser();
      const logs = repo.getCollection('auditLogs');
      logs.unshift({
        id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: getLocalDateTimeISO(),
        userId: current ? current.id : null,
        username: current ? current.username : 'sistema',
        action,
        detail
      });
      repo.saveCollection('auditLogs', logs);
    }

    function getCurrentUser() {
      const uid = repo.getSessionUserId();
      if (!uid) return null;
      const u = repo.getCollection('users').find((x) => x.id === uid);
      return u && u.status === 'ACTIVO' ? u : null;
    }

    function hasPermission(perm, user = getCurrentUser()) {
      if (!user || user.status !== 'ACTIVO') return false;
      if (user.role === 'ADMIN') return true;
      return (repo.getRolePermissions()[user.role] || []).includes(perm);
    }

    function requirePermission(perm) {
      const u = getCurrentUser();
      if (!u) throw new Error('Debe iniciar sesión.');
      if (!hasPermission(perm, u)) throw new Error('Acceso denegado.');
      return u;
    }

    async function login(identifier, password, nowMs = Date.now()) {
      const idClean = String(identifier || '').trim().toLowerCase();
      const pwd = String(password || '');
      if (!idClean || !pwd) throw new Error(GENERIC_ERR);

      const users = repo.getCollection('users');
      const idx = users.findIndex((u) => u.username.toLowerCase() === idClean || u.email.toLowerCase() === idClean);
      if (idx === -1) {
        logAudit('LOGIN_FALLIDO', `Identificador inexistente "${idClean}"`, { id: null, username: idClean });
        throw new Error(GENERIC_ERR);
      }

      const u = users[idx];
      if (u.status === 'INACTIVO') throw new Error(GENERIC_ERR);
      if (u.status === 'BLOQUEADO') {
        if (u.lockedUntil && nowMs >= u.lockedUntil) {
          u.status = 'ACTIVO';
          u.failedAttempts = 0;
          u.lockedUntil = null;
          users[idx] = u;
          repo.saveCollection('users', users);
        } else {
          throw new Error(GENERIC_ERR);
        }
      }

      if (!(await verifyPassword(pwd, u.salt, u.passwordHash))) {
        u.failedAttempts = (u.failedAttempts || 0) + 1;
        if (u.failedAttempts >= 5) {
          u.status = 'BLOQUEADO';
          u.lockedUntil = nowMs + LOCK_MS;
          logAudit('BLOQUEO_USUARIO', `Usuario "${u.username}" bloqueado 15 min`, u);
        } else {
          logAudit('LOGIN_FALLIDO', `Clave incorrecta "${u.username}" (${u.failedAttempts}/5)`, u);
        }
        users[idx] = u;
        repo.saveCollection('users', users);
        throw new Error(GENERIC_ERR);
      }

      u.failedAttempts = 0;
      u.lockedUntil = null;
      users[idx] = u;
      repo.saveCollection('users', users);
      repo.setSessionUserId(u.id);
      logAudit('LOGIN_EXITOSO', `Inicio de sesión de "${u.username}"`, u);
      return u;
    }

    function logout() {
      const u = getCurrentUser();
      if (u) logAudit('LOGOUT', `Cierre de sesión de "${u.username}"`, u);
      repo.setSessionUserId(null);
    }

    function updateRolePermissions(role, perms) {
      const actor = requirePermission('users.manage');
      if (role === 'ADMIN') throw new Error('Los permisos del Administrador no se pueden modificar.');
      if (!['VENDEDOR', 'TRABAJADOR'].includes(role)) throw new Error('Rol no válido.');
      const valid = new Set(ALL_PERMISSIONS_META.map((p) => p.key));
      const clean = [...new Set((perms || []).filter((p) => valid.has(p)))];
      const map = repo.getRolePermissions();
      map[role] = clean;
      repo.saveRolePermissions(map);
      logAudit('CAMBIO_PERMISOS', `Permisos actualizados para ${role}`, actor);
      return clean;
    }

    function _ensureActiveAdmin(users, ignoreId, nextRole, nextStatus) {
      const count = users.filter((u) =>
        u.id === ignoreId ? nextRole === 'ADMIN' && nextStatus === 'ACTIVO' : u.role === 'ADMIN' && u.status === 'ACTIVO'
      ).length;
      if (count < 1) throw new Error('Siempre debe existir al menos un Administrador activo.');
    }

    async function createUser(data) {
      const actor = requirePermission('users.manage');
      const username = requireNonEmpty(data.username, 'Usuario').toLowerCase();
      const email = requireValidEmail(data.email, 'Correo');
      const fullName = requireNonEmpty(data.fullName || username, 'Nombre');
      const role = requireNonEmpty(data.role, 'Rol');
      if (!['ADMIN', 'VENDEDOR', 'TRABAJADOR'].includes(role)) throw new Error('Rol no válido.');
      validatePasswordStrength(data.password);

      const users = repo.getCollection('users');
      if (users.some((u) => u.username.toLowerCase() === username)) throw new Error(`El usuario "${username}" ya existe.`);
      if (users.some((u) => u.email.toLowerCase() === email)) throw new Error(`El correo "${email}" ya existe.`);

      const salt = generateSalt();
      const passwordHash = await hashPassword(data.password, salt);
      const u = {
        id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        username, email, fullName, role, status: 'ACTIVO', passwordHash, salt,
        failedAttempts: 0, lockedUntil: null, workerId: data.workerId || null
      };
      users.push(u);
      repo.saveCollection('users', users);
      logAudit('CREACION_USUARIO', `Usuario "${username}" creado (${role})`, actor);
      return u;
    }

    function updateUser(id, data) {
      const actor = requirePermission('users.manage');
      const users = repo.getCollection('users');
      const idx = users.findIndex((u) => u.id === id);
      if (idx === -1) throw new Error('Usuario no encontrado.');
      const cur = users[idx];
      const role = data.role ?? cur.role;
      const status = data.status ?? cur.status;
      const email = requireValidEmail(data.email ?? cur.email, 'Correo');
      if (users.some((u) => u.id !== id && u.email.toLowerCase() === email)) {
        throw new Error('Ese correo ya pertenece a otro usuario.');
      }
      _ensureActiveAdmin(users, id, role, status);

      users[idx] = {
        ...cur,
        email,
        fullName: data.fullName !== undefined ? requireNonEmpty(data.fullName, 'Nombre') : cur.fullName,
        role,
        status,
        workerId: data.workerId !== undefined ? data.workerId || null : cur.workerId,
        failedAttempts: status === 'ACTIVO' ? 0 : cur.failedAttempts,
        lockedUntil: status === 'ACTIVO' ? null : cur.lockedUntil
      };
      repo.saveCollection('users', users);
      if (cur.role !== role) logAudit('CAMBIO_ROL', `Rol de "${cur.username}" a ${role}`, actor);
      if (cur.status !== status) logAudit('CAMBIO_ESTADO', `Estado de "${cur.username}" a ${status}`, actor);
      return users[idx];
    }

    function unlockUser(id) {
      const actor = requirePermission('users.manage');
      const users = repo.getCollection('users');
      const idx = users.findIndex((u) => u.id === id);
      if (idx === -1) throw new Error('Usuario no encontrado.');
      users[idx] = { ...users[idx], status: 'ACTIVO', failedAttempts: 0, lockedUntil: null };
      repo.saveCollection('users', users);
      logAudit('DESBLOQUEO_USUARIO', `Desbloqueo de "${users[idx].username}"`, actor);
      return users[idx];
    }

    async function changeOwnPassword(currentPwd, newPwd) {
      const u = getCurrentUser();
      if (!u) throw new Error('Debe iniciar sesión.');
      if (!(await verifyPassword(currentPwd, u.salt, u.passwordHash))) {
        throw new Error('La contraseña actual es incorrecta.');
      }
      validatePasswordStrength(newPwd);
      const salt = generateSalt();
      const passwordHash = await hashPassword(newPwd, salt);
      const users = repo.getCollection('users');
      const idx = users.findIndex((x) => x.id === u.id);
      users[idx] = { ...users[idx], salt, passwordHash };
      repo.saveCollection('users', users);
      logAudit('CAMBIO_CLAVE', `Usuario "${u.username}" cambió su contraseña`, u);
    }

    function requestPasswordReset(identifier) {
      const idClean = requireNonEmpty(identifier, 'Correo electrónico o usuario').toLowerCase();
      const user = repo.getCollection('users').find((u) => u.username.toLowerCase() === idClean || u.email.toLowerCase() === idClean);
      if (!user || user.status === 'INACTIVO') return null;
      const token = generateSalt(16);
      const tokens = repo.getCollection('passwordResetTokens');
      tokens.push({ token, userId: user.id, username: user.username, expiresAt: Date.now() + 30 * 60 * 1000, used: false });
      repo.saveCollection('passwordResetTokens', tokens);
      logAudit('SOLICITUD_CLAVE', `Token generado para "${user.username}"`, user);
      return { token, username: user.username };
    }

    async function resetPasswordWithToken(token, newPwd) {
      const clean = requireNonEmpty(token, 'Token');
      validatePasswordStrength(newPwd);
      const tokens = repo.getCollection('passwordResetTokens');
      const tIdx = tokens.findIndex((t) => t.token === clean);
      if (tIdx === -1) throw new Error('Token inválido.');
      const rec = tokens[tIdx];
      if (rec.used) throw new Error('Este token ya fue utilizado.');
      if (Date.now() > rec.expiresAt) throw new Error('El token ha expirado (vigencia 30 minutos).');

      const users = repo.getCollection('users');
      const uIdx = users.findIndex((u) => u.id === rec.userId);
      if (uIdx === -1) throw new Error('Usuario no encontrado.');
      const salt = generateSalt();
      const passwordHash = await hashPassword(newPwd, salt);
      users[uIdx] = {
        ...users[uIdx], salt, passwordHash, failedAttempts: 0, lockedUntil: null,
        status: users[uIdx].status === 'BLOQUEADO' ? 'ACTIVO' : users[uIdx].status
      };
      tokens[tIdx] = { ...rec, used: true };
      repo.saveCollection('users', users);
      repo.saveCollection('passwordResetTokens', tokens);
      logAudit('RESTABLECER_CLAVE', `Clave restablecida para "${users[uIdx].username}"`, users[uIdx]);
    }

    return {
      logAudit, getCurrentUser, hasPermission, requirePermission, login, logout,
      getRolePermissions: () => repo.getRolePermissions(), updateRolePermissions,
      listUsers: () => { requirePermission('users.manage'); return repo.getCollection('users'); },
      createUser, updateUser, unlockUser, changeOwnPassword, requestPasswordReset, resetPasswordWithToken,
      listAuditLogs: () => { requirePermission('users.manage'); return repo.getCollection('auditLogs'); }
    };
  })();

  // ==========================================================================
  // Servicio de inventario y proveedores
  // ==========================================================================
  const inventoryService = (() => {
    function getProductStatus(p) {
      if (!p.active) return 'Inactivo';
      if (p.stock === 0) return 'Agotado';
      if (p.stock <= p.minStock) return 'Stock bajo';
      return 'Disponible';
    }

    function listProducts({ search = '', category = '', onlyActive = false } = {}) {
      authService.requirePermission('inventory.view');
      const term = search.trim().toLowerCase();
      return repo.getCollection('products').filter((p) => {
        if (onlyActive && !p.active) return false;
        if (category && p.category !== category) return false;
        if (term && !p.name.toLowerCase().includes(term) && !p.code.toLowerCase().includes(term)) return false;
        return true;
      }).map((p) => ({ ...p, statusLabel: getProductStatus(p) }));
    }

    function getProductById(id) { return repo.getCollection('products').find((p) => p.id === id) || null; }
    function getLowStockProducts() {
      return repo.getCollection('products').filter((p) => p.active && p.stock <= p.minStock).map((p) => ({ ...p, statusLabel: getProductStatus(p) }));
    }
    function getCategories() { return [...new Set(repo.getCollection('products').map((p) => p.category))].sort(); }

    function createProduct(data) {
      const user = authService.requirePermission('inventory.manage');
      const code = requireNonEmpty(data.code, 'Código').toUpperCase();
      const name = requireNonEmpty(data.name, 'Nombre');
      const description = String(data.description || '').trim();
      const category = requireNonEmpty(data.category, 'Categoría');
      const salePrice = requirePositiveInt(data.salePrice, 'Precio de venta');
      const stock = requireNonNegativeInt(data.stock ?? 0, 'Stock inicial');
      const minStock = requireNonNegativeInt(data.minStock ?? 0, 'Stock mínimo');
      const active = data.active !== false;

      const products = repo.getCollection('products');
      if (products.some((p) => p.code.toUpperCase() === code)) throw new Error(`Ya existe el código "${code}".`);

      return repo.runTransaction(() => {
        const prod = { id: `prd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, code, name, description, category, salePrice, stock, minStock, active };
        products.push(prod);
        repo.saveCollection('products', products);
        if (stock > 0) {
          const movs = repo.getCollection('inventoryMovements');
          movs.unshift({ id: `mov-${Date.now()}`, date: getLocalDateTimeISO(), userId: user.id, username: user.username, productId: prod.id, productCode: prod.code, productName: prod.name, type: 'ENTRADA', quantity: stock, reason: 'Stock inicial', supplierId: null, supplierName: null });
          repo.saveCollection('inventoryMovements', movs);
        }
        return prod;
      });
    }

    function updateProduct(id, data) {
      authService.requirePermission('inventory.manage');
      const products = repo.getCollection('products');
      const idx = products.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error('Producto no encontrado.');
      const cur = products[idx];
      const code = requireNonEmpty(data.code ?? cur.code, 'Código').toUpperCase();
      if (products.some((p) => p.id !== id && p.code.toUpperCase() === code)) throw new Error(`Código duplicado "${code}".`);

      products[idx] = {
        ...cur, code,
        name: requireNonEmpty(data.name ?? cur.name, 'Nombre'),
        description: String(data.description ?? cur.description).trim(),
        category: requireNonEmpty(data.category ?? cur.category, 'Categoría'),
        salePrice: requirePositiveInt(data.salePrice ?? cur.salePrice, 'Precio de venta'),
        minStock: requireNonNegativeInt(data.minStock ?? cur.minStock, 'Stock mínimo'),
        active: data.active !== undefined ? Boolean(data.active) : cur.active
      };
      repo.saveCollection('products', products);
      return products[idx];
    }

    function registerMovement({ productId, type, quantity, reason, supplierId = null }) {
      const user = authService.requirePermission('inventory.manage');
      if (!['ENTRADA', 'SALIDA'].includes(type)) throw new Error('Tipo inválido.');
      const qty = requirePositiveInt(quantity, 'Cantidad');
      const cleanReason = requireNonEmpty(reason, 'Motivo');

      return repo.runTransaction(() => {
        const products = repo.getCollection('products');
        const idx = products.findIndex((p) => p.id === productId);
        if (idx === -1) throw new Error('Producto no encontrado.');
        const p = products[idx];
        let supplierName = null;
        if (type === 'ENTRADA' && supplierId) {
          const sup = repo.getCollection('suppliers').find((s) => s.id === supplierId);
          if (!sup || !sup.active) throw new Error('Proveedor inválido o inactivo.');
          supplierName = sup.name;
        }
        if (type === 'SALIDA' && qty > p.stock) throw new Error(`La salida (${qty}) supera el stock disponible de "${p.name}" (${p.stock}).`);
        products[idx] = { ...p, stock: type === 'ENTRADA' ? p.stock + qty : p.stock - qty };
        repo.saveCollection('products', products);

        const movs = repo.getCollection('inventoryMovements');
        movs.unshift({
          id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          date: getLocalDateTimeISO(), userId: user.id, username: user.username,
          productId: p.id, productCode: p.code, productName: p.name, type, quantity: qty, reason: cleanReason,
          supplierId: type === 'ENTRADA' ? supplierId || null : null, supplierName
        });
        repo.saveCollection('inventoryMovements', movs);
      });
    }

    function deductStockForSale(items, saleNumber, user) {
      const products = repo.getCollection('products');
      const movs = repo.getCollection('inventoryMovements');
      const warnings = [];
      for (const item of items) {
        const idx = products.findIndex((p) => p.id === item.productId);
        if (idx === -1) throw new Error('Producto no encontrado.');
        const p = products[idx];
        if (!p.active) throw new Error(`El producto "${p.name}" está inactivo.`);
        if (p.stock < item.quantity) throw new Error(`Inventario insuficiente: ${p.name} (disponible ${p.stock}, solicitado ${item.quantity}).`);
        const nextStock = p.stock - item.quantity;
        products[idx] = { ...p, stock: nextStock };
        movs.unshift({
          id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          date: getLocalDateTimeISO(), userId: user.id, username: user.username,
          productId: p.id, productCode: p.code, productName: p.name, type: 'SALIDA', quantity: item.quantity,
          reason: `Venta ${saleNumber}`, supplierId: null, supplierName: null
        });
        if (nextStock <= p.minStock) warnings.push({ name: p.name, stock: nextStock, minStock: p.minStock });
      }
      repo.saveCollection('products', products);
      repo.saveCollection('inventoryMovements', movs);
      return warnings;
    }

    function restoreStockForVoid(items, saleNumber, reason, user) {
      const products = repo.getCollection('products');
      const movs = repo.getCollection('inventoryMovements');
      for (const item of items) {
        const idx = products.findIndex((p) => p.id === item.productId);
        if (idx === -1) continue;
        const p = products[idx];
        products[idx] = { ...p, stock: p.stock + item.quantity };
        movs.unshift({
          id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          date: getLocalDateTimeISO(), userId: user.id, username: user.username,
          productId: p.id, productCode: p.code, productName: p.name, type: 'ENTRADA', quantity: item.quantity,
          reason: `Anulación venta ${saleNumber}: ${reason}`, supplierId: null, supplierName: null
        });
      }
      repo.saveCollection('products', products);
      repo.saveCollection('inventoryMovements', movs);
    }

    function listSuppliers({ onlyActive = false, search = '' } = {}) {
      const term = search.trim().toLowerCase();
      return repo.getCollection('suppliers').filter((s) => (!onlyActive || s.active) && (!term || s.name.toLowerCase().includes(term) || s.nit.toLowerCase().includes(term)));
    }

    function createSupplier(data) {
      authService.requirePermission('suppliers.manage');
      const name = requireNonEmpty(data.name, 'Nombre'), nit = requireNonEmpty(data.nit, 'NIT'), phone = requireNonEmpty(data.phone, 'Teléfono'), email = requireValidEmail(data.email, 'Correo');
      const list = repo.getCollection('suppliers');
      if (list.some((s) => s.nit.toLowerCase() === nit.toLowerCase())) throw new Error(`Ya existe un proveedor con el NIT "${nit}".`);
      const sup = { id: `sup-${Date.now()}`, name, nit, phone, email, active: true };
      list.push(sup);
      repo.saveCollection('suppliers', list);
      return sup;
    }

    function toggleSupplier(id) {
      authService.requirePermission('suppliers.manage');
      const list = repo.getCollection('suppliers');
      const idx = list.findIndex((s) => s.id === id);
      if (idx === -1) throw new Error('Proveedor no encontrado.');
      list[idx] = { ...list[idx], active: !list[idx].active };
      repo.saveCollection('suppliers', list);
      return list[idx];
    }

    return {
      getProductStatus, listProducts, getProductById, getLowStockProducts, getCategories,
      createProduct, updateProduct, registerMovement, listMovements: () => repo.getCollection('inventoryMovements'),
      deductStockForSale, restoreStockForVoid, listSuppliers, createSupplier, toggleSupplier
    };
  })();

  // ==========================================================================
  // Servicio de caja y ventas
  // ==========================================================================
  const cashSalesService = (() => {
    function getActiveCashRegister() {
      return repo.getCollection('cashRegisters').find((r) => r.status === 'ABIERTA' || r.status === 'EN_ARQUEO') || null;
    }

    function getCashSummary(regId) {
      const reg = repo.getCollection('cashRegisters').find((r) => r.id === regId);
      if (!reg) throw new Error('Caja no encontrada.');
      const sales = repo.getCollection('sales').filter((s) => s.cashRegisterId === regId && !s.voided);
      const movs = repo.getCollection('cashMovements').filter((m) => m.cashRegisterId === regId);
      const totalSales = sales.reduce((a, s) => a + s.total, 0);
      const totalIncomes = movs.filter((m) => m.type === 'INGRESO').reduce((a, m) => a + m.amount, 0);
      const totalExpenses = movs.filter((m) => m.type === 'EGRESO').reduce((a, m) => a + m.amount, 0);
      const expectedAmount = reg.initialAmount + totalSales + totalIncomes - totalExpenses;
      return { register: reg, totalSales, totalIncomes, totalExpenses, expectedAmount, availableCash: expectedAmount };
    }

    function openCashRegister(initialAmount) {
      const user = authService.requirePermission('cash.open');
      const amount = requireNonNegativeInt(initialAmount, 'Monto inicial en caja');
      if (getActiveCashRegister()) throw new Error('Ya existe una caja abierta o en arqueo.');
      const regs = repo.getCollection('cashRegisters');
      const reg = {
        id: `cash-${Date.now()}`, openedAt: getLocalDateTimeISO(), openedDate: getLocalDateString(),
        openedByUsername: user.username, initialAmount: amount, status: 'ABIERTA',
        expectedAmount: null, countedAmount: null, difference: null, closingObservation: null, closedAt: null, closedByUsername: null
      };
      regs.unshift(reg);
      repo.saveCollection('cashRegisters', regs);
      authService.logAudit('APERTURA_CAJA', `Caja abierta con ${formatCOP(amount)}`, user);
      return reg;
    }

    function registerCashMovement(type, description, amount) {
      const user = authService.requirePermission('cash.movements');
      if (!['INGRESO', 'EGRESO'].includes(type)) throw new Error('Tipo inválido.');
      const desc = requireNonEmpty(description, 'Descripción');
      const val = requirePositiveInt(amount, 'Valor');
      const active = getActiveCashRegister();
      if (!active || active.status !== 'ABIERTA') throw new Error('Debe haber una caja ABIERTA.');
      const sum = getCashSummary(active.id);
      if (type === 'EGRESO' && val > sum.availableCash) {
        throw new Error(`El egreso (${formatCOP(val)}) supera el dinero disponible (${formatCOP(sum.availableCash)}).`);
      }
      const movs = repo.getCollection('cashMovements');
      movs.unshift({ id: `cmov-${Date.now()}`, cashRegisterId: active.id, date: getLocalDateTimeISO(), type, description: desc, amount: val, username: user.username });
      repo.saveCollection('cashMovements', movs);
    }

    function startCashClosing() {
      const user = authService.requirePermission('cash.close');
      const regs = repo.getCollection('cashRegisters');
      const idx = regs.findIndex((r) => r.status === 'ABIERTA');
      if (idx === -1) throw new Error('No hay caja abierta para cerrar.');
      regs[idx] = { ...regs[idx], status: 'EN_ARQUEO' };
      repo.saveCollection('cashRegisters', regs);
      authService.logAudit('INICIO_ARQUEO', `Caja ${regs[idx].id} pasó a EN_ARQUEO`, user);
    }

    function cancelCashClosing() {
      const user = authService.requirePermission('cash.close');
      const regs = repo.getCollection('cashRegisters');
      const idx = regs.findIndex((r) => r.status === 'EN_ARQUEO');
      if (idx === -1) throw new Error('No hay caja en arqueo.');
      regs[idx] = { ...regs[idx], status: 'ABIERTA' };
      repo.saveCollection('cashRegisters', regs);
      authService.logAudit('CANCELAR_ARQUEO', `Caja ${regs[idx].id} volvió a ABIERTA`, user);
    }

    function confirmCashClosing(countedAmount, obs = '') {
      const user = authService.requirePermission('cash.close');
      const counted = requireNonNegativeInt(countedAmount, 'Dinero contado');
      const cleanObs = String(obs || '').trim();
      const regs = repo.getCollection('cashRegisters');
      const idx = regs.findIndex((r) => r.status === 'EN_ARQUEO');
      if (idx === -1) throw new Error('La caja debe estar EN_ARQUEO.');
      const sum = getCashSummary(regs[idx].id);
      const diff = counted - sum.expectedAmount;
      if (diff !== 0 && !cleanObs) {
        throw new Error('Hay una diferencia entre lo esperado y lo contado: la observación es obligatoria.');
      }
      regs[idx] = {
        ...regs[idx], status: 'CERRADA', expectedAmount: sum.expectedAmount, countedAmount: counted, difference: diff,
        closingObservation: cleanObs, closedAt: getLocalDateTimeISO(), closedByUsername: user.username
      };
      repo.saveCollection('cashRegisters', regs);
      authService.logAudit('CIERRE_CAJA', `Caja ${regs[idx].id} cerrada. Diferencia ${formatCOP(diff)}`, user);
      return diff;
    }

    /**
     * Registrar venta (diagrama de secuencia):
     * 1) caja ABIERTA  2) stock suficiente  3) total con precio del catálogo  4) pago confirmado
     * 5) guardar venta y descontar stock en una sola operación (si algo falla se deshace todo).
     * Este servicio guarda la venta; InventarioService solo descuenta el stock.
     */
    function createSale({ items, paymentMethod, receivedAmount }) {
      const user = authService.requirePermission('sales.create');
      const reg = getActiveCashRegister();
      if (!reg || reg.status !== 'ABIERTA') {
        throw new Error('No hay una caja abierta. Abra la caja antes de registrar ventas.');
      }
      if (!Array.isArray(items) || items.length === 0) throw new Error('Agregue al menos un producto a la venta.');

      const merged = new Map();
      for (const it of items) {
        const q = requirePositiveInt(it.quantity, 'Cantidad');
        merged.set(it.productId, (merged.get(it.productId) || 0) + q);
      }
      const products = repo.getCollection('products');
      const lines = [];
      const shortages = [];
      for (const [productId, quantity] of merged) {
        const p = products.find((x) => x.id === productId);
        if (!p || !p.active) throw new Error('Uno de los productos no existe o está inactivo.');
        if (quantity > p.stock) shortages.push(`${p.name} (disponible ${p.stock}, solicitado ${quantity})`);
        lines.push({ productId, code: p.code, name: p.name, quantity, unitPrice: p.salePrice, subtotal: quantity * p.salePrice });
      }
      if (shortages.length) throw new Error(`Inventario insuficiente: ${shortages.join(', ')}.`);

      const total = lines.reduce((a, l) => a + l.subtotal, 0);
      if (!['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'].includes(paymentMethod)) throw new Error('Seleccione un método de pago válido.');
      let received = total;
      if (paymentMethod === 'EFECTIVO') {
        received = Number(receivedAmount);
        if (!Number.isFinite(received) || received < total) {
          throw new Error('El pago no está confirmado: el dinero recibido es menor que el total.');
        }
      }

      return repo.runTransaction(() => {
        const counter = (repo.getMeta('saleCounter') || 0) + 1;
        const number = `V-${String(counter).padStart(6, '0')}`;
        const warnings = inventoryService.deductStockForSale(
          lines.map((l) => ({ productId: l.productId, quantity: l.quantity })), number, user
        );
        const sale = {
          id: `sal-${Date.now()}-${counter}`, number, date: getLocalDateTimeISO(), cashRegisterId: reg.id,
          userId: user.id, username: user.username, items: lines, total, paymentMethod,
          receivedAmount: received, change: received - total,
          voided: false, voidReason: null, voidedAt: null, voidedBy: null
        };
        const sales = repo.getCollection('sales');
        sales.unshift(sale);
        repo.saveCollection('sales', sales);
        repo.setMeta('saleCounter', counter);
        authService.logAudit('VENTA', `Venta ${number} por ${formatCOP(total)} (${paymentMethod})`, user);
        return { sale, warnings };
      });
    }

    function listSales({ from = '', to = '', number = '', product = '' } = {}) {
      authService.requirePermission('sales.view');
      validateDateRange(from, to);
      const n = number.trim().toLowerCase();
      const pr = product.trim().toLowerCase();
      return repo.getCollection('sales').filter((s) => {
        const d = s.date.slice(0, 10);
        if (from && d < from) return false;
        if (to && d > to) return false;
        if (n && !s.number.toLowerCase().includes(n)) return false;
        if (pr && !s.items.some((i) => i.name.toLowerCase().includes(pr))) return false;
        return true;
      });
    }

    function getSale(id) { return repo.getCollection('sales').find((s) => s.id === id) || null; }

    /** Solo el Administrador; con motivo; solo si la caja de la venta sigue ABIERTA. Restituye el stock. */
    function voidSale(id, reason) {
      const user = authService.requirePermission('sales.void');
      const motivo = requireNonEmpty(reason, 'Motivo de anulación');
      const sales = repo.getCollection('sales');
      const idx = sales.findIndex((s) => s.id === id);
      if (idx === -1) throw new Error('La venta no existe.');
      const sale = sales[idx];
      if (sale.voided) throw new Error('La venta ya está anulada.');
      const reg = repo.getCollection('cashRegisters').find((r) => r.id === sale.cashRegisterId);
      if (!reg || reg.status !== 'ABIERTA') {
        throw new Error('La caja de esta venta ya no está abierta: la venta no se puede modificar.');
      }
      return repo.runTransaction(() => {
        inventoryService.restoreStockForVoid(sale.items, sale.number, motivo, user);
        sales[idx] = { ...sale, voided: true, voidReason: motivo, voidedAt: getLocalDateTimeISO(), voidedBy: user.username };
        repo.saveCollection('sales', sales);
        authService.logAudit('ANULACION_VENTA', `${sale.number}: ${motivo}`, user);
        return sales[idx];
      });
    }

    function listRegisters() {
      authService.requirePermission('sales.view');
      return repo.getCollection('cashRegisters');
    }

    function listCashMovements(regId) {
      return repo.getCollection('cashMovements').filter((m) => m.cashRegisterId === regId);
    }

    return {
      getActiveCashRegister, getCashSummary, openCashRegister, registerCashMovement, startCashClosing,
      cancelCashClosing, confirmCashClosing, createSale, listSales, getSale, voidSale, listRegisters, listCashMovements
    };
  })();

  // ==========================================================================
  // Servicio de contabilidad básica (gastos, pagos al personal y resumen)
  // ==========================================================================
  const accountingService = (() => {
    const inRange = (d, from, to) => (!from || d >= from) && (!to || d <= to);

    function listExpenses({ search = '', category = '', from = '', to = '' } = {}) {
      authService.requirePermission('accounting.manage');
      validateDateRange(from, to);
      const t = search.trim().toLowerCase();
      return repo.getCollection('expenses')
        .filter((e) => (!t || e.description.toLowerCase().includes(t) || (e.responsibleName || '').toLowerCase().includes(t))
          && (!category || e.category === category) && inRange(e.date, from, to))
        .sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id));
    }

    function _supplierInfo(supplierId) {
      if (!supplierId) return { supplierId: null, supplierName: null };
      const sup = repo.getCollection('suppliers').find((s) => s.id === supplierId);
      if (!sup || !sup.active) throw new Error('El proveedor seleccionado no existe o está inactivo.');
      return { supplierId: sup.id, supplierName: sup.name };
    }

    function createExpense(data) {
      const user = authService.requirePermission('accounting.manage');
      const exp = {
        id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        description: requireNonEmpty(data.description, 'Descripción'),
        date: requireNonEmpty(data.date, 'Fecha'),
        category: requireNonEmpty(data.category, 'Categoría'),
        amount: requirePositiveInt(data.amount, 'Valor'),
        ..._supplierInfo(data.supplierId),
        responsibleUserId: user.id, responsibleName: user.username,
        status: 'ACTIVO', voidReason: null, voidedAt: null, voidedBy: null
      };
      const list = repo.getCollection('expenses');
      list.push(exp);
      repo.saveCollection('expenses', list);
      authService.logAudit('GASTO', `${exp.description} ${formatCOP(exp.amount)}`, user);
      return exp;
    }

    function updateExpense(id, data) {
      authService.requirePermission('accounting.manage');
      const list = repo.getCollection('expenses');
      const idx = list.findIndex((e) => e.id === id);
      if (idx === -1) throw new Error('Gasto no encontrado.');
      if (list[idx].status !== 'ACTIVO') throw new Error('Un gasto anulado no se puede editar.');
      list[idx] = {
        ...list[idx],
        description: requireNonEmpty(data.description, 'Descripción'),
        date: requireNonEmpty(data.date, 'Fecha'),
        category: requireNonEmpty(data.category, 'Categoría'),
        amount: requirePositiveInt(data.amount, 'Valor'),
        ..._supplierInfo(data.supplierId)
      };
      repo.saveCollection('expenses', list);
      return list[idx];
    }

    function voidExpense(id, reason) {
      const user = authService.requirePermission('accounting.manage');
      const motivo = requireNonEmpty(reason, 'Motivo de anulación');
      const list = repo.getCollection('expenses');
      const idx = list.findIndex((e) => e.id === id);
      if (idx === -1) throw new Error('Gasto no encontrado.');
      if (list[idx].status === 'ANULADO') throw new Error('El gasto ya está anulado.');
      list[idx] = { ...list[idx], status: 'ANULADO', voidReason: motivo, voidedAt: getLocalDateTimeISO(), voidedBy: user.username };
      repo.saveCollection('expenses', list);
      authService.logAudit('ANULACION_GASTO', `${list[idx].description}: ${motivo}`, user);
    }

    function listStaffPayments({ workerId = '', from = '', to = '' } = {}) {
      authService.requirePermission('accounting.manage');
      validateDateRange(from, to);
      return repo.getCollection('staffPayments')
        .filter((p) => (!workerId || p.workerId === workerId) && inRange(p.date, from, to))
        .sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id));
    }

    function createStaffPayment(data) {
      const user = authService.requirePermission('accounting.manage');
      const worker = hrService.getWorkerView(data.workerId);
      if (!worker || worker.status !== 'ACTIVO') throw new Error('Seleccione un trabajador activo.');
      const pay = {
        id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        workerId: worker.id, workerName: worker.fullName,
        date: requireNonEmpty(data.date, 'Fecha'),
        concept: requireNonEmpty(data.concept, 'Concepto'),
        amount: requirePositiveInt(data.amount, 'Valor'),
        status: 'ACTIVO', voidReason: null, voidedAt: null, voidedBy: null
      };
      const list = repo.getCollection('staffPayments');
      list.push(pay);
      repo.saveCollection('staffPayments', list);
      authService.logAudit('PAGO_PERSONAL', `${pay.workerName}: ${pay.concept} ${formatCOP(pay.amount)}`, user);
      return pay;
    }

    function voidStaffPayment(id, reason) {
      const user = authService.requirePermission('accounting.manage');
      const motivo = requireNonEmpty(reason, 'Motivo de anulación');
      const list = repo.getCollection('staffPayments');
      const idx = list.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error('Pago no encontrado.');
      if (list[idx].status === 'ANULADO') throw new Error('El pago ya está anulado.');
      list[idx] = { ...list[idx], status: 'ANULADO', voidReason: motivo, voidedAt: getLocalDateTimeISO(), voidedBy: user.username };
      repo.saveCollection('staffPayments', list);
      authService.logAudit('ANULACION_PAGO', `${list[idx].workerName}: ${motivo}`, user);
    }

    /** Equilibrio = ventas − gastos − pagos al personal. Los registros anulados no cuentan. */
    function getFinancialSummary({ from = '', to = '', type = 'todos' } = {}) {
      authService.requirePermission('accounting.manage');
      validateDateRange(from, to);
      const sales = repo.getCollection('sales').filter((s) => !s.voided && inRange(s.date.slice(0, 10), from, to));
      const expenses = repo.getCollection('expenses').filter((e) => e.status === 'ACTIVO' && inRange(e.date, from, to));
      const payments = repo.getCollection('staffPayments').filter((p) => p.status === 'ACTIVO' && inRange(p.date, from, to));
      const totals = {
        sales: sales.reduce((a, s) => a + s.total, 0),
        expenses: expenses.reduce((a, e) => a + e.amount, 0),
        payments: payments.reduce((a, p) => a + p.amount, 0)
      };
      totals.balance = totals.sales - totals.expenses - totals.payments;
      const movements = [];
      if (type === 'todos' || type === 'ventas') sales.forEach((s) => movements.push({ date: s.date.slice(0, 10), concept: `Venta ${s.number}`, kind: 'Venta', amount: s.total }));
      if (type === 'todos' || type === 'gastos') expenses.forEach((e) => movements.push({ date: e.date, concept: e.description, kind: 'Gasto', amount: -e.amount }));
      if (type === 'todos' || type === 'pagos') payments.forEach((p) => movements.push({ date: p.date, concept: `Pago: ${p.concept} (${p.workerName})`, kind: 'Pago personal', amount: -p.amount }));
      movements.sort((a, b) => b.date.localeCompare(a.date));
      return { ...totals, movements };
    }

    return {
      listExpenses, createExpense, updateExpense, voidExpense,
      listStaffPayments, createStaffPayment, voidStaffPayment, getFinancialSummary
    };
  })();

  // ==========================================================================
  // Servicio de personal: hojas de vida, trabajadores y contratos (Ley 1581 de 2012)
  // ==========================================================================
  const hrService = (() => {
    const WARN_DAYS = 30;

    /** ANULADO, VENCIDO (pasó la fecha fin), POR_VENCER (faltan 30 días o menos) o VIGENTE. */
    function getContractStatus(c, today = getLocalDateString()) {
      if (c.voided) return 'ANULADO';
      if (!c.endDate) return 'VIGENTE';
      const left = diffDays(today, c.endDate);
      if (left < 0) return 'VENCIDO';
      if (left <= WARN_DAYS) return 'POR_VENCER';
      return 'VIGENTE';
    }

    const isCurrent = (c) => ['VIGENTE', 'POR_VENCER'].includes(getContractStatus(c));

    function getWorkerView(workerId) {
      const w = repo.getCollection('workers').find((x) => x.id === workerId);
      if (!w) return null;
      const r = repo.getCollection('resumes').find((x) => x.id === w.resumeId) || {};
      const contracts = repo.getCollection('contracts').filter((c) => c.workerId === w.id);
      const current = contracts.find(isCurrent);
      const last = contracts[contracts.length - 1];
      return {
        ...w, fullName: r.fullName || '—', document: r.document || '—', phone: r.phone || '', email: r.email || '',
        address: r.address || '', dataAuthorization: Boolean(r.dataAuthorization),
        contractStatus: current ? getContractStatus(current) : (last ? getContractStatus(last) : 'SIN CONTRATO')
      };
    }

    function listWorkers({ search = '', onlyActive = false } = {}) {
      authService.requirePermission('hr.manage');
      const t = search.trim().toLowerCase();
      return repo.getCollection('workers').map((w) => getWorkerView(w.id))
        .filter((w) => (!onlyActive || w.status === 'ACTIVO') && (!t || w.fullName.toLowerCase().includes(t) || w.document.toLowerCase().includes(t)))
        .sort((a, b) => a.fullName.localeCompare(b.fullName));
    }

    /** Lista simple (sin permiso 'hr.manage') para selectores de otros módulos autorizados. */
    function listActiveWorkersBasic() {
      return repo.getCollection('workers').filter((w) => w.status === 'ACTIVO').map((w) => getWorkerView(w.id))
        .sort((a, b) => a.fullName.localeCompare(b.fullName));
    }

    function listResumes() { authService.requirePermission('hr.manage'); return repo.getCollection('resumes'); }
    function getResume(id) { return repo.getCollection('resumes').find((r) => r.id === id) || null; }

    function createResume(data) {
      const user = authService.requirePermission('hr.manage');
      if (!data.dataAuthorization) {
        throw new Error('Sin la autorización de tratamiento de datos personales no se puede guardar la hoja de vida.');
      }
      const document = requireNonEmpty(data.document, 'Documento');
      const fullName = requireNonEmpty(data.fullName, 'Nombre completo');
      const email = String(data.email || '').trim() ? requireValidEmail(data.email, 'Correo') : '';
      const list = repo.getCollection('resumes');
      if (list.some((r) => r.document === document)) throw new Error('Ya existe una hoja de vida con ese documento.');
      const r = {
        id: `res-${Date.now()}`, document, fullName, phone: String(data.phone || '').trim(), email,
        address: String(data.address || '').trim(), dataAuthorization: true, education: [], experience: []
      };
      list.push(r);
      repo.saveCollection('resumes', list);
      authService.logAudit('HOJA_VIDA', `Hoja de vida creada: ${fullName}`, user);
      return r;
    }

    function _mutateResume(resumeId, fn) {
      authService.requirePermission('hr.manage');
      const list = repo.getCollection('resumes');
      const idx = list.findIndex((r) => r.id === resumeId);
      if (idx === -1) throw new Error('Hoja de vida no encontrada.');
      list[idx] = fn({ ...list[idx], education: [...(list[idx].education || [])], experience: [...(list[idx].experience || [])] });
      repo.saveCollection('resumes', list);
    }

    function addEducation(resumeId, d) {
      const title = requireNonEmpty(d.title, 'Título');
      validateDateRange(d.startDate, d.endDate, 'Inicio', 'Fin');
      _mutateResume(resumeId, (r) => { r.education.push({ title, institution: String(d.institution || '').trim(), startDate: d.startDate || '', endDate: d.endDate || '' }); return r; });
    }

    function addExperience(resumeId, d) {
      const company = requireNonEmpty(d.company, 'Empresa');
      validateDateRange(d.startDate, d.endDate, 'Fecha de inicio', 'Fecha de fin');
      _mutateResume(resumeId, (r) => { r.experience.push({ company, role: String(d.role || '').trim(), startDate: d.startDate || '', endDate: d.endDate || '', description: '' }); return r; });
    }

    function createWorker(data) {
      const user = authService.requirePermission('hr.manage');
      const resume = getResume(data.resumeId);
      if (!resume) throw new Error('Seleccione una persona con hoja de vida.');
      const position = requireNonEmpty(data.position, 'Cargo');
      const hireDate = requireNonEmpty(data.hireDate, 'Fecha de ingreso');
      const list = repo.getCollection('workers');
      if (list.some((w) => w.resumeId === resume.id)) throw new Error('Esa persona ya está registrada como trabajador.');
      const w = { id: `wrk-${Date.now()}`, resumeId: resume.id, position, hireDate, status: 'ACTIVO' };
      list.push(w);
      repo.saveCollection('workers', list);
      authService.logAudit('TRABAJADOR', `Trabajador registrado: ${resume.fullName}`, user);
      return w;
    }

    function updateWorker(workerId, data) {
      const user = authService.requirePermission('hr.manage');
      const workers = repo.getCollection('workers');
      const idx = workers.findIndex((w) => w.id === workerId);
      if (idx === -1) throw new Error('Trabajador no encontrado.');
      const fullName = requireNonEmpty(data.fullName, 'Nombre completo');
      const position = requireNonEmpty(data.position, 'Cargo');
      const email = String(data.email || '').trim() ? requireValidEmail(data.email, 'Correo') : '';
      workers[idx] = { ...workers[idx], position };
      repo.saveCollection('workers', workers);
      _mutateResume(workers[idx].resumeId, (r) => ({ ...r, fullName, phone: String(data.phone || '').trim(), email, address: String(data.address || '').trim() }));
      authService.logAudit('DATOS_PERSONALES', `Datos actualizados: ${fullName}`, user);
    }

    function toggleWorkerStatus(workerId) {
      authService.requirePermission('hr.manage');
      const workers = repo.getCollection('workers');
      const idx = workers.findIndex((w) => w.id === workerId);
      if (idx === -1) throw new Error('Trabajador no encontrado.');
      workers[idx] = { ...workers[idx], status: workers[idx].status === 'ACTIVO' ? 'RETIRADO' : 'ACTIVO' };
      repo.saveCollection('workers', workers);
    }

    function listContracts(workerId) {
      authService.requirePermission('hr.manage');
      return repo.getCollection('contracts').filter((c) => !workerId || c.workerId === workerId)
        .map((c) => ({ ...c, status: getContractStatus(c) })).reverse();
    }

    function createContract(data) {
      const user = authService.requirePermission('hr.manage');
      const worker = getWorkerView(data.workerId);
      if (!worker) throw new Error('Seleccione un trabajador.');
      const type = String(data.type || '');
      if (!CONTRACT_TYPES.some((t) => t.key === type)) throw new Error('Seleccione un tipo de contrato válido.');
      const startDate = requireNonEmpty(data.startDate, 'Fecha de inicio');
      const endDate = String(data.endDate || '').trim() || null;
      const position = requireNonEmpty(data.position, 'Cargo');
      const salary = requirePositiveInt(data.salary, 'Salario');
      if (type !== 'INDEFINIDO' && !endDate) throw new Error('Este tipo de contrato requiere fecha de finalización.');
      if (endDate && endDate < startDate) throw new Error('La fecha de finalización no puede ser anterior al inicio.');
      const list = repo.getCollection('contracts');
      if (list.some((c) => c.workerId === worker.id && isCurrent(c))) {
        throw new Error('El trabajador ya tiene un contrato vigente. Anúlelo antes de registrar otro.');
      }
      const c = { id: `ctr-${Date.now()}`, workerId: worker.id, type, startDate, endDate, position, salary, voided: false, voidReason: null };
      list.push(c);
      repo.saveCollection('contracts', list);
      authService.logAudit('CONTRATO', `Contrato registrado para ${worker.fullName}`, user);
      return c;
    }

    function voidContract(id, reason) {
      const user = authService.requirePermission('hr.manage');
      const motivo = requireNonEmpty(reason, 'Motivo de anulación');
      const list = repo.getCollection('contracts');
      const idx = list.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error('Contrato no encontrado.');
      if (list[idx].voided) throw new Error('El contrato ya está anulado.');
      list[idx] = { ...list[idx], voided: true, voidReason: motivo };
      repo.saveCollection('contracts', list);
      authService.logAudit('ANULACION_CONTRATO', `${id}: ${motivo}`, user);
    }

    return {
      getContractStatus, getWorkerView, listWorkers, listActiveWorkersBasic, listResumes, getResume, createResume,
      addEducation, addExperience, createWorker, updateWorker, toggleWorkerStatus, listContracts, createContract, voidContract
    };
  })();

  // ==========================================================================
  // Servicio de horarios y asistencia (la hora la toma siempre el sistema)
  // ==========================================================================
  const attendanceService = (() => {
    const TOLERANCE_MIN = 5;

    /** Puntual o Retardo (ingreso posterior a la hora de entrada + 5 minutos de tolerancia). */
    function computeObservation(daySchedule, hhmm, tolerance = TOLERANCE_MIN) {
      if (!daySchedule) return 'Puntual';
      return timeToMinutes(hhmm) > timeToMinutes(daySchedule.startTime) + tolerance ? 'Retardo' : 'Puntual';
    }

    function getSchedule(workerId) {
      const s = repo.getCollection('schedules').find((x) => x.workerId === workerId);
      const days = {};
      DAY_NAMES.forEach((d) => { days[d.key] = s && s.days && s.days[d.key] ? s.days[d.key] : null; });
      return days;
    }

    function saveSchedule(workerId, days) {
      const user = authService.requirePermission('attendance.all');
      if (!hrService.getWorkerView(workerId)) throw new Error('Trabajador no encontrado.');
      const clean = {};
      DAY_NAMES.forEach((d) => {
        const v = days[d.key];
        if (v && (v.startTime || v.endTime)) {
          if (!v.startTime || !v.endTime || v.startTime >= v.endTime) {
            throw new Error(`${d.label}: la hora de entrada debe ser menor que la de salida.`);
          }
          clean[d.key] = { startTime: v.startTime, endTime: v.endTime };
        } else {
          clean[d.key] = null;
        }
      });
      const list = repo.getCollection('schedules').filter((s) => s.workerId !== workerId);
      list.push({ workerId, days: clean });
      repo.saveCollection('schedules', list);
      authService.logAudit('HORARIO', `Horario actualizado (${workerId})`, user);
    }

    function _targetWorkerId(requestedId) {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('Debe iniciar sesión.');
      if (authService.hasPermission('attendance.all') && requestedId) return requestedId;
      authService.requirePermission('attendance.own');
      if (!user.workerId) throw new Error('Su usuario no está vinculado a un trabajador. Pida al Administrador que lo vincule.');
      return user.workerId;
    }

    function clockIn(requestedWorkerId = null) {
      const workerId = _targetWorkerId(requestedWorkerId);
      const worker = hrService.getWorkerView(workerId);
      if (!worker || worker.status !== 'ACTIVO') throw new Error('El trabajador no existe o está retirado.');
      const list = repo.getCollection('attendance');
      if (list.some((a) => a.workerId === workerId && !a.clockOut)) {
        throw new Error('Ya hay un ingreso sin salida registrada. Registre primero la salida.');
      }
      const now = new Date();
      const date = getLocalDateString(now);
      const time = getLocalTimeString(now);
      const rec = {
        id: `att-${Date.now()}`, workerId, workerName: worker.fullName, date, clockIn: time, clockOut: null,
        observation: computeObservation(getSchedule(workerId)[getDayOfWeekKey(date)], time)
      };
      list.push(rec);
      repo.saveCollection('attendance', list);
      return rec;
    }

    function clockOut(requestedWorkerId = null) {
      const workerId = _targetWorkerId(requestedWorkerId);
      const list = repo.getCollection('attendance');
      let idx = -1;
      for (let i = list.length - 1; i >= 0; i--) { if (list[i].workerId === workerId && !list[i].clockOut) { idx = i; break; } }
      if (idx === -1) throw new Error('No hay un ingreso abierto: primero registre el ingreso.');
      list[idx] = { ...list[idx], clockOut: getLocalTimeString() };
      repo.saveCollection('attendance', list);
      return list[idx];
    }

    /** Filas del día. El Administrador ve a todos; los demás solo lo propio. Incluye «Sin registro». */
    function listAttendance({ date = getLocalDateString(), workerId = '' } = {}) {
      const user = authService.getCurrentUser();
      if (!user || !(authService.hasPermission('attendance.own') || authService.hasPermission('attendance.all'))) {
        throw new Error('Acceso denegado.');
      }
      const all = authService.hasPermission('attendance.all');
      let workers = repo.getCollection('workers').filter((w) => w.status === 'ACTIVO').map((w) => hrService.getWorkerView(w.id));
      if (!all) workers = workers.filter((w) => w.id === user.workerId);
      else if (workerId) workers = workers.filter((w) => w.id === workerId);
      const today = getLocalDateString();
      const nowMin = timeToMinutes(getLocalTimeString());
      const records = repo.getCollection('attendance');
      const rows = [];
      workers.sort((a, b) => a.fullName.localeCompare(b.fullName)).forEach((w) => {
        const day = getSchedule(w.id)[getDayOfWeekKey(date)];
        const scheduleLabel = day ? `${day.startTime} - ${day.endTime}` : 'Sin horario';
        const recs = records.filter((r) => r.workerId === w.id && r.date === date);
        if (recs.length) {
          recs.forEach((r) => rows.push({ workerName: w.fullName, schedule: scheduleLabel, clockIn: r.clockIn, clockOut: r.clockOut || '—', observation: r.observation }));
        } else if (day && (date < today || (date === today && nowMin > timeToMinutes(day.startTime)))) {
          rows.push({ workerName: w.fullName, schedule: scheduleLabel, clockIn: '—', clockOut: '—', observation: 'Sin registro' });
        }
      });
      return rows;
    }

    function listRecordsForWorker(workerId, limit = 30) {
      return repo.getCollection('attendance').filter((a) => a.workerId === workerId)
        .sort((a, b) => (b.date + b.clockIn).localeCompare(a.date + a.clockIn)).slice(0, limit);
    }

    return { computeObservation, getSchedule, saveSchedule, clockIn, clockOut, listAttendance, listRecordsForWorker };
  })();

  // ==========================================================================
  // Servicio de reportes (no incluye registros anulados)
  // ==========================================================================
  const reportService = (() => {
    const TYPES = {
      ventas: 'Ventas', gastos: 'Gastos', pagos: 'Pagos al personal', cajas: 'Cajas',
      inventario: 'Inventario', asistencia: 'Asistencia', resumen: 'Resumen financiero'
    };
    const inRange = (d, from, to) => (!from || d >= from) && (!to || d <= to);

    function build(type, from, to) {
      authService.requirePermission('reports.view');
      if (!TYPES[type]) throw new Error('Tipo de reporte no válido.');
      if (!from || !to) throw new Error('Indique las fechas desde y hasta.');
      validateDateRange(from, to, 'Fecha inicial', 'Fecha final');
      const rep = { type, title: `Reporte de ${TYPES[type]}`, subtitle: `Periodo: ${formatDate(from)} a ${formatDate(to)}`, columns: [], rows: [], summaryItems: [] };

      if (type === 'ventas') {
        const list = repo.getCollection('sales').filter((s) => !s.voided && inRange(s.date.slice(0, 10), from, to)).reverse();
        rep.columns = ['Número', 'Fecha', 'Atendió', 'Método de pago', 'Total'];
        rep.rows = list.map((s) => [s.number, formatDateTime(s.date), s.username, s.paymentMethod, formatCOP(s.total)]);
        rep.summaryItems = [{ label: 'Ventas', value: String(list.length) }, { label: 'Total vendido', value: formatCOP(list.reduce((a, s) => a + s.total, 0)) }];
      } else if (type === 'gastos') {
        const list = repo.getCollection('expenses').filter((e) => e.status === 'ACTIVO' && inRange(e.date, from, to)).sort((a, b) => a.date.localeCompare(b.date));
        rep.columns = ['Fecha', 'Categoría', 'Descripción', 'Proveedor', 'Valor'];
        rep.rows = list.map((e) => [formatDate(e.date), e.category, e.description, e.supplierName || '—', formatCOP(e.amount)]);
        rep.summaryItems = [{ label: 'Total gastos', value: formatCOP(list.reduce((a, e) => a + e.amount, 0)) }];
      } else if (type === 'pagos') {
        const list = repo.getCollection('staffPayments').filter((p) => p.status === 'ACTIVO' && inRange(p.date, from, to)).sort((a, b) => a.date.localeCompare(b.date));
        rep.columns = ['Fecha', 'Trabajador', 'Concepto', 'Valor'];
        rep.rows = list.map((p) => [formatDate(p.date), p.workerName, p.concept, formatCOP(p.amount)]);
        rep.summaryItems = [{ label: 'Total pagos', value: formatCOP(list.reduce((a, p) => a + p.amount, 0)) }];
      } else if (type === 'cajas') {
        const list = repo.getCollection('cashRegisters').filter((r) => inRange(r.openedDate, from, to)).reverse();
        rep.columns = ['Apertura', 'Cierre', 'Estado', 'Inicial', 'Esperado', 'Contado', 'Diferencia'];
        rep.rows = list.map((r) => [formatDateTime(r.openedAt), formatDateTime(r.closedAt), r.status, formatCOP(r.initialAmount),
          r.expectedAmount === null ? '—' : formatCOP(r.expectedAmount), r.countedAmount === null ? '—' : formatCOP(r.countedAmount),
          r.difference === null ? '—' : formatCOP(r.difference)]);
        rep.summaryItems = [{ label: 'Diferencia acumulada', value: formatCOP(list.reduce((a, r) => a + (r.difference || 0), 0)) }];
      } else if (type === 'inventario') {
        const list = repo.getCollection('products').slice().sort((a, b) => a.name.localeCompare(b.name));
        rep.subtitle = `Corte al ${formatDate(getLocalDateString())}`;
        rep.columns = ['Código', 'Producto', 'Categoría', 'Stock', 'Mínimo', 'Precio', 'Estado'];
        rep.rows = list.map((p) => [p.code, p.name, p.category, String(p.stock), String(p.minStock), formatCOP(p.salePrice), inventoryService.getProductStatus(p)]);
        rep.summaryItems = [{ label: 'Productos', value: String(list.length) }, { label: 'Con stock bajo o agotados', value: String(list.filter((p) => p.active && p.stock <= p.minStock).length) }];
      } else if (type === 'asistencia') {
        const list = repo.getCollection('attendance').filter((a) => inRange(a.date, from, to)).sort((a, b) => (a.date + a.clockIn).localeCompare(b.date + b.clockIn));
        rep.columns = ['Fecha', 'Trabajador', 'Ingreso', 'Salida', 'Observación'];
        rep.rows = list.map((a) => [formatDate(a.date), a.workerName, a.clockIn, a.clockOut || '—', a.observation]);
        rep.summaryItems = [{ label: 'Registros', value: String(list.length) }, { label: 'Retardos', value: String(list.filter((a) => a.observation === 'Retardo').length) }];
      } else {
        const sales = repo.getCollection('sales').filter((s) => !s.voided && inRange(s.date.slice(0, 10), from, to)).reduce((a, s) => a + s.total, 0);
        const exp = repo.getCollection('expenses').filter((e) => e.status === 'ACTIVO' && inRange(e.date, from, to)).reduce((a, e) => a + e.amount, 0);
        const pay = repo.getCollection('staffPayments').filter((p) => p.status === 'ACTIVO' && inRange(p.date, from, to)).reduce((a, p) => a + p.amount, 0);
        rep.columns = ['Concepto', 'Valor'];
        rep.rows = [['Ventas', formatCOP(sales)], ['Gastos', formatCOP(exp)], ['Pagos al personal', formatCOP(pay)]];
        rep.summaryItems = [{ label: 'Equilibrio (ventas − gastos − pagos)', value: formatCOP(sales - exp - pay) }];
      }
      return rep;
    }

    return { TYPES, build };
  })();

  // ==========================================================================
  // Interfaz de usuario: utilidades, enrutador y componentes comunes
  // ==========================================================================
  const esc = escapeHtml;
  const today = () => getLocalDateString();
  const monthStart = () => `${today().slice(0, 8)}01`;

  /** Convierte «5.000», «$5000» o «5000» en número. Devuelve NaN si está vacío. */
  function toInt(v) {
    const s = String(v ?? '').replace(/[.\s$,]/g, '');
    return s === '' ? NaN : Number(s);
  }

  const state = {
    authError: '', resetLink: '', cart: [], payMethod: 'EFECTIVO', received: '', posSearch: '', sidebarOpen: false,
    filters: {
      sales: { from: '', to: '', number: '', product: '' }, inventory: { search: '', category: '' },
      suppliers: { search: '' }, expenses: { search: '', category: '', from: '', to: '' },
      payments: { workerId: '', from: '', to: '' }, accounting: { from: '', to: '', type: 'todos' },
      workers: { search: '' }, attendance: { date: '', workerId: '' }, users: { search: '' }
    },
    workerTab: 'datos', scheduleWorkerId: '', permRole: 'VENDEDOR',
    report: { type: 'ventas', from: '', to: '', data: null }
  };

  const NAV = [
    { id: 'panel', label: 'Panel principal', perms: ['dashboard.view'] },
    { id: 'caja', label: 'Caja y ventas', perms: ['cash.open', 'sales.create', 'cash.close'] },
    { id: 'ventas', label: 'Consultar ventas', perms: ['sales.view'] },
    { id: 'historial', label: 'Historial de cajas', perms: ['sales.view'] },
    { id: 'inventario', label: 'Inventario', perms: ['inventory.view', 'inventory.manage'] },
    { id: 'proveedores', label: 'Proveedores', perms: ['suppliers.manage'] },
    { id: 'contabilidad', label: 'Contabilidad', perms: ['accounting.manage'] },
    { id: 'gastos', label: 'Gastos', perms: ['accounting.manage'] },
    { id: 'pagos', label: 'Pagos al personal', perms: ['accounting.manage'] },
    { id: 'personal', label: 'Personal', perms: ['hr.manage'] },
    { id: 'asistencia', label: 'Asistencia', perms: ['attendance.own', 'attendance.all'] },
    { id: 'horarios', label: 'Horarios', perms: ['attendance.all'] },
    { id: 'reportes', label: 'Reportes', perms: ['reports.view'] },
    { id: 'usuarios', label: 'Usuarios y roles', perms: ['users.manage'] }
  ];
  // Vistas que no están en el menú pero pertenecen a un módulo
  const EXTRA_VIEWS = {
    cierre: { perms: ['cash.close'], parent: 'caja' },
    movimientos: { perms: ['inventory.manage'], parent: 'inventario' },
    ficha: { perms: ['hr.manage'], parent: 'personal' },
    cuenta: { perms: [], parent: '' }
  };

  const can = (perms) => !perms.length || perms.some((p) => authService.hasPermission(p));
  const allowedNav = () => NAV.filter((n) => can(n.perms));
  const defaultView = () => (allowedNav()[0] || { id: 'cuenta' }).id;

  function parseHash() {
    const parts = (location.hash || '').replace(/^#\/?/, '').split('/').filter(Boolean);
    return { view: parts[0] || '', param: parts[1] ? decodeURIComponent(parts[1]) : '' };
  }
  function navigate(view, param = '') {
    const target = `#/${view}${param ? '/' + encodeURIComponent(param) : ''}`;
    if (location.hash === target) render(); else location.hash = target;
  }

  // ---- Componentes de formulario ---------------------------------------------------------------
  const fld = (label, inner, id = '') => `<div class="form-group"><label${id ? ` for="${id}"` : ''}>${label}</label>${inner}</div>`;
  const inp = (name, o = {}) => `<input class="form-control" id="${o.id || name}" name="${name}" type="${o.type || 'text'}" value="${esc(o.value ?? '')}"${o.required ? ' required' : ''}${o.placeholder ? ` placeholder="${esc(o.placeholder)}"` : ''}${o.inputmode ? ` inputmode="${o.inputmode}"` : ''}${o.attrs ? ' ' + o.attrs : ''}>`;
  const money = (name, value = '', o = {}) => inp(name, { ...o, inputmode: 'numeric', value, placeholder: o.placeholder || 'Ej: 5000' });
  const sel = (name, options, selected = '', o = {}) => `<select class="form-control" id="${o.id || name}" name="${name}"${o.attrs ? ' ' + o.attrs : ''}>${options.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(selected) ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`;

  function badge(label) {
    const ok = ['Disponible', 'ACTIVO', 'ABIERTA', 'REGISTRADA', 'VIGENTE', 'Puntual', 'REGISTRADO', 'CERRADA'];
    const warn = ['Stock bajo', 'BLOQUEADO', 'EN_ARQUEO', 'POR_VENCER', 'Retardo'];
    const bad = ['Agotado', 'VENCIDO', 'Sin registro', 'ANULADA', 'ANULADO'];
    const cls = ok.includes(label) ? 'badge-success' : warn.includes(label) ? 'badge-warning' : bad.includes(label) ? 'badge-danger' : 'badge-neutral';
    const text = { EN_ARQUEO: 'EN ARQUEO', POR_VENCER: 'POR VENCER' }[label] || label;
    return `<span class="badge ${cls}">${esc(text)}</span>`;
  }
  const emptyRow = (cols, msg) => `<tr><td colspan="${cols}" class="text-center" style="color:var(--text-muted)">${esc(msg)}</td></tr>`;
  const pageHeader = (title, sub = '') => `<div class="page-header"><h1>${esc(title)}</h1>${sub ? `<p class="page-subtitle">${sub}</p>` : ''}</div>`;
  const denied = () => `${pageHeader('Acceso denegado')}<div class="alert alert-danger" role="alert">Su rol no tiene permiso para esta función. Si lo necesita, pida al Administrador que lo habilite en «Usuarios y roles».</div>`;

  // ---- Notificaciones y ventanas modales -------------------------------------------------------
  function toast(message, type = '') {
    const box = document.getElementById('toast-container');
    if (!box) return;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = message;
    box.appendChild(t);
    setTimeout(() => t.remove(), type === 'error' ? 7000 : 4500);
  }
  function openModal(title, html) {
    const root = document.getElementById('modal-root');
    root.innerHTML = `<div class="modal-backdrop" data-action="modal-backdrop"><div class="modal-dialog" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="modal-header"><h2 style="margin:0;font-size:1.1rem">${esc(title)}</h2><button type="button" class="btn btn-secondary btn-sm" data-action="close-modal" aria-label="Cerrar">✕</button></div>${html}</div></div>`;
    const first = root.querySelector('input:not([type=hidden]),select,textarea,button.btn-primary');
    if (first) first.focus();
  }
  const closeModal = () => { document.getElementById('modal-root').innerHTML = ''; };

  function voidModal(kind, id, title, hint) {
    openModal(title, `<p>${hint}</p><form data-form="void" data-kind="${kind}" data-id="${esc(id)}">
      ${fld('Motivo de la anulación', '<textarea class="form-control" name="reason" id="reason" required></textarea>', 'reason')}
      <div class="btn-group"><button class="btn btn-danger" type="submit">Confirmar anulación</button><button class="btn btn-secondary" type="button" data-action="close-modal">Cancelar</button></div></form>`);
  }

  function receiptHtml(sale) {
    const rows = sale.items.map((i) => `${i.quantity} x ${esc(i.name)}<br>&nbsp;&nbsp;${formatCOP(i.unitPrice)} = ${formatCOP(i.subtotal)}<br>`).join('');
    return `<div id="printable-receipt" class="receipt-box"><strong>SWIACLI · Cafetería-Panadería</strong><br>Tunja, Boyacá<hr>Venta ${esc(sale.number)}<br>${esc(formatDateTime(sale.date))}<br>Atendió: ${esc(sale.username)}<hr>${rows}<hr>
      <strong>TOTAL ${formatCOP(sale.total)}</strong><br>Pago: ${esc(sale.paymentMethod)}${sale.paymentMethod === 'EFECTIVO' ? `<br>Recibido: ${formatCOP(sale.receivedAmount)} · Cambio: ${formatCOP(sale.change)}` : ''}
      ${sale.voided ? `<hr><strong>*** ANULADA ***</strong> ${esc(sale.voidReason)}` : ''}<hr>¡Gracias por su compra!</div>`;
  }
  function showReceipt(sale) {
    openModal(`Comprobante ${sale.number}`, `${receiptHtml(sale)}<div class="btn-group" style="justify-content:center"><button class="btn btn-primary" data-action="print">Imprimir comprobante</button><button class="btn btn-secondary" data-action="close-modal">Cerrar</button></div>`);
  }

  // ---- Pantallas de acceso (inicio de sesión y restablecer contraseña) -------------------------
  function renderAuth(route) {
    const demo = `<div class="demo-box"><strong>Usuarios de ejemplo</strong><br>admin / Admin123 · vendedor / Clave1234 · trabajador / Clave1234<br>
      <button type="button" class="link-btn" data-action="reset-seed">Restablecer datos de ejemplo</button></div>`;
    const err = state.authError ? `<div class="alert alert-danger" role="alert">${esc(state.authError)}</div>` : '';
    if (route.view === 'restablecer') {
      return `<div class="auth-wrapper"><div class="auth-card"><h1 class="auth-brand">Nueva contraseña</h1><p class="auth-sub">Escriba la nueva contraseña (mínimo 8 caracteres, una mayúscula y un número).</p>${err}
        <form data-form="reset-password"><input type="hidden" name="token" value="${esc(route.param)}">
        ${fld('Nueva contraseña', inp('password', { type: 'password', required: true, attrs: 'autocomplete="new-password"' }), 'password')}
        ${fld('Confirmar contraseña', inp('confirm', { type: 'password', required: true, attrs: 'autocomplete="new-password"' }), 'confirm')}
        <button class="btn btn-primary" type="submit" style="width:100%">Guardar contraseña</button></form>
        <div class="auth-links"><button class="link-btn" data-action="go-login">Volver a iniciar sesión</button></div></div></div>`;
    }
    if (route.view === 'olvido') {
      const link = state.resetLink ? `<div class="alert alert-info">Modo académico (sin servidor de correo): use este enlace → <a href="${esc(state.resetLink)}"><strong>Restablecer ahora</strong></a></div>` : '';
      return `<div class="auth-wrapper"><div class="auth-card"><h1 class="auth-brand">Restablecer contraseña</h1><p class="auth-sub">Escriba el correo electrónico registrado.</p>${err}${link}
        <form data-form="forgot">${fld('Correo electrónico registrado', inp('identifier', { type: 'text', required: true, attrs: 'autocomplete="email"' }), 'identifier')}
        <div class="btn-group"><button class="btn btn-primary" type="submit">Enviar enlace</button><button class="btn btn-secondary" type="button" data-action="go-login">Cancelar</button></div></form>
        <p class="auth-note">El enlace vence en 30 minutos y solo se puede usar una vez.</p></div></div>`;
    }
    return `<div class="auth-wrapper"><div class="auth-card"><h1 class="auth-brand">SWIACLI</h1>
      <p class="auth-sub">Sistema web integral para la gestión administrativa, contable, laboral y de inventario.</p>${err}
      <form data-form="login">${fld('Usuario o correo electrónico', inp('identifier', { required: true, attrs: 'autocomplete="username" autofocus' }), 'identifier')}
      ${fld('Contraseña', inp('password', { type: 'password', required: true, attrs: 'autocomplete="current-password"' }), 'password')}
      <button class="btn btn-primary" type="submit" style="width:100%">Iniciar sesión</button></form>
      <div class="auth-links"><a class="link-btn" href="#/olvido">¿Olvidó su contraseña?</a></div>
      <p class="auth-note">Acceso solo para personal autorizado. Tras 5 intentos fallidos la cuenta se bloquea 15 minutos.</p>${demo}</div></div>`;
  }

  // ---- Estructura general (barra superior + menú lateral) --------------------------------------
  function shell(user, activeId, content) {
    const parent = EXTRA_VIEWS[activeId] ? EXTRA_VIEWS[activeId].parent : activeId;
    const items = allowedNav().map((n) => `<li><button class="nav-btn${n.id === parent ? ' active' : ''}" data-action="nav" data-view="${n.id}"${n.id === parent ? ' aria-current="page"' : ''}>${esc(n.label)}</button></li>`).join('');
    const footer = authService.hasPermission('users.manage')
      ? `<div class="sidebar-footer"><button class="link-btn" data-action="reset-seed">Restablecer datos de ejemplo</button></div>` : '';
    return `<div class="app-container"><header class="topbar"><div class="topbar-left"><button class="menu-toggle" data-action="toggle-menu" aria-label="Abrir o cerrar el menú">☰</button><span class="topbar-brand">SWIACLI</span></div>
      <div class="topbar-right"><span>Usuario: ${esc(user.username)} (${esc(ROLE_LABELS[user.role] || user.role)})</span><button class="topbar-link" data-action="nav" data-view="cuenta">Mi cuenta</button><button class="topbar-logout" data-action="logout">Cerrar sesión</button></div></header>
      <div class="workspace"><nav class="sidebar${state.sidebarOpen ? ' open' : ''}" aria-label="Menú principal"><ul class="nav-list">${items}</ul>${footer}</nav><main class="main-content" id="main">${content}</main></div></div>`;
  }

  // ==========================================================================
  // Vistas: panel, caja y ventas, inventario, proveedores
  // ==========================================================================
  function viewPanel(user) {
    const t = today();
    const salesToday = repo.getCollection('sales').filter((s) => !s.voided && s.date.slice(0, 10) === t).reduce((a, s) => a + s.total, 0);
    const reg = cashSalesService.getActiveCashRegister();
    const cashLabel = reg ? (reg.status === 'ABIERTA' ? 'Abierta' : 'En arqueo') : 'Cerrada';
    const low = authService.hasPermission('inventory.view') ? inventoryService.getLowStockProducts() : [];
    const kpis = [`<div class="kpi-card"><div class="kpi-value">${formatCOP(salesToday)}</div><div class="kpi-label">Ventas de hoy</div></div>`,
      `<div class="kpi-card"><div class="kpi-value">${cashLabel}</div><div class="kpi-label">Estado de la caja</div></div>`];
    if (authService.hasPermission('accounting.manage')) {
      const m = today().slice(0, 7);
      const exp = repo.getCollection('expenses').filter((e) => e.status === 'ACTIVO' && e.date.slice(0, 7) === m).reduce((a, e) => a + e.amount, 0);
      kpis.push(`<div class="kpi-card"><div class="kpi-value">${formatCOP(exp)}</div><div class="kpi-label">Gastos del mes</div></div>`);
    }
    let expiring = [];
    if (authService.hasPermission('hr.manage')) {
      kpis.push(`<div class="kpi-card"><div class="kpi-value">${repo.getCollection('workers').filter((w) => w.status === 'ACTIVO').length}</div><div class="kpi-label">Trabajadores activos</div></div>`);
      expiring = hrService.listWorkers().filter((w) => w.contractStatus === 'POR_VENCER');
    }
    const quick = [];
    if (authService.hasPermission('sales.create')) quick.push(['caja', 'Registrar venta', 'btn-primary']);
    if (authService.hasPermission('attendance.own') || authService.hasPermission('attendance.all')) quick.push(['asistencia', 'Registrar asistencia', 'btn-secondary']);
    if (authService.hasPermission('inventory.view')) quick.push(['inventario', 'Ver inventario', 'btn-secondary']);
    if (authService.hasPermission('accounting.manage')) quick.push(['gastos', 'Registrar gasto', 'btn-secondary']);
    if (authService.hasPermission('reports.view')) quick.push(['reportes', 'Reportes', 'btn-secondary']);
    return `${pageHeader('Panel principal', `Bienvenida/o, ${esc(user.fullName || user.username)}. Vista general del negocio.`)}
      ${low.length ? `<div class="alert alert-warning" role="alert"><strong>Alerta de inventario:</strong> stock bajo en ${low.map((p) => `${esc(p.name)} (${p.stock}/${p.minStock})`).join(', ')}.</div>` : ''}
      ${expiring.length ? `<div class="alert alert-info"><strong>Contratos por vencer:</strong> ${expiring.map((w) => esc(w.fullName)).join(', ')}.</div>` : ''}
      <div class="grid-kpi">${kpis.join('')}</div>
      <div class="card"><h2 class="card-title">Accesos rápidos</h2><div class="btn-group">${quick.map(([v, l, c]) => `<button class="btn ${c}" data-action="nav" data-view="${v}">${l}</button>`).join('') || '<span class="page-subtitle">No hay accesos rápidos para su rol.</span>'}</div></div>`;
  }

  // ---- Caja y ventas ---------------------------------------------------------------------------
  function cartLines() {
    return state.cart.map((c) => {
      const p = inventoryService.getProductById(c.productId);
      return p ? { p, quantity: c.quantity, subtotal: p.salePrice * c.quantity } : null;
    }).filter(Boolean);
  }

  function viewCaja() {
    if (!(authService.hasPermission('cash.open') || authService.hasPermission('sales.create') || authService.hasPermission('cash.close'))) return denied();
    const reg = cashSalesService.getActiveCashRegister();
    const head = pageHeader('Caja registradora');
    if (!reg) {
      const canOpen = authService.hasPermission('cash.open');
      return `${head}<p class="page-subtitle">No hay una caja abierta. Ingrese el monto inicial para comenzar el turno.</p>
        ${canOpen ? `<div class="card" style="max-width:430px"><form data-form="open-cash">${fld('Monto inicial en caja ($)', money('initialAmount', '100000', { required: true }), 'initialAmount')}<button class="btn btn-primary" type="submit">Abrir caja</button></form></div>`
        : '<div class="alert alert-warning">Su rol no puede abrir la caja.</div>'}`;
    }
    const sum = cashSalesService.getCashSummary(reg.id);
    const isOpen = reg.status === 'ABIERTA';
    const closeBtn = authService.hasPermission('cash.close')
      ? (isOpen ? '<button class="btn btn-danger" data-action="start-closing">Cerrar caja</button>' : '<button class="btn btn-primary" data-action="nav" data-view="cierre">Continuar arqueo</button>') : '';
    const bar = `<div class="status-bar open"><div>${badge(reg.status)} Inicio ${esc(formatDateTime(reg.openedAt))} · Monto inicial ${formatCOP(reg.initialAmount)} · Esperado ahora ${formatCOP(sum.expectedAmount)}</div>${closeBtn}</div>`;
    if (!isOpen) {
      return `${head}${bar}<div class="alert alert-warning">La caja está en arqueo: no admite ventas hasta que se confirme o cancele el cierre.</div>`;
    }
    if (!authService.hasPermission('sales.create')) return `${head}${bar}<div class="alert alert-info">Su rol no puede registrar ventas.</div>`;

    const term = state.posSearch.trim().toLowerCase();
    const prods = inventoryService.listProducts({ onlyActive: true }).filter((p) => !term || p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term));
    const lines = cartLines();
    const total = lines.reduce((a, l) => a + l.subtotal, 0);
    const received = state.received === '' ? String(total) : state.received;
    const list = prods.map((p) => `<div class="pos-product-row"><div><strong>${esc(p.name)}</strong><br><small>${formatCOP(p.salePrice)} · stock ${p.stock}</small></div>
      ${p.stock > 0 ? `<form data-form="add-cart" class="btn-group"><input type="hidden" name="productId" value="${p.id}"><label class="sr-only" for="q-${p.id}">Cantidad de ${esc(p.name)}</label><input class="form-control" id="q-${p.id}" name="quantity" type="number" min="1" value="1" style="width:70px"><button class="btn btn-primary btn-sm" type="submit">Agregar</button></form>` : badge('Agotado')}</div>`).join('') || '<p class="page-subtitle">No hay productos que coincidan.</p>';
    const cartHtml = lines.length ? `<div class="table-wrap"><table><thead><tr><th>Producto</th><th class="text-right">Cant.</th><th class="text-right">Precio</th><th class="text-right">Subtotal</th><th></th></tr></thead><tbody>
      ${lines.map((l) => `<tr><td>${esc(l.p.name)}</td><td class="text-right">${l.quantity}</td><td class="text-right">${formatCOP(l.p.salePrice)}</td><td class="text-right">${formatCOP(l.subtotal)}</td><td><button class="btn btn-secondary btn-sm" data-action="remove-cart" data-id="${l.p.id}">Quitar</button></td></tr>`).join('')}</tbody></table></div>
      <p class="kpi-value text-right" style="margin:.7rem 0">Total: ${formatCOP(total)}</p>
      <div class="form-row">${fld('Método de pago', sel('paymentMethod', [['EFECTIVO', 'Efectivo'], ['TARJETA', 'Tarjeta'], ['TRANSFERENCIA', 'Transferencia']], state.payMethod), 'paymentMethod')}
      ${state.payMethod === 'EFECTIVO' ? fld('Dinero recibido (efectivo)', money('receivedAmount', received), 'receivedAmount') : ''}</div>
      <div class="btn-group" style="margin-top:.7rem"><button class="btn btn-primary" data-action="confirm-sale">Confirmar pago y registrar venta</button><button class="btn btn-secondary" data-action="clear-cart">Cancelar venta</button></div>`
      : '<p class="page-subtitle">Agregue productos desde la lista.</p>';
    const movs = cashSalesService.listCashMovements(reg.id).slice(0, 10);
    const movCard = authService.hasPermission('cash.movements') ? `<div class="card"><h2 class="card-title">Ingreso / egreso de caja</h2>
      <form data-form="cash-movement" class="form-row">${fld('Tipo', sel('type', [['INGRESO', 'Ingreso'], ['EGRESO', 'Egreso']]), 'type')}${fld('Descripción', inp('description', { required: true }), 'description')}${fld('Valor', money('amount', '', { required: true }), 'amount')}<button class="btn btn-primary" type="submit">Registrar</button></form>
      ${movs.length ? `<div class="table-wrap" style="margin-top:.8rem"><table><thead><tr><th>Fecha</th><th>Tipo</th><th>Descripción</th><th class="text-right">Valor</th></tr></thead><tbody>${movs.map((m) => `<tr><td>${esc(formatDateTime(m.date))}</td><td>${esc(m.type)}</td><td>${esc(m.description)}</td><td class="text-right">${formatCOP(m.amount)}</td></tr>`).join('')}</tbody></table></div>` : ''}</div>` : '';
    return `${head}${bar}<div class="pos-grid"><div class="card"><form data-form="pos-search" class="form-row" style="margin-bottom:.6rem"><div class="form-group"><label class="sr-only" for="posSearch">Buscar producto</label><input class="form-control" id="posSearch" name="search" value="${esc(state.posSearch)}" placeholder="Buscar producto por nombre o código"></div><button class="btn btn-secondary" type="submit">Buscar</button></form>${list}</div>
      <div class="card"><h2 class="card-title">Venta actual</h2>${cartHtml}</div></div>${movCard}`;
  }

  function viewCierre() {
    if (!authService.hasPermission('cash.close')) return denied();
    const reg = cashSalesService.getActiveCashRegister();
    if (!reg || reg.status !== 'EN_ARQUEO') return `${pageHeader('Cierre de caja')}<div class="alert alert-warning">No hay un arqueo en curso.</div><button class="btn btn-primary" data-action="nav" data-view="caja">Volver a caja</button>`;
    const s = cashSalesService.getCashSummary(reg.id);
    return `${pageHeader('Cierre de caja', `Estado de la caja: ${badge('EN_ARQUEO')} — compare el dinero esperado con el contado.`)}
      <div class="grid-2"><div class="card"><div class="table-wrap"><table><tbody>
      <tr><td>Monto inicial</td><td class="text-right">${formatCOP(reg.initialAmount)}</td></tr><tr><td>Ventas</td><td class="text-right">${formatCOP(s.totalSales)}</td></tr>
      <tr><td>Ingresos</td><td class="text-right">${formatCOP(s.totalIncomes)}</td></tr><tr><td>Egresos</td><td class="text-right">− ${formatCOP(s.totalExpenses)}</td></tr>
      <tr><th>Monto esperado</th><th class="text-right" style="font-size:1rem">${formatCOP(s.expectedAmount)}</th></tr></tbody></table></div></div>
      <div class="card"><form data-form="confirm-closing" id="closing-form" data-expected="${s.expectedAmount}">${fld('Dinero contado ($)', money('counted', '', { required: true }), 'counted')}
      <p>Diferencia (contado − esperado): <strong id="diff-out">—</strong></p>
      ${fld('Observación (obligatoria si hay diferencia)', '<textarea class="form-control" name="observation" id="observation"></textarea>', 'observation')}
      <div class="btn-group"><button class="btn btn-primary" type="submit">Confirmar cierre</button><button class="btn btn-secondary" type="button" data-action="cancel-closing">Cancelar</button></div></form></div></div>`;
  }

  function viewVentas() {
    if (!authService.hasPermission('sales.view')) return denied();
    const f = state.filters.sales;
    const sales = cashSalesService.listSales(f);
    const canVoid = authService.hasPermission('sales.void');
    return `${pageHeader('Consultar ventas')}<div class="card"><form data-form="filter-sales" class="form-row">${fld('Desde', inp('from', { type: 'date', value: f.from }), 'from')}${fld('Hasta', inp('to', { type: 'date', value: f.to }), 'to')}
      ${fld('Número de venta', inp('number', { value: f.number }), 'number')}${fld('Producto', inp('product', { value: f.product }), 'product')}<button class="btn btn-secondary" type="submit">Buscar</button></form></div>
      <div class="card"><div class="table-wrap"><table><thead><tr><th>Número</th><th>Fecha</th><th>Atendió</th><th>Pago</th><th class="text-right">Total</th><th>Estado</th><th></th></tr></thead><tbody>
      ${sales.map((s) => `<tr><td><button class="link-btn" data-action="view-sale" data-id="${s.id}">${esc(s.number)}</button></td><td>${esc(formatDateTime(s.date))}</td><td>${esc(s.username)}</td><td>${esc(s.paymentMethod)}</td><td class="text-right">${formatCOP(s.total)}</td>
      <td>${badge(s.voided ? 'ANULADA' : 'REGISTRADA')}</td><td>${canVoid && !s.voided ? `<button class="btn btn-danger btn-sm" data-action="void-sale" data-id="${s.id}">Anular</button>` : (s.voided ? `<small>${esc(s.voidReason)}</small>` : '')}</td></tr>`).join('') || emptyRow(7, 'No se encontraron ventas con esos criterios.')}</tbody></table></div></div>`;
  }

  function viewHistorial() {
    if (!authService.hasPermission('sales.view')) return denied();
    const regs = cashSalesService.listRegisters();
    const m = (v) => (v === null || v === undefined ? '—' : formatCOP(v));
    return `${pageHeader('Historial de cajas', 'Cada turno queda archivado al cerrarse y no se puede modificar.')}<div class="card"><div class="table-wrap"><table><thead><tr><th>Apertura</th><th>Cierre</th><th>Estado</th><th class="text-right">Inicial</th><th class="text-right">Esperado</th><th class="text-right">Contado</th><th class="text-right">Diferencia</th><th>Observación</th></tr></thead><tbody>
      ${regs.map((r) => `<tr><td>${esc(formatDateTime(r.openedAt))}</td><td>${esc(formatDateTime(r.closedAt))}</td><td>${badge(r.status)}</td><td class="text-right">${formatCOP(r.initialAmount)}</td><td class="text-right">${m(r.expectedAmount)}</td><td class="text-right">${m(r.countedAmount)}</td><td class="text-right">${m(r.difference)}</td><td>${esc(r.closingObservation || '')}</td></tr>`).join('') || emptyRow(8, 'Aún no hay cajas registradas.')}</tbody></table></div></div>`;
  }

  // ---- Inventario y proveedores ----------------------------------------------------------------
  function viewInventario() {
    if (!(authService.hasPermission('inventory.view') || authService.hasPermission('inventory.manage'))) return denied();
    const f = state.filters.inventory;
    const manage = authService.hasPermission('inventory.manage');
    const prods = inventoryService.listProducts({ search: f.search, category: f.category });
    const cats = inventoryService.getCategories();
    const low = inventoryService.getLowStockProducts();
    const suppliers = inventoryService.listSuppliers({ onlyActive: true });
    const allProds = inventoryService.listProducts();
    return `${pageHeader('Inventario', 'Productos, stock, stock mínimo y alertas.')}
      ${low.length ? `<div class="alert alert-warning" role="alert"><strong>Stock bajo:</strong> ${low.map((p) => `${esc(p.name)} (${p.stock}/${p.minStock})`).join(', ')}.</div>` : ''}
      <div class="card"><form data-form="filter-inventory" class="form-row">${fld('Buscar por nombre o código', inp('search', { value: f.search }), 'search')}${fld('Categoría', sel('category', [['', 'Todas'], ...cats.map((c) => [c, c])], f.category), 'category')}<button class="btn btn-secondary" type="submit">Buscar</button></form></div>
      <div class="card"><div class="table-wrap"><table><thead><tr><th>Código</th><th>Producto</th><th>Categoría</th><th class="text-right">Precio</th><th class="text-right">Stock</th><th class="text-right">Mínimo</th><th>Estado</th>${manage ? '<th></th>' : ''}</tr></thead><tbody>
      ${prods.map((p) => `<tr><td>${esc(p.code)}</td><td>${esc(p.name)}</td><td>${esc(p.category)}</td><td class="text-right">${formatCOP(p.salePrice)}</td><td class="text-right">${p.stock}</td><td class="text-right">${p.minStock}</td><td>${badge(p.statusLabel)}</td>${manage ? `<td><button class="btn btn-secondary btn-sm" data-action="edit-product" data-id="${p.id}">Editar</button></td>` : ''}</tr>`).join('') || emptyRow(8, 'No hay productos con esos criterios.')}</tbody></table></div></div>
      ${manage ? `<div class="grid-2"><div class="card"><h2 class="card-title">Registrar producto</h2><form data-form="create-product">
        <div class="form-row">${fld('Código', inp('code', { required: true }), 'code')}${fld('Nombre', inp('name', { required: true }), 'name')}</div>${fld('Descripción', inp('description'), 'description')}
        <div class="form-row">${fld('Categoría', `<input class="form-control" id="category-new" name="category" list="cat-list" required><datalist id="cat-list">${cats.map((c) => `<option value="${esc(c)}">`).join('')}</datalist>`, 'category-new')}${fld('Precio de venta', money('salePrice', '', { required: true }), 'salePrice')}</div>
        <div class="form-row">${fld('Stock inicial', money('stock', '0'), 'stock')}${fld('Stock mínimo', money('minStock', '0'), 'minStock')}</div><button class="btn btn-primary" type="submit">Guardar producto</button></form></div>
        <div class="card"><h2 class="card-title">Entrada o salida de productos</h2><form data-form="movement">
        ${fld('Producto', sel('productId', allProds.map((p) => [p.id, `${p.name} (stock ${p.stock})`])), 'productId')}
        <div class="form-row">${fld('Tipo', sel('type', [['ENTRADA', 'Entrada'], ['SALIDA', 'Salida']]), 'type')}${fld('Cantidad', money('quantity', '', { required: true }), 'quantity')}</div>
        ${fld('Motivo', inp('reason', { required: true, placeholder: 'Compra, merma, ajuste…' }), 'reason')}${fld('Proveedor (solo entradas)', sel('supplierId', [['', '—'], ...suppliers.map((s) => [s.id, s.name])]), 'supplierId')}
        <div class="btn-group"><button class="btn btn-primary" type="submit">Registrar movimiento</button><button type="button" class="btn btn-secondary" data-action="nav" data-view="movimientos">Ver historial</button></div></form></div></div>` : ''}`;
  }

  function viewMovimientos() {
    if (!authService.hasPermission('inventory.manage')) return denied();
    const movs = inventoryService.listMovements().slice(0, 200);
    return `${pageHeader('Movimientos de inventario')}<button class="btn btn-secondary" data-action="nav" data-view="inventario" style="margin-bottom:1rem">← Volver al inventario</button>
      <div class="card"><div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th class="text-right">Cantidad</th><th>Motivo</th><th>Proveedor</th><th>Usuario</th></tr></thead><tbody>
      ${movs.map((m) => `<tr><td>${esc(formatDateTime(m.date))}</td><td>${esc(m.productName)}</td><td>${esc(m.type)}</td><td class="text-right">${m.quantity}</td><td>${esc(m.reason)}</td><td>${esc(m.supplierName || '—')}</td><td>${esc(m.username)}</td></tr>`).join('') || emptyRow(7, 'Sin movimientos.')}</tbody></table></div></div>`;
  }

  function viewProveedores() {
    if (!authService.hasPermission('suppliers.manage')) return denied();
    const f = state.filters.suppliers;
    const list = inventoryService.listSuppliers({ search: f.search });
    return `${pageHeader('Proveedores', 'Los proveedores inactivos no se ofrecen en entradas ni gastos.')}
      <div class="card"><form data-form="create-supplier" class="form-row">${fld('Nombre', inp('name', { required: true }), 'name')}${fld('NIT', inp('nit', { required: true }), 'nit')}${fld('Teléfono', inp('phone', { required: true }), 'phone')}${fld('Correo', inp('email', { type: 'email', required: true }), 'email')}<button class="btn btn-primary" type="submit">Guardar</button></form></div>
      <div class="card"><form data-form="filter-suppliers" class="form-row" style="margin-bottom:.7rem">${fld('Buscar por nombre o NIT', inp('search', { value: f.search }), 'search')}<button class="btn btn-secondary" type="submit">Buscar</button></form>
      <div class="table-wrap"><table><thead><tr><th>Nombre</th><th>NIT</th><th>Teléfono</th><th>Correo</th><th>Estado</th><th></th></tr></thead><tbody>
      ${list.map((s) => `<tr><td>${esc(s.name)}</td><td>${esc(s.nit)}</td><td>${esc(s.phone)}</td><td>${esc(s.email)}</td><td>${badge(s.active ? 'ACTIVO' : 'INACTIVO')}</td><td><button class="btn btn-secondary btn-sm" data-action="toggle-supplier" data-id="${s.id}">${s.active ? 'Desactivar' : 'Activar'}</button></td></tr>`).join('') || emptyRow(6, 'No hay proveedores.')}</tbody></table></div></div>`;
  }

  // ==========================================================================
  // Vistas: contabilidad, personal, asistencia, reportes, usuarios y cuenta
  // ==========================================================================
  function viewContabilidad() {
    if (!authService.hasPermission('accounting.manage')) return denied();
    const f = state.filters.accounting;
    const from = f.from || monthStart(), to = f.to || today();
    const r = accountingService.getFinancialSummary({ from, to, type: f.type });
    return `${pageHeader('Contabilidad', 'Resumen de ingresos y egresos. Las ventas se registran solo en Caja; los registros anulados no se cuentan.')}
      <div class="btn-group" style="margin-bottom:1rem"><button class="btn btn-primary" data-action="nav" data-view="gastos">Registrar gasto</button><button class="btn btn-primary" data-action="nav" data-view="pagos">Registrar pago al personal</button></div>
      <div class="card"><form data-form="filter-accounting" class="form-row">${fld('Desde', inp('from', { type: 'date', value: from }), 'from')}${fld('Hasta', inp('to', { type: 'date', value: to }), 'to')}
      ${fld('Tipo', sel('type', [['todos', 'Todos'], ['ventas', 'Ventas'], ['gastos', 'Gastos'], ['pagos', 'Pagos al personal']], f.type), 'type')}<button class="btn btn-secondary" type="submit">Filtrar</button></form></div>
      <div class="grid-kpi"><div class="kpi-card"><div class="kpi-value">${formatCOP(r.sales)}</div><div class="kpi-label">Ventas del periodo</div></div><div class="kpi-card"><div class="kpi-value">${formatCOP(r.expenses)}</div><div class="kpi-label">Gastos</div></div>
      <div class="kpi-card"><div class="kpi-value">${formatCOP(r.payments)}</div><div class="kpi-label">Pagos al personal</div></div><div class="kpi-card"><div class="kpi-value ${r.balance >= 0 ? 'success' : 'danger'}">${formatCOP(r.balance)}</div><div class="kpi-label">Equilibrio (ventas − gastos − pagos)</div></div></div>
      <div class="card"><div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Concepto</th><th>Tipo</th><th class="text-right">Valor</th></tr></thead><tbody>
      ${r.movements.map((m) => `<tr><td>${esc(formatDate(m.date))}</td><td>${esc(m.concept)}</td><td>${esc(m.kind)}</td><td class="text-right">${formatCOP(m.amount)}</td></tr>`).join('') || emptyRow(4, 'Sin movimientos en el periodo.')}</tbody></table></div></div>`;
  }

  function viewGastos() {
    if (!authService.hasPermission('accounting.manage')) return denied();
    const f = state.filters.expenses;
    const list = accountingService.listExpenses(f);
    const sups = inventoryService.listSuppliers({ onlyActive: true });
    return `${pageHeader('Gastos', 'Registre, consulte, corrija y anule gastos. Los gastos no se eliminan: se anulan con motivo.')}
      <div class="card"><h2 class="card-title">Registrar gasto</h2><form data-form="create-expense"><div class="form-row">${fld('Descripción', inp('description', { required: true }), 'description')}${fld('Fecha', inp('date', { type: 'date', value: today(), required: true }), 'date')}${fld('Valor', money('amount', '', { required: true }), 'amount')}
      ${fld('Categoría', sel('category', EXPENSE_CATEGORIES.map((c) => [c, c])), 'category')}${fld('Proveedor (opcional)', sel('supplierId', [['', '—'], ...sups.map((s) => [s.id, s.name])]), 'supplierId')}</div>
      <p class="page-subtitle">El responsable es el usuario en sesión.</p><button class="btn btn-primary" type="submit">Guardar</button></form></div>
      <div class="card"><form data-form="filter-expenses" class="form-row">${fld('Buscar', inp('search', { value: f.search }), 'search')}${fld('Categoría', sel('category', [['', 'Todas'], ...EXPENSE_CATEGORIES.map((c) => [c, c])], f.category), 'category')}
      ${fld('Desde', inp('from', { type: 'date', value: f.from }), 'from')}${fld('Hasta', inp('to', { type: 'date', value: f.to }), 'to')}<button class="btn btn-secondary" type="submit">Buscar</button></form></div>
      <div class="card"><div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Descripción</th><th>Categoría</th><th>Responsable</th><th class="text-right">Valor</th><th>Estado</th><th></th></tr></thead><tbody>
      ${list.map((e) => `<tr><td>${esc(formatDate(e.date))}</td><td>${esc(e.description)}</td><td>${esc(e.category)}</td><td>${esc(e.responsibleName)}</td><td class="text-right">${formatCOP(e.amount)}</td><td>${badge(e.status === 'ACTIVO' ? 'REGISTRADO' : 'ANULADO')}</td>
      <td>${e.status === 'ACTIVO' ? `<div class="btn-group"><button class="btn btn-secondary btn-sm" data-action="edit-expense" data-id="${e.id}">Editar</button><button class="btn btn-danger btn-sm" data-action="void-expense" data-id="${e.id}">Anular</button></div>` : `<small>${esc(e.voidReason)}</small>`}</td></tr>`).join('') || emptyRow(7, 'No hay gastos con esos criterios.')}</tbody></table></div></div>`;
  }

  function viewPagos() {
    if (!authService.hasPermission('accounting.manage')) return denied();
    const f = state.filters.payments;
    const list = accountingService.listStaffPayments(f);
    const workers = hrService.listWorkers({ onlyActive: true });
    return `${pageHeader('Pagos al personal')}<div class="alert alert-info">Aviso de alcance: el sistema solo registra los pagos efectuados; no calcula nómina ni prestaciones.</div>
      <div class="card"><form data-form="create-payment" class="form-row">${fld('Trabajador', sel('workerId', workers.map((w) => [w.id, w.fullName])), 'workerId')}${fld('Fecha', inp('date', { type: 'date', value: today(), required: true }), 'date')}
      ${fld('Concepto', inp('concept', { required: true }), 'concept')}${fld('Valor', money('amount', '', { required: true }), 'amount')}<button class="btn btn-primary" type="submit">Registrar pago</button></form></div>
      <div class="card"><form data-form="filter-payments" class="form-row">${fld('Trabajador', sel('workerId', [['', 'Todos'], ...workers.map((w) => [w.id, w.fullName])], f.workerId), 'fworker')}${fld('Desde', inp('from', { type: 'date', value: f.from }), 'from')}${fld('Hasta', inp('to', { type: 'date', value: f.to }), 'to')}<button class="btn btn-secondary" type="submit">Consultar</button></form></div>
      <div class="card"><div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Trabajador</th><th>Concepto</th><th class="text-right">Valor</th><th>Estado</th><th></th></tr></thead><tbody>
      ${list.map((p) => `<tr><td>${esc(formatDate(p.date))}</td><td>${esc(p.workerName)}</td><td>${esc(p.concept)}</td><td class="text-right">${formatCOP(p.amount)}</td><td>${badge(p.status === 'ACTIVO' ? 'REGISTRADO' : 'ANULADO')}</td>
      <td>${p.status === 'ACTIVO' ? `<button class="btn btn-danger btn-sm" data-action="void-payment" data-id="${p.id}">Anular</button>` : `<small>${esc(p.voidReason)}</small>`}</td></tr>`).join('') || emptyRow(6, 'Sin pagos registrados.')}</tbody></table></div></div>`;
  }

  // ---- Personal --------------------------------------------------------------------------------
  const statusBadge = (s) => badge(s);

  function viewPersonal() {
    if (!authService.hasPermission('hr.manage')) return denied();
    const workers = hrService.listWorkers({ search: state.filters.workers.search });
    const free = hrService.listResumes().filter((r) => !repo.getCollection('workers').some((w) => w.resumeId === r.id));
    const active = hrService.listWorkers({ onlyActive: true });
    return `${pageHeader('Gestión de personal', 'Los datos personales se tratan conforme a la Ley 1581 de 2012; solo el Administrador accede a ellos.')}
      <div class="card"><form data-form="filter-workers" class="form-row">${fld('Buscar por nombre o documento', inp('search', { value: state.filters.workers.search }), 'search')}<button class="btn btn-secondary" type="submit">Buscar</button></form></div>
      <div class="card"><div class="table-wrap"><table><thead><tr><th>Documento</th><th>Nombre</th><th>Cargo</th><th>Estado</th><th>Contrato</th><th></th></tr></thead><tbody>
      ${workers.map((w) => `<tr><td>${esc(w.document)}</td><td>${esc(w.fullName)}</td><td>${esc(w.position)}</td><td>${esc(w.status)}</td><td>${statusBadge(w.contractStatus)}</td><td><button class="btn btn-primary btn-sm" data-action="open-worker" data-id="${w.id}">Ver ficha</button></td></tr>`).join('') || emptyRow(6, 'No hay trabajadores registrados.')}</tbody></table></div></div>
      <div class="grid-2"><div class="card"><h2 class="card-title">1. Nueva hoja de vida</h2><form data-form="create-resume">
        <div class="form-row">${fld('Documento', inp('document', { required: true }), 'document')}${fld('Nombre completo', inp('fullName', { required: true }), 'fullName')}</div>
        <div class="form-row">${fld('Teléfono', inp('phone'), 'phone')}${fld('Correo', inp('email', { type: 'email' }), 'email')}</div>${fld('Dirección', inp('address'), 'address')}
        <label class="checkbox-label" style="margin-bottom:.8rem"><input type="checkbox" name="dataAuthorization"> La persona autoriza el tratamiento de sus datos personales (Ley 1581 de 2012)</label>
        <button class="btn btn-primary" type="submit">Guardar hoja de vida</button><p class="page-subtitle" style="margin-top:.5rem">Los estudios y la experiencia se agregan desde la ficha del trabajador.</p></form></div>
      <div><div class="card"><h2 class="card-title">2. Nuevo trabajador</h2><form data-form="create-worker">${fld('Persona (con hoja de vida)', sel('resumeId', free.map((r) => [r.id, `${r.fullName} (${r.document})`])), 'resumeId')}
        <div class="form-row">${fld('Cargo', inp('position', { required: true }), 'position')}${fld('Fecha de ingreso', inp('hireDate', { type: 'date', value: today(), required: true }), 'hireDate')}</div><button class="btn btn-primary" type="submit"${free.length ? '' : ' disabled'}>Registrar trabajador</button></form></div>
      <div class="card"><h2 class="card-title">3. Nuevo contrato</h2><form data-form="create-contract">${fld('Trabajador', sel('workerId', active.map((w) => [w.id, w.fullName])), 'workerId')}
        <div class="form-row">${fld('Tipo', sel('type', CONTRACT_TYPES.map((t) => [t.key, t.label])), 'type')}${fld('Cargo', inp('position', { required: true }), 'cposition')}</div>
        <div class="form-row">${fld('Inicio', inp('startDate', { type: 'date', value: today(), required: true }), 'startDate')}${fld('Fin', inp('endDate', { type: 'date' }), 'endDate')}${fld('Salario', money('salary', '', { required: true }), 'salary')}</div>
        <button class="btn btn-primary" type="submit">Registrar contrato</button></form></div></div></div>`;
  }

  function viewFicha(workerId) {
    if (!authService.hasPermission('hr.manage')) return denied();
    const w = hrService.getWorkerView(workerId);
    if (!w) return `${pageHeader('Trabajador no encontrado')}<button class="btn btn-primary" data-action="nav" data-view="personal">Volver a personal</button>`;
    const r = hrService.getResume(w.resumeId) || { education: [], experience: [] };
    const tabs = [['datos', 'Datos personales'], ['hoja', 'Hoja de vida'], ['contrato', 'Contrato'], ['horario', 'Horario'], ['asistencia', 'Asistencia'], ['pagos', 'Pagos']];
    const tab = state.workerTab;
    let body = '';
    if (tab === 'datos') {
      body = `<div class="card"><form data-form="update-worker" data-id="${w.id}"><div class="form-row">${fld('Nombre completo', inp('fullName', { value: w.fullName, required: true }), 'fullName')}${fld('Cargo', inp('position', { value: w.position, required: true }), 'position')}</div>
        <div class="form-row">${fld('Teléfono', inp('phone', { value: w.phone }), 'phone')}${fld('Correo', inp('email', { value: w.email }), 'email')}${fld('Dirección', inp('address', { value: w.address }), 'address')}</div>
        <p>Autorización de tratamiento de datos: <strong>${w.dataAuthorization ? 'Sí' : 'No registrada'}</strong></p><div class="btn-group"><button class="btn btn-primary" type="submit">Guardar cambios</button>
        <button type="button" class="btn btn-secondary" data-action="toggle-worker" data-id="${w.id}">${w.status === 'ACTIVO' ? 'Marcar como retirado' : 'Reactivar'}</button></div></form></div>`;
    } else if (tab === 'hoja') {
      body = `<div class="grid-2"><div class="card"><h2 class="card-title">Estudios</h2><div class="table-wrap"><table><thead><tr><th>Título</th><th>Institución</th><th>Periodo</th></tr></thead><tbody>${r.education.map((e) => `<tr><td>${esc(e.title)}</td><td>${esc(e.institution)}</td><td>${esc(formatDate(e.startDate))} – ${esc(formatDate(e.endDate))}</td></tr>`).join('') || emptyRow(3, 'Sin estudios.')}</tbody></table></div>
        <form data-form="add-education" data-id="${w.resumeId}" style="margin-top:.8rem"><div class="form-row">${fld('Título', inp('title', { required: true }), 'title')}${fld('Institución', inp('institution'), 'institution')}</div><div class="form-row">${fld('Inicio', inp('startDate', { type: 'date' }), 'startDate')}${fld('Fin', inp('endDate', { type: 'date' }), 'endDate')}</div><button class="btn btn-secondary btn-sm" type="submit">Agregar estudio</button></form></div>
        <div class="card"><h2 class="card-title">Experiencia laboral</h2><div class="table-wrap"><table><thead><tr><th>Empresa</th><th>Cargo</th><th>Periodo</th></tr></thead><tbody>${r.experience.map((e) => `<tr><td>${esc(e.company)}</td><td>${esc(e.role)}</td><td>${esc(formatDate(e.startDate))} – ${esc(formatDate(e.endDate))}</td></tr>`).join('') || emptyRow(3, 'Sin experiencia.')}</tbody></table></div>
        <form data-form="add-experience" data-id="${w.resumeId}" style="margin-top:.8rem"><div class="form-row">${fld('Empresa', inp('company', { required: true }), 'company')}${fld('Cargo', inp('role'), 'role')}</div><div class="form-row">${fld('Desde', inp('startDate', { type: 'date' }), 'xstart')}${fld('Hasta', inp('endDate', { type: 'date' }), 'xend')}</div><button class="btn btn-secondary btn-sm" type="submit">Agregar experiencia</button></form></div></div>`;
    } else if (tab === 'contrato') {
      const cs = hrService.listContracts(w.id);
      body = `<div class="card"><div class="table-wrap"><table><thead><tr><th>Tipo</th><th>Inicio</th><th>Fin</th><th>Cargo</th><th class="text-right">Salario</th><th>Estado</th><th></th></tr></thead><tbody>
        ${cs.map((c) => `<tr><td>${esc((CONTRACT_TYPES.find((t) => t.key === c.type) || {}).label || c.type)}</td><td>${esc(formatDate(c.startDate))}</td><td>${esc(formatDate(c.endDate))}</td><td>${esc(c.position)}</td><td class="text-right">${formatCOP(c.salary)}</td><td>${statusBadge(c.status)}</td>
        <td>${['VIGENTE', 'POR_VENCER'].includes(c.status) ? `<button class="btn btn-danger btn-sm" data-action="void-contract" data-id="${c.id}">Anular</button>` : (c.voidReason ? `<small>${esc(c.voidReason)}</small>` : '')}</td></tr>`).join('') || emptyRow(7, 'Sin contratos.')}</tbody></table></div></div>
        <div class="card"><h2 class="card-title">Registrar contrato</h2><form data-form="create-contract"><input type="hidden" name="workerId" value="${w.id}"><div class="form-row">${fld('Tipo', sel('type', CONTRACT_TYPES.map((t) => [t.key, t.label])), 'type')}${fld('Cargo', inp('position', { value: w.position, required: true }), 'cposition')}
        ${fld('Inicio', inp('startDate', { type: 'date', value: today(), required: true }), 'startDate')}${fld('Fin', inp('endDate', { type: 'date' }), 'endDate')}${fld('Salario', money('salary', '', { required: true }), 'salary')}</div><button class="btn btn-primary" type="submit">Registrar</button></form></div>`;
    } else if (tab === 'horario') {
      const sc = attendanceService.getSchedule(w.id);
      body = `<div class="card"><div class="table-wrap"><table><thead><tr><th>Día</th><th>Entrada</th><th>Salida</th></tr></thead><tbody>${DAY_NAMES.map((d) => `<tr><td>${d.label}</td><td>${sc[d.key] ? sc[d.key].startTime : '—'}</td><td>${sc[d.key] ? sc[d.key].endTime : '—'}</td></tr>`).join('')}</tbody></table></div>
        <p style="margin-top:.8rem"><button class="btn btn-secondary" data-action="goto-schedule" data-id="${w.id}">Gestionar horario</button></p></div>`;
    } else if (tab === 'asistencia') {
      const recs = attendanceService.listRecordsForWorker(w.id);
      body = `<div class="card"><div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Ingreso</th><th>Salida</th><th>Observación</th></tr></thead><tbody>${recs.map((a) => `<tr><td>${esc(formatDate(a.date))}</td><td>${esc(a.clockIn)}</td><td>${esc(a.clockOut || '—')}</td><td>${badge(a.observation)}</td></tr>`).join('') || emptyRow(4, 'Sin registros.')}</tbody></table></div></div>`;
    } else {
      const pays = accountingService.listStaffPayments({ workerId: w.id });
      body = `<div class="card"><div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Concepto</th><th class="text-right">Valor</th><th>Estado</th></tr></thead><tbody>${pays.map((p) => `<tr><td>${esc(formatDate(p.date))}</td><td>${esc(p.concept)}</td><td class="text-right">${formatCOP(p.amount)}</td><td>${badge(p.status === 'ACTIVO' ? 'REGISTRADO' : 'ANULADO')}</td></tr>`).join('') || emptyRow(4, 'Sin pagos.')}</tbody></table></div></div>`;
    }
    return `${pageHeader(w.fullName, `${esc(w.position)} · Documento ${esc(w.document)} · ${badge(w.status)}`)}<button class="btn btn-secondary" data-action="nav" data-view="personal" style="margin-bottom:1rem">← Volver a personal</button>
      <div class="tabs" role="tablist">${tabs.map(([k, l]) => `<button class="tab-btn${tab === k ? ' active' : ''}" role="tab" aria-selected="${tab === k}" data-action="worker-tab" data-tab="${k}">${l}</button>`).join('')}</div>${body}`;
  }

  // ---- Asistencia y horarios -------------------------------------------------------------------
  function viewAsistencia() {
    const all = authService.hasPermission('attendance.all');
    if (!(all || authService.hasPermission('attendance.own'))) return denied();
    const f = state.filters.attendance;
    const date = f.date || today();
    const rows = attendanceService.listAttendance({ date, workerId: f.workerId });
    const workers = hrService.listActiveWorkersBasic();
    const pick = all ? `<div class="form-group" style="min-width:200px;flex:1"><label class="sr-only" for="att-worker">Trabajador</label>${sel('workerId', workers.map((w) => [w.id, w.fullName]), '', { id: 'att-worker' })}</div>` : '';
    return `${pageHeader('Asistencia', 'Registre su ingreso y salida. La hora la toma el sistema y el retardo se calcula frente al horario asignado.')}
      <div class="card"><div class="form-row">${pick}<button class="btn btn-primary" data-action="clock-in">Registrar ingreso</button><button class="btn btn-secondary" data-action="clock-out">Registrar salida</button>${all ? '<button class="btn btn-secondary" data-action="nav" data-view="horarios">Gestionar horarios</button>' : ''}</div></div>
      <div class="card"><form data-form="filter-attendance" class="form-row">${fld('Fecha', inp('date', { type: 'date', value: date }), 'date')}${all ? fld('Trabajador', sel('workerId', [['', 'Todos'], ...workers.map((w) => [w.id, w.fullName])], f.workerId), 'fworker') : ''}<button class="btn btn-secondary" type="submit">Consultar</button></form></div>
      <div class="card"><div class="table-wrap"><table><thead><tr><th>Trabajador</th><th>Horario</th><th>Entrada</th><th>Salida</th><th>Observación</th></tr></thead><tbody>
      ${rows.map((r) => `<tr><td>${esc(r.workerName)}</td><td>${esc(r.schedule)}</td><td>${esc(r.clockIn)}</td><td>${esc(r.clockOut)}</td><td>${badge(r.observation)}</td></tr>`).join('') || emptyRow(5, 'Sin registros para la fecha.')}</tbody></table></div></div>`;
  }

  function viewHorarios() {
    if (!authService.hasPermission('attendance.all')) return denied();
    const workers = hrService.listActiveWorkersBasic();
    if (!workers.length) return `${pageHeader('Gestionar horarios')}<div class="alert alert-warning">No hay trabajadores activos.</div>`;
    const wid = workers.some((w) => w.id === state.scheduleWorkerId) ? state.scheduleWorkerId : workers[0].id;
    const sc = attendanceService.getSchedule(wid);
    return `${pageHeader('Gestionar horarios', 'Deje vacíos los días libres. La hora de entrada debe ser menor que la de salida.')}
      <div class="card"><div class="form-row">${fld('Trabajador', sel('workerId', workers.map((w) => [w.id, w.fullName]), wid, { id: 'schedule-worker' }), 'schedule-worker')}</div></div>
      <div class="card"><form data-form="save-schedule" data-id="${wid}"><div class="table-wrap"><table><thead><tr><th>Día</th><th>Entrada</th><th>Salida</th></tr></thead><tbody>
      ${DAY_NAMES.map((d) => `<tr><td>${d.label}</td><td><input class="form-control" type="time" name="start-${d.key}" aria-label="Entrada ${d.label}" value="${sc[d.key] ? sc[d.key].startTime : ''}"></td><td><input class="form-control" type="time" name="end-${d.key}" aria-label="Salida ${d.label}" value="${sc[d.key] ? sc[d.key].endTime : ''}"></td></tr>`).join('')}</tbody></table></div>
      <p style="margin-top:.8rem"><button class="btn btn-primary" type="submit">Guardar horario</button></p></form></div>`;
  }

  // ---- Reportes --------------------------------------------------------------------------------
  function viewReportes() {
    if (!authService.hasPermission('reports.view')) return denied();
    const rp = state.report;
    const from = rp.from || monthStart(), to = rp.to || today();
    const d = rp.data;
    return `${pageHeader('Reportes', 'Genere reportes de la información registrada. No se cuentan registros anulados.')}
      <div class="card"><form data-form="report" class="form-row">${fld('Tipo de reporte', sel('type', Object.entries(reportService.TYPES), rp.type), 'type')}${fld('Desde', inp('from', { type: 'date', value: from, required: true }), 'from')}${fld('Hasta', inp('to', { type: 'date', value: to, required: true }), 'to')}
      <button class="btn btn-primary" type="submit" name="mode" value="view">Generar</button><button class="btn btn-secondary" type="submit" name="mode" value="pdf">Exportar PDF</button></form></div>
      ${d ? `<div class="card"><div class="card-header"><h2 class="card-title">${esc(d.title)}</h2><span class="page-subtitle">${esc(d.subtitle)}</span></div><div class="table-wrap"><table><thead><tr>${d.columns.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>
      ${d.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('') || emptyRow(d.columns.length, 'Sin registros en el periodo.')}</tbody></table></div>
      <p style="margin-top:.8rem">${d.summaryItems.map((s) => `<strong>${esc(s.label)}:</strong> ${esc(s.value)}`).join(' · ')}</p></div>` : ''}`;
  }

  // ---- Usuarios y roles ------------------------------------------------------------------------
  function viewUsuarios() {
    if (!authService.hasPermission('users.manage')) return denied();
    const q = state.filters.users.search.trim().toLowerCase();
    const users = authService.listUsers().filter((u) => !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    const workers = hrService.listActiveWorkersBasic();
    const roleOpts = Object.entries(ROLE_LABELS);
    const perms = authService.getRolePermissions();
    const sel_ = state.permRole;
    const mine = new Set(perms[sel_] || []);
    const audit = authService.listAuditLogs().slice(0, 12);
    const wname = (id) => (workers.find((w) => w.id === id) || {}).fullName || '—';
    return `${pageHeader('Usuarios y roles', 'Administre las cuentas de acceso y los permisos de cada rol.')}
      <div class="card"><form data-form="filter-users" class="form-row">${fld('Buscar', inp('search', { value: state.filters.users.search, placeholder: 'usuario o correo' }), 'search')}<button class="btn btn-secondary" type="submit">Buscar</button></form></div>
      <div class="card"><div class="table-wrap"><table><thead><tr><th>Usuario</th><th>Trabajador</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
      ${users.map((u) => `<tr><td>${esc(u.username)}<br><small>${esc(u.email)}</small></td><td>${esc(u.workerId ? wname(u.workerId) : '—')}</td>
      <td><div class="btn-group"><label class="sr-only" for="role-${u.id}">Rol de ${esc(u.username)}</label>${sel('role-' + u.id, roleOpts, u.role, { id: 'role-' + u.id, attrs: 'style="width:auto;height:32px"' })}<button class="btn btn-secondary btn-sm" data-action="change-role" data-id="${u.id}">Cambiar</button></div></td>
      <td>${badge(u.status)}</td><td><div class="btn-group">${u.status === 'BLOQUEADO' ? `<button class="btn btn-primary btn-sm" data-action="unlock-user" data-id="${u.id}">Desbloquear</button>` : ''}
      ${u.status === 'INACTIVO' ? `<button class="btn btn-success btn-sm" data-action="set-status" data-id="${u.id}" data-status="ACTIVO">Reactivar</button>` : `<button class="btn btn-danger btn-sm" data-action="set-status" data-id="${u.id}" data-status="INACTIVO">Desactivar</button>`}</div></td></tr>`).join('') || emptyRow(5, 'No hay usuarios.')}</tbody></table></div></div>
      <div class="grid-2"><div class="card"><h2 class="card-title">Nuevo usuario</h2><form data-form="create-user"><div class="form-row">${fld('Usuario', inp('username', { required: true }), 'username')}${fld('Nombre completo', inp('fullName', { required: true }), 'fullName')}</div>
      <div class="form-row">${fld('Correo', inp('email', { type: 'email', required: true }), 'email')}${fld('Contraseña inicial', inp('password', { type: 'password', required: true, attrs: 'autocomplete="new-password"' }), 'password')}</div>
      <div class="form-row">${fld('Rol', sel('role', roleOpts, 'VENDEDOR'), 'role')}${fld('Vincular a trabajador (opcional)', sel('workerId', [['', '— Ninguno —'], ...workers.map((w) => [w.id, w.fullName])]), 'workerId')}</div><button class="btn btn-primary" type="submit">Crear usuario</button></form></div>
      <div class="card"><h2 class="card-title">Permisos del rol</h2><div class="tabs">${roleOpts.map(([k, l]) => `<button class="tab-btn${sel_ === k ? ' active' : ''}" data-action="perm-role" data-role="${k}">${l}</button>`).join('')}</div>
      <form data-form="save-permissions" data-role="${sel_}">${ALL_PERMISSIONS_META.map((p) => `<label class="checkbox-label" style="margin-bottom:.4rem"><input type="checkbox" name="${p.key}"${sel_ === 'ADMIN' || mine.has(p.key) ? ' checked' : ''}${sel_ === 'ADMIN' ? ' disabled' : ''}> ${esc(p.label)}</label>`).join('')}
      ${sel_ === 'ADMIN' ? '<p class="page-subtitle">El Administrador siempre tiene todos los permisos.</p>' : '<p style="margin-top:.8rem"><button class="btn btn-primary" type="submit">Guardar permisos</button></p>'}</form></div></div>
      <div class="card"><h2 class="card-title">Registro de auditoría (últimos 12)</h2><div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Detalle</th></tr></thead><tbody>${audit.map((a) => `<tr><td>${esc(formatDateTime(a.timestamp))}</td><td>${esc(a.username)}</td><td>${esc(a.action)}</td><td>${esc(a.detail)}</td></tr>`).join('')}</tbody></table></div></div>`;
  }

  function viewCuenta(user) {
    return `${pageHeader('Mi cuenta', 'Cambiar contraseña')}<div class="card" style="max-width:440px"><p>Usuario: <strong>${esc(user.username)}</strong> · Rol: <strong>${esc(ROLE_LABELS[user.role] || user.role)}</strong></p>
      <form data-form="change-password">${fld('Contraseña actual', inp('current', { type: 'password', required: true, attrs: 'autocomplete="current-password"' }), 'current')}${fld('Nueva contraseña', inp('next', { type: 'password', required: true, attrs: 'autocomplete="new-password"' }), 'next')}
      ${fld('Confirmar nueva contraseña', inp('confirm', { type: 'password', required: true, attrs: 'autocomplete="new-password"' }), 'confirm')}<button class="btn btn-primary" type="submit">Cambiar contraseña</button></form></div>`;
  }

  // ==========================================================================
  // Dibujado de la pantalla actual y manejo de eventos
  // ==========================================================================
  function renderView(view, param, user) {
    const nav = NAV.find((n) => n.id === view);
    if (nav && !can(nav.perms)) return denied();
    switch (view) {
      case 'panel': return viewPanel(user);
      case 'caja': return viewCaja();
      case 'cierre': return viewCierre();
      case 'ventas': return viewVentas();
      case 'historial': return viewHistorial();
      case 'inventario': return viewInventario();
      case 'movimientos': return viewMovimientos();
      case 'proveedores': return viewProveedores();
      case 'contabilidad': return viewContabilidad();
      case 'gastos': return viewGastos();
      case 'pagos': return viewPagos();
      case 'personal': return viewPersonal();
      case 'ficha': return viewFicha(param);
      case 'asistencia': return viewAsistencia();
      case 'horarios': return viewHorarios();
      case 'reportes': return viewReportes();
      case 'usuarios': return viewUsuarios();
      case 'cuenta': return viewCuenta(user);
      default: return `${pageHeader('Página no encontrada')}<p>La página solicitada no existe.</p><button class="btn btn-primary" data-action="nav" data-view="${defaultView()}">Ir al inicio</button>`;
    }
  }

  function render() {
    const app = document.getElementById('app');
    if (!app) return;
    const route = parseHash();
    const user = authService.getCurrentUser();
    if (!user) {
      app.innerHTML = renderAuth(route);
      document.title = 'Iniciar sesión · SWIACLI';
      return;
    }
    let view = route.view;
    if (!view || ['login', 'olvido', 'restablecer'].includes(view)) {
      view = defaultView();
      history.replaceState(null, '', `#/${view}`);
    }
    let content;
    try {
      content = renderView(view, route.param, user);
    } catch (err) {
      console.error(err);
      content = `${pageHeader('Ocurrió un problema')}<div class="alert alert-danger" role="alert">${esc(err.message)}</div>`;
    }
    app.innerHTML = shell(user, view, content);
    const nav = NAV.find((n) => n.id === (EXTRA_VIEWS[view] ? EXTRA_VIEWS[view].parent : view));
    document.title = `${nav ? nav.label : 'Mi cuenta'} · SWIACLI`;
  }

  /** Ejecuta una acción; si falla muestra el mensaje de la regla de negocio en vez de romper la página. */
  async function safe(fn) {
    try { await fn(); } catch (err) {
      // Los rechazos por reglas de negocio son normales (se avisan con un mensaje); solo los fallos de programación son errores.
      const programming = err instanceof TypeError || err instanceof ReferenceError || err instanceof RangeError || err instanceof SyntaxError;
      (programming ? console.error : console.warn)(err);
      toast(err && err.message ? err.message : 'Ocurrió un error inesperado.', 'error');
    }
  }

  function getFormData(form) {
    const d = {};
    new FormData(form).forEach((v, k) => { d[k] = typeof v === 'string' ? v : ''; });
    return d;
  }

  // ---- Acciones por clic -----------------------------------------------------------------------
  const actions = {
    nav: (el) => { state.sidebarOpen = false; navigate(el.dataset.view); },
    'toggle-menu': () => { state.sidebarOpen = !state.sidebarOpen; render(); },
    logout: () => { authService.logout(); state.cart = []; state.received = ''; state.authError = ''; state.sidebarOpen = false; location.hash = ''; render(); },
    'close-modal': () => closeModal(),
    'modal-backdrop': (el, ev) => { if (ev.target === el) closeModal(); },
    print: () => window.print(),
    'go-login': () => { state.authError = ''; state.resetLink = ''; if (location.hash) location.hash = ''; else render(); },
    'reset-seed': async () => {
      if (!window.confirm('Se borrarán todos los datos actuales y se cargarán los datos de ejemplo. ¿Continuar?')) return;
      await resetToSeed();
      state.cart = []; state.received = ''; state.authError = '';
      location.hash = '';
      toast('Datos de ejemplo restablecidos.', 'success');
      render();
    },
    // Caja y ventas
    'start-closing': () => { cashSalesService.startCashClosing(); navigate('cierre'); },
    'cancel-closing': () => { cashSalesService.cancelCashClosing(); toast('Arqueo cancelado: la caja vuelve a estar abierta.', 'success'); navigate('caja'); },
    'remove-cart': (el) => { state.cart = state.cart.filter((c) => c.productId !== el.dataset.id); render(); },
    'clear-cart': () => { state.cart = []; state.received = ''; render(); toast('Venta cancelada.', 'success'); },
    'confirm-sale': () => {
      const input = document.getElementById('receivedAmount');
      const received = input ? toInt(input.value) : NaN;
      const { sale, warnings } = cashSalesService.createSale({
        items: state.cart.map((c) => ({ productId: c.productId, quantity: c.quantity })),
        paymentMethod: state.payMethod, receivedAmount: received
      });
      state.cart = []; state.received = '';
      render();
      showReceipt(sale);
      if (warnings.length) toast(`Atención, stock bajo o agotado en: ${warnings.map((w) => w.name).join(', ')}.`, 'warning');
    },
    'view-sale': (el) => { const s = cashSalesService.getSale(el.dataset.id); if (s) showReceipt(s); },
    'void-sale': (el) => voidModal('sale', el.dataset.id, 'Anular venta', 'La venta quedará como ANULADA, dejará de contarse en los totales y el stock se restituirá. Solo es posible si la caja sigue abierta.'),
    // Inventario y proveedores
    'edit-product': (el) => {
      const p = inventoryService.getProductById(el.dataset.id);
      if (!p) return;
      const cats = inventoryService.getCategories();
      openModal('Editar producto', `<form data-form="update-product" data-id="${p.id}"><div class="form-row">${fld('Código', inp('code', { value: p.code, required: true }), 'ecode')}${fld('Nombre', inp('name', { value: p.name, required: true }), 'ename')}</div>
        ${fld('Descripción', inp('description', { value: p.description }), 'edesc')}<div class="form-row">${fld('Categoría', `<input class="form-control" id="ecat" name="category" list="ecat-list" value="${esc(p.category)}" required><datalist id="ecat-list">${cats.map((c) => `<option value="${esc(c)}">`).join('')}</datalist>`, 'ecat')}${fld('Precio de venta', money('salePrice', p.salePrice, { required: true }), 'eprice')}${fld('Stock mínimo', money('minStock', p.minStock), 'emin')}</div>
        <p class="page-subtitle">El stock actual (${p.stock}) no se edita a mano: solo cambia por entradas, salidas, ventas y anulaciones.</p>
        <label class="checkbox-label" style="margin-bottom:.8rem"><input type="checkbox" name="active"${p.active ? ' checked' : ''}> Producto activo</label><div class="btn-group"><button class="btn btn-primary" type="submit">Guardar</button><button class="btn btn-secondary" type="button" data-action="close-modal">Cancelar</button></div></form>`);
    },
    'toggle-supplier': (el) => { inventoryService.toggleSupplier(el.dataset.id); render(); },
    // Contabilidad
    'edit-expense': (el) => {
      const e = repo.getCollection('expenses').find((x) => x.id === el.dataset.id);
      if (!e) return;
      const sups = inventoryService.listSuppliers({ onlyActive: true });
      openModal('Editar gasto', `<form data-form="update-expense" data-id="${e.id}"><div class="form-row">${fld('Descripción', inp('description', { value: e.description, required: true }), 'xdesc')}${fld('Fecha', inp('date', { type: 'date', value: e.date, required: true }), 'xdate')}${fld('Valor', money('amount', e.amount, { required: true }), 'xamount')}</div>
        <div class="form-row">${fld('Categoría', sel('category', EXPENSE_CATEGORIES.map((c) => [c, c]), e.category), 'xcat')}${fld('Proveedor', sel('supplierId', [['', '—'], ...sups.map((s) => [s.id, s.name])], e.supplierId || ''), 'xsup')}</div>
        <div class="btn-group"><button class="btn btn-primary" type="submit">Guardar</button><button class="btn btn-secondary" type="button" data-action="close-modal">Cancelar</button></div></form>`);
    },
    'void-expense': (el) => voidModal('expense', el.dataset.id, 'Anular gasto', 'Los gastos no se eliminan: quedan como ANULADOS con su motivo.'),
    'void-payment': (el) => voidModal('payment', el.dataset.id, 'Anular pago', 'El pago quedará como ANULADO y no se contará en el resumen.'),
    // Personal
    'open-worker': (el) => { state.workerTab = 'datos'; navigate('ficha', el.dataset.id); },
    'worker-tab': (el) => { state.workerTab = el.dataset.tab; render(); },
    'toggle-worker': (el) => { hrService.toggleWorkerStatus(el.dataset.id); render(); },
    'goto-schedule': (el) => { state.scheduleWorkerId = el.dataset.id; navigate('horarios'); },
    'void-contract': (el) => voidModal('contract', el.dataset.id, 'Anular contrato', 'La anulación (terminación anticipada) requiere un motivo.'),
    // Asistencia
    'clock-in': () => { const s = document.getElementById('att-worker'); const r = attendanceService.clockIn(s ? s.value : null); toast(`Ingreso registrado a las ${r.clockIn} (${r.observation}).`, 'success'); render(); },
    'clock-out': () => { const s = document.getElementById('att-worker'); const r = attendanceService.clockOut(s ? s.value : null); toast(`Salida registrada a las ${r.clockOut}.`, 'success'); render(); },
    // Usuarios
    'change-role': (el) => { const role = document.getElementById(`role-${el.dataset.id}`).value; authService.updateUser(el.dataset.id, { role }); toast('Rol actualizado.', 'success'); render(); },
    'unlock-user': (el) => { authService.unlockUser(el.dataset.id); toast('Usuario desbloqueado.', 'success'); render(); },
    'set-status': (el) => {
      if (el.dataset.status === 'INACTIVO' && !window.confirm('¿Desactivar este usuario? No podrá iniciar sesión.')) return;
      authService.updateUser(el.dataset.id, { status: el.dataset.status });
      toast('Estado actualizado.', 'success'); render();
    },
    'perm-role': (el) => { state.permRole = el.dataset.role; render(); }
  };

  // ---- Envío de formularios --------------------------------------------------------------------
  const forms = {
    login: async (f, d) => {
      try { await authService.login(d.identifier, d.password); state.authError = ''; location.hash = ''; render(); navigate(defaultView()); }
      catch (err) { state.authError = err.message; render(); }
    },
    forgot: (f, d) => {
      const r = authService.requestPasswordReset(d.identifier);
      state.resetLink = r ? `#/restablecer/${r.token}` : '';
      toast('Si el correo está registrado, se generó un enlace de restablecimiento con vigencia de 30 minutos.', 'success');
      render();
    },
    'reset-password': async (f, d) => {
      if (d.password !== d.confirm) { state.authError = 'Las contraseñas no coinciden.'; render(); return; }
      try { await authService.resetPasswordWithToken(d.token, d.password); state.authError = ''; state.resetLink = ''; toast('Contraseña actualizada. Ya puede iniciar sesión.', 'success'); location.hash = ''; render(); }
      catch (err) { state.authError = err.message; render(); }
    },
    'change-password': async (f, d) => {
      if (d.next !== d.confirm) throw new Error('Las contraseñas no coinciden.');
      await authService.changeOwnPassword(d.current, d.next);
      toast('Contraseña cambiada.', 'success'); f.reset();
    },
    // Caja
    'open-cash': (f, d) => { cashSalesService.openCashRegister(toInt(d.initialAmount)); toast('Caja abierta.', 'success'); render(); },
    'pos-search': (f, d) => { state.posSearch = d.search || ''; render(); },
    'add-cart': (f, d) => {
      const qty = Number(d.quantity);
      if (!Number.isInteger(qty) || qty <= 0) throw new Error('La cantidad debe ser un número entero mayor que cero.');
      const p = inventoryService.getProductById(d.productId);
      const existing = state.cart.find((c) => c.productId === d.productId);
      const next = (existing ? existing.quantity : 0) + qty;
      if (p && next > p.stock) throw new Error(`Inventario insuficiente: ${p.name} (disponible ${p.stock}, solicitado ${next}).`);
      if (existing) existing.quantity = next; else state.cart.push({ productId: d.productId, quantity: qty });
      render();
    },
    'cash-movement': (f, d) => { cashSalesService.registerCashMovement(d.type, d.description, toInt(d.amount)); toast('Operación de caja registrada.', 'success'); render(); },
    'confirm-closing': (f, d) => {
      const diff = cashSalesService.confirmCashClosing(toInt(d.counted), d.observation);
      toast(diff === 0 ? 'Caja cerrada. Sin diferencia.' : `Caja cerrada. Diferencia: ${formatCOP(diff)}.`, 'success');
      navigate('historial');
    },
    'filter-sales': (f, d) => { state.filters.sales = { from: d.from, to: d.to, number: d.number, product: d.product }; render(); },
    // Inventario
    'filter-inventory': (f, d) => { state.filters.inventory = { search: d.search, category: d.category }; render(); },
    'create-product': (f, d) => {
      inventoryService.createProduct({ code: d.code, name: d.name, description: d.description, category: d.category, salePrice: toInt(d.salePrice), stock: toInt(d.stock || '0'), minStock: toInt(d.minStock || '0') });
      toast('Producto guardado.', 'success'); render();
    },
    'update-product': (f, d) => {
      inventoryService.updateProduct(f.dataset.id, { code: d.code, name: d.name, description: d.description, category: d.category, salePrice: toInt(d.salePrice), minStock: toInt(d.minStock || '0'), active: d.active === 'on' });
      closeModal(); toast('Producto actualizado.', 'success'); render();
    },
    movement: (f, d) => {
      inventoryService.registerMovement({ productId: d.productId, type: d.type, quantity: toInt(d.quantity), reason: d.reason, supplierId: d.supplierId || null });
      toast('Movimiento registrado.', 'success'); render();
    },
    'create-supplier': (f, d) => { inventoryService.createSupplier(d); toast('Proveedor guardado.', 'success'); render(); },
    'filter-suppliers': (f, d) => { state.filters.suppliers = { search: d.search }; render(); },
    // Contabilidad
    'create-expense': (f, d) => { accountingService.createExpense({ ...d, amount: toInt(d.amount) }); toast('Gasto guardado.', 'success'); render(); },
    'update-expense': (f, d) => { accountingService.updateExpense(f.dataset.id, { ...d, amount: toInt(d.amount) }); closeModal(); toast('Gasto actualizado.', 'success'); render(); },
    'filter-expenses': (f, d) => { state.filters.expenses = { search: d.search, category: d.category, from: d.from, to: d.to }; render(); },
    'create-payment': (f, d) => { accountingService.createStaffPayment({ ...d, amount: toInt(d.amount) }); toast('Pago registrado.', 'success'); render(); },
    'filter-payments': (f, d) => { state.filters.payments = { workerId: d.workerId, from: d.from, to: d.to }; render(); },
    'filter-accounting': (f, d) => { state.filters.accounting = { from: d.from, to: d.to, type: d.type }; render(); },
    void: (f, d) => {
      const kind = f.dataset.kind; const id = f.dataset.id;
      if (kind === 'sale') cashSalesService.voidSale(id, d.reason);
      else if (kind === 'expense') accountingService.voidExpense(id, d.reason);
      else if (kind === 'payment') accountingService.voidStaffPayment(id, d.reason);
      else if (kind === 'contract') hrService.voidContract(id, d.reason);
      closeModal(); toast('Anulado correctamente.', 'success'); render();
    },
    // Personal
    'filter-workers': (f, d) => { state.filters.workers = { search: d.search }; render(); },
    'create-resume': (f, d) => { hrService.createResume({ ...d, dataAuthorization: d.dataAuthorization === 'on' }); toast('Hoja de vida registrada.', 'success'); render(); },
    'create-worker': (f, d) => { hrService.createWorker(d); toast('Trabajador registrado.', 'success'); render(); },
    'create-contract': (f, d) => { hrService.createContract({ ...d, salary: toInt(d.salary) }); toast('Contrato registrado.', 'success'); render(); },
    'update-worker': (f, d) => { hrService.updateWorker(f.dataset.id, d); toast('Datos actualizados.', 'success'); render(); },
    'add-education': (f, d) => { hrService.addEducation(f.dataset.id, d); toast('Estudio agregado.', 'success'); render(); },
    'add-experience': (f, d) => { hrService.addExperience(f.dataset.id, d); toast('Experiencia agregada.', 'success'); render(); },
    // Asistencia, reportes y usuarios
    'filter-attendance': (f, d) => { state.filters.attendance = { date: d.date, workerId: d.workerId || '' }; render(); },
    'save-schedule': (f, d) => {
      const days = {};
      DAY_NAMES.forEach((x) => { days[x.key] = { startTime: d[`start-${x.key}`], endTime: d[`end-${x.key}`] }; });
      attendanceService.saveSchedule(f.dataset.id, days);
      toast('Horario guardado.', 'success'); render();
    },
    report: (f, d, submitter) => {
      state.report = { type: d.type, from: d.from, to: d.to, data: null };
      state.report.data = reportService.build(d.type, d.from, d.to);
      render();
      if (submitter && submitter.value === 'pdf') exportReportToPDF(state.report.data);
    },
    'filter-users': (f, d) => { state.filters.users = { search: d.search }; render(); },
    'create-user': async (f, d) => { await authService.createUser(d); toast('Usuario creado.', 'success'); render(); },
    'save-permissions': (f, d) => {
      const perms = ALL_PERMISSIONS_META.filter((p) => d[p.key] === 'on').map((p) => p.key);
      authService.updateRolePermissions(f.dataset.role, perms);
      toast('Permisos guardados.', 'success'); render();
    }
  };

  function bindEvents() {
    document.addEventListener('click', (ev) => {
      const el = ev.target.closest('[data-action]');
      if (!el) return;
      const fn = actions[el.dataset.action];
      if (fn) safe(() => fn(el, ev));
    });
    document.addEventListener('submit', (ev) => {
      const form = ev.target.closest('form[data-form]');
      if (!form) return;
      ev.preventDefault();
      const fn = forms[form.dataset.form];
      if (fn) safe(() => fn(form, getFormData(form), ev.submitter));
    });
    document.addEventListener('change', (ev) => {
      if (ev.target.id === 'paymentMethod') { state.payMethod = ev.target.value; state.received = ''; render(); }
      else if (ev.target.id === 'schedule-worker') { state.scheduleWorkerId = ev.target.value; render(); }
    });
    document.addEventListener('input', (ev) => {
      if (ev.target.id === 'receivedAmount') state.received = ev.target.value;
      else if (ev.target.id === 'counted') {
        const form = ev.target.closest('#closing-form');
        const out = document.getElementById('diff-out');
        const v = toInt(ev.target.value);
        if (form && out) {
          const diff = v - Number(form.dataset.expected);
          out.textContent = Number.isNaN(v) ? '—' : `${diff > 0 ? '+' : ''}${formatCOP(diff)}`;
        }
      }
    });
    document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeModal(); });
    window.addEventListener('hashchange', () => { closeModal(); render(); window.scrollTo(0, 0); });
  }

  // ==========================================================================
  // Arranque: si algo falla se muestra el motivo (nunca se queda en «Cargando…»)
  // ==========================================================================
  async function init() {
    const app = document.getElementById('app');
    if (!app) return;
    try {
      await ensureSeeded();
      bindEvents();
      render();
    } catch (err) {
      console.error(err);
      app.innerHTML = `<div class="auth-wrapper"><div class="auth-card"><h1 class="auth-brand">SWIACLI</h1><div class="alert alert-danger" role="alert">
        <strong>No se pudo iniciar la aplicación.</strong><br>${esc(err && err.message ? err.message : err)}</div>
        <p class="auth-note">Revise que el navegador permita guardar datos del sitio (no use ventana privada restringida) y recargue la página.</p>
        <button class="btn btn-primary" onclick="localStorage.clear();location.reload()">Borrar datos locales y reintentar</button></div></div>`;
    }
  }

  // API pública para las pruebas automáticas (pruebas.html)
  globalThis.SWIACLI = {
    repo, authService, inventoryService, cashSalesService, accountingService, hrService, attendanceService, reportService,
    ensureSeeded, resetToSeed, formatCOP, sha256Fallback, getLocalDateString, addDays
  };

  init();
})();