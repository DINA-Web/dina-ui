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
