import {
  BackButton,
  DeleteButton,
  DinaForm,
  DinaFormSection,
  DinaFormSubmitParams,
  FieldSet,
  SubmitButton,
  TextField,
  useQuery,
  withResponse
} from "common-ui";
import { useRouter } from "next/router";
import React, { useRef } from "react";
import {
  AcquisitionEvent,
  CollectingEvent,
  FormTemplate,
  FormTemplateComponents,
  MaterialSample,
  MATERIAL_SAMPLE_FORM_LEGEND
} from "../../../types/collection-api";
import PageLayout from "packages/dina-ui/components/page/PageLayout";
import { DinaMessage } from "packages/dina-ui/intl/dina-ui-intl";
import { GroupSelectField } from "packages/dina-ui/components/group-select/GroupSelectField";
import { InputResource } from "kitsu";
import { getInitialValuesFromFormTemplate } from "packages/dina-ui/components/form-template/formTemplateUtils";
import {
  MaterialSampleForm,
  useMaterialSampleSave
} from "packages/dina-ui/components";
import { FormikProps } from "formik";

export default function FormTemplateEditPage() {
  const router = useRouter();
  const id = router.query.id?.toString();

  const formTemplateQuery = useQuery<FormTemplate>(
    { path: `/collection-api/form-template/${id}` },
    { disabled: !id }
  );

  return (
    <>
      {/* New Form Template or New Form Template */}
      {id ? (
        withResponse(formTemplateQuery, ({ data: fetchedFormTemplate }) => (
          <FormTemplateEditPageLoaded
            fetchedFormTemplate={fetchedFormTemplate}
            id={id}
          />
        ))
      ) : (
        <FormTemplateEditPageLoaded id={id} />
      )}
    </>
  );
}

interface FormTemplateEditPageLoadedProps {
  id?: string;
  fetchedFormTemplate?: FormTemplate;
}

/**
 * This component is only displayed after the Form Template has been loaded.
 */
export function FormTemplateEditPageLoaded({
  id,
  fetchedFormTemplate
}: FormTemplateEditPageLoadedProps) {
  const router = useRouter();
  const collectingEvtFormRef = useRef<FormikProps<any>>(null);
  const acqEventFormRef = useRef<FormikProps<any>>(null);

  const pageTitle = id
    ? "editMaterialSampleFormTemplate"
    : "createMaterialSampleFormTemplate";

  async function moveToNextPage() {
    await router.push("/collection/form-template/list");
  }

  // Collecting Event Initial Values
  const collectingEventInitialValues = {
    ...getInitialValuesFromFormTemplate<CollectingEvent>({
      formTemplate: fetchedFormTemplate
    }),
    managedAttributesOrder: []
  };
  if (!collectingEventInitialValues.geoReferenceAssertions?.length) {
    collectingEventInitialValues.geoReferenceAssertions = [{}];
  }

  // Acquisition Event Initial Values
  const acquisitionEventInitialValues =
    getInitialValuesFromFormTemplate<AcquisitionEvent>({
      formTemplate: fetchedFormTemplate
    });

  const materialSampleTemplateInitialValues =
    getInitialValuesFromFormTemplate<MaterialSample>({
      formTemplate: fetchedFormTemplate
    });

  // Provide initial values for the material sample form.
  const initialValues: any = {
    ...collectingEventInitialValues,
    id,
    type: "form-template"
  };

  // Generate the material sample save hook to use for the form.
  const materialSampleSaveHook = useMaterialSampleSave({
    isTemplate: true,
    acqEventTemplateInitialValues: acquisitionEventInitialValues,
    colEventTemplateInitialValues: collectingEventInitialValues,
    materialSampleTemplateInitialValues,
    colEventFormRef: collectingEvtFormRef,
    acquisitionEventFormRef: acqEventFormRef
  });

  async function onSaveTemplateSubmit({
    api: { save },
    submittedValues
  }: DinaFormSubmitParams<FormTemplate & FormTemplateComponents>) {
    const formTemplate: InputResource<FormTemplate> = {
      type: "form-template",
      name: submittedValues.name,
      group: submittedValues.group,
      components: MATERIAL_SAMPLE_FORM_LEGEND.map(
        (dataComponent, componentIndex) => ({
          name: dataComponent.id,
          visible: true,
          order: componentIndex,
          sections: dataComponent.sections.map((section, sectionIndex) => ({
            name: section.id,
            visible: true,
            fields: section.fields.map((field, fieldIndex) => ({
              name: field.id,
              visible: submittedValues.templateCheckboxes?.[field.id] ?? false
            }))
          }))
        })
      )
    };

    const [savedDefinition] = await save<FormTemplate>(
      [{ resource: formTemplate, type: "form-template" }],
      { apiBaseUrl: "/collection-api" }
    );

    await moveToNextPage();
  }

  const buttonBarContent = (
    <>
      <BackButton
        entityId={id}
        className="me-auto"
        entityLink="/collection/form-template"
        byPassView={true}
      />

      {id && (
        <DeleteButton
          id={id}
          options={{ apiBaseUrl: "/collection-api" }}
          postDeleteRedirect="/collection/form-template/list"
          type="form-template"
          className="me-5"
        />
      )}

      <SubmitButton />
    </>
  );

  return (
    <DinaForm initialValues={initialValues} onSubmit={onSaveTemplateSubmit}>
      <PageLayout titleId={pageTitle} buttonBarContent={buttonBarContent}>
        {/* Form Template Specific Configuration */}
        <div className="container-fluid px-0">
          <FieldSet
            className="workflow-main-details"
            legend={<DinaMessage id="configureFormTemplate" />}
          >
            <div className="row">
              <div className="col-md-6">
                <TextField name="name" className="row" />
                <GroupSelectField
                  name="group"
                  enableStoredDefaultGroup={true}
                />
              </div>
            </div>
          </FieldSet>
        </div>

        {/* The Material Sample Form in Template Mode */}
        <DinaFormSection isTemplate={true}>
          <MaterialSampleForm
            templateInitialValues={initialValues}
            materialSampleSaveHook={materialSampleSaveHook}
          />
        </DinaFormSection>
      </PageLayout>
    </DinaForm>
  );
}
