import { ResourceIdentifierObject } from "jsonapi-typescript";
import { InputResource, KitsuResource, KitsuResourceLink } from "kitsu";
import { BLANK_PREPARATION } from "../../../components";
import { ManagedAttributeValues, Person } from "../../objectstore-api";
import { AcquisitionEvent } from "./AcquisitionEvent";
import { CollectingEvent } from "./CollectingEvent";
import { Collection } from "./Collection";
import { MaterialSampleType } from "./MaterialSampleType";
import { Organism } from "./Organism";
import { PreparationType } from "./PreparationType";
import { Project } from "./Project";
import { HierarchyItem, StorageUnit } from "./StorageUnit";

/**
 * All Material Sample form sections in order.
 * This array is the source of truth for the section ID names and their order.
 */
export const MATERIAL_SAMPLE_FORM_SECTIONS = [
  "identifiers-section",
  "material-sample-info-section",
  "collecting-event-section",
  "acquisition-event-section",
  "preparations-section",
  "organisms-section",
  "associations-section",
  "storage-section",
  "scheduled-actions-section",
  "managedAttributes-section",
  "material-sample-attachments-section"
] as const;

export type MaterialSampleFormSectionId =
  typeof MATERIAL_SAMPLE_FORM_SECTIONS[number];

export interface MaterialSampleAttributes {
  type: "material-sample";

  materialSampleName?: string;

  group?: string;
  createdOn?: string;
  createdBy?: string;
  dwcOtherCatalogNumbers?: string[];
  preparationMethod?: string | null;
  preparationDate?: string | null;
  preparationRemarks?: string | null;
  description?: string;
  dwcDegreeOfEstablishment?: string | null;

  managedAttributes?: ManagedAttributeValues;

  hierarchy?: HierarchyItem[];

  barcode?: string;

  materialSampleState?: string;
  materialSampleRemarks?: string;

  organism?: (Organism | null | undefined)[] | null;

  // Client-side only fields for the organism section:
  organismsQuantity?: number;
  organismsIndividualEntry?: boolean;

  publiclyReleasable?: boolean | null;
  notPubliclyReleasableReason?: string;
  materialSampleChildren?: Partial<MaterialSample>[];
  tags?: string[];

  scheduledActions?: ScheduledAction[];
  allowDuplicateName?: boolean;

  hostOrganism?: HostOrganism | null;
  associations?: MaterialSampleAssociation[];

  stateChangedOn?: string;
  stateChangeRemarks?: string;

  useNextSequence?: boolean;
}

export interface HostOrganism {
  name?: string;
  remarks?: string;
}

export interface MaterialSampleAssociation {
  associatedSample?: string;
  associationType?: string;
  remarks?: string;
}

export interface ScheduledAction {
  actionType?: string;
  date?: string;
  actionStatus?: string;
  assignedTo?: KitsuResourceLink;
  remarks?: string;
}

export interface MaterialSampleRelationships {
  collection?: Collection;
  materialSampleType?: MaterialSampleType;
  collectingEvent?: CollectingEvent;
  attachment?: ResourceIdentifierObject[];
  preparationAttachment?: ResourceIdentifierObject[];
  preparationType?: PreparationType;
  preparedBy?: Person;
  parentMaterialSample?: MaterialSample;
  storageUnit?: StorageUnit;
  projects?: Project[];
  acquisitionEvent?: AcquisitionEvent;
}

export function blankMaterialSample(): Partial<InputResource<MaterialSample>> {
  return {
    ...BLANK_PREPARATION,
    associations: [],
    hostOrganism: null,
    organism: []
  };
}

export type MaterialSample = KitsuResource &
  MaterialSampleAttributes &
  MaterialSampleRelationships;
