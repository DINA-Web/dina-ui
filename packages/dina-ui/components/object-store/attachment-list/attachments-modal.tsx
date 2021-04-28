import { FieldHeader, useApiClient, useModal, useQuery } from "common-ui";
import { PersistedResource } from "kitsu";
import { uniqBy } from "lodash";
import { useEffect, useState } from "react";
import ReactTable from "react-table";
import { DinaMessage } from "../../../intl/dina-ui-intl";
import { Metadata } from "../../../types/objectstore-api";
import { AttachmentSection } from "./AttachmentSection";

export interface AttachmentsModalParams {
  /** Pre-existing metadata attachments. */
  initialMetadatas?: PersistedResource<Metadata>[];

  /** Dependencies for re-initializing the attachment list. */
  deps: any[];
}

export function useAttachmentsModal({
  initialMetadatas = [],
  deps
}: AttachmentsModalParams) {
  const { closeModal, openModal } = useModal();
  const { bulkGet } = useApiClient();

  const [selectedMetadatas, setSelectedMetadatas] = useState<Metadata[]>(
    initialMetadatas
  );
  useEffect(() => {
    setSelectedMetadatas(initialMetadatas);
  }, deps);

  // Just check if the object-store is up:
  const { error } = useQuery<[]>({ path: "objectstore-api/metadata" });

  async function addAttachedMetadatas(metadataIds: string[]) {
    const metadatas = await bulkGet<Metadata>(
      metadataIds.map(mId => `/metadata/${mId}`),
      { apiBaseUrl: "/objectstore-api" }
    );

    // Add the selected Metadatas to the array, making sure there are no duplicates:
    setSelectedMetadatas(current =>
      uniqBy([...current, ...metadatas], metadata => metadata.id)
    );

    closeModal();
  }

  async function removeMetadata(id: string) {
    // Remove the selected Metadata from the array:
    setSelectedMetadatas(current =>
      current.filter(metadata => metadata.id !== id)
    );
  }

  function openAttachmentsModal() {
    openModal(
      <div className="modal-content">
        <style>{`
        .modal-dialog {
          max-width: calc(100vw - 3rem);
        }
        .modal-content {
          max-height: calc(100vh - 3rem) !important;
          overflow-y: scroll !important;
        }
        .ht_master .wtHolder {
          height: 0% !important;
        }
      `}</style>
        <div className="modal-header">
          <button className="btn btn-dark" onClick={closeModal}>
            <DinaMessage id="cancelButtonText" />
          </button>
        </div>
        <div className="modal-body">
          <AttachmentSection afterMetadatasSaved={addAttachedMetadatas} />
        </div>
      </div>
    );
  }

  const attachedMetadatasUI = (
    <div>
      <h2>Attachments ({selectedMetadatas.length})</h2>
      {error ? (
        <DinaMessage id="objectStoreDataUnavailable" />
      ) : (
        <>
          {selectedMetadatas.length ? (
            <ReactTable
              columns={[
                ...[
                  "originalFilename",
                  "acCaption",
                  "xmpMetadataDate",
                  "acTags"
                ].map(accessor => ({
                  accessor,
                  Header: <FieldHeader name={accessor} />
                })),
                {
                  Cell: ({ original: { id } }) => (
                    <button
                      className="btn btn-dark"
                      onClick={() => removeMetadata(id)}
                      type="button"
                    >
                      <DinaMessage id="remove" />
                    </button>
                  )
                }
              ]}
              data={selectedMetadatas}
              minRows={selectedMetadatas.length}
              showPagination={false}
            />
          ) : null}
          <button
            className="btn btn-primary"
            type="button"
            onClick={openAttachmentsModal}
          >
            <DinaMessage id="addAttachments" />
          </button>
        </>
      )}
    </div>
  );

  return {
    addAttachedMetadatas,
    attachedMetadatasUI,
    removeMetadata,
    selectedMetadatas
  };
}
