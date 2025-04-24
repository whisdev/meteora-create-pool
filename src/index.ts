import app from "./app";
import { env, logger } from "./config";

const PORT = Number(env.port);
const HOST = env.host;

app.listen(PORT, async () => {
  logger.info(`Server is running on http://${HOST}:${PORT}`);
});
