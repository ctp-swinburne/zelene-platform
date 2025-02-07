// ~/server/api/routers/device/deviceProfile.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  createProfileSchema,
  updateProfileSchema,
} from "~/schema/deviceProfile";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";

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
      // Start a transaction to ensure data consistency
      return ctx.db.$transaction(async (tx) => {
        // If trying to create a default profile, ensure there's only one
        if (input.isDefault) {
          const defaultProfileCount = await tx.deviceProfile.count({
            where: {
              userId: ctx.session.user.id,
              isDefault: true,
            },
          });

          if (defaultProfileCount > 0) {
            // Update all existing default profiles to non-default
            await tx.deviceProfile.updateMany({
              where: {
                userId: ctx.session.user.id,
                isDefault: true,
              },
              data: {
                isDefault: false,
              },
            });
          }
        }

        // Create the new profile
        return tx.deviceProfile.create({
          data: {
            name: input.name,
            description: input.description,
            transport: input.transport,
            isDefault: input.isDefault,
            userId: ctx.session.user.id,
          },
        });
      });
    }),

  update: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Start a transaction to ensure data consistency
      return ctx.db.$transaction(async (tx) => {
        // If setting as default, handle existing default profiles
        if (updateData.isDefault) {
          await tx.deviceProfile.updateMany({
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

        // Update the profile
        return tx.deviceProfile.update({
          where: {
            id,
            userId: ctx.session.user.id,
          },
          data: updateData,
        });
      });
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        const profile = await tx.deviceProfile.findFirst({
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

        if (!profile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Profile not found",
          });
        }

        if (profile._count.devices > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot delete profile with associated devices",
          });
        }

        // If deleting a default profile, try to set another profile as default
        if (profile.isDefault) {
          const anotherProfile = await tx.deviceProfile.findFirst({
            where: {
              userId: ctx.session.user.id,
              id: { not: input },
            },
            orderBy: { createdAt: "desc" },
          });

          if (anotherProfile) {
            await tx.deviceProfile.update({
              where: { id: anotherProfile.id },
              data: { isDefault: true },
            });
          }
        }

        return tx.deviceProfile.delete({
          where: {
            id: input,
            userId: ctx.session.user.id,
          },
        });
      });
    }),
});
