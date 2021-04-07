import {
  ButtonBar,
  ColumnDefinition,
  CreateButton,
  dateCell,
  FilterAttribute,
  ListPageLayout
} from "common-ui";
import { GroupSelectField, Head, Nav } from "../../../components";
import { DinaMessage, useDinaIntl } from "../../../intl/dina-ui-intl";
import { PhysicalEntity } from "../../../types/collection-api";

const CATALOGUED_OBJECT_FILTER_ATTRIBUTES: FilterAttribute[] = [
  "dwcCatalogNumber",
  "createdBy",
  {
    name: "createdOn",
    type: "DATE"
  }
];

const CATALOGUED_OBJECT_TABLE_COLUMNS: ColumnDefinition<PhysicalEntity>[] = [
  "dwcCatalogNumber",
  "createdBy",
  dateCell("createdOn")
];

export default function CataloguedObjectListPage() {
  const { formatMessage } = useDinaIntl();

  return (
    <div>
      <Head title={formatMessage("cataloguedObjectListTitle")} />
      <Nav />
      <main className="container-fluid">
        <h1>
          <DinaMessage id="cataloguedObjectListTitle" />
        </h1>
        <ButtonBar>
          <CreateButton entityLink="/collection/catalogued-object" />
        </ButtonBar>
        <ListPageLayout
          additionalFilters={filterForm => ({
            // Apply group filter:
            ...(filterForm.group && { rsql: `group==${filterForm.group}` })
          })}
          filterAttributes={CATALOGUED_OBJECT_FILTER_ATTRIBUTES}
          id="physical-entity-list"
          queryTableProps={{
            columns: CATALOGUED_OBJECT_TABLE_COLUMNS,
            path: "collection-api/physical-entity"
          }}
          filterFormchildren={({ submitForm }) => (
            <div className="form-group">
              <div style={{ width: "300px" }}>
                <GroupSelectField
                  onChange={() => setImmediate(submitForm)}
                  name="group"
                  showAnyOption={true}
                />
              </div>
            </div>
          )}
        />
      </main>
    </div>
  );
}
