import { logger } from "@app/lib/logger";
import { OrgServiceActor } from "@app/lib/types";

import { AppConnection } from "../app-connection-enums";
import { listDaytonaOrganizations } from "./daytona-connection-fns";
import { TDaytonaConnection } from "./daytona-connection-types";

type TGetAppConnectionFunc = (
  app: AppConnection,
  connectionId: string,
  actor: OrgServiceActor
) => Promise<TDaytonaConnection>;

export const daytonaConnectionService = (getAppConnection: TGetAppConnectionFunc) => {
  const listOrganizations = async (connectionId: string, actor: OrgServiceActor) => {
    const appConnection = await getAppConnection(AppConnection.Daytona, connectionId, actor);
    try {
      const organizations = await listDaytonaOrganizations(appConnection);
      return organizations;
    } catch (error) {
      logger.error(error, `Failed to list organizations on Daytona for app ${connectionId}`);
      return [];
    }
  };

  return {
    listOrganizations
  };
};
