// src/server/api/routers/mqtt/mqttTopic.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  createMqttTopicSchema,
  updateMqttTopicSchema,
  deleteMqttTopicSchema,
  bulkCreateMqttTopicsSchema,
} from "~/schema/mqttTopic";
import { TRPCError } from "@trpc/server";

export const mqttTopicRouter = createTRPCRouter({
  // Get all topics for a specific device profile
  getAllByProfileId: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      // First check if the profile belongs to the user
      const profile = await ctx.db.deviceProfile.findFirst({
        where: {
          id: input,
          userId: ctx.session.user.id,
        },
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Device profile not found",
        });
      }

      return ctx.db.mqttTopic.findMany({
        where: {
          profileId: input,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    }),

  // Create a new MQTT topic
  create: protectedProcedure
    .input(createMqttTopicSchema)
    .mutation(async ({ ctx, input }) => {
      // First check if the profile belongs to the user
      const profile = await ctx.db.deviceProfile.findFirst({
        where: {
          id: input.profileId,
          userId: ctx.session.user.id,
        },
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Device profile not found",
        });
      }

      return ctx.db.mqttTopic.create({
        data: input,
      });
    }),

  // Bulk create MQTT topics (for initial profile creation)
  bulkCreate: protectedProcedure
    .input(bulkCreateMqttTopicsSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.length === 0) return [];
      if (!input[0]) return [];
      // Check if all topics belong to the same profile and if that profile belongs to the user
      const profileId = input[0].profileId;

      const profile = await ctx.db.deviceProfile.findFirst({
        where: {
          id: profileId,
          userId: ctx.session.user.id,
        },
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Device profile not found",
        });
      }

      // Create all topics in a transaction
      return ctx.db.$transaction(
        input.map((topic) =>
          ctx.db.mqttTopic.create({
            data: topic,
          }),
        ),
      );
    }),

  // Update an existing MQTT topic
  update: protectedProcedure
    .input(updateMqttTopicSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // First check if the topic exists and if its profile belongs to the user
      const topic = await ctx.db.mqttTopic.findUnique({
        where: { id },
        include: {
          profile: true,
        },
      });

      if (!topic) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "MQTT topic not found",
        });
      }

      if (topic.profile.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this topic",
        });
      }

      return ctx.db.mqttTopic.update({
        where: { id },
        data: updateData,
      });
    }),

  // Delete an MQTT topic
  delete: protectedProcedure
    .input(deleteMqttTopicSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      // First check if the topic exists and if its profile belongs to the user
      const topic = await ctx.db.mqttTopic.findUnique({
        where: { id },
        include: {
          profile: true,
        },
      });

      if (!topic) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "MQTT topic not found",
        });
      }

      if (topic.profile.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this topic",
        });
      }

      return ctx.db.mqttTopic.delete({
        where: { id },
      });
    }),
});
