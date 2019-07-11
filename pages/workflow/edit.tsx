import { Form, Formik, FormikActions } from "formik";
import { SingletonRouter, withRouter, WithRouterProps } from "next/router";
import { useContext } from "react";
import {
  ApiClientContext,
  ErrorViewer,
  Head,
  LoadingSpinner,
  Nav,
  Query,
  ResourceSelectField,
  SubmitButton,
  TextField
} from "../../components";
import { Group } from "../../types/seqdb-api/resources/Group";
import { filterBy } from "../../util/rsql";
import { serialize } from "../../util/serialize";

interface ChainFormProps {
  chain?: any;
  router: SingletonRouter;
}

export function ChainEditPage({ router }: WithRouterProps) {
  const { id } = router.query;

  return (
    <div>
      <Head title="Edit Workflow" />
      <Nav />
      <div className="container-fluid">
        {id ? (
          <div>
            <h1>Edit Workflow</h1>
            <Query<any>
              query={{ include: "chainTemplate,group", path: `workflow/${id}` }}
            >
              {({ loading, response }) => (
                <div>
                  <LoadingSpinner loading={loading} />
                  {response && (
                    <ChainForm chain={response.data} router={router} />
                  )}
                </div>
              )}
            </Query>
          </div>
        ) : (
          <div>
            <h1>Add Workflow</h1>
            <ChainForm router={router} />
          </div>
        )}
      </div>
    </div>
  );
}

function ChainForm({ chain, router }: ChainFormProps) {
  const { doOperations } = useContext(ApiClientContext);

  const initialValues = chain || {};

  async function onSubmit(
    submittedValues,
    { setStatus, setSubmitting }: FormikActions<any>
  ) {
    try {
      // Current date as yyyy-mm-dd string.
      const dateCreated = new Date().toISOString().split('T')[0];
      submittedValues.dateCreated = dateCreated;

      const serialized = await serialize({
        resource: submittedValues,
        type: "chain"
      });

      const op = submittedValues.id ? "PATCH" : "POST";

      if (op === "POST") {
        serialized.id = -100;
      }

      const response = await doOperations([
        {
          op,
          path: op === "PATCH" ? `chain/${chain.id}` : "chain",
          value: serialized
        }
      ]);

      const newId = response[0].data.id;
      router.push(`/workflow/view?id=${newId}`);
    } catch (error) {
      setStatus(error.message);
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="container-fluid">
        <Formik initialValues={initialValues} onSubmit={onSubmit}>
          <Form>
            <ErrorViewer />
            <div className="row">
              <ResourceSelectField<any>
                className="col-md-2"
                name="chainTemplate"
                filter={filterBy(["name"])}
                model="chainTemplate"
                optionLabel={template => template.name}
              />
            </div>
            <div className="row">
              <ResourceSelectField<Group>
                className="col-md-2"
                name="group"
                filter={filterBy(["groupName"])}
                model="group"
                optionLabel={group => group.groupName}
              />
            </div>
            <div className="row">
              <TextField className="col-md-2" name="name" />
            </div>
            <SubmitButton />
          </Form>
        </Formik>
      </div>
    </div>
  );
}

export default withRouter(ChainEditPage);
