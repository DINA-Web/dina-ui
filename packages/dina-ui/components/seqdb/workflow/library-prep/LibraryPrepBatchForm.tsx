import {
  DateField,
  DinaForm,
  DinaFormOnSubmit,
  filterBy,
  NumberField,
  ResourceSelectField,
  SubmitButton,
  TextField
} from "common-ui";
import {
  Chain,
  ChainStepTemplate,
  ContainerType,
  IndexSet,
  LibraryPrepBatch,
  PcrProfile,
  Product,
  Protocol,
  StepResource
} from "../../../../types/seqdb-api";

interface LibraryPrepBatchFormProps {
  chain: Chain;
  libraryPrepBatch?: LibraryPrepBatch;
  onSuccess: () => void;
  step: ChainStepTemplate;
}

export function LibraryPrepBatchForm({
  chain,
  libraryPrepBatch,
  onSuccess,
  step
}: LibraryPrepBatchFormProps) {
  const onSubmit: DinaFormOnSubmit = async ({
    api: { save },
    submittedValues
  }) => {
    if (submittedValues.product) {
      submittedValues.product.type = "product";
    }
    if (submittedValues.protocol) {
      submittedValues.protocol.type = "protocol";
    }

    const [newLibraryPrepBatch] = await save(
      [
        {
          resource: submittedValues,
          type: "libraryPrepBatch"
        }
      ],
      { apiBaseUrl: "/seqdb-api" }
    );

    // Only add a new stepResource if the LibraryPrepBatch is new.
    if (!submittedValues.id) {
      const newStepResource: StepResource = {
        chain,
        chainStepTemplate: step,
        libraryPrepBatch: newLibraryPrepBatch as LibraryPrepBatch,
        type: "stepResource",
        value: "LIBRARY_PREP_BATCH"
      };

      await save(
        [
          {
            resource: newStepResource,
            type: "stepResource"
          }
        ],
        { apiBaseUrl: "/seqdb-api" }
      );
    }

    onSuccess();
  };

  return (
    <DinaForm initialValues={libraryPrepBatch || {}} onSubmit={onSubmit}>
      <div className="row">
        <TextField
          className="col-md-2"
          label="Library Prep Batch Name"
          name="name"
        />
        <DateField className="col-md-2" name="dateUsed" />
      </div>
      <div className="row">
        <ResourceSelectField<Product>
          className="col-md-2"
          name="product"
          filter={filterBy(["name"])}
          model="seqdb-api/product"
          optionLabel={product => product.name}
        />
        <ResourceSelectField<Protocol>
          className="col-md-2"
          name="protocol"
          filter={filterBy(["name"])}
          model="seqdb-api/protocol"
          optionLabel={protocol => protocol.name}
        />
        <ResourceSelectField<ContainerType>
          className="col-md-2"
          name="containerType"
          filter={filterBy(["name"])}
          model="seqdb-api/containerType"
          optionLabel={ct => ct.name}
        />
        <ResourceSelectField<PcrProfile>
          className="col-md-2"
          name="thermocyclerProfile"
          filter={filterBy(["name"])}
          model="seqdb-api/thermocyclerprofile"
          optionLabel={profile => profile.name}
        />
        <ResourceSelectField<IndexSet>
          className="col-md-2"
          name="indexSet"
          filter={filterBy(["name"])}
          model="seqdb-api/indexSet"
          optionLabel={set => set.name}
        />
      </div>
      <div className="row">
        <NumberField className="col-md-2" name="totalLibraryYieldNm" />
      </div>
      <div className="row">
        <TextField className="col-md-6" name="yieldNotes" multiLines={true} />
      </div>
      <div className="row">
        <TextField className="col-md-6" name="cleanUpNotes" multiLines={true} />
        <TextField className="col-md-6" name="notes" multiLines={true} />
      </div>
      <SubmitButton />
    </DinaForm>
  );
}
