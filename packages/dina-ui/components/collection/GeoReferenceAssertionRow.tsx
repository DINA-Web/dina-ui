import { DateField, NumberField, FieldView, TextField } from "common-ui";
import { useDinaIntl } from "../../intl/dina-ui-intl";
import { GeoReferenceAssertion } from "../../types/collection-api/resources/GeoReferenceAssertion";

export interface GeoReferenceAssertionRowProps {
  index: number;
  assertion?: GeoReferenceAssertion;
  onAddClick?: () => void;
  onRemoveClick?: () => void;
  viewOnly?: boolean;
}

export function GeoReferenceAssertionRow({
  index,
  onAddClick,
  onRemoveClick,
  viewOnly
}: GeoReferenceAssertionRowProps) {
  const { formatMessage } = useDinaIntl();
  return (
    <>
      {viewOnly ? (
        <div className="row">
          <div className="col-md-6">
            <FieldView
              name={`geoReferenceAssertions[${index}].dwcDecimalLatitude`}
              label={formatMessage("decimalLatitude")}
              className={"dwcDecimalLatitude"}
            />
            <FieldView
              name={`geoReferenceAssertions[${index}].dwcDecimalLongitude`}
              label={formatMessage("decimalLongitude")}
              className={"dwcDecimalLongitude"}
            />
            <FieldView
              name={`geoReferenceAssertions[${index}].dwcCoordinateUncertaintyInMeters`}
              label={formatMessage("coordinateUncertaintyInMeters")}
              className={"dwcCoordinateUncertaintyInMeters"}
            />
            <FieldView
              name={`geoReferenceAssertions[${index}].dwcGeoreferencedDate`}
              className={"dwcGeoreferencedDate"}
              label={formatMessage("georeferencedDateLabel")}
            />
          </div>
          <div className="col-md-6">
            <FieldView
              name={`geoReferenceAssertions[${index}].literalGeoreferencedBy`}
              className={"literalGeoreferencedBy"}
              label={formatMessage("literalGeoreferencedByLabel")}
            />
            <FieldView
              name={`geoReferenceAssertions[${index}].dwcGeoreferenceProtocol`}
              className={"dwcGeoreferenceProtocol"}
              tooltipKey={"field_dwcGeoreferenceProtocol_tooltip"}
            />
            <FieldView
              name={`geoReferenceAssertions[${index}].dwcGeoreferenceSources`}
              className={"dwcGeoreferenceSources"}
              tooltipKey={"field_dwcGeoreferenceSources_tooltip"}
            />
            <FieldView
              name={`geoReferenceAssertions[${index}].dwcGeoreferenceRemarks`}
              className={"dwcGeoreferenceRemarks"}
              tooltipKey={"field_dwcGeoreferenceRemarks_tooltip"}
            />
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-md-6">
            <NumberField
              name={`geoReferenceAssertions[${index}].dwcDecimalLatitude`}
              label={formatMessage("decimalLatitude")}
              className={"dwcDecimalLatitude"}
            />
            <NumberField
              name={`geoReferenceAssertions[${index}].dwcDecimalLongitude`}
              label={formatMessage("decimalLongitude")}
              readOnly={viewOnly}
              className={"dwcDecimalLongitude"}
            />
            <NumberField
              name={`geoReferenceAssertions[${index}].dwcCoordinateUncertaintyInMeters`}
              label={formatMessage("coordinateUncertaintyInMeters")}
              readOnly={viewOnly}
              className={"dwcCoordinateUncertaintyInMeters"}
            />
            <DateField
              name={`geoReferenceAssertions[${index}].dwcGeoreferencedDate`}
              className={"dwcGeoreferencedDate"}
              label={formatMessage("georeferencedDateLabel")}
              withZone={true}
            />
          </div>

          <div className="col-md-6">
            <TextField
              name={`geoReferenceAssertions[${index}].literalGeoreferencedBy`}
              className={"literalGeoreferencedBy"}
              label={formatMessage("literalGeoreferencedByLabel")}
            />
            <TextField
              name={`geoReferenceAssertions[${index}].dwcGeoreferenceProtocol`}
              className={"dwcGeoreferenceProtocol"}
              tooltipKey={"field_dwcGeoreferenceProtocol_tooltip"}
            />
            <TextField
              name={`geoReferenceAssertions[${index}].dwcGeoreferenceSources`}
              className={"dwcGeoreferenceSources"}
              tooltipKey={"field_dwcGeoreferenceSources_tooltip"}
            />
            <TextField
              name={`geoReferenceAssertions[${index}].dwcGeoreferenceRemarks`}
              className={"dwcGeoreferenceRemarks"}
              tooltipKey={"field_dwcGeoreferenceRemarks_tooltip"}
            />
          </div>
        </div>
      )}
      <div className="list-inline-item d-none">
        <button
          className="btn btn-primary add-assertion-button"
          type="button"
          onClick={onAddClick}
        >
          +
        </button>
      </div>
      <div className="list-inline-item d-none">
        <button
          className="btn btn-primary"
          type="button"
          onClick={onRemoveClick}
        >
          -
        </button>
      </div>{" "}
    </>
  );
}
