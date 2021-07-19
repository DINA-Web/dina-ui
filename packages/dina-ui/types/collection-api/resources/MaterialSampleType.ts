import { KitsuResource } from "kitsu";
import { DINAUI_MESSAGES_ENGLISH } from "packages/dina-ui/intl/dina-ui-en";

export interface MaterialSampleTypeAttributes {
  type: "material-sample-type";
  name: string;
  group: string;
  createdBy?: string;
  createdOn?: string;
}

export type MaterialSampleType = KitsuResource & MaterialSampleTypeAttributes;

export type MaterialSampleTypeValues =
  | "Whole Organism"
  | "Partial Organism"
  | "Mixed Specimen"
  | "Molecular Sample"
  | "Geological";

export const MATERIAL_SAMPLE_TYPE_OPTIONS: {
  labelKey: keyof typeof DINAUI_MESSAGES_ENGLISH;
  value: MaterialSampleTypeValues;
}[] = [
  {
    labelKey: "field_materialSampleType_wholeOrganism_label",
    value: "Whole Organism"
  },
  {
    labelKey: "field_materialSampleType_partialOrganism_label",
    value: "Partial Organism"
  },
  {
    labelKey: "field_materialSampleType_mixedSpecimen_label",
    value: "Mixed Specimen"
  },
  {
    labelKey: "field_materialSampleType_molecularSample_label",
    value: "Molecular Sample"
  },
  {
    labelKey: "field_materialSampleType_geological_label",
    value: "Geological"
  }
];
