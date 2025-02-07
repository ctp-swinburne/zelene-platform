// ~/server/api/routers/device/device.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  createDeviceSchema,
  updateDeviceSchema,
  updateDeviceStatusSchema,
} from "~/schema/device";

export const deviceRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.device.findMany({
      where: { userId: ctx.session.user.id },
      include: { profile: true },
    });
  }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.db.device.findFirst({
        where: {
          id: input,
          userId: ctx.session.user.id,
        },
        include: { profile: true },
      });
    }),

  create: protectedProcedure
    .input(createDeviceSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.device.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(updateDeviceSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return ctx.db.device.update({
        where: {
          id,
          userId: ctx.session.user.id,
        },
        data: updateData,
      });
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.device.delete({
        where: {
          id: input,
          userId: ctx.session.user.id,
        },
      });
    }),

  updateStatus: protectedProcedure
    .input(updateDeviceStatusSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.device.update({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        data: {
          status: input.status,
          lastSeen: input.status === "ONLINE" ? new Date() : undefined,
        },
      });
    }),
});
