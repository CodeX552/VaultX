import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

const app = createApp();

// Server start hone par port log karte hain taaki runtime visibility ho.
app.listen(env.PORT, () => {
  logger.info(`VaultX backend listening on port ${env.PORT}`);
});
