import { z } from "zod";

import { AppConnections } from "@app/lib/api-docs";
import { AppConnection } from "@app/services/app-connection/app-connection-enums";
import {
  BaseAppConnectionSchema,
  GenericCreateAppConnectionFieldsSchema,
  GenericUpdateAppConnectionFieldsSchema
} from "@app/services/app-connection/app-connection-schemas";

import { APP_CONNECTION_NAME_MAP } from "../app-connection-maps";
import { DaytonaConnectionMethod } from "./daytona-connection-enums";

export const DaytonaConnectionMethodSchema = z
  .nativeEnum(DaytonaConnectionMethod)
  .describe(AppConnections.CREATE(AppConnection.Daytona).method);

export const DaytonaConnectionAccessTokenCredentialsSchema = z.object({
  apiKey: z.string().trim().min(1, "API Key required").max(255).describe(AppConnections.CREDENTIALS.DAYTONA.apiKey)
});

const BaseDaytonaConnectionSchema = BaseAppConnectionSchema.extend({
  app: z.literal(AppConnection.Daytona)
});

export const DaytonaConnectionSchema = BaseDaytonaConnectionSchema.extend({
  method: DaytonaConnectionMethodSchema,
  credentials: DaytonaConnectionAccessTokenCredentialsSchema
});

export const SanitizedDaytonaConnectionSchema = z.discriminatedUnion("method", [
  BaseDaytonaConnectionSchema.extend({
    method: DaytonaConnectionMethodSchema,
    credentials: DaytonaConnectionAccessTokenCredentialsSchema.pick({})
  }).describe(JSON.stringify({ title: `${APP_CONNECTION_NAME_MAP[AppConnection.Daytona]} (API Key)` }))
]);

export const ValidateDaytonaConnectionCredentialsSchema = z.discriminatedUnion("method", [
  z.object({
    method: DaytonaConnectionMethodSchema,
    credentials: DaytonaConnectionAccessTokenCredentialsSchema.describe(
      AppConnections.CREATE(AppConnection.Daytona).credentials
    )
  })
]);

export const CreateDaytonaConnectionSchema = ValidateDaytonaConnectionCredentialsSchema.and(
  GenericCreateAppConnectionFieldsSchema(AppConnection.Daytona)
);

export const UpdateDaytonaConnectionSchema = z
  .object({
    credentials: DaytonaConnectionAccessTokenCredentialsSchema.optional().describe(
      AppConnections.UPDATE(AppConnection.Daytona).credentials
    )
  })
  .and(GenericUpdateAppConnectionFieldsSchema(AppConnection.Daytona));

export const DaytonaConnectionListItemSchema = z
  .object({
    name: z.literal("Daytona"),
    app: z.literal(AppConnection.Daytona),
    methods: z.nativeEnum(DaytonaConnectionMethod).array()
  })
  .describe(JSON.stringify({ title: APP_CONNECTION_NAME_MAP[AppConnection.Daytona] }));
