import React, { useRef, useState } from "react";
import { RiDeleteBinLine } from "react-icons/ri";
import { FieldWrapper, FieldWrapperProps, FieldWrapperRenderProps, TextField } from "..";
import { MaterialSampleLink } from "../../../dina-ui/components/collection/MaterialSampleAssociationsField";
import { useDinaIntl } from "../../../dina-ui/intl/dina-ui-intl";
import { SampleListLayout } from "../../../dina-ui/pages/collection/material-sample/list";
import { ASSOCIATED_SAMPLE_SEARCH_TYPE_MATERIAL_SAMPLE, ASSOCIATED_SAMPLE_SEARCH_TYPE_NAME_SEARCH, ASSOCIATED_SAMPLE_SEARCH_TYPE_TEXT_STRING, MaterialSample } from "../../../dina-ui/types/collection-api/resources/MaterialSample";
import Select from "react-select";
import { CatalogueOfLifeNameField } from "../../../dina-ui/components/collection";
import { PersistedResource } from "kitsu";
import classNames from "classnames";

export function AssociatedMaterialSampleSearchBoxField(
  props: FieldWrapperProps
) {  
  const { formatMessage } = useDinaIntl();
  type searchTypeValueOptions =
    | typeof ASSOCIATED_SAMPLE_SEARCH_TYPE_NAME_SEARCH
    | typeof ASSOCIATED_SAMPLE_SEARCH_TYPE_MATERIAL_SAMPLE
    | typeof ASSOCIATED_SAMPLE_SEARCH_TYPE_TEXT_STRING;

  const associatedSampleSearchTypeOptions: {
    label: string;
    value: searchTypeValueOptions;
  }[] = [
    {
      label: formatMessage(ASSOCIATED_SAMPLE_SEARCH_TYPE_NAME_SEARCH),
      value: ASSOCIATED_SAMPLE_SEARCH_TYPE_NAME_SEARCH
    },
    {
      label: formatMessage(ASSOCIATED_SAMPLE_SEARCH_TYPE_MATERIAL_SAMPLE),
      value: ASSOCIATED_SAMPLE_SEARCH_TYPE_MATERIAL_SAMPLE
    },
    {
      label: formatMessage(ASSOCIATED_SAMPLE_SEARCH_TYPE_TEXT_STRING),
      value: ASSOCIATED_SAMPLE_SEARCH_TYPE_TEXT_STRING
    }
  ];
  const [showSearchBtn, setShowSearchBtn] = useState(true);
  const [searchType, setSearchType] = useState(
    ASSOCIATED_SAMPLE_SEARCH_TYPE_NAME_SEARCH
  );

  const listRef = useRef<HTMLDivElement>(null);

  function onSearchClicked() {
    if (listRef.current) {
      listRef.current.className = listRef.current.className.replace(
        "d-none",
        ""
      );
    }
  }

  function onCloseClicked() {
    if (listRef.current) {
      listRef.current.className = listRef.current.className + " d-none";
    }
  }

  function onSearchTypeChanged (newValue, _) {
    setSearchType(newValue?.value);
  }

  const customStyle = {
    placeholder: (provided, _) => ({
      ...provided,
      color: "rgb(87,120,94)"
    }),
    menu: base => ({ ...base, zIndex: 1050 })
  };

  return (
    <div>
      <label className="w-100">
        <strong>{formatMessage("associatedMaterialSample")}</strong>{" "}
      </label>
      <div className="list-inline d-flex flex-row gap-2 pt-2">
        <div className="list-inline-item">
          <Select
            options={associatedSampleSearchTypeOptions}
            onChange={onSearchTypeChanged}
            defaultValue={associatedSampleSearchTypeOptions[0]}
            styles={customStyle}
            className="search-type-select"
          />
        </div>
        {searchType === ASSOCIATED_SAMPLE_SEARCH_TYPE_NAME_SEARCH && (
          <div className="list-inline-item">
            <CatalogueOfLifeNameField name={props.name} removeLabel={true} />
          </div>
        )}
        {searchType === ASSOCIATED_SAMPLE_SEARCH_TYPE_MATERIAL_SAMPLE &&
          <FieldWrapper {...props} hideLabel={true} disableLabelClick={true}>
            {({ setValue, value }) => {
              function onAssociatedSampleSelected(
                sample: PersistedResource<MaterialSample>
              ) {
                setValue(sample.id);
                setShowSearchBtn(false);
              }

              /** Clear the input value */
              function removeEntry() {
                setValue(null);
                if (listRef.current) {
                  listRef.current.className =
                    listRef.current.className.replaceAll("d-none", "");
                }
              }
              return (
                <div className="row">
                  {showSearchBtn ? (
                    <button
                      type="button"
                      className="btn btn-secondary searchSample"
                      onClick={() => onSearchClicked()}
                    >
                      {formatMessage("search") + "..."}
                    </button>
                  ) : (
                    <div className={"d-flex flex-row"}>
                      <div
                        className="flex-md-grow-1 form-control associated-sample-link"
                        style={{ backgroundColor: "#e9ecef" }}
                      >
                        {value && <MaterialSampleLink id={value} />}
                      </div>
                      <button
                        className="btn mb-2"
                        onClick={removeEntry}
                        type="button"
                        style={{
                          cursor: "pointer"
                        }}
                      >
                        <RiDeleteBinLine size="1.8em" className="ms-auto" />
                      </button>
                    </div>
                  )}
                  <div
                    ref={listRef}
                    className={classNames("p-2 mt-2 d-none")}
                    style={{ borderStyle: "dashed" }}
                  >
                    <div className="mb-4">
                      <span
                        className="me-2 fw-bold"
                        style={{ fontSize: "1.2em" }}
                      >
                        {formatMessage("search")}
                      </span>
                      <button
                        className="btn btn-dark"
                        type="button"
                        onClick={onCloseClicked}
                      >
                        {formatMessage("closeButtonText")}
                      </button>
                    </div>
                    <SampleListLayout
                      onSelect={onAssociatedSampleSelected}
                      classNames="btn btn-primary associated-sample-search"
                      btnMsg={formatMessage("select")}
                      hideTopPagination={true}
                      hideGroupFilter={true}
                    />
                  </div>
                </div>
              );
            }}
          </FieldWrapper>}
        

        {searchType === ASSOCIATED_SAMPLE_SEARCH_TYPE_TEXT_STRING && (
          <TextField
            className="col-md-4"
            removeLabel={true}
            name={props.name}
          />
        )}
      </div>
    </div>
  );
}
