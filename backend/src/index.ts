import { app } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';

app.listen(env.PORT);

logger.info(
	{
		port: env.PORT,
		appUrl: env.APP_URL,
		frontendUrl: env.FRONTEND_URL,
	},
	'server running',
);

logger.info(`docs available at ${env.APP_URL}/api/docs`);