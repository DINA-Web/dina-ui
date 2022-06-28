import { KitsuResource } from "kitsu";

export interface StorageUnitTypeAttributes {
  type: "storage-unit-type";
  name: string;
  group: string;
  createdBy?: string;
  createdOn?: string;
  isInseperable?: boolean | null;
  enableGrid?: boolean;
}

export type StorageUnitType = KitsuResource & StorageUnitTypeAttributes;
