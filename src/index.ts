import "dotenv/config";
import express from 'express';
import { setupDb } from './db/index.js';
import { router } from './api/routes.js';

const app = express();
app.use(express.json());
app.use(router);

const PORT = Number(process.env.PORT ?? 3000);

await setupDb();
app.listen(PORT, () => {
  console.log(`Lerche running on http://localhost:${PORT}`);
});
