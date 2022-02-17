import {
  BackButton,
  ButtonBar,
  DinaForm,
  DinaFormContext,
  DinaFormSection,
  FieldSet,
  LoadingSpinner,
  SubmitButton,
  withResponse
} from "common-ui";
import { FormikProps } from "formik";
import { InputResource } from "kitsu";
import { mapValues } from "lodash";
import { useRouter } from "next/router";
import { ReactNode, Ref, useContext, useState } from "react";
import {
  AttachmentsField,
  BulkEditTabWarning,
  Footer,
  GroupSelectField,
  Head,
  MaterialSampleBreadCrumb,
  MaterialSampleFormNav,
  MaterialSampleFormSectionId,
  MaterialSampleIdentifiersSection,
  MaterialSampleInfoSection,
  Nav,
  nextSampleInitialValues,
  OrganismsField,
  ProjectSelectSection,
  StorageLinkerField,
  TagsAndRestrictionsSection
} from "../../../components";
import {
  CollectingEventLinker,
  ScheduledActionsField,
  SetDefaultSampleName,
  TabbedResourceLinker,
  useCollectingEventQuery,
  useMaterialSampleQuery,
  useMaterialSampleSave
} from "../../../components/collection";
import { AcquisitionEventLinker } from "../../../components/collection/AcquisitionEventLinker";
import { AssociationsField } from "../../../components/collection/AssociationsField";
import { CollectingEventBriefDetails } from "../../../components/collection/collecting-event/CollectingEventBriefDetails";
import { PreparationField } from "../../../components/collection/material-sample/PreparationField";
import { SaveAndCopyToNextSuccessAlert } from "../../../components/collection/SaveAndCopyToNextSuccessAlert";
import { AllowAttachmentsConfig } from "../../../components/object-store";
import { ManagedAttributesEditor } from "../../../components/object-store/managed-attributes/ManagedAttributesEditor";
import { DinaMessage, useDinaIntl } from "../../../intl/dina-ui-intl";
import {
  AcquisitionEvent,
  CollectingEvent,
  MaterialSample
} from "../../../types/collection-api";
import {
  AcquisitionEventFormLayout,
  useAcquisitionEvent
} from "../acquisition-event/edit";

export type PostSaveRedirect = "VIEW" | "CREATE_NEXT";

export default function MaterialSampleEditPage() {
  const router = useRouter();

  const id = router.query.id?.toString();
  const copyFromId = router.query.copyFromId?.toString();
  const lastCreatedId = router.query.lastCreatedId?.toString();

  const { formatMessage } = useDinaIntl();

  const materialSampleQuery = useMaterialSampleQuery(id);
  const copyFromQuery = useMaterialSampleQuery(copyFromId);

  /** The page to redirect to after saving. */
  const [saveRedirect, setSaveRedirect] = useState<PostSaveRedirect>("VIEW");

  async function moveToViewPage(savedId: string) {
    await router.push(`/collection/material-sample/view?id=${savedId}`);
  }

  async function moveToNextSamplePage(savedId: string) {
    await router.push(
      `/collection/material-sample/edit?copyFromId=${savedId}&lastCreatedId=${savedId}`
    );
  }

  const title = id ? "editMaterialSampleTitle" : "addMaterialSampleTitle";

  const sampleFormProps: Partial<MaterialSampleFormProps> = {
    enableStoredDefaultGroup: true,
    buttonBar: (
      <ButtonBar>
        <BackButton
          className="me-auto"
          entityId={id}
          entityLink="/collection/material-sample"
        />
        {!id && (
          <SubmitButton
            buttonProps={() => ({
              style: { width: "12rem" },
              onClick: () => setSaveRedirect("CREATE_NEXT")
            })}
          >
            <DinaMessage id="saveAndCopyToNext" />
          </SubmitButton>
        )}
        <SubmitButton
          buttonProps={() => ({ onClick: () => setSaveRedirect("VIEW") })}
        />
      </ButtonBar>
    ),
    // On save either redirect to the view page or create the next sample with the same values:
    onSaved:
      saveRedirect === "CREATE_NEXT" ? moveToNextSamplePage : moveToViewPage
  };

  return (
    <div>
      <Head title={formatMessage(title)} />
      <Nav />
      <main className="container-fluid">
        {!id &&
          !!lastCreatedId &&
          withResponse(copyFromQuery, ({ data: originalSample }) => (
            <SaveAndCopyToNextSuccessAlert
              id={lastCreatedId}
              displayName={
                !!originalSample.materialSampleName?.length
                  ? originalSample.materialSampleName
                  : lastCreatedId
              }
              entityPath={"collection/material-sample"}
            />
          ))}
        <h1 id="wb-cont">
          <DinaMessage id={title} />
        </h1>
        {id ? (
          withResponse(materialSampleQuery, ({ data: sample }) => (
            <MaterialSampleForm {...sampleFormProps} materialSample={sample} />
          ))
        ) : copyFromId ? (
          withResponse(copyFromQuery, ({ data: originalSample }) => {
            const initialValues = nextSampleInitialValues(originalSample);
            return (
              <MaterialSampleForm
                {...sampleFormProps}
                materialSample={initialValues}
                disableAutoNamePrefix={true}
              />
            );
          })
        ) : (
          <MaterialSampleForm {...sampleFormProps} />
        )}
      </main>
      <Footer />
    </div>
  );
}

export interface MaterialSampleFormProps {
  materialSample?: InputResource<MaterialSample>;
  collectingEventInitialValues?: InputResource<CollectingEvent>;
  acquisitionEventInitialValues?: InputResource<AcquisitionEvent>;

  onSaved?: (id: string) => Promise<void>;

  /** Optionally call the hook from the parent component. */
  materialSampleSaveHook?: ReturnType<typeof useMaterialSampleSave>;

  /** Template form values for template mode. */
  templateInitialValues?: Partial<MaterialSample> & {
    templateCheckboxes?: Record<string, boolean | undefined>;
  };

  /** The enabled fields if creating from a template. */
  enabledFields?: {
    materialSample: string[];
    collectingEvent: string[];
    acquisitionEvent: string[];
  };

  attachmentsConfig?: {
    materialSample: AllowAttachmentsConfig;
    collectingEvent: AllowAttachmentsConfig;
  };

  buttonBar?: ReactNode;

  /** Disables prefixing the sample name with the Collection code. */
  disableAutoNamePrefix?: boolean;

  /** Makes the sample name field (Primary ID) read-only. */
  disableSampleNameField?: boolean;

  materialSampleFormRef?: Ref<FormikProps<InputResource<MaterialSample>>>;

  /** Disables the "Are You Sure" prompt in the nav when removing a data component. */
  disableNavRemovePrompt?: boolean;

  /**
   * Removes the html tag IDs from hidden tabs.
   * This needs to be done for off-screen forms in the bulk editor.
   */
  isOffScreen?: boolean;

  /** Reduces the rendering to improve performance when bulk editing many material samples. */
  reduceRendering?: boolean;

  /** Hide the use next identifer checkbox, e.g when create multiple new samples */
  hideUseSequence?: boolean;
  /** Sets a default group from local storage when the group is not already set. */
  enableStoredDefaultGroup?: boolean;
}

export function MaterialSampleForm({
  materialSample,
  collectingEventInitialValues,
  acquisitionEventInitialValues,
  onSaved,
  materialSampleSaveHook,
  enabledFields,
  attachmentsConfig,
  disableAutoNamePrefix,
  materialSampleFormRef,
  disableSampleNameField,
  disableNavRemovePrompt,
  isOffScreen,
  reduceRendering,
  hideUseSequence,
  enableStoredDefaultGroup,
  buttonBar = (
    <ButtonBar>
      <BackButton
        entityId={materialSample?.id}
        entityLink="/collection/material-sample"
      />
      <SubmitButton className="ms-auto" />
    </ButtonBar>
  )
}: MaterialSampleFormProps) {
  const { isTemplate } = useContext(DinaFormContext) ?? {};
  const {
    initialValues,
    nestedCollectingEventForm,
    nestedAcqEventForm,
    dataComponentState,
    colEventId,
    setColEventId,
    acqEventId,
    setAcqEventId,
    onSubmit,
    loading
  } =
    materialSampleSaveHook ??
    useMaterialSampleSave({
      collectingEventAttachmentsConfig: attachmentsConfig?.collectingEvent,
      materialSample,
      collectingEventInitialValues,
      acquisitionEventInitialValues,
      onSaved,
      isTemplate,
      enabledFields,
      reduceRendering
    });

  // CollectingEvent "id" being enabled in the template enabledFields means that the
  // Template links an existing Collecting Event:
  const templateAttachesCollectingEvent = Boolean(
    enabledFields?.collectingEvent.includes("id")
  );
  const templateAttachesAcquisitionEvent = Boolean(
    enabledFields?.acquisitionEvent.includes("id")
  );

  const attachmentsField = "attachment";

  /** Set IDs to blank when this component is off-screen. */
  const navIds = mapValues(
    {
      identifiers: "identifiers-section",
      colEvent: "collecting-event-section",
      acqEvent: "acquisition-event-section",
      preparation: "preparations-section",
      organism: "organisms-section",
      associations: "associations-section",
      storage: "storage-section",
      ScheduledActions: "scheduled-actions-section",
      managedAttributes: "managedAttributes-section",
      attachments: "material-sample-attachments-section"
    },
    id => (isOffScreen ? "" : id)
  );

  const [formSectionOrder, setFormSectionOrder] = useState<
    MaterialSampleFormSectionId[]
  >([]);

  const mateirialSampleInternal = (
    <div className="d-md-flex">
      <div style={{ minWidth: "20rem" }}>
        {(!isOffScreen || !reduceRendering) && (
          <MaterialSampleFormNav
            dataComponentState={dataComponentState}
            disableRemovePrompt={disableNavRemovePrompt}
            navOrder={formSectionOrder}
            onChangeNavOrder={setFormSectionOrder}
          />
        )}
      </div>
      <div className="flex-grow-1 container-fluid">
        {!reduceRendering && (
          <>
            {!isTemplate && materialSample && (
              <MaterialSampleBreadCrumb
                disableLastLink={true}
                materialSample={materialSample as any}
              />
            )}
            {!isTemplate && (
              <div className="row">
                <div className="col-md-6">
                  <GroupSelectField
                    name="group"
                    enableStoredDefaultGroup={enableStoredDefaultGroup}
                  />
                </div>
              </div>
            )}
            <TagsAndRestrictionsSection resourcePath="collection-api/material-sample" />
            <ProjectSelectSection
              classNames="mt-3"
              resourcePath="collection-api/project"
            />
          </>
        )}
        <div className="data-components">
          {!reduceRendering && (
            <>
              <MaterialSampleIdentifiersSection
                id={navIds.identifiers}
                disableSampleNameField={disableSampleNameField}
                hideUseSequence={hideUseSequence}
              />
              <MaterialSampleInfoSection />
            </>
          )}
          {dataComponentState.enableCollectingEvent && (
            <TabbedResourceLinker<CollectingEvent>
              fieldSetId={navIds.colEvent}
              legend={<DinaMessage id="collectingEvent" />}
              briefDetails={colEvent => (
                <CollectingEventBriefDetails collectingEvent={colEvent} />
              )}
              linkerTabContent={
                reduceRendering ? null : (
                  <CollectingEventLinker
                    onCollectingEventSelect={colEventToLink => {
                      setColEventId(colEventToLink.id);
                    }}
                  />
                )
              }
              nestedForm={nestedCollectingEventForm}
              useResourceQuery={useCollectingEventQuery}
              setResourceId={setColEventId}
              disableLinkerTab={templateAttachesCollectingEvent}
              readOnlyLink="/collection/collecting-event/view?id="
              resourceId={colEventId}
              fieldName="collectingEvent"
              targetType="materialSample"
            />
          )}
          {dataComponentState.enableAcquisitionEvent && (
            <TabbedResourceLinker<AcquisitionEvent>
              fieldSetId={navIds.acqEvent}
              legend={<DinaMessage id="acquisitionEvent" />}
              briefDetails={acqEvent => (
                <DinaForm initialValues={acqEvent} readOnly={true}>
                  <AcquisitionEventFormLayout />
                </DinaForm>
              )}
              linkerTabContent={
                reduceRendering ? null : (
                  <AcquisitionEventLinker
                    onAcquisitionEventSelect={acqEventToLink => {
                      setAcqEventId(acqEventToLink.id);
                    }}
                  />
                )
              }
              nestedForm={nestedAcqEventForm}
              useResourceQuery={useAcquisitionEvent}
              setResourceId={setAcqEventId}
              disableLinkerTab={templateAttachesAcquisitionEvent}
              readOnlyLink="/collection/acquisition-event/view?id="
              resourceId={acqEventId}
              fieldName="acquisitionEvent"
              targetType="materialSample"
            />
          )}
          {!reduceRendering && (
            <>
              {dataComponentState.enablePreparations && (
                <PreparationField
                  id={navIds.preparation}
                  // Use the same attachments config for preparations as the Material Sample:
                  attachmentsConfig={attachmentsConfig?.materialSample}
                />
              )}
              {dataComponentState.enableOrganisms && (
                <OrganismsField id={navIds.organism} name="organism" />
              )}
              {dataComponentState.enableAssociations && (
                <AssociationsField id={navIds.associations} />
              )}
              {dataComponentState.enableStorage && (
                <FieldSet
                  id={navIds.storage}
                  legend={<DinaMessage id="storage" />}
                  fieldName="storageUnit"
                >
                  <StorageLinkerField
                    name="storageUnit"
                    hideLabel={true}
                    targetType="material-sample"
                  />
                </FieldSet>
              )}
              {dataComponentState.enableScheduledActions && (
                <ScheduledActionsField
                  id={navIds.ScheduledActions}
                  wrapContent={content => (
                    <BulkEditTabWarning
                      targetType="material-sample"
                      fieldName="scheduledActions"
                    >
                      {content}
                    </BulkEditTabWarning>
                  )}
                />
              )}
              {!isTemplate && (
                <DinaFormSection
                  // Disabled the template's restrictions for this section:
                  enabledFields={null}
                >
                  <div className="row">
                    <div className="col-md-6">
                      <ManagedAttributesEditor
                        valuesPath="managedAttributes"
                        managedAttributeApiPath="collection-api/managed-attribute"
                        managedAttributeComponent="MATERIAL_SAMPLE"
                        fieldSetProps={{
                          id: navIds.managedAttributes,
                          legend: (
                            <DinaMessage id="materialSampleManagedAttributes" />
                          )
                        }}
                        showCustomViewDropdown={true}
                      />
                    </div>
                  </div>
                </DinaFormSection>
              )}
              <AttachmentsField
                name={attachmentsField}
                title={<DinaMessage id="materialSampleAttachments" />}
                id={navIds.attachments}
                allowNewFieldName="attachmentsConfig.allowNew"
                allowExistingFieldName="attachmentsConfig.allowExisting"
                allowAttachmentsConfig={attachmentsConfig?.materialSample}
                attachmentPath={`collection-api/material-sample/${materialSample?.id}/attachment`}
                wrapContent={content => (
                  <BulkEditTabWarning
                    targetType="material-sample"
                    fieldName={attachmentsField}
                  >
                    {content}
                  </BulkEditTabWarning>
                )}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );

  return isTemplate ? (
    mateirialSampleInternal
  ) : loading ? (
    <LoadingSpinner loading={true} />
  ) : (
    <DinaForm<InputResource<MaterialSample>>
      innerRef={materialSampleFormRef}
      initialValues={initialValues}
      onSubmit={onSubmit}
      enabledFields={enabledFields?.materialSample}
    >
      {!initialValues.id && !disableAutoNamePrefix && <SetDefaultSampleName />}
      {buttonBar}
      {mateirialSampleInternal}
      {buttonBar}
    </DinaForm>
  );
}
