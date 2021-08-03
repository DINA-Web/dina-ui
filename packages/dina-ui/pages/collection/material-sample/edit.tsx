import {
  BackButton,
  ButtonBar,
  DinaForm,
  DinaFormContext,
  DinaFormSection,
  FieldSet,
  FormikButton,
  StringArrayField,
  SubmitButton,
  TextField,
  withResponse
} from "common-ui";
import { FormikProps } from "formik";
import { InputResource, PersistedResource } from "kitsu";
import Link from "next/link";
import { useRouter } from "next/router";
import { DeterminationField } from "../../../components/collection/DeterminationField";
import { ReactNode, useContext } from "react";
import Switch from "react-switch";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import {
  GroupSelectField,
  Head,
  Nav,
  StorageLinkerField
} from "../../../components";
import { CollectingEventLinker } from "../../../components/collection";
import { PreparationField } from "../../../components/collection/PreparationField";
import {
  useMaterialSampleQuery,
  useMaterialSampleSave
} from "../../../components/collection/useMaterialSample";
import { AllowAttachmentsConfig } from "../../../components/object-store";
import { ManagedAttributesEditor } from "../../../components/object-store/managed-attributes/ManagedAttributesEditor";
import { DinaMessage, useDinaIntl } from "../../../intl/dina-ui-intl";
import { CollectingEvent, MaterialSample } from "../../../types/collection-api";

export default function MaterialSampleEditPage() {
  const router = useRouter();
  const {
    query: { id }
  } = router;
  const { formatMessage } = useDinaIntl();
  const materialSampleQuery = useMaterialSampleQuery(id as any);

  async function moveToViewPage(savedId: string) {
    await router.push(`/collection/material-sample/view?id=${savedId}`);
  }

  const title = id ? "editMaterialSampleTitle" : "addMaterialSampleTitle";

  return (
    <div>
      <Head title={formatMessage(title)} />
      <Nav />
      <main className="container-fluid">
        <h1>
          <DinaMessage id={title} />
        </h1>
        {id ? (
          withResponse(materialSampleQuery, ({ data }) => (
            <MaterialSampleForm
              materialSample={data}
              onSaved={moveToViewPage}
            />
          ))
        ) : (
          <MaterialSampleForm onSaved={moveToViewPage} />
        )}
      </main>
    </div>
  );
}

export interface MaterialSampleFormProps {
  materialSample?: InputResource<MaterialSample>;
  collectingEventInitialValues?: InputResource<CollectingEvent>;

  onSaved?: (id: string) => Promise<void>;
  preparationsSectionRef?: React.RefObject<FormikProps<any>>;
  identifiersSectionRef?: React.RefObject<FormikProps<any>>;

  /** Optionally call the hook from the parent component. */
  materialSampleSaveHook?: ReturnType<typeof useMaterialSampleSave>;

  /** Template form values for template mode. */
  preparationsTemplateInitialValues?: Partial<MaterialSample> & {
    templateCheckboxes?: Record<string, boolean | undefined>;
  };
  identifiersTemplateInitialValues?: Partial<MaterialSample> & {
    templateCheckboxes?: Record<string, boolean | undefined>;
  };

  /** The enabled fields if creating from a template. */
  enabledFields?: {
    materialSample: string[];
    collectingEvent: string[];
  };

  attachmentsConfig?: {
    materialSample: AllowAttachmentsConfig;
    collectingEvent: AllowAttachmentsConfig;
  };

  buttonBar?: ReactNode;
}

export function MaterialSampleForm({
  materialSample,
  collectingEventInitialValues,
  onSaved,
  preparationsSectionRef,
  identifiersSectionRef,
  materialSampleSaveHook,
  enabledFields,
  attachmentsConfig,
  buttonBar = (
    <ButtonBar>
      <BackButton
        entityId={materialSample?.id}
        entityLink="/collection/material-sample"
      />
      <SubmitButton className="ms-auto" />
    </ButtonBar>
  ),
  preparationsTemplateInitialValues,
  identifiersTemplateInitialValues
}: MaterialSampleFormProps) {
  const { formatMessage } = useDinaIntl();
  const { isTemplate } = useContext(DinaFormContext) ?? {};

  const {
    initialValues,
    nestedCollectingEventForm,
    dataComponentToggler,
    enablePreparations,
    setEnablePreparations,
    enableCollectingEvent,
    setEnableCollectingEvent,
    colEventId,
    setColEventId,
    colEventQuery,
    onSubmit,
    materialSampleAttachmentsUI,
    enableDetermination,
    setEnableDetermination
  } =
    materialSampleSaveHook ??
    useMaterialSampleSave({
      collectingEventAttachmentsConfig: attachmentsConfig?.collectingEvent,
      materialSampleAttachmentsConfig: attachmentsConfig?.materialSample,
      materialSample,
      collectingEventInitialValues,
      onSaved,
      isTemplate,
      enabledFields
    });

  // CollectingEvent "id" being enabled in the template enabledFields means that the
  // Template links an existing Collecting Event:
  const templateAttachesCollectingEvent = Boolean(
    enabledFields?.collectingEvent.includes("id")
  );

  const mateirialSampleInternal = (
    <div className="d-flex">
      <div>
        <nav
          className="card card-body sticky-top d-none d-md-block"
          style={{ width: "20rem" }}
        >
          <h2>
            <DinaMessage id="formNavigation" />
          </h2>
          <div className="list-group">
            {!isTemplate && (
              <a href="#material-sample-section" className="list-group-item">
                <DinaMessage id="materialSample" />
              </a>
            )}
            {!isTemplate && (
              <a href="#identifiers-section" className="list-group-item">
                <DinaMessage id="identifiers" />
              </a>
            )}
            {enableCollectingEvent && (
              <a href="#collecting-event-section" className="list-group-item">
                <DinaMessage id="collectingEvent" />
              </a>
            )}
            {enablePreparations && (
              <a href="#preparations-section" className="list-group-item">
                <DinaMessage id="preparations" />
              </a>
            )}
            {enableDetermination && (
              <a href="#determination-section" className="list-group-item">
                <DinaMessage id="determination" />
              </a>
            )}
            <a href="#managedAttributes-section" className="list-group-item">
              <DinaMessage id="managedAttributeListTitle" />
            </a>
            <a
              href="#material-sample-attachments-section"
              className="list-group-item"
            >
              <DinaMessage id="materialSampleAttachments" />
            </a>
          </div>
        </nav>
      </div>
      <div className="flex-grow-1 container-fluid">
        {!isTemplate && <MaterialSampleMainInfoFormLayout />}
        <div className="row">
          <div className="col-md-6">
            {isTemplate ? (
              <DinaForm
                initialValues={identifiersTemplateInitialValues}
                innerRef={identifiersSectionRef}
                isTemplate={true}
              >
                <MaterialSampleIdentifiersFormLayout />
              </DinaForm>
            ) : (
              <MaterialSampleIdentifiersFormLayout />
            )}{" "}
          </div>
        </div>

        {!isTemplate && (
          <div className="card card-body mb-3">
            <StorageLinkerField name="storageUnit" removeLabelTag={true} />
          </div>
        )}
        <FieldSet legend={<DinaMessage id="components" />}>
          <div className="row">
            <label className="enable-collecting-event d-flex align-items-center fw-bold col-sm-3">
              <Switch
                className="mx-2"
                checked={enableCollectingEvent}
                onChange={dataComponentToggler(
                  setEnableCollectingEvent,
                  formatMessage("collectingEvent")
                )}
              />
              <DinaMessage id="collectingEvent" />
            </label>
            <label className="enable-catalogue-info d-flex align-items-center fw-bold col-sm-3">
              <Switch
                className="mx-2"
                checked={enablePreparations}
                onChange={dataComponentToggler(
                  setEnablePreparations,
                  formatMessage("preparations")
                )}
              />
              <DinaMessage id="preparations" />
            </label>
            <label className="enable-determination d-flex align-items-center fw-bold col-sm-3">
              <Switch
                className="mx-2"
                checked={enableDetermination}
                onChange={dataComponentToggler(
                  setEnableDetermination,
                  formatMessage("determination")
                )}
              />
              <DinaMessage id="determination" />
            </label>
          </div>
        </FieldSet>
        <div className="data-components">
          <FieldSet
            id="collecting-event-section"
            className={enableCollectingEvent ? "" : "d-none"}
            legend={<DinaMessage id="collectingEvent" />}
          >
            <Tabs
              // Re-initialize the form when the linked CollectingEvent changes:
              key={colEventId}
              // Prevent unmounting the form on tab switch to avoid losing the form state:
              forceRenderTabPanel={true}
            >
              <TabList>
                <Tab>
                  {colEventId ? (
                    <DinaMessage id="attachedCollectingEvent" />
                  ) : (
                    <DinaMessage id="createNew" />
                  )}
                </Tab>
                <Tab disabled={templateAttachesCollectingEvent}>
                  <DinaMessage id="attachExisting" />
                </Tab>
              </TabList>
              <TabPanel>
                {
                  // If there is already a linked CollectingEvent then wait for it to load first:
                  colEventId
                    ? withResponse(
                        colEventQuery,
                        ({ data: linkedColEvent }) => (
                          <>
                            <div className="mb-3 d-flex justify-content-end align-items-center">
                              <Link
                                href={`/collection/collecting-event/view?id=${colEventId}`}
                              >
                                <a target="_blank">
                                  <DinaMessage id="collectingEventDetailsPageLink" />
                                </a>
                              </Link>
                              {
                                // Do not allow changing an attached Collecting Event from a template:
                                !templateAttachesCollectingEvent && (
                                  <FormikButton
                                    className="btn btn-danger detach-collecting-event-button ms-5"
                                    onClick={() => setColEventId(null)}
                                  >
                                    <DinaMessage id="detachCollectingEvent" />
                                  </FormikButton>
                                )
                              }
                            </div>
                            {
                              // In template mode or Workflow Run mode, only show a link to the linked Collecting Event:
                              isTemplate || templateAttachesCollectingEvent ? (
                                <div>
                                  <div className="attached-collecting-event-link mb-3">
                                    <DinaMessage id="attachedCollectingEvent" />
                                    :{" "}
                                    <Link
                                      href={`/collection/collecting-event/view?id=${colEventId}`}
                                    >
                                      <a target="_blank">{linkedColEvent.id}</a>
                                    </Link>
                                  </div>
                                  <CollectingEventBriefDetails
                                    collectingEvent={linkedColEvent}
                                  />
                                </div>
                              ) : (
                                // In form mode, show the actual editable Collecting Event form:
                                nestedCollectingEventForm
                              )
                            }
                          </>
                        )
                      )
                    : nestedCollectingEventForm
                }
              </TabPanel>
              <TabPanel>
                <CollectingEventLinker
                  onCollectingEventSelect={colEventToLink => {
                    setColEventId(colEventToLink.id);
                  }}
                />
              </TabPanel>
            </Tabs>
          </FieldSet>
          {isTemplate ? (
            <DinaForm
              initialValues={preparationsTemplateInitialValues}
              innerRef={preparationsSectionRef}
              isTemplate={true}
            >
              {enablePreparations && (
                <div className="row">
                  <div className="col-md-6">
                    <PreparationField />
                  </div>
                </div>
              )}
              {materialSampleAttachmentsUI}
            </DinaForm>
          ) : (
            <>
              {enablePreparations && <PreparationField />}
              {enableDetermination && <DeterminationField />}
              <FieldSet
                legend={<DinaMessage id="managedAttributeListTitle" />}
                id="managedAttributes-section"
              >
                <DinaFormSection
                  // Disabled the template's restrictions for this section:
                  enabledFields={null}
                >
                  <ManagedAttributesEditor
                    valuesPath="managedAttributeValues"
                    valueFieldName="assignedValue"
                    managedAttributeApiPath="collection-api/managed-attribute"
                    apiBaseUrl="/collection-api"
                    managedAttributeComponent="MATERIAL_SAMPLE"
                    managedAttributeKeyField="key"
                  />
                </DinaFormSection>
              </FieldSet>
              {materialSampleAttachmentsUI}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return !isTemplate ? (
    <DinaForm<InputResource<MaterialSample>>
      initialValues={initialValues}
      onSubmit={onSubmit}
      enabledFields={enabledFields?.materialSample}
    >
      {buttonBar}
      {mateirialSampleInternal}
      {buttonBar}
    </DinaForm>
  ) : (
    mateirialSampleInternal
  );
}
export function MaterialSampleMainInfoFormLayout() {
  return (
    <div id="material-sample-section">
      <div className="row">
        <div className="col-md-6">
          <GroupSelectField name="group" enableStoredDefaultGroup={true} />
        </div>
      </div>
    </div>
  );
}

export interface MaterialSampleIdentifiersFormLayoutProps {
  disableSampleName?: boolean;
  hideOtherCatalogNumbers?: boolean;
  className?: string;
  namePrefix?: string;
  sampleNamePlaceHolder?: string;
}

/** Fields layout re-useable between view and edit pages. */
export function MaterialSampleIdentifiersFormLayout({
  disableSampleName,
  className,
  namePrefix = "",
  sampleNamePlaceHolder
}: MaterialSampleIdentifiersFormLayoutProps) {
  const { formatMessage } = useDinaIntl();
  return (
    <FieldSet
      id="identifiers-section"
      legend={<DinaMessage id="identifiers" />}
      className={className}
    >
      <div className="row">
        <div className="col-md-6">
          <TextField
            name={`${namePrefix}materialSampleName`}
            customName="materialSampleName"
            className="materialSampleName"
            placeholder={sampleNamePlaceHolder}
            readOnly={disableSampleName}
          />

          <TextField
            name={`${
              namePrefix ? namePrefix + "dwcCatalogNumber" : "dwcCatalogNumber"
            }`}
            customName="dwcCatalogNumber"
            className="dwcCatalogNumber"
          />
        </div>
        <div className="col-md-6">
          <StringArrayField
            name={`${
              namePrefix
                ? namePrefix + "dwcOtherCatalogNumbers"
                : "dwcOtherCatalogNumbers"
            }`}
            customName="dwcOtherCatalogNumbers"
          />
        </div>
      </div>
    </FieldSet>
  );
}
export interface CollectingEventBriefDetailsProps {
  collectingEvent: PersistedResource<CollectingEvent>;
}

/** Shows just the main details of a Collecting Event. */
export function CollectingEventBriefDetails({
  collectingEvent
}: CollectingEventBriefDetailsProps) {
  return (
    <DinaForm initialValues={collectingEvent} readOnly={true}>
      <div className="row">
        <div className="col-sm-6">
          <FieldSet legend={<DinaMessage id="collectingDateLegend" />}>
            <TextField name="startEventDateTime" />
            {collectingEvent.endEventDateTime && (
              <TextField name="startEventDateTime" />
            )}
            <TextField name="verbatimEventDateTime" />
          </FieldSet>
        </div>
        <div className="col-sm-6">
          <FieldSet legend={<DinaMessage id="collectingLocationLegend" />}>
            <TextField name="dwcVerbatimLocality" />
            <TextField name="dwcVerbatimCoordinateSystem" />
            <TextField name="dwcVerbatimLatitude" />
            <TextField name="dwcVerbatimLongitude" />
          </FieldSet>
        </div>
      </div>
    </DinaForm>
  );
}
