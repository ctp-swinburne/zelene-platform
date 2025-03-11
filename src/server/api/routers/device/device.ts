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
      include: {
        profile: {
          include: { broker: true },
        },
        broker: true,
      },
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
        include: {
          profile: {
            include: { broker: true },
          },
          broker: true,
        },
      });
    }),

  create: protectedProcedure
    .input(createDeviceSchema)
    .mutation(async ({ ctx, input }) => {
      // If a profile is selected, check if it has a broker
      let profileBrokerId: string | null = null;

      if (input.profileId) {
        const profile = await ctx.db.deviceProfile.findUnique({
          where: { id: input.profileId },
          select: { brokerId: true },
        });
        profileBrokerId = profile?.brokerId ?? null;
      }

      // Use explicitly specified brokerId or inherit from profile
      const brokerId = input.brokerId ?? profileBrokerId;

      return ctx.db.device.create({
        data: {
          name: input.name,
          deviceId: input.deviceId,
          profileId: input.profileId,
          brokerId: brokerId,
          userId: ctx.session.user.id,
        },
        include: {
          profile: {
            include: { broker: true },
          },
          broker: true,
        },
      });
    }),

  update: protectedProcedure
    .input(updateDeviceSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // If profile is changing and new profile has a broker, use that broker
      if (updateData.profileId) {
        const profile = await ctx.db.deviceProfile.findUnique({
          where: { id: updateData.profileId },
          select: { brokerId: true },
        });

        // If profile has a broker and no explicit broker is specified, use profile's broker
        if (profile?.brokerId && !updateData.brokerId) {
          updateData.brokerId = profile.brokerId;
        }
      }

      return ctx.db.device.update({
        where: {
          id,
          userId: ctx.session.user.id,
        },
        data: updateData,
        include: {
          profile: {
            include: { broker: true },
          },
          broker: true,
        },
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
