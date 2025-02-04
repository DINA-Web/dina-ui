import { ApiClientContext, OperationVerb } from "common-ui";
import { FormikContextType } from "formik";
import { toPairs } from "lodash";
import { useContext, useState } from "react";
import {
  LibraryPool,
  LibraryPoolContent,
  LibraryPrepBatch
} from "../../../../types/seqdb-api";
import {
  LibraryPoolingSelectionFormValues,
  LibraryPoolingSelectionProps
} from "./LibraryPoolingSelection";

export function useLibraryPoolingSelectionControls({
  libraryPool
}: LibraryPoolingSelectionProps) {
  const { doOperations, save } = useContext(ApiClientContext);

  const [lastSave, setLastSave] = useState<number>();

  async function selectPooledItems(
    pooledItems: (LibraryPrepBatch | LibraryPool)[]
  ) {
    const newLibraryPoolContents = pooledItems.map<LibraryPoolContent>(
      item => ({
        libraryPool,
        pooledLibraryPool:
          item.type === "library-pool" ? item : ({ id: null } as any),
        pooledLibraryPrepBatch:
          item.type === "library-prep-batch" ? item : ({ id: null } as any),
        type: "library-pool-content"
      })
    );

    await save(
      newLibraryPoolContents.map(lpc => ({
        resource: lpc,
        type: "library-pool-content"
      })),
      { apiBaseUrl: "/seqdb-api" }
    );

    setLastSave(Date.now());
  }

  async function selectAllCheckedItems(
    formValues: LibraryPoolingSelectionFormValues,
    formik: FormikContextType<any>
  ) {
    const { libraryPoolIdsToSelect, libraryPrepBatchIdsToSelect } = formValues;

    const libraryPoolIds = toPairs(libraryPoolIdsToSelect)
      .filter(pair => pair[1])
      .map(pair => pair[0]);

    const libraryPrepBatchIds = toPairs(libraryPrepBatchIdsToSelect)
      .filter(pair => pair[1])
      .map(pair => pair[0]);

    const newPoolItems = [
      ...libraryPoolIds.map<LibraryPool>(
        id =>
          ({
            id,
            type: "library-pool"
          } as LibraryPool)
      ),
      ...libraryPrepBatchIds.map<LibraryPrepBatch>(
        id =>
          ({
            id,
            type: "library-prep-batch"
          } as LibraryPrepBatch)
      )
    ];

    await selectPooledItems(newPoolItems);

    formik.setFieldValue("libraryPoolIdsToSelect", {});
    formik.setFieldValue("libraryPrepBatchIdsToSelect", {});
  }

  async function deleteLibraryPoolContents(items: LibraryPoolContent[]) {
    const operations = items.map(item => ({
      op: "DELETE" as OperationVerb,
      path: `library-pool-content/${item.id}`,
      value: {
        id: item.id as string,
        type: "library-pool-content"
      }
    }));

    await doOperations(operations, { apiBaseUrl: "/seqdb-api" });

    setLastSave(Date.now());
  }

  async function deleteAllCheckedItems(
    formValues: LibraryPoolingSelectionFormValues,
    formik: FormikContextType<any>
  ) {
    const { libraryPoolContentIdsToDelete } = formValues;

    const ids = toPairs(libraryPoolContentIdsToDelete)
      .filter(pair => pair[1])
      .map(pair => pair[0]);

    const lpcs = ids.map<LibraryPoolContent>(
      id =>
        ({
          id,
          type: "library-pool-content"
        } as LibraryPoolContent)
    );

    await deleteLibraryPoolContents(lpcs);

    formik.setFieldValue("libraryPoolContentIdsToDelete", {});
  }

  return {
    deleteAllCheckedItems,
    deleteLibraryPoolContents,
    lastSave,
    selectAllCheckedItems,
    selectPooledItems
  };
}
