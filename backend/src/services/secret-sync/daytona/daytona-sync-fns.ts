/* eslint-disable no-await-in-loop */
import { request } from "@app/lib/config/request";
import { DAYTONA_API_BASE_URL, getDaytonaAuthHeaders } from "@app/services/app-connection/daytona";
import { matchesSchema } from "@app/services/secret-sync/secret-sync-fns";
import { TSecretMap } from "@app/services/secret-sync/secret-sync-types";

import { SecretSyncError } from "../secret-sync-errors";
import { SECRET_SYNC_NAME_MAP } from "../secret-sync-maps";
import { TDaytonaSecret, TDaytonaSyncWithCredentials } from "./daytona-sync-types";

const listDaytonaSecrets = async (apiKey: string): Promise<TDaytonaSecret[]> => {
  const { data } = await request.get<TDaytonaSecret[]>(`${DAYTONA_API_BASE_URL}/secret`, {
    headers: getDaytonaAuthHeaders(apiKey)
  });

  return data;
};

const createDaytonaSecret = async (apiKey: string, name: string, value: string) => {
  await request.post(
    `${DAYTONA_API_BASE_URL}/secret`,
    { name, value },
    {
      headers: getDaytonaAuthHeaders(apiKey)
    }
  );
};

const updateDaytonaSecret = async (apiKey: string, secretId: string, value: string) => {
  await request.patch(
    `${DAYTONA_API_BASE_URL}/secret/${encodeURIComponent(secretId)}`,
    { value },
    {
      headers: getDaytonaAuthHeaders(apiKey)
    }
  );
};

const deleteDaytonaSecret = async (apiKey: string, secretId: string) => {
  await request.delete(`${DAYTONA_API_BASE_URL}/secret/${encodeURIComponent(secretId)}`, {
    headers: getDaytonaAuthHeaders(apiKey)
  });
};

export const DaytonaSyncFns = {
  syncSecrets: async (secretSync: TDaytonaSyncWithCredentials, secretMap: TSecretMap) => {
    const {
      connection: {
        credentials: { apiKey }
      }
    } = secretSync;

    const currentSecrets = await listDaytonaSecrets(apiKey);
    const secretIdByName = new Map(currentSecrets.map((secret) => [secret.name, secret.id]));

    for (const name of Object.keys(secretMap)) {
      try {
        const existingId = secretIdByName.get(name);
        if (existingId) {
          await updateDaytonaSecret(apiKey, existingId, secretMap[name].value);
        } else {
          await createDaytonaSecret(apiKey, name, secretMap[name].value);
        }
      } catch (error) {
        throw new SecretSyncError({
          error,
          secretKey: name
        });
      }
    }

    if (secretSync.syncOptions.disableSecretDeletion) {
      return;
    }

    for (const secret of currentSecrets) {
      try {
        const shouldDelete =
          matchesSchema(secret.name, secretSync.environment?.slug || "", secretSync.syncOptions.keySchema) &&
          !(secret.name in secretMap);

        if (shouldDelete) {
          await deleteDaytonaSecret(apiKey, secret.id);
        }
      } catch (error) {
        throw new SecretSyncError({
          error,
          secretKey: secret.name
        });
      }
    }
  },

  removeSecrets: async (secretSync: TDaytonaSyncWithCredentials, secretMap: TSecretMap) => {
    const {
      connection: {
        credentials: { apiKey }
      }
    } = secretSync;

    const currentSecrets = await listDaytonaSecrets(apiKey);

    for (const secret of currentSecrets) {
      try {
        if (secret.name in secretMap) {
          await deleteDaytonaSecret(apiKey, secret.id);
        }
      } catch (error) {
        throw new SecretSyncError({
          error,
          secretKey: secret.name
        });
      }
    }
  },

  getSecrets: async (secretSync: TDaytonaSyncWithCredentials) => {
    throw new Error(`${SECRET_SYNC_NAME_MAP[secretSync.destination]} does not support importing secrets.`);
  }
};
