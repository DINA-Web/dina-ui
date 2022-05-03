import {
  ButtonBar,
  CreateButton,
  dateCell,
  stringArrayCell,
  TableColumn,
  QueryPage,
  BooleanCell
} from "common-ui";
import Link from "next/link";
import { Transaction } from "packages/dina-ui/types/loan-transaction-api";
import { Footer, Head, Nav } from "../../../components";
import { DinaMessage, useDinaIntl } from "../../../intl/dina-ui-intl";

const TABLE_COLUMNS: TableColumn<Transaction>[] = [
  {
    Cell: ({ original: { data, id } }) => (
      <Link href={`/loan-transaction/transaction/view?id=${id}`}>
        <a>{data?.attributes?.transactionNumber || id}</a>
      </Link>
    ),
    label: "transactionNumber",
    accessor: "data.attributes.transactionNumber",
    isKeyword: true
  },
  {
    label: "transactionType",
    accessor: "data.attributes.transactionType",
    isKeyword: true
  },
  {
    label: "materialDirection",
    accessor: "data.attributes.materialDirection",
    isKeyword: true
  },
  stringArrayCell("otherIdentifiers", "data.attributes.otherIdentifiers"),
  BooleanCell("materialToBeReturned", "data.attributes.materialToBeReturned"),
  {
    label: "purpose",
    accessor: "data.attributes.purpose",
    isKeyword: true
  },
  {
    label: "status",
    accessor: "data.attributes.status",
    isKeyword: true
  },
  dateCell("openedDate", "data.attributes.openedDate"),
  dateCell("closedDate", "data.attributes.closedDate"),
  dateCell("dueDate", "data.attributes.dueDate")
];

export default function TransactionListPage() {
  const { formatMessage } = useDinaIntl();

  return (
    <div>
      <Head title={formatMessage("transactions")} />
      <Nav />
      <main className="container-fluid">
        <h1 id="wb-cont">
          <DinaMessage id="transactions" />
        </h1>
        <ButtonBar>
          <CreateButton entityLink="/loan-transaction/transaction" />
        </ButtonBar>
        <QueryPage
          indexName={"dina_loan_transaction_index"}
          columns={TABLE_COLUMNS}
        />
      </main>
      <Footer />
    </div>
  );
}
