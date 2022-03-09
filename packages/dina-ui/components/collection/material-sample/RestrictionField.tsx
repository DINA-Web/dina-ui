import {
  FieldExtensionSelectField,
  FieldSet,
  TextField,
  ToggleField
} from "common-ui";
import { InputResource } from "kitsu";
import { DinaMessage, useDinaIntl } from "../../..//intl/dina-ui-intl";
import { MaterialSample } from "../../..//types/collection-api";
import Switch from "react-switch";

export const MATERIALSAMPLE_FIELDSET_FIELDS: (keyof MaterialSample)[] = [
  "materialSampleRemarks",
  "materialSampleState",
  "materialSampleType"
];

export const RESTRICTIONS_FIELDS = [
  "phac_animal_rg",
  "phac_human_rg",
  "cfia_ppc",
  "phac_cl",
  "isRestricted",
  "restrictionRemarks"
] as const;

/** Blank values for all Preparation fields. */
export const BLANK_RESTRICTION: Required<
  Pick<InputResource<MaterialSample>, typeof RESTRICTIONS_FIELDS[number]>
> = Object.seal({
  phac_animal_rg: null,
  phac_human_rg: null,
  cfia_ppc: null,
  phac_cl: null,
  isRestricted: false,
  restrictionRemarks: null
});

export function RestrictionField({ id }: { id?: string }) {
  const { formatMessage } = useDinaIntl();
  return (
    <FieldSet id={id} legend={<DinaMessage id="restrictions" />}>
      <div className="row">
        <FieldExtensionSelectField
          readOnlyRender={value => value.value}
          name="phac_animal_rg"
          label={formatMessage("phacAnimalRGLevel")}
          className="col-md-6"
          query={() => ({
            path: "collection-api/extension/phac_animal_rg"
          })}
        />
        <FieldExtensionSelectField
          readOnlyRender={value => value.value}
          name="phac_human_rg"
          label={formatMessage("phacHumanRGLevel")}
          className="col-md-6"
          query={() => ({
            path: "collection-api/extension/phac_human_rg"
          })}
        />
      </div>
      <div className="row">
        <FieldExtensionSelectField
          readOnlyRender={value => value.value}
          name="cfia_ppc"
          label={formatMessage("cfiaPPCLevel")}
          className="col-md-6"
          query={() => ({
            path: "collection-api/extension/cfia_ppc"
          })}
        />
        <FieldExtensionSelectField
          readOnlyRender={value => value.value}
          className="col-md-6"
          label={formatMessage("phacContainmentLevel")}
          name="phac_cl"
          query={() => ({
            path: "collection-api/extension/phac_cl"
          })}
        />
      </div>
      <ToggleField name="isRestricted" label={formatMessage("restricted")} />
      <div>
        <TextField name="restrictionRemarks" multiLines={true} />
      </div>
    </FieldSet>
  );
}
