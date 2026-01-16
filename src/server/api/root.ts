// src/server/api/root.ts
import { deviceRouter } from "./routers/device/device";
import { brokerRouter } from "./routers/brokers/broker";
import { deviceProfileRouter } from "./routers/device/deviceProfile";
import { mqttTopicRouter } from "./routers/mqtt/mqttTopic";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  device: deviceRouter,
  deviceProfile: deviceProfileRouter,
  broker: brokerRouter,
  mqttTopic: mqttTopicRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
