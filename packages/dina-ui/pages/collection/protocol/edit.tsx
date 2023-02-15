import {
  ApiClientContext,
  BackButton,
  ButtonBar,
  DinaForm,
  DinaFormOnSubmit,
  SubmitButton,
  TextField,
  useQuery,
  withResponse,
  useDinaFormContext
} from "common-ui";
import { InputResource, PersistedResource } from "kitsu";
import { fromPairs, toPairs } from "lodash";
import { useRouter } from "next/router";
import { ProtocolsField } from "packages/dina-ui/components/collection/ProtocolDataField";
import { useContext } from "react";
import {
  GroupSelectField,
  Head,
  Nav,
  AttachmentsField
} from "../../../components";
import { DinaMessage, useDinaIntl } from "../../../intl/dina-ui-intl";
import { Protocol } from "../../../types/collection-api/resources/Protocol";

interface ProtocolFormProps {
  fetchedProtocol?: Protocol;
  onSaved: (protocol: PersistedResource<Protocol>) => Promise<void>;
}

export default function ProtocolEditPage() {
  const router = useRouter();
  const {
    query: { id }
  } = router;
  const { formatMessage } = useDinaIntl();

  async function goToViewPage(protocol: PersistedResource<Protocol>) {
    await router.push(`/collection/protocol/view?id=${protocol.id}`);
  }

  const title = id ? "editProtocolTitle" : "addProtocolTitle";

  const query = useQuery<Protocol>(
    {
      path: `collection-api/protocol/${id}?include=attachments`
    },
    {
      disabled: !id
    }
  );

  return (
    <div>
      <Head title={formatMessage(title)} />
      <Nav />
      <main className="container">
        <div>
          <h1 id="wb-cont">
            <DinaMessage id={title} />
          </h1>
          {id ? (
            withResponse(query, ({ data }) => (
              <ProtocolForm fetchedProtocol={data} onSaved={goToViewPage} />
            ))
          ) : (
            <ProtocolForm onSaved={goToViewPage} />
          )}
        </div>
      </main>
    </div>
  );
}

export interface ProtocolFormValues extends InputResource<Protocol> {
  multilingualDescription?: Record<string, string | undefined>;
}

export function ProtocolForm({ fetchedProtocol, onSaved }: ProtocolFormProps) {
  const { save } = useContext(ApiClientContext);

  const initialValues: ProtocolFormValues = fetchedProtocol
    ? {
        ...fetchedProtocol,
        // Convert multilingualDescription to editable Dictionary format:
        multilingualDescription: fromPairs<string | undefined>(
          fetchedProtocol.multilingualDescription?.descriptions?.map(
            ({ desc, lang }) => [lang ?? "", desc ?? ""]
          )
        )
      }
    : { name: "", type: "protocol", protocolData: [] };

  const onSubmit: DinaFormOnSubmit<ProtocolFormValues> = async ({
    submittedValues
  }) => {
    const input: InputResource<Protocol> = {
      ...submittedValues,
      // Convert the editable format to the stored format:
      multilingualDescription: {
        descriptions: toPairs(submittedValues.multilingualDescription).map(
          ([lang, desc]) => ({ lang, desc })
        )
      }
    };

    // Add attachments if they were selected:
    (input as any).relationships = {
      attachments: {
        data:
          input.attachments?.map((it) => ({
            id: it.id,
            type: it.type
          })) ?? []
      }
    };

    // Delete the 'attachments' attribute because it should stay in the relationships field:
    delete input.attachments;

    const [savedProtocol] = await save<Protocol>(
      [
        {
          resource: input,
          type: "protocol"
        }
      ],
      {
        apiBaseUrl: "/collection-api"
      }
    );
    await onSaved(savedProtocol);
  };

  return (
    <DinaForm<ProtocolFormValues>
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      <ButtonBar>
        <BackButton
          entityId={fetchedProtocol?.id}
          entityLink="/collection/protocol"
        />
        <SubmitButton className="ms-auto" />
      </ButtonBar>
      <ProtocolFormLayout />
    </DinaForm>
  );
}

export function ProtocolFormLayout() {
  const { initialValues } = useDinaFormContext();
  const { formatMessage } = useDinaIntl();

  return (
    <>
      <div className="row">
        <GroupSelectField
          name="group"
          enableStoredDefaultGroup={true}
          className="col-md-6"
        />
      </div>
      <div className="row">
        <TextField
          className="col-md-6 protocolName"
          name="name"
          label={formatMessage("protocolNameLabel")}
        />
      </div>
      <div className="row">
        <TextField
          className="english-description"
          name="multilingualDescription.en"
          label={formatMessage("field_description.en")}
          multiLines={true}
        />
      </div>
      <div className="row">
        <TextField
          className="french-description"
          name="multilingualDescription.fr"
          label={formatMessage("field_description.fr")}
          multiLines={true}
        />
      </div>
      <AttachmentsField
        name="attachments"
        title={<DinaMessage id="protocolAttachments" />}
        id="protocol-attachments-section"
        allowNewFieldName="attachmentsConfig.allowNew"
        allowExistingFieldName="attachmentsConfig.allowExisting"
        attachmentPath={`collection-api/protocol/${initialValues?.id}/attachments`}
        hideAddAttchmentBtn={true}
      />
      <div className="row">
        <ProtocolsField />
      </div>
    </>
  );
}
