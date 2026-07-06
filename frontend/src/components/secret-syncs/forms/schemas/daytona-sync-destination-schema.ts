import { z } from "zod";

import { BaseSecretSyncSchema } from "@app/components/secret-syncs/forms/schemas/base-secret-sync-schema";
import { SecretSync } from "@app/hooks/api/secretSyncs";

export const DaytonaSyncDestinationSchema = BaseSecretSyncSchema().merge(
  z.object({
    destination: z.literal(SecretSync.Daytona),
    destinationConfig: z.object({
      organizationId: z.string().min(1, "Organization required"),
      organizationName: z.string().min(1, "Organization required")
    })
  })
);
