import {
  ButtonBar,
  ColumnDefinition,
  CreateButton,
  ListPageLayout
} from "common-ui";
import Link from "next/link";
import { groupCell, Head, Nav } from "../../../components";
import { SeqdbMessage, useSeqdbIntl } from "../../../intl/seqdb-intl";
import { Region } from "../../../types/seqdb-api/resources/Region";

const REGION_TABLE_COLUMNS: ColumnDefinition<Region>[] = [
  {
    Cell: ({ original: { id, name } }) => (
      <Link href={`/seqdb/region/view?id=${id}`}>
        <a>{name}</a>
      </Link>
    ),
    accessor: "name"
  },
  groupCell("group"),
  "description",
  "symbol"
];

const REGION_FILTER_ATTRIBUTES = ["name", "description", "symbol"];

export default function RegionListPage() {
  const { formatMessage } = useSeqdbIntl();

  return (
    <>
      <Head title={formatMessage("regionListTitle")} />
      <Nav />
      <ButtonBar>
        <CreateButton entityLink="/seqdb/region" />
      </ButtonBar>
      <main className="container-fluid">
        <h1 id="wb-cont">
          <SeqdbMessage id="regionListTitle" />
        </h1>
        <ListPageLayout
          filterAttributes={REGION_FILTER_ATTRIBUTES}
          id="region-list"
          queryTableProps={{
            columns: REGION_TABLE_COLUMNS,
            path: "seqdb-api/region"
          }}
        />
      </main>
    </>
  );
}
