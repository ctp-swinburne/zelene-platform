// ~/server/api/routers/device/deviceProfile.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  createProfileSchema,
  updateProfileSchema,
} from "~/schema/deviceProfile";

export const deviceProfileRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.deviceProfile.findMany({
      where: { userId: ctx.session.user.id },
      include: { devices: true },
    });
  }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.db.deviceProfile.findFirst({
        where: {
          id: input,
          userId: ctx.session.user.id,
        },
        include: { devices: true },
      });
    }),

  create: protectedProcedure
    .input(createProfileSchema)
    .mutation(async ({ ctx, input }) => {
      // If this profile is set as default, remove default from other profiles
      if (input.isDefault) {
        await ctx.db.deviceProfile.updateMany({
          where: {
            userId: ctx.session.user.id,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      return ctx.db.deviceProfile.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // If this profile is being set as default, remove default from other profiles
      if (updateData.isDefault) {
        await ctx.db.deviceProfile.updateMany({
          where: {
            userId: ctx.session.user.id,
            isDefault: true,
            id: { not: id },
          },
          data: {
            isDefault: false,
          },
        });
      }

      return ctx.db.deviceProfile.update({
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
      // Check if profile has any devices
      const profile = await ctx.db.deviceProfile.findFirst({
        where: {
          id: input,
          userId: ctx.session.user.id,
        },
        include: {
          _count: {
            select: { devices: true },
          },
        },
      });

      if (profile?._count.devices ?? 0 > 0) {
        throw new Error("Cannot delete profile with associated devices");
      }

      return ctx.db.deviceProfile.delete({
        where: {
          id: input,
          userId: ctx.session.user.id,
        },
      });
    }),
});
