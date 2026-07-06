import z from "zod";

import { DiscriminativePick } from "@app/lib/types";

import { AppConnection } from "../app-connection-enums";
import {
  CreateDaytonaConnectionSchema,
  DaytonaConnectionSchema,
  ValidateDaytonaConnectionCredentialsSchema
} from "./daytona-connection-schemas";

export type TDaytonaConnection = z.infer<typeof DaytonaConnectionSchema>;

export type TDaytonaConnectionInput = z.infer<typeof CreateDaytonaConnectionSchema> & {
  app: AppConnection.Daytona;
};

export type TValidateDaytonaConnectionCredentialsSchema = typeof ValidateDaytonaConnectionCredentialsSchema;

export type TDaytonaConnectionConfig = DiscriminativePick<TDaytonaConnection, "method" | "app" | "credentials"> & {
  orgId: string;
};

export type TDaytonaOrganization = {
  id: string;
  name: string;
};
