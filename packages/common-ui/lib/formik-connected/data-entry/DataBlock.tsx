import { DataRow, VocabularySelectField } from "../../../../dina-ui/components";
import { FieldArray } from "formik";
import {
  FieldWrapperProps,
  SelectField,
  TextField
} from "../../../../common-ui/lib";
import Button from "react-bootstrap/Button";
import { DinaMessage } from "../../../../dina-ui/intl/dina-ui-intl";

export interface DataBlockProps extends FieldWrapperProps {
  blockOptions?: any[];
  vocabularyOptionsPath?: string;
  /** The model type to select resources from. */
  model?: string;
  unitsOptions?: any[];
  blockIndex: number;
  removeBlock?: (index) => void;
  typeOptions: any[];
}

export function DataBlock({
  blockOptions,
  vocabularyOptionsPath,
  model,
  unitsOptions,
  blockIndex,
  removeBlock,
  typeOptions,
  ...props
}: DataBlockProps) {
  return (
    <div>
      <FieldArray name={`${props.name}[${blockIndex}].rows`}>
        {(fieldArrayProps) => {
          const rows: [] =
            fieldArrayProps.form.values[props.name][blockIndex].rows;
          function addRow() {
            fieldArrayProps.push({});
          }

          function removeRow(rowIndex) {
            fieldArrayProps.remove(rowIndex);
          }

          return (
            <div>
              {rows?.length > 0 ? (
                <div
                  className="border"
                  style={{ padding: 15, marginBottom: "2rem" }}
                >
                  <div className="d-inline-flex align-items-center">
                    {blockOptions && (
                      <div style={{ width: "15rem" }}>
                        <SelectField
                          options={blockOptions}
                          name={`${props.name}[${blockIndex}].select`}
                          removeBottomMargin={true}
                          removeLabel={true}
                        />
                      </div>
                    )}
                    {vocabularyOptionsPath && (
                      <VocabularySelectField
                        path={vocabularyOptionsPath}
                        name={`${props.name}[${blockIndex}].select`}
                        removeLabel={true}
                      />
                    )}
                    {!blockOptions && !vocabularyOptionsPath && (
                      <TextField
                        name={`${props.name}[${blockIndex}].select`}
                        removeLabel={true}
                      />
                    )}
                    <div style={{ marginLeft: "2rem" }}>
                      <DinaMessage id="dataType" />
                    </div>
                    <div style={{ marginLeft: "15.5rem" }}>
                      <DinaMessage id="dataValue" />
                    </div>

                    {unitsOptions && (
                      <div style={{ marginLeft: "15.2rem" }}>
                        <DinaMessage id="unit" />
                      </div>
                    )}
                  </div>
                  {rows.map((_, rowIndex) => {
                    return (
                      <DataRow
                        readOnly={false}
                        showPlusIcon={true}
                        name={`${fieldArrayProps.name}`}
                        key={rowIndex}
                        rowIndex={rowIndex}
                        addRow={addRow}
                        removeRow={removeRow}
                        model={model}
                        unitsOptions={unitsOptions}
                        typeOptions={typeOptions}
                      />
                    );
                  })}
                  <div className="d-flex align-items-center justify-content-between">
                    <Button onClick={() => removeBlock?.(blockIndex)}>
                      <DinaMessage id="deleteButtonText" />
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        }}
      </FieldArray>
    </div>
  );
}
