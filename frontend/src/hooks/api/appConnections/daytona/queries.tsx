import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { apiRequest } from "@app/config/request";
import { appConnectionKeys } from "@app/hooks/api/appConnections";

import { TDaytonaOrganization } from "./types";

const daytonaConnectionKeys = {
  all: [...appConnectionKeys.all, "daytona"] as const,
  listOrganizations: (connectionId: string) =>
    [...daytonaConnectionKeys.all, "organizations", connectionId] as const
};

export const useDaytonaConnectionListOrganizations = (
  connectionId: string,
  options?: Omit<
    UseQueryOptions<
      TDaytonaOrganization[],
      unknown,
      TDaytonaOrganization[],
      ReturnType<typeof daytonaConnectionKeys.listOrganizations>
    >,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: daytonaConnectionKeys.listOrganizations(connectionId),
    queryFn: async () => {
      const { data } = await apiRequest.get<{ organizations: TDaytonaOrganization[] }>(
        `/api/v1/app-connections/daytona/${connectionId}/organizations`
      );

      return data.organizations;
    },
    ...options
  });
};
