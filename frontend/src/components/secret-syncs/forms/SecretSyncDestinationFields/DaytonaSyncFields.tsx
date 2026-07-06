import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { SecretSyncConnectionField } from "@app/components/secret-syncs/forms/SecretSyncConnectionField";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input
} from "@app/components/v3";
import { useDaytonaConnectionListOrganizations } from "@app/hooks/api/appConnections/daytona";
import { SecretSync } from "@app/hooks/api/secretSyncs";

import { TSecretSyncForm } from "../schemas";

export const DaytonaSyncFields = () => {
  const { control, setValue } = useFormContext<
    TSecretSyncForm & { destination: SecretSync.Daytona }
  >();

  const connectionId = useWatch({ name: "connection.id", control });

  const { data: organizations, isPending: isOrganizationsPending } =
    useDaytonaConnectionListOrganizations(connectionId, {
      enabled: Boolean(connectionId)
    });

  const currentOrganizationId = useWatch({ name: "destinationConfig.organizationId", control });

  // Daytona API keys are scoped to a single organization, so we resolve and display it
  // read-only instead of asking the user to pick from a list.
  useEffect(() => {
    if (!organizations?.length) return;

    const organization =
      organizations.find((org) => org.id === currentOrganizationId) ?? organizations[0];

    if (organization.id !== currentOrganizationId) {
      setValue("destinationConfig.organizationId", organization.id, { shouldDirty: true });
    }
    setValue("destinationConfig.organizationName", organization.name, { shouldDirty: true });
  }, [organizations, currentOrganizationId, setValue]);

  return (
    <FieldGroup>
      <SecretSyncConnectionField
        onChange={() => {
          setValue("destinationConfig.organizationId", "");
          setValue("destinationConfig.organizationName", "");
        }}
      />

      <Controller
        name="destinationConfig.organizationName"
        control={control}
        render={({ field: { value }, fieldState: { error } }) => (
          <Field>
            <FieldLabel>Organization</FieldLabel>
            <FieldContent>
              <Input
                readOnly
                disabled={!connectionId}
                value={
                  // eslint-disable-next-line no-nested-ternary
                  !connectionId
                    ? ""
                    : isOrganizationsPending
                      ? "Loading organization..."
                      : (value ?? "")
                }
                placeholder="Organization"
              />
              <FieldDescription>
                Secrets will sync to the organization associated with the selected connection.
              </FieldDescription>
              <FieldError errors={[error]} />
            </FieldContent>
          </Field>
        )}
      />
    </FieldGroup>
  );
};
