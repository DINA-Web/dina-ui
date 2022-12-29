import {
  EditableTable,
  EditableTableColumnDefinition,
  useDinaFormContext
} from "common-ui";
import { Card } from "react-bootstrap";
import { SeqdbMessage } from "../../../intl/seqdb-intl";
import {
  SequencingFacilityContactVO,
  SequencingFacilityVO
} from "../../../types/seqdb-api";

export interface SequencingFacilityProps {
  formValues: SequencingFacilityVO;
}

const CONTACT_COLUMNS: EditableTableColumnDefinition<SequencingFacilityContactVO>[] =
  [
    {
      accessor: "name",
      Header: () => <SeqdbMessage id="field_name" />
    },
    {
      accessor: "roles",
      Header: () => <SeqdbMessage id="field_role" />
    },
    {
      accessor: "info",
      Header: () => <SeqdbMessage id="field_contactInfo" />
    }
  ];

export const SequencingFacilityContacts = ({
  formValues
}: SequencingFacilityProps) => {
  const { readOnly } = useDinaFormContext();
  return (
    <Card>
      <Card.Header>
        <SeqdbMessage id="sequencingFacilityContacts" />
      </Card.Header>
      <Card.Body>
        <EditableTable<SequencingFacilityContactVO>
          fieldName="contacts"
          columns={CONTACT_COLUMNS}
          data={formValues.contacts || []}
          readOnly={readOnly}
        />
      </Card.Body>
    </Card>
  );
};
