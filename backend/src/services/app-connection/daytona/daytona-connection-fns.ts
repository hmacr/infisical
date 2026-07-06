import { AxiosError } from "axios";

import { request } from "@app/lib/config/request";
import { BadRequestError } from "@app/lib/errors";

import { AppConnection } from "../app-connection-enums";
import { DaytonaConnectionMethod } from "./daytona-connection-enums";
import { TDaytonaConnection, TDaytonaConnectionConfig, TDaytonaOrganization } from "./daytona-connection-types";

export const DAYTONA_API_BASE_URL = "https://app.daytona.io/api";

type TDaytonaListOrganizationsResponse = {
  id: string;
  name: string;
}[];

export const getDaytonaAuthHeaders = (apiKey: string): Record<string, string> => ({
  Authorization: `Bearer ${apiKey}`,
  Accept: "application/json"
});

export const getDaytonaConnectionListItem = () => {
  return {
    name: "Daytona" as const,
    app: AppConnection.Daytona as const,
    methods: Object.values(DaytonaConnectionMethod)
  };
};

export const validateDaytonaConnectionCredentials = async (config: TDaytonaConnectionConfig) => {
  const { credentials } = config;

  try {
    await request.get(`${DAYTONA_API_BASE_URL}/organizations`, {
      headers: getDaytonaAuthHeaders(credentials.apiKey)
    });
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new BadRequestError({
        message: `Failed to validate credentials: ${error.message || "Unknown error"}`
      });
    }

    throw new BadRequestError({
      message: "Unable to validate connection - verify credentials"
    });
  }

  return credentials;
};

export const listDaytonaOrganizations = async (appConnection: TDaytonaConnection): Promise<TDaytonaOrganization[]> => {
  const { credentials } = appConnection;

  const { data } = await request.get<TDaytonaListOrganizationsResponse>(`${DAYTONA_API_BASE_URL}/organizations`, {
    headers: getDaytonaAuthHeaders(credentials.apiKey)
  });

  return data.map((org) => ({
    id: org.id,
    name: org.name
  }));
};
