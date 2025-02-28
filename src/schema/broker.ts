import { z } from "zod";

// Enums matching Prisma
export const BrokerNodeTypeEnum = z.enum(["SINGLE", "CLUSTER"]);
export const BrokerAuthTypeEnum = z.enum([
  "BUILT_IN",
  "MYSQL",
  "POSTGRES",
  "MONGODB",
  "JWT",
]);
export const BrokerStatusEnum = z.enum(["RUNNING", "STOPPED", "ERROR"]);

// Base broker schema with common fields
const baseBrokerSchema = z.object({
  name: z.string().min(1, "Broker name is required"),
  nodeType: BrokerNodeTypeEnum.default("SINGLE"),
  mqttEnabled: z.boolean().default(true),
  wsEnabled: z.boolean().default(true),
  sslEnabled: z.boolean().default(false),
  wssEnabled: z.boolean().default(false),
  maxConnections: z.number().int().positive().default(1000000),
  keepAlive: z.number().int().positive().default(300),
  enableAcl: z.boolean().default(false),
  enableMetrics: z.boolean().default(false),
});

// Create broker schema with auth fields
export const createBrokerSchema = baseBrokerSchema.extend({
  authType: BrokerAuthTypeEnum.default("BUILT_IN"),
  // Built-in auth fields
  authUsername: z.string().min(1, "Username is required").optional(),
  authPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  // Database auth fields
  dbHost: z.string().min(1, "Database host is required").optional(),
  dbPort: z.number().int().positive().optional(),
  dbName: z.string().min(1, "Database name is required").optional(),
  dbUsername: z.string().min(1, "Database username is required").optional(),
  dbPassword: z.string().min(1, "Database password is required").optional(),
  // JWT auth fields
  jwtSecret: z.string().min(1, "JWT secret is required").optional(),
  jwtAlgorithm: z.string().default("HS256").optional(),
});

// Schema for updating an existing broker
export const updateBrokerSchema = z
  .object({
    id: z.string().cuid("Invalid broker ID"),
  })
  .merge(createBrokerSchema.partial());

// Schema for deleting a broker
export const deleteBrokerSchema = z.object({
  id: z.string().cuid("Invalid broker ID"),
});

// Schema for getting a broker by ID
export const getBrokerByIdSchema = z.object({
  id: z.string().cuid("Invalid broker ID"),
});

// Schema for getting all brokers (with optional filtering)
export const getAllBrokersSchema = z
  .object({
    status: BrokerStatusEnum.optional(),
    search: z.string().optional(),
  })
  .optional();

// Schema for changing broker status
export const changeBrokerStatusSchema = z.object({
  id: z.string().cuid("Invalid broker ID"),
  status: BrokerStatusEnum,
});

// Types derived from schemas
export type CreateBrokerInput = z.infer<typeof createBrokerSchema>;
export type UpdateBrokerInput = z.infer<typeof updateBrokerSchema>;
export type DeleteBrokerInput = z.infer<typeof deleteBrokerSchema>;
export type GetBrokerByIdInput = z.infer<typeof getBrokerByIdSchema>;
export type GetAllBrokersInput = z.infer<typeof getAllBrokersSchema>;
export type ChangeBrokerStatusInput = z.infer<typeof changeBrokerStatusSchema>;
