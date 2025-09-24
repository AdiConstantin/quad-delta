import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  res.json({ ok: true, message: 'Server is running without database' });
});

app.get('/api/audit', async (req, res) => {
  // Mock response for testing
  res.json([
    {
      id: 1,
      tableName: 'products',
      action: 'INSERT',
      rowData: { sku: 'TEST', name: 'Test Product', price: 100 },
      changedAt: new Date().toISOString(),
      changedBy: 'system'
    }
  ]);
});

const PORT = Number(process.env.PORT || 3001);

// Add error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, '127.0.0.1', () => console.log(`test server listening on ${PORT}`));