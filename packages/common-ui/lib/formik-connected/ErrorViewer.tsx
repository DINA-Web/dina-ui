import { flatten } from "flat";
import { useFormikContext } from "formik";
import { compact, toPairs } from "lodash";
import { useMemo } from "react";
import { useFieldLabels } from "../field-header/FieldHeader";

/** Renders the Formik status as an error message. */
export function ErrorViewer() {
  // "status" is the form-level error, and
  // "errors" are the field-level errors.
  const { isSubmitting, errors, status } = useFormikContext();
  const { getFieldLabel } = useFieldLabels();

  /** Start array indexes at 1 e.g. The user should see Determination 1 instead of Determination 0. */
  function transformKey(key: string) {
    const asInt = parseInt(key, 10);
    if (!isNaN(asInt)) {
      return String(asInt + 1);
    }
    return getFieldLabel({ name: key }).fieldLabel || key;
  }

  /** A string of form-level and field-level error messages. */
  const errorMessages = useMemo(
    () => {
      const fieldErrors = toPairs(flatten(errors, { transformKey })).map(
        ([field, error], index) => {
          // Return null if the error is not renderable:
          if (
            !error ||
            (typeof error !== "string" && typeof error !== "function")
          ) {
            return null;
          }

          // The error can be a renderable component:
          const JSXError = typeof error === "function" && error;

          const { fieldLabel } = getFieldLabel({ name: field });
          return (
            <div className="error-message" key={index}>
              {index + 1} : {fieldLabel} - {JSXError ? <JSXError /> : error}
            </div>
          );
        }
      );

      const formError = status ? (
        <div className="error-message" key="form-error">
          {status}
        </div>
      ) : null;

      return compact([formError, ...fieldErrors]);
    },
    // Update the form-level error message on form submit or when errors change:
    [isSubmitting, errors, status]
  );

  return (
    <div className="error-viewer">
      {errorMessages.length ? (
        <div className="alert alert-danger" role="status">
          {errorMessages.map((msg, idx) => (
            <div key={idx}>{msg}</div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Scrolls the user's browser to the error message. */
export function scrollToError() {
  setImmediate(() => {
    // Scroll to error message:
    const invalidField =
      document?.querySelector?.(".is-invalid") ??
      document?.querySelector?.(".error-message");
    invalidField?.scrollIntoView?.({
      behavior: "auto",
      block: "center",
      inline: "center"
    });
  });
}
