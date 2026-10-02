/**
 * MobiTPV – API Client
 * ─────────────────────────────────────────────────────────────
 * Detecta automáticamente si hay un backend disponible.
 * Si MOBITPV_API_URL está definida (Railway) usa la API real.
 * Si no, cae a datos mock locales (para GitHub Pages estático).
 *
 * USO en cualquier HTML:
 *   <script src="../js/api.js"></script>   (desde subcarpetas)
 *   <script src="./js/api.js"></script>    (desde raíz)
 *
 * Luego: const data = await API.products.list();
 */

window.MOBITPV_CONFIG = window.MOBITPV_CONFIG || {};

const API = (() => {
  'use strict';

  // ── Detectar URL del backend ──────────────────────────────────
  // Prioridad: 1) config manual  2) mismo origen si responde  3) mock
  const BACKEND_URL = window.MOBITPV_CONFIG.apiUrl || '';

  // ── Token JWT ─────────────────────────────────────────────────
  const getToken  = ()        => sessionStorage.getItem('tpv_token');
  const setToken  = (t)       => sessionStorage.setItem('tpv_token', t);
  const clearToken = ()       => sessionStorage.removeItem('tpv_token');

  // ── Fetch helper ──────────────────────────────────────────────
  async function req(method, path, body) {
    if (!BACKEND_URL) throw new Error('NO_BACKEND');
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BACKEND_URL}${path}`, opts);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw Object.assign(new Error(err.error || 'API Error'), { status: res.status });
    }
    return res.json();
  }

  // ══════════════════════════════════════════════════════════════
  //  MOCK DATA (fallback sin backend)
  // ══════════════════════════════════════════════════════════════
  const MOCK = {
    users: [
      { id:1, name:'Admin Demo', email:'admin@mobitpv.es',
        password:'demo1234', shop_name:'MobiTPV Demo', role:'admin', plan:'pro' }
    ],
    products: [
      { id:1, name:'Samsung Galaxy A54 5G',           sku:'SGA54',    imei:'351234567890001', category:'phone',     buy_price:220, sell_price:329,   stock:5,  min_stock:2 },
      { id:2, name:'iPhone 13 128GB Reacondicionado', sku:'IP13128',  imei:'352345678901002', category:'phone',     buy_price:380, sell_price:549,   stock:3,  min_stock:1 },
      { id:3, name:'Xiaomi Redmi Note 12',            sku:'XRN12',    imei:'353456789012003', category:'phone',     buy_price:110, sell_price:189,   stock:8,  min_stock:2 },
      { id:4, name:'Pantalla Samsung A54',            sku:'PAN-A54',  imei:'—',              category:'spare',     buy_price:35,  sell_price:85,    stock:12, min_stock:3 },
      { id:5, name:'Batería iPhone 13',               sku:'BAT-IP13', imei:'—',              category:'spare',     buy_price:18,  sell_price:49,    stock:7,  min_stock:3 },
      { id:6, name:'Funda Silicona iPhone 14',        sku:'FUN-IP14', imei:'—',              category:'accessory', buy_price:4,   sell_price:14.99, stock:30, min_stock:5 },
      { id:7, name:'Cargador USB-C 20W',              sku:'CAR-20W',  imei:'—',              category:'accessory', buy_price:8,   sell_price:22.99, stock:2,  min_stock:3 },
      { id:8, name:'Protector Cristal S23',           sku:'PCT-S23',  imei:'—',              category:'accessory', buy_price:2,   sell_price:9.99,  stock:0,  min_stock:5 },
    ],
    clients: [
      { id:1, name:'Carlos García', phone:'666111222', email:'carlos@email.com', dni:'12345678A', purchases:8,  sat:2, total:1249 },
      { id:2, name:'María López',   phone:'677222333', email:'maria@email.com',  dni:'23456789B', purchases:5,  sat:1, total:874  },
      { id:3, name:'Pedro Sánchez', phone:'688333444', email:'pedro@email.com',  dni:'34567890C', purchases:12, sat:3, total:2340 },
      { id:4, name:'Ana Torres',    phone:'699444555', email:'ana@email.com',    dni:'45678901D', purchases:3,  sat:1, total:458  },
      { id:5, name:'Luis Martín',   phone:'611555666', email:'luis@email.com',   dni:'56789012E', purchases:7,  sat:0, total:1102 },
    ],
    sales: [
      { id:1, ticket_num:'T-0185', product_name:'iPhone 13 128GB', client_name:'María López',   total:549.00, payment:'card',  created_at: new Date().toISOString() },
      { id:2, ticket_num:'T-0186', product_name:'Cargador 20W ×2', client_name:'Pedro Sánchez', total:45.98,  payment:'card',  created_at: new Date().toISOString() },
      { id:3, ticket_num:'T-0187', product_name:'Funda + Protector',client_name:'Ana Torres',   total:24.98,  payment:'cash',  created_at: new Date().toISOString() },
      { id:4, ticket_num:'T-0188', product_name:'Batería iPhone 13',client_name:'—',            total:49.00,  payment:'cash',  created_at: new Date().toISOString() },
      { id:5, ticket_num:'T-0189', product_name:'Samsung Galaxy A54',client_name:'Carlos García',total:329.00, payment:'card', created_at: new Date().toISOString() },
    ],
    sat: [
      { id:1, sat_num:'SAT-001', client_name:'Carlos García', client_phone:'666111222', device_brand:'Samsung', device_model:'Galaxy S22', imei:'353000111222001', fault:'Pantalla rota',         status:'pending',   budget:120, technician:'Carlos Técnico',     priority:'normal', created_at:'2026-09-28T10:00:00Z' },
      { id:2, sat_num:'SAT-002', client_name:'María López',   client_phone:'677222333', device_brand:'Apple',   device_model:'iPhone 12',  imei:'354000222333002', fault:'No carga batería',       status:'workshop',  budget:80,  technician:'María Reparaciones', priority:'high',   created_at:'2026-09-29T11:00:00Z' },
      { id:3, sat_num:'SAT-003', client_name:'Pedro Sánchez', client_phone:'688333444', device_brand:'Xiaomi',  device_model:'Mi 11',      imei:'355000333444003', fault:'No enciende',            status:'ready',     budget:60,  technician:'Carlos Técnico',     priority:'urgent', created_at:'2026-09-27T09:00:00Z' },
      { id:4, sat_num:'SAT-004', client_name:'Ana Torres',    client_phone:'699444555', device_brand:'Huawei',  device_model:'P40',        imei:'356000444555004', fault:'Micrófono no funciona',  status:'delivered', budget:45,  technician:'María Reparaciones', priority:'normal', created_at:'2026-09-25T14:00:00Z' },
      { id:5, sat_num:'SAT-005', client_name:'Luis Martín',   client_phone:'611555666', device_brand:'OPPO',    device_model:'Find X3',    imei:'357000555666005', fault:'WiFi intermitente',       status:'pending',   budget:70,  technician:'Sin asignar',        priority:'normal', created_at:'2026-09-30T15:00:00Z' },
      { id:6, sat_num:'SAT-006', client_name:'Sara Jiménez',  client_phone:'622666777', device_brand:'Samsung', device_model:'A53',        imei:'358000666777006', fault:'Cámara trasera',          status:'workshop',  budget:95,  technician:'Carlos Técnico',     priority:'high',   created_at:'2026-10-01T08:00:00Z' },
      { id:7, sat_num:'SAT-007', client_name:'Javier Ruiz',   client_phone:'633777888', device_brand:'Apple',   device_model:'iPhone 11',  imei:'359000777888007', fault:'Face ID no funciona',     status:'ready',     budget:110, technician:'María Reparaciones', priority:'normal', created_at:'2026-09-26T16:00:00Z' },
    ],
    // Contadores para el mock
    _counters: { ticket: 189, sat: 7 },
  };

  // Persistir mock en localStorage para que los cambios sobrevivan F5
  function loadMock() {
    try {
      const saved = localStorage.getItem('mobitpv_mock');
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(MOCK, parsed);
      }
    } catch {}
  }
  function saveMock() {
    try { localStorage.setItem('mobitpv_mock', JSON.stringify(MOCK)); } catch {}
  }
  loadMock();

  // ── Mock helpers ─────────────────────────────────────────────
  function nextMockId(collection) {
    const arr = MOCK[collection];
    return arr.length ? Math.max(...arr.map(i => i.id)) + 1 : 1;
  }
  function nextTicketNum() {
    MOCK._counters.ticket++;
    saveMock();
    return `T-${String(MOCK._counters.ticket).padStart(4,'0')}`;
  }
  function nextSATNum() {
    MOCK._counters.sat++;
    saveMock();
    return `SAT-${String(MOCK._counters.sat).padStart(3,'0')}`;
  }

  // ══════════════════════════════════════════════════════════════
  //  AUTH
  // ══════════════════════════════════════════════════════════════
  const auth = {
    async login(email, password) {
      if (BACKEND_URL) {
        const data = await req('POST', '/api/auth/login', { email, password });
        setToken(data.token);
        sessionStorage.setItem('tpv_user', JSON.stringify(data.user));
        return data;
      }
      // Mock
      const user = MOCK.users.find(u =>
        u.email === email.toLowerCase().trim() && u.password === password
      );
      if (!user) throw new Error('Credenciales incorrectas');
      const { password: _, ...safe } = user;
      sessionStorage.setItem('tpv_user', JSON.stringify(safe));
      return { user: safe };
    },

    async register({ shop_name, name, email, password }) {
      if (BACKEND_URL) {
        const data = await req('POST', '/api/auth/register', { shop_name, name, email, password });
        setToken(data.token);
        sessionStorage.setItem('tpv_user', JSON.stringify(data.user));
        return data;
      }
      // Mock
      if (MOCK.users.find(u => u.email === email.toLowerCase())) throw new Error('Email ya registrado');
      const newUser = { id: nextMockId('users'), shop_name, name, email: email.toLowerCase(), password, role:'admin', plan:'trial' };
      MOCK.users.push(newUser);
      saveMock();
      const { password: _, ...safe } = newUser;
      sessionStorage.setItem('tpv_user', JSON.stringify(safe));
      return { user: safe };
    },

    logout() {
      clearToken();
      sessionStorage.clear();
    },

    getUser() {
      try { return JSON.parse(sessionStorage.getItem('tpv_user')); } catch { return null; }
    },

    isLoggedIn() { return !!this.getUser(); },
  };

  // ══════════════════════════════════════════════════════════════
  //  PRODUCTS
  // ══════════════════════════════════════════════════════════════
  const products = {
    async list({ search='', category='' } = {}) {
      if (BACKEND_URL) return req('GET', `/api/products?search=${encodeURIComponent(search)}&category=${category}`);
      let items = [...MOCK.products];
      if (search) { const q=search.toLowerCase(); items=items.filter(p=>p.name.toLowerCase().includes(q)||p.sku.toLowerCase().includes(q)||String(p.imei).includes(q)); }
      if (category && category!=='all') items=items.filter(p=>p.category===category);
      return items;
    },
    async create(data) {
      if (BACKEND_URL) return req('POST', '/api/products', data);
      const p = { id: nextMockId('products'), ...data, created_at: new Date().toISOString() };
      MOCK.products.push(p); saveMock(); return p;
    },
    async update(id, data) {
      if (BACKEND_URL) return req('PUT', `/api/products/${id}`, data);
      const idx = MOCK.products.findIndex(p=>p.id===id);
      if (idx<0) throw new Error('No encontrado');
      MOCK.products[idx] = { ...MOCK.products[idx], ...data }; saveMock(); return MOCK.products[idx];
    },
    async remove(id) {
      if (BACKEND_URL) return req('DELETE', `/api/products/${id}`);
      MOCK.products = MOCK.products.filter(p=>p.id!==id); saveMock(); return { ok:true };
    },
  };

  // ══════════════════════════════════════════════════════════════
  //  SALES
  // ══════════════════════════════════════════════════════════════
  const sales = {
    async list({ date='', limit=50 } = {}) {
      if (BACKEND_URL) return req('GET', `/api/sales?date=${date}&limit=${limit}`);
      let s = [...MOCK.sales].reverse();
      if (date) s = s.filter(x=>x.created_at.startsWith(date));
      return s.slice(0, limit);
    },
    async create({ payment, discount=0, items=[], cash_given=0, client_id, notes='' }) {
      if (BACKEND_URL) return req('POST', '/api/sales', { payment, discount, items, cash_given, client_id, notes });
      // Mock: descuenta stock
      for (const item of items) {
        if (item.product_id) {
          const prod = MOCK.products.find(p=>p.id===item.product_id);
          if (prod) { if (prod.stock < item.qty) throw new Error(`Stock insuficiente: ${prod.name}`); prod.stock -= item.qty; }
        }
      }
      const subtotal  = items.reduce((s,i)=>s+i.unit_price*i.qty, 0);
      const discAmt   = subtotal*(discount/100);
      const afterDisc = subtotal-discAmt;
      const iva       = parseFloat((afterDisc*0.21).toFixed(2));
      const total     = parseFloat((afterDisc+iva).toFixed(2));
      const sale = { id: nextMockId('sales'), ticket_num: nextTicketNum(), payment, subtotal: parseFloat(subtotal.toFixed(2)), discount: parseFloat(discAmt.toFixed(2)), iva, total, cash_given, change_back: parseFloat(Math.max(0,cash_given-total).toFixed(2)), notes, items, created_at: new Date().toISOString() };
      MOCK.sales.push(sale); saveMock(); return sale;
    },
  };

  // ══════════════════════════════════════════════════════════════
  //  SAT
  // ══════════════════════════════════════════════════════════════
  const sat = {
    async list({ status='', search='' } = {}) {
      if (BACKEND_URL) return req('GET', `/api/sat?status=${status}&search=${encodeURIComponent(search)}`);
      let r = [...MOCK.sat].reverse();
      if (status && status!=='all') r=r.filter(x=>x.status===status);
      if (search) { const q=search.toLowerCase(); r=r.filter(x=>x.client_name.toLowerCase().includes(q)||String(x.imei).includes(q)||x.device_model.toLowerCase().includes(q)); }
      return r;
    },
    async create(data) {
      if (BACKEND_URL) return req('POST', '/api/sat', data);
      const record = { id: nextMockId('sat'), sat_num: nextSATNum(), ...data, status: data.status||'pending', priority: data.priority||'normal', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      MOCK.sat.push(record); saveMock(); return record;
    },
    async update(id, data) {
      if (BACKEND_URL) return req('PUT', `/api/sat/${id}`, data);
      const idx = MOCK.sat.findIndex(r=>r.id===id);
      if (idx<0) throw new Error('No encontrado');
      MOCK.sat[idx] = { ...MOCK.sat[idx], ...data, updated_at: new Date().toISOString() }; saveMock(); return MOCK.sat[idx];
    },
    async remove(id) {
      if (BACKEND_URL) return req('DELETE', `/api/sat/${id}`);
      MOCK.sat = MOCK.sat.filter(r=>r.id!==id); saveMock(); return { ok:true };
    },
  };

  // ══════════════════════════════════════════════════════════════
  //  CLIENTS
  // ══════════════════════════════════════════════════════════════
  const clients = {
    async list({ search='' } = {}) {
      if (BACKEND_URL) return req('GET', `/api/clients?search=${encodeURIComponent(search)}`);
      let c = [...MOCK.clients];
      if (search) { const q=search.toLowerCase(); c=c.filter(x=>x.name.toLowerCase().includes(q)||String(x.phone).includes(q)||String(x.email).toLowerCase().includes(q)); }
      return c;
    },
    async create(data) {
      if (BACKEND_URL) return req('POST', '/api/clients', data);
      const client = { id: nextMockId('clients'), ...data, purchases:0, sat:0, total:0, created_at: new Date().toISOString() };
      MOCK.clients.push(client); saveMock(); return client;
    },
    async update(id, data) {
      if (BACKEND_URL) return req('PUT', `/api/clients/${id}`, data);
      const idx = MOCK.clients.findIndex(c=>c.id===id);
      if (idx<0) throw new Error('No encontrado');
      MOCK.clients[idx] = { ...MOCK.clients[idx], ...data }; saveMock(); return MOCK.clients[idx];
    },
  };

  // ══════════════════════════════════════════════════════════════
  //  DASHBOARD METRICS
  // ══════════════════════════════════════════════════════════════
  const dashboard = {
    async metrics() {
      if (BACKEND_URL) return req('GET', '/api/dashboard/metrics');
      const today = new Date().toISOString().split('T')[0];
      const todaySales = MOCK.sales.filter(s=>s.created_at.startsWith(today));
      return {
        sales: {
          today_total: parseFloat(todaySales.reduce((s,v)=>s+v.total,0).toFixed(2)),
          today_count: todaySales.length,
          all_time:    parseFloat(MOCK.sales.reduce((s,v)=>s+v.total,0).toFixed(2)),
        },
        sat: {
          pending:  MOCK.sat.filter(r=>r.status==='pending').length,
          workshop: MOCK.sat.filter(r=>r.status==='workshop').length,
          ready:    MOCK.sat.filter(r=>r.status==='ready').length,
          active:   MOCK.sat.filter(r=>r.status==='pending'||r.status==='workshop').length,
        },
        inventory: {
          total_products: MOCK.products.length,
          low_stock:      MOCK.products.filter(p=>p.stock>0&&p.stock<=p.min_stock).length,
          out_of_stock:   MOCK.products.filter(p=>p.stock===0).length,
        },
        clients: { total: MOCK.clients.length },
      };
    },
  };

  // ── Modo actual ───────────────────────────────────────────────
  const mode = BACKEND_URL ? 'api' : 'mock';
  console.log(`[MobiTPV] Modo: ${mode}${BACKEND_URL ? ' → '+BACKEND_URL : ' (datos locales)'}`);

  return { auth, products, sales, sat, clients, dashboard, mode, getToken, setToken, clearToken };
})();
