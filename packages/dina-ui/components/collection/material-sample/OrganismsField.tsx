import {
  FieldSet,
  FormikButton,
  NumberField,
  useDinaFormContext,
  useFieldLabels
} from "common-ui";
import { FieldArray } from "formik";
import { get } from "lodash";
import { useState } from "react";
import ReactTable, { Column } from "react-table";
import { OrganismStateField } from "..";
import { BulkEditTabWarning } from "../..";
import { DinaMessage, useDinaIntl } from "../../../intl/dina-ui-intl";
import { Organism } from "../../../types/collection-api/resources/Organism";
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  SortEnd
} from "react-sortable-hoc";
import { MdDragHandle } from "react-icons/md";
import classNames from "classnames";

export interface OrganismsFieldProps {
  /** Organism array field name. */
  name: string;
  /** FieldSet id */
  id?: string;
}

export function OrganismsField({ name, id }: OrganismsFieldProps) {
  const { isTemplate } = useDinaFormContext();

  return (
    <FieldSet
      id={id}
      className="organisms-section"
      fieldName={name}
      legend={<DinaMessage id="organism" />}
    >
      <BulkEditTabWarning
        targetType="material-sample"
        fieldName={name}
        setDefaultValue={ctx => {
          // Auto-create the first organism:
          ctx.bulkEditFormRef?.current?.setFieldValue("organismsQuantity", 1);
          ctx.bulkEditFormRef?.current?.setFieldValue(name, [{}]);
        }}
      >
        <FieldArray name={name}>
          {({ form, remove, move }) => {
            const organismsQuantity =
              Number(form.values.organismsQuantity) || 1;
            const organisms: (Organism | null | undefined)[] =
              get(form.values, name) || [];

            function removeOrganism(index: number) {
              remove(index);
              form.setFieldValue("organismsQuantity", organismsQuantity - 1);
            }

            return (
              <div>
                {!isTemplate && (
                  <div className="row">
                    <NumberField
                      name="organismsQuantity"
                      className="col-sm-6"
                    />
                  </div>
                )}
                <OrganismsTable
                  namePrefix={name}
                  organisms={organisms}
                  organismsQuantity={organismsQuantity}
                  onRemoveClick={removeOrganism}
                  onRowMove={move}
                />
              </div>
            );
          }}
        </FieldArray>
      </BulkEditTabWarning>
    </FieldSet>
  );
}

interface OrganismsTableProps {
  organismsQuantity: number;
  organisms: (Organism | null | undefined)[];
  namePrefix: string;
  onRemoveClick: (index: number) => void;
  onRowMove: (from: number, to: number) => void;
}

function OrganismsTable({
  organismsQuantity,
  organisms,
  namePrefix,
  onRemoveClick,
  onRowMove
}: OrganismsTableProps) {
  const { formatMessage } = useDinaIntl();
  const { getFieldLabel } = useFieldLabels();
  const { isTemplate, readOnly, initialValues } = useDinaFormContext();

  const initialLength = Number(get(initialValues, namePrefix)?.length) || 1;

  const allExpandedInitially = [...new Array(initialLength)].reduce<
    Record<number, boolean>
  >((prev, _, index) => ({ ...prev, [index]: true }), {});

  const initialExpanded: Record<number, boolean> = readOnly
    ? allExpandedInitially
    : { 0: organismsQuantity === 1 };

  const [expanded, setExpanded] = useState(initialExpanded);

  function handleRemoveClick(index: number) {
    setExpanded({});
    onRemoveClick(index);
  }

  function onExpandedChange(newExpanded: Record<number, boolean>) {
    // Disable expand change in template mode:
    if (isTemplate) {
      return;
    }
    setExpanded(newExpanded);
  }

  function onSortStart(_, event: unknown) {
    setExpanded({});
    if (event instanceof MouseEvent) {
      document.body.style.cursor = "grabbing";
    }
  }

  function onSortEnd(se: SortEnd) {
    document.body.style.cursor = "default";
    onRowMove(se.oldIndex, se.newIndex);
  }

  const tableColumns: Column<Organism>[] = [
    ...(readOnly
      ? []
      : [
          {
            Header: "Sort",
            Cell: () => <RowSortHandle />,
            width: 60
          }
        ]),
    {
      id: "determination",
      accessor: o => {
        const primaryDet = o?.determination?.find(it => it.isPrimary);
        const { scientificName, verbatimScientificName } = primaryDet ?? {};

        const cellText = verbatimScientificName || scientificName;
        return cellText;
      },
      Header: formatMessage("determinationPrimary")
    },
    ...["lifeStage", "sex"].map<Column<Organism>>(accessor => ({
      accessor,
      Header: getFieldLabel({ name: accessor }).fieldLabel
    })),
    {
      Header: "",
      Cell: ({ index }) => (
        <>
          {!isTemplate && !readOnly && (
            <FormikButton
              className="btn btn-dark"
              onClick={() => handleRemoveClick(index)}
            >
              <DinaMessage id="removeOrganism" />
            </FormikButton>
          )}
        </>
      )
    }
  ];

  /** Only show up to the organismsQuantity number */
  const visibleTableData: Organism[] = [...new Array(organismsQuantity)].map(
    (_, index) => organisms[index] || { type: "organism" }
  );

  return (
    <>
      <style>{`
        .rt-expandable, .rt-th:first-child {
          min-width: 12rem !important;
        }
      `}</style>
      <ReactTable
        columns={tableColumns}
        data={visibleTableData}
        sortable={false}
        minRows={organismsQuantity}
        ExpanderComponent={({ isExpanded }) => (
          <button
            className={classNames(
              "btn btn-light expand-organism",
              `${isExpanded ? "is" : "not"}-expanded`
            )}
            style={{ pointerEvents: "none", backgroundColor: "inherit" }}
          >
            <span>
              <strong>
                <DinaMessage id="showHide" />
              </strong>
            </span>
            <span className={`rt-expander ${isExpanded ? "-open" : false}`}>
              •
            </span>
          </button>
        )}
        expanded={expanded}
        TbodyComponent={TbodyComponent}
        getTbodyProps={() => ({ onSortStart, onSortEnd })}
        onExpandedChange={onExpandedChange}
        SubComponent={row => {
          const isOdd = (row.index + 1) % 2 === 1;

          // Add zebra striping to the subcomponent background:
          const backgroundColor = isOdd ? "rgba(0,0,0,0.03)" : undefined;

          return (
            <div style={{ backgroundColor }}>
              <OrganismStateField namePrefix={`${namePrefix}[${row.index}].`} />
            </div>
          );
        }}
        className="-striped"
      />
    </>
  );
}

function TbodyComponent(props) {
  return (
    <SortableTBody
      onSortStart={props.onSortStart}
      onSortEnd={props.onSortEnd}
      helperClass="d-flex"
      useDragHandle={true}
      axis="y"
      {...props}
    />
  );
}

const SortableTBody = SortableContainer(({ children, ...bodyProps }) => {
  const [rows, otherChildren] = children;
  const { readOnly } = useDinaFormContext();

  return (
    <div {...bodyProps} className="rt-tbody">
      {rows.map((row, index) => (
        <SortableTRow
          key={row.key}
          {...row.props}
          disabled={readOnly}
          index={index}
        />
      ))}
      {otherChildren}
    </div>
  );
});

const SortableTRow = SortableElement(({ children }) => <>{children}</>);

const RowSortHandle = SortableHandle(() => (
  <MdDragHandle cursor="grab" size="3em" />
));
