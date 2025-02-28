import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  createBrokerSchema,
  updateBrokerSchema,
  deleteBrokerSchema,
  getBrokerByIdSchema,
  getAllBrokersSchema,
  changeBrokerStatusSchema,
} from "~/schema/broker";

export const brokerRouter = createTRPCRouter({
  // Create a new broker
  create: protectedProcedure
    .input(createBrokerSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.broker.create({
        data: {
          name: input.name,
          nodeType: input.nodeType,
          userId: ctx.session.user.id,
          // Protocol settings
          mqttEnabled: input.mqttEnabled,
          wsEnabled: input.wsEnabled,
          sslEnabled: input.sslEnabled,
          wssEnabled: input.wssEnabled,
          // Auth settings
          authType: input.authType,
          // Built-in auth
          authUsername: input.authUsername,
          authPassword: input.authPassword,
          // Database auth
          dbHost: input.dbHost,
          dbPort: input.dbPort,
          dbName: input.dbName,
          dbUsername: input.dbUsername,
          dbPassword: input.dbPassword,
          // JWT auth
          jwtSecret: input.jwtSecret,
          jwtAlgorithm: input.jwtAlgorithm,
          // Advanced settings
          maxConnections: input.maxConnections,
          keepAlive: input.keepAlive,
          enableAcl: input.enableAcl,
          enableMetrics: input.enableMetrics,
        },
      });
    }),

  // Get all brokers with optional filtering
  getAll: protectedProcedure
    .input(getAllBrokersSchema)
    .query(async ({ ctx, input }) => {
      const where = {
        userId: ctx.session.user.id,
        ...(input?.status ? { status: input.status } : {}),
        ...(input?.search
          ? {
              name: {
                contains: input.search,
                mode: "insensitive" as const,
              },
            }
          : {}),
      };

      return ctx.db.broker.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
    }),

  // Get a broker by ID
  getById: protectedProcedure
    .input(getBrokerByIdSchema)
    .query(async ({ ctx, input }) => {
      const broker = await ctx.db.broker.findUnique({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!broker) {
        throw new Error("Broker not found");
      }

      return broker;
    }),

  // Update an existing broker
  update: protectedProcedure
    .input(updateBrokerSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // First check if the broker exists and belongs to the user
      const existingBroker = await ctx.db.broker.findUnique({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });

      if (!existingBroker) {
        throw new Error(
          "Broker not found or you don't have permission to update it",
        );
      }

      return ctx.db.broker.update({
        where: { id },
        data,
      });
    }),

  // Delete a broker
  delete: protectedProcedure
    .input(deleteBrokerSchema)
    .mutation(async ({ ctx, input }) => {
      // First check if the broker exists and belongs to the user
      const existingBroker = await ctx.db.broker.findUnique({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!existingBroker) {
        throw new Error(
          "Broker not found or you don't have permission to delete it",
        );
      }

      // Check if there are any devices using this broker
      const deviceCount = await ctx.db.device.count({
        where: {
          brokerId: input.id,
        },
      });

      if (deviceCount > 0) {
        throw new Error(
          `Cannot delete broker because it is used by ${deviceCount} device(s)`,
        );
      }

      return ctx.db.broker.delete({
        where: { id: input.id },
      });
    }),

  // Change broker status (start/stop)
  changeStatus: protectedProcedure
    .input(changeBrokerStatusSchema)
    .mutation(async ({ ctx, input }) => {
      // First check if the broker exists and belongs to the user
      const existingBroker = await ctx.db.broker.findUnique({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!existingBroker) {
        throw new Error(
          "Broker not found or you don't have permission to change its status",
        );
      }

      return ctx.db.broker.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),

  // Get broker statistics (count by status)
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const brokers = await ctx.db.broker.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      select: {
        status: true,
      },
    });

    const stats = {
      total: brokers.length,
      running: brokers.filter((b) => b.status === "RUNNING").length,
      stopped: brokers.filter((b) => b.status === "STOPPED").length,
      error: brokers.filter((b) => b.status === "ERROR").length,
    };

    return stats;
  }),
});
