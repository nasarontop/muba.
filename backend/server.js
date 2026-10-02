/**
 * MobiTPV – Backend API
 * Node.js + Express + LowDB v1 (JSON file, sin compilación nativa)
 *
 * POST /api/auth/login            – Iniciar sesión
 * POST /api/auth/register         – Crear cuenta
 * GET  /api/auth/me               – Info del usuario autenticado
 * GET  /api/products              – Listar productos (search, category)
 * POST /api/products              – Crear producto
 * PUT  /api/products/:id          – Actualizar producto
 * DELETE /api/products/:id        – Eliminar producto
 * GET  /api/sales                 – Listar ventas (date, limit)
 * POST /api/sales                 – Crear venta (descuenta stock)
 * GET  /api/sat                   – Listar fichas SAT (status, search)
 * POST /api/sat                   – Crear ficha SAT
 * PUT  /api/sat/:id               – Actualizar estado/campos SAT
 * GET  /api/clients               – Listar clientes
 * POST /api/clients               – Crear cliente
 * GET  /api/dashboard/metrics     – Métricas del día
 * GET  /api/health                – Estado del servidor
 */

'use strict';

const express  = require('express');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const path     = require('path');
const fs       = require('fs');
const low      = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// ─── Config ───────────────────────────────────────────────────────────────────
const PORT       = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'mobitpv_jwt_secret_2026_change_in_prod';
const DB_FILE    = path.join(__dirname, 'db.json');

// ─── LowDB setup ─────────────────────────────────────────────────────────────
const adapter = new FileSync(DB_FILE);
const db      = low(adapter);

db.defaults({
  users:    [],
  products: [],
  clients:  [],
  sales:    [],
  sat:      [],
  counters: { ticket: 0, sat: 0 }
}).write();

// ─── Seed demo data once ─────────────────────────────────────────────────────
if (db.get('users').size().value() === 0) {
  db.get('users').push({
    id: 1, shop_name: 'MobiTPV Demo Store', name: 'Admin Demo',
    email: 'admin@mobitpv.es', password: bcrypt.hashSync('demo1234', 10),
    role: 'admin', plan: 'pro', created_at: new Date().toISOString()
  }).write();

  const products = [
    { id:1, name:'Samsung Galaxy A54 5G',          sku:'SGA54',    imei:'351234567890001', category:'phone',     buy_price:220, sell_price:329,   stock:5,  min_stock:2 },
    { id:2, name:'iPhone 13 128GB Reacondicionado', sku:'IP13128',  imei:'352345678901002', category:'phone',     buy_price:380, sell_price:549,   stock:3,  min_stock:1 },
    { id:3, name:'Xiaomi Redmi Note 12',            sku:'XRN12',    imei:'353456789012003', category:'phone',     buy_price:110, sell_price:189,   stock:8,  min_stock:2 },
    { id:4, name:'Pantalla Samsung A54',            sku:'PAN-A54',  imei:'—',              category:'spare',     buy_price:35,  sell_price:85,    stock:12, min_stock:3 },
    { id:5, name:'Batería iPhone 13',               sku:'BAT-IP13', imei:'—',              category:'spare',     buy_price:18,  sell_price:49,    stock:7,  min_stock:3 },
    { id:6, name:'Funda Silicona iPhone 14',        sku:'FUN-IP14', imei:'—',              category:'accessory', buy_price:4,   sell_price:14.99, stock:30, min_stock:5 },
    { id:7, name:'Cargador USB-C 20W',              sku:'CAR-20W',  imei:'—',              category:'accessory', buy_price:8,   sell_price:22.99, stock:2,  min_stock:3 },
    { id:8, name:'Protector Cristal S23',           sku:'PCT-S23',  imei:'—',              category:'accessory', buy_price:2,   sell_price:9.99,  stock:0,  min_stock:5 },
  ];
  products.forEach(p => db.get('products').push({ ...p, created_at: new Date().toISOString() }).write());

  const clients = [
    { id:1, name:'Carlos García', phone:'666111222', email:'carlos@email.com', dni:'12345678A' },
    { id:2, name:'María López',   phone:'677222333', email:'maria@email.com',  dni:'23456789B' },
    { id:3, name:'Pedro Sánchez', phone:'688333444', email:'pedro@email.com',  dni:'34567890C' },
    { id:4, name:'Ana Torres',    phone:'699444555', email:'ana@email.com',    dni:'45678901D' },
    { id:5, name:'Luis Martín',   phone:'611555666', email:'luis@email.com',   dni:'56789012E' },
  ];
  clients.forEach(c => db.get('clients').push({ ...c, created_at: new Date().toISOString() }).write());

  const satRecords = [
    { id:1, sat_num:'SAT-001', client_name:'Carlos García', client_phone:'666111222', device_brand:'Samsung', device_model:'Galaxy S22', imei:'353000111222001', fault:'Pantalla rota',         status:'pending',   budget:120, technician:'Carlos Técnico',     priority:'normal', created_at:'2026-09-28T10:00:00Z' },
    { id:2, sat_num:'SAT-002', client_name:'María López',   client_phone:'677222333', device_brand:'Apple',   device_model:'iPhone 12',  imei:'354000222333002', fault:'No carga batería',       status:'workshop',  budget:80,  technician:'María Reparaciones', priority:'high',   created_at:'2026-09-29T11:00:00Z' },
    { id:3, sat_num:'SAT-003', client_name:'Pedro Sánchez', client_phone:'688333444', device_brand:'Xiaomi',  device_model:'Mi 11',      imei:'355000333444003', fault:'No enciende',            status:'ready',     budget:60,  technician:'Carlos Técnico',     priority:'urgent', created_at:'2026-09-27T09:00:00Z' },
    { id:4, sat_num:'SAT-004', client_name:'Ana Torres',    client_phone:'699444555', device_brand:'Huawei',  device_model:'P40',        imei:'356000444555004', fault:'Micrófono no funciona', status:'delivered', budget:45,  technician:'María Reparaciones', priority:'normal', created_at:'2026-09-25T14:00:00Z' },
    { id:5, sat_num:'SAT-005', client_name:'Luis Martín',   client_phone:'611555666', device_brand:'OPPO',    device_model:'Find X3',    imei:'357000555666005', fault:'WiFi intermitente',      status:'pending',   budget:70,  technician:'Sin asignar',        priority:'normal', created_at:'2026-09-30T15:00:00Z' },
  ];
  satRecords.forEach(r => db.get('sat').push(r).write());
  db.set('counters.sat', 5).write();

  console.log('✅ Demo data seeded in db.json');
}

// ─── Express setup ────────────────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, '..')));

// ─── Helpers ─────────────────────────────────────────────────────────────────
function nextId(collection) {
  const items = db.get(collection).value();
  return items.length ? Math.max(...items.map(i => i.id)) + 1 : 1;
}

function nextTicket() {
  const n = db.get('counters.ticket').value() + 1;
  db.set('counters.ticket', n).write();
  return `T-${String(n).padStart(4,'0')}`;
}

function nextSAT() {
  const n = db.get('counters.sat').value() + 1;
  db.set('counters.sat', n).write();
  return `SAT-${String(n).padStart(3,'0')}`;
}

// ─── JWT Middleware ───────────────────────────────────────────────────────────
function auth(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: 'Token requerido' });
  try { req.user = jwt.verify(h.slice(7), JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Token inválido' }); }
}

// ══════════════════════════════════════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════════════════════════════════════
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });

  const user = db.get('users').find({ email: email.toLowerCase().trim() }).value();
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Credenciales incorrectas' });

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, shop: user.shop_name, role: user.role },
    JWT_SECRET, { expiresIn: '8h' }
  );
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, shop: user.shop_name, role: user.role, plan: user.plan } });
});

app.post('/api/auth/register', (req, res) => {
  const { shop_name, name, email, password } = req.body || {};
  if (!shop_name || !name || !email || !password)
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  if (password.length < 8)
    return res.status(400).json({ error: 'Contraseña mínimo 8 caracteres' });

  const emailLow = email.toLowerCase().trim();
  if (db.get('users').find({ email: emailLow }).value())
    return res.status(409).json({ error: 'Email ya registrado' });

  const id   = nextId('users');
  const user = { id, shop_name, name, email: emailLow, password: bcrypt.hashSync(password, 10), role: 'admin', plan: 'trial', created_at: new Date().toISOString() };
  db.get('users').push(user).write();

  const token = jwt.sign({ id, email: emailLow, name, shop: shop_name, role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
  res.status(201).json({ token, user: { id, name, email: emailLow, shop: shop_name, role: 'admin', plan: 'trial' } });
});

app.get('/api/auth/me', auth, (req, res) => {
  const u = db.get('users').find({ id: req.user.id }).value();
  if (!u) return res.status(404).json({ error: 'Usuario no encontrado' });
  const { password: _, ...safe } = u;
  res.json(safe);
});

// ══════════════════════════════════════════════════════════════════════════════
//  PRODUCTS
// ══════════════════════════════════════════════════════════════════════════════
app.get('/api/products', auth, (req, res) => {
  const { search = '', category = '' } = req.query;
  let items = db.get('products').value();

  if (search.trim()) {
    const q = search.toLowerCase();
    items = items.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)  ||
      String(p.imei).includes(q)
    );
  }
  if (category && category !== 'all') items = items.filter(p => p.category === category);
  res.json(items);
});

app.post('/api/products', auth, (req, res) => {
  const { name, sku, imei = '—', category, buy_price = 0, sell_price, stock = 0, min_stock = 2, description = '' } = req.body || {};
  if (!name || !sku || !category || sell_price === undefined)
    return res.status(400).json({ error: 'Faltan: name, sku, category, sell_price' });
  if (db.get('products').find({ sku }).value())
    return res.status(409).json({ error: 'SKU ya existe' });

  const product = { id: nextId('products'), name, sku, imei, category, buy_price, sell_price, stock, min_stock, description, created_at: new Date().toISOString() };
  db.get('products').push(product).write();
  res.status(201).json(product);
});

app.put('/api/products/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const p  = db.get('products').find({ id }).value();
  if (!p) return res.status(404).json({ error: 'Producto no encontrado' });

  const allowed = ['name','sku','imei','category','buy_price','sell_price','stock','min_stock','description'];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  db.get('products').find({ id }).assign(updates).write();
  res.json(db.get('products').find({ id }).value());
});

app.delete('/api/products/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  if (!db.get('products').find({ id }).value()) return res.status(404).json({ error: 'No encontrado' });
  db.get('products').remove({ id }).write();
  res.json({ ok: true });
});

// ══════════════════════════════════════════════════════════════════════════════
//  SALES
// ══════════════════════════════════════════════════════════════════════════════
app.get('/api/sales', auth, (req, res) => {
  const { date = '', limit = 50 } = req.query;
  let sales = db.get('sales').value().slice().reverse();

  if (date) sales = sales.filter(s => s.created_at.startsWith(date));
  res.json(sales.slice(0, Number(limit)));
});

app.post('/api/sales', auth, (req, res) => {
  const { client_id, payment, discount = 0, items = [], cash_given = 0, notes = '' } = req.body || {};
  if (!payment || !items.length)
    return res.status(400).json({ error: 'Se requieren payment e items' });

  // Check stock
  for (const item of items) {
    if (item.product_id) {
      const prod = db.get('products').find({ id: item.product_id }).value();
      if (prod && prod.stock < item.qty)
        return res.status(400).json({ error: `Stock insuficiente para: ${prod.name}` });
    }
  }

  const subtotal  = items.reduce((s, i) => s + i.unit_price * i.qty, 0);
  const discAmt   = subtotal * (discount / 100);
  const afterDisc = subtotal - discAmt;
  const iva       = parseFloat((afterDisc * 0.21).toFixed(2));
  const total     = parseFloat((afterDisc + iva).toFixed(2));
  const change    = parseFloat(Math.max(0, cash_given - total).toFixed(2));

  const sale = {
    id: nextId('sales'), ticket_num: nextTicket(),
    client_id: client_id || null, payment,
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount: parseFloat(discAmt.toFixed(2)),
    iva, total, cash_given, change_back: change,
    notes, items,
    created_at: new Date().toISOString()
  };

  // Deduct stock
  items.forEach(item => {
    if (item.product_id) {
      const prod = db.get('products').find({ id: item.product_id }).value();
      if (prod) db.get('products').find({ id: item.product_id }).assign({ stock: prod.stock - item.qty }).write();
    }
  });

  db.get('sales').push(sale).write();
  res.status(201).json(sale);
});

app.get('/api/sales/:id', auth, (req, res) => {
  const sale = db.get('sales').find({ id: parseInt(req.params.id) }).value();
  if (!sale) return res.status(404).json({ error: 'Venta no encontrada' });
  res.json(sale);
});

// ══════════════════════════════════════════════════════════════════════════════
//  SAT
// ══════════════════════════════════════════════════════════════════════════════
app.get('/api/sat', auth, (req, res) => {
  const { status = '', search = '' } = req.query;
  let records = db.get('sat').value().slice().reverse();

  if (status && status !== 'all') records = records.filter(r => r.status === status);
  if (search.trim()) {
    const q = search.toLowerCase();
    records = records.filter(r =>
      r.client_name.toLowerCase().includes(q) ||
      String(r.imei).includes(q) ||
      r.device_model.toLowerCase().includes(q)
    );
  }
  res.json(records);
});

app.post('/api/sat', auth, (req, res) => {
  const {
    client_name, client_phone = '', device_brand = '', device_model,
    imei = '', color = '', fault, notes = '', accessories = '',
    budget = 0, technician = 'Sin asignar', status = 'pending',
    priority = 'normal', pattern = '', signature = ''
  } = req.body || {};

  if (!client_name || !device_model || !fault)
    return res.status(400).json({ error: 'Faltan: client_name, device_model, fault' });

  const record = {
    id: nextId('sat'), sat_num: nextSAT(),
    client_name, client_phone, device_brand, device_model,
    imei, color, fault, notes, accessories,
    budget: parseFloat(budget) || 0,
    technician, status, priority, pattern, signature,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.get('sat').push(record).write();
  res.status(201).json(record);
});

app.put('/api/sat/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  if (!db.get('sat').find({ id }).value())
    return res.status(404).json({ error: 'Ficha SAT no encontrada' });

  const allowed = ['status','priority','technician','budget','notes','pattern','signature','fault'];
  const updates = { updated_at: new Date().toISOString() };
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  db.get('sat').find({ id }).assign(updates).write();
  res.json(db.get('sat').find({ id }).value());
});

app.delete('/api/sat/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  if (!db.get('sat').find({ id }).value()) return res.status(404).json({ error: 'No encontrado' });
  db.get('sat').remove({ id }).write();
  res.json({ ok: true });
});

// ══════════════════════════════════════════════════════════════════════════════
//  CLIENTS
// ══════════════════════════════════════════════════════════════════════════════
app.get('/api/clients', auth, (req, res) => {
  const { search = '' } = req.query;
  let clients = db.get('clients').value();

  if (search.trim()) {
    const q = search.toLowerCase();
    clients = clients.filter(c =>
      c.name.toLowerCase().includes(q)  ||
      String(c.phone).includes(q)       ||
      String(c.email).toLowerCase().includes(q) ||
      String(c.dni).includes(q)
    );
  }
  res.json(clients);
});

app.post('/api/clients', auth, (req, res) => {
  const { name, phone = '', email = '', dni = '', address = '', notes = '' } = req.body || {};
  if (!name) return res.status(400).json({ error: 'El nombre es obligatorio' });

  const client = { id: nextId('clients'), name, phone, email, dni, address, notes, created_at: new Date().toISOString() };
  db.get('clients').push(client).write();
  res.status(201).json(client);
});

app.put('/api/clients/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  if (!db.get('clients').find({ id }).value()) return res.status(404).json({ error: 'Cliente no encontrado' });

  const allowed = ['name','phone','email','dni','address','notes'];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  db.get('clients').find({ id }).assign(updates).write();
  res.json(db.get('clients').find({ id }).value());
});

// ══════════════════════════════════════════════════════════════════════════════
//  DASHBOARD METRICS
// ══════════════════════════════════════════════════════════════════════════════
app.get('/api/dashboard/metrics', auth, (req, res) => {
  const today    = new Date().toISOString().split('T')[0];
  const sales    = db.get('sales').value();
  const sat      = db.get('sat').value();
  const products = db.get('products').value();

  const todaySales = sales.filter(s => s.created_at.startsWith(today));
  const todayTotal = todaySales.reduce((s, v) => s + v.total, 0);

  res.json({
    sales: {
      today_total: parseFloat(todayTotal.toFixed(2)),
      today_count: todaySales.length,
      all_time:    parseFloat(sales.reduce((s,v) => s+v.total, 0).toFixed(2))
    },
    sat: {
      pending:  sat.filter(r => r.status === 'pending').length,
      workshop: sat.filter(r => r.status === 'workshop').length,
      ready:    sat.filter(r => r.status === 'ready').length,
      active:   sat.filter(r => r.status === 'pending' || r.status === 'workshop').length,
    },
    inventory: {
      total_products: products.length,
      low_stock:      products.filter(p => p.stock > 0 && p.stock <= p.min_stock).length,
      out_of_stock:   products.filter(p => p.stock === 0).length,
    },
    clients: {
      total: db.get('clients').size().value()
    }
  });
});

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', ts: new Date().toISOString() });
});

// ─── SPA fallback ─────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 MobiTPV corriendo en http://localhost:${PORT}`);
  console.log(`   🏠 Landing    → http://localhost:${PORT}/index.html`);
  console.log(`   🔐 Login      → http://localhost:${PORT}/auth/login.html`);
  console.log(`   📊 Dashboard  → http://localhost:${PORT}/dashboard/index.html`);
  console.log(`   ❤️  API Health → http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
