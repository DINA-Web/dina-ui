import {
  BackButton,
  ButtonBar,
  DateField,
  DinaForm,
  DinaFormSection,
  FieldSet,
  filterBy,
  FormikButton,
  ResourceSelectField,
  StringArrayField,
  SubmitButton,
  TextField,
  withResponse
} from "common-ui";
import { FormikProps } from "formik";
import { InputResource, PersistedResource } from "kitsu";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  useMaterialSampleQuery,
  useMaterialSampleSave
} from "../../../components/collection/useMaterialSample";
import Switch from "react-switch";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { GroupSelectField, Head, Nav } from "../../../components";
import { CollectingEventLinker } from "../../../components/collection";
import { DinaMessage, useDinaIntl } from "../../../intl/dina-ui-intl";
import { MaterialSample } from "../../../types/collection-api";
import { PreparationType } from "../../../types/collection-api/resources/PreparationType";

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
      <div className="container-fluid">
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
      </div>
    </div>
  );
}

export interface MaterialSampleFormProps {
  materialSample?: PersistedResource<MaterialSample>;
  onSaved?: (id: string) => Promise<void>;
  isTemplate?: boolean;
  collectingEvtFormRef?: React.Ref<FormikProps<any>>;
  catelogueSectionRef?: React.Ref<FormikProps<any>>;
}

export function MaterialSampleForm({
  materialSample,
  onSaved,
  isTemplate,
  collectingEvtFormRef,
  catelogueSectionRef
}: MaterialSampleFormProps) {
  const { formatMessage } = useDinaIntl();
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
    materialSampleAttachmentsUI
  } = useMaterialSampleSave({
    materialSample,
    onSaved,
    isTemplate,
    collectingEvtFormRef
  });
  const buttonBar = (
    <ButtonBar>
      <BackButton
        entityId={materialSample?.id}
        entityLink="/collection/material-sample"
      />
      <SubmitButton className="ms-auto" />
    </ButtonBar>
  );

  const mateirialSampleInternal = (
    <div className="d-flex">
      <div>
        <nav
          className="card card-body sticky-top d-none d-md-block"
          style={{ width: "20rem" }}
        >
          <h4>
            <DinaMessage id="formNavigation" />
          </h4>
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
        {!isTemplate && <MaterialSampleIdentifiersFormLayout />}
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
                <Tab>
                  <DinaMessage id="attachExisting" />
                </Tab>
              </TabList>
              <TabPanel>
                {
                  // If there is already a linked CollectingEvent then wait for it to load first:
                  colEventId
                    ? withResponse(colEventQuery, () => (
                        <>
                          <div className="mb-3 d-flex justify-content-end align-items-center">
                            <Link
                              href={`/collection/collecting-event/view?id=${colEventId}`}
                            >
                              <a target="_blank">
                                <DinaMessage id="collectingEventDetailsPageLink" />
                              </a>
                            </Link>
                            <FormikButton
                              className="btn btn-danger detach-collecting-event-button ms-5"
                              onClick={() => setColEventId(null)}
                            >
                              <DinaMessage id="detachCollectingEvent" />
                            </FormikButton>
                          </div>
                          {nestedCollectingEventForm}
                        </>
                      ))
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
              initialValues={{}}
              innerRef={catelogueSectionRef}
              isTemplate={true}
            >
              <PreparationsFormLayout
                className={enablePreparations ? "" : "d-none"}
              />
              {materialSampleAttachmentsUI}
            </DinaForm>
          ) : (
            <>
              <PreparationsFormLayout
                className={enablePreparations ? "" : "d-none"}
              />
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

/** Fields layout re-useable between view and edit pages. */
export function MaterialSampleIdentifiersFormLayout() {
  return (
    <FieldSet
      id="identifiers-section"
      legend={<DinaMessage id="identifiers" />}
    >
      <div className="row">
        <div className="col-md-6">
          <TextField name="materialSampleName" />
          <TextField name="dwcCatalogNumber" />
        </div>
        <div className="col-md-6">
          <StringArrayField name="dwcOtherCatalogNumbers" />
        </div>
      </div>
    </FieldSet>
  );
}

export interface CatalogueInfoFormLayoutProps {
  className?: string;
}

export function PreparationsFormLayout({
  className
}: CatalogueInfoFormLayoutProps) {
  return (
    <FieldSet
      className={className}
      id="preparations-section"
      legend={<DinaMessage id="preparations" />}
    >
      <div className="row">
        <div className="col-md-6">
          <ResourceSelectField<PreparationType>
            name="preparationType"
            filter={filterBy(["name"])}
            model="collection-api/preparation-type"
            optionLabel={it => it.name}
            readOnlyLink="/collection/preparation-type/view?id="
          />
          <DinaFormSection
            readOnly={true} // Disabled until back-end supports these fields.
          >
            <TextField name="preparedBy" />
            <DateField name="datePrepared" />
          </DinaFormSection>
        </div>
      </div>
    </FieldSet>
  );
}
