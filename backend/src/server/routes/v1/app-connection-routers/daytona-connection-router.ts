import { z } from "zod";

import { readLimit } from "@app/server/config/rateLimiter";
import { verifyAuth } from "@app/server/plugins/auth/verify-auth";
import { AppConnection } from "@app/services/app-connection/app-connection-enums";
import {
  CreateDaytonaConnectionSchema,
  SanitizedDaytonaConnectionSchema,
  UpdateDaytonaConnectionSchema
} from "@app/services/app-connection/daytona";
import { AuthMode } from "@app/services/auth/auth-type";

import { registerAppConnectionEndpoints } from "./app-connection-endpoints";

export const registerDaytonaConnectionRouter = async (server: FastifyZodProvider) => {
  registerAppConnectionEndpoints({
    app: AppConnection.Daytona,
    server,
    sanitizedResponseSchema: SanitizedDaytonaConnectionSchema,
    createSchema: CreateDaytonaConnectionSchema,
    updateSchema: UpdateDaytonaConnectionSchema
  });

  // The following endpoints are for internal Infisical App use only and not part of the public API
  server.route({
    method: "GET",
    url: `/:connectionId/organizations`,
    config: {
      rateLimit: readLimit
    },
    schema: {
      operationId: "listDaytonaOrganizations",
      params: z.object({
        connectionId: z.string().uuid()
      }),
      response: {
        200: z.object({
          organizations: z.object({ id: z.string(), name: z.string() }).array()
        })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const { connectionId } = req.params;

      const organizations = await server.services.appConnection.daytona.listOrganizations(connectionId, req.permission);

      return { organizations };
    }
  });
};
