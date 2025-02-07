import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { type PrismaClient } from "@prisma/client";
import { type Adapter, type AdapterUser } from "next-auth/adapters";

import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

/**
 * Type for the user creation data received from NextAuth
 */

function customPrismaAdapter(p: PrismaClient): Adapter {
  const originalAdapter = PrismaAdapter(p);

  return {
    ...originalAdapter,
    createUser: async (user: AdapterUser): Promise<AdapterUser> => {
      return await p.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            email: user.email,
            emailVerified: user.emailVerified,
            name: user.name ?? null,
            image: user.image ?? null,
            deviceProfiles: {
              create: {
                name: "Default Profile",
                description: "Default device profile created automatically",
                isDefault: true,
                transport: "MQTT",
              },
            },
          },
        });

        // Ensure we return an object matching AdapterUser type
        return {
          id: createdUser.id,
          email: createdUser.email!,
          emailVerified: createdUser.emailVerified,
          name: createdUser.name,
          image: createdUser.image,
        };
      });
    },
  };
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 */
export const authConfig = {
  providers: [DiscordProvider, GoogleProvider, GithubProvider],
  adapter: customPrismaAdapter(db),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
} satisfies NextAuthConfig;
