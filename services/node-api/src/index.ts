import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.PGHOST || 'postgres',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'appdb',
  user: process.env.PGUSER || 'demo',
  password: process.env.PGPASSWORD || 'demo'
});

app.get('/api/health', async (_req, res) => {
  const { rows } = await pool.query('SELECT NOW() as now');
  res.json({ ok: true, db: 'postgres', now: rows[0].now });
});

app.get('/api/products', async (_req, res) => {
  const q = `SELECT id, sku, name, price, is_active AS "isActive",
                    created_at AS "createdAt", updated_at AS "updatedAt"
             FROM products ORDER BY id`;
  const { rows } = await pool.query(q);
  res.json(rows);
});

app.post('/api/products', async (req, res) => {
  const { sku, name, price } = req.body;
  const q = `INSERT INTO products (sku,name,price)
             VALUES ($1,$2,$3) RETURNING id, sku, name, price, is_active AS "isActive",
                                        created_at AS "createdAt", updated_at AS "updatedAt"`;
  const { rows } = await pool.query(q, [sku, name, Number(price)]);
  res.status(201).json(rows[0]);
});

app.put('/api/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { sku, name, price, isActive } = req.body;
  const q = `UPDATE products SET sku=$1, name=$2, price=$3, is_active=$4
             WHERE id=$5
             RETURNING id, sku, name, price, is_active AS "isActive",
                       created_at AS "createdAt", updated_at AS "updatedAt"`;
  const { rows } = await pool.query(q, [sku, name, Number(price), !!isActive, id]);
  if (rows.length === 0) return res.sendStatus(404);
  res.json(rows[0]);
});

app.delete('/api/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { rowCount } = await pool.query('DELETE FROM products WHERE id=$1', [id]);
  return rowCount === 0 ? res.sendStatus(404) : res.sendStatus(204);
});

const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, () => console.log(`node-api listening on ${PORT}`));
