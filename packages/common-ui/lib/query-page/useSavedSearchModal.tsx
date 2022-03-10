import { DinaForm, TextField, useModal } from "common-ui";
import { UserPreference } from "packages/dina-ui/types/user-api/resources/UserPreference";
import { useDinaIntl } from "../../../dina-ui/intl/dina-ui-intl";
import { FormikButton } from "../formik-connected/FormikButton";

interface SavedSearchModalParams {
  saveSearch: (
    isDefault: boolean,
    userPreferences: UserPreference[],
    searchName?: string
  ) => void;
  userPreferences: UserPreference[];
}

export function useSavedSearchModal() {
  const { closeModal, openModal } = useModal();
  const { formatMessage } = useDinaIntl();

  function openSavedSearchModal({
    saveSearch,
    userPreferences
  }: SavedSearchModalParams) {
    openModal(
      <div className="modal-content">
        <style>{`
          .modal-dialog {
            max-width: 70rem !important;
          }
        `}</style>
        <main className="modal-body">
          <div className="d-flex align-items-center flex-column gap-2">
            <h1 style={{ border: "none" }}>{formatMessage("saveSearch")}</h1>
            <span>{formatMessage("saveSearchInstruction")}</span>
            <DinaForm initialValues={{}}>
              <>
                <TextField name="searchName" removeLabel={true} />
                <div className="d-flex gap-2">
                  <FormikButton
                    className="btn btn-primary order-3"
                    onClick={(submittedValues, _) => {
                      saveSearch(
                        false,
                        userPreferences,
                        submittedValues.searchName
                      );
                      closeModal();
                    }}
                  >
                    {formatMessage("save")}
                  </FormikButton>
                  <FormikButton
                    className="btn btn-primary order-2"
                    onClick={() => {
                      saveSearch(true, userPreferences);
                      closeModal();
                    }}
                  >
                    {formatMessage("saveAsDefault")}
                  </FormikButton>
                  <button
                    className="btn btn-secondary order-1"
                    onClick={closeModal}
                  >
                    {formatMessage("cancelButtonText")}
                  </button>
                </div>
              </>
            </DinaForm>
          </div>
        </main>
      </div>
    );
  }

  return { openSavedSearchModal };
}
