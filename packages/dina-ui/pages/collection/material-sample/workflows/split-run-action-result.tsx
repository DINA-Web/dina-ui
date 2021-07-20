import { Nav } from "../../../../../dina-ui/components/button-bar/nav/nav";
import { Head } from "../../../../../dina-ui/components/head";
import {
  DinaMessage,
  useDinaIntl
} from "../../../../../dina-ui/intl/dina-ui-intl";
import React from "react";
import Link from "next/link";
import useLocalStorage from "@rehooks/local-storage";
import { MaterialSampleRunActionResult } from "../../../../../dina-ui/types/collection-api/resources/MaterialSampleRunActionResult";
import { SPLIT_CHILD_SAMPLE_RUN_ACTION_RESULT_KEY } from "./split-run";
import { MaterialSampleRunConfig } from "../../../../../dina-ui/types/collection-api/resources/MaterialSampleRunConfig";
import { SPLIT_CHILD_SAMPLE_RUN_CONFIG_KEY } from "./split-config";
import {
  ButtonBar,
  ColumnDefinition,
  dateCell,
  DinaForm,
  ListPageLayout,
  stringArrayCell
} from "../../../../../common-ui/lib";
import { useRouter } from "next/router";
import { MaterialSample } from "packages/dina-ui/types/collection-api";

export default function SplitRunActionResult() {
  const { formatMessage } = useDinaIntl();
  const router = useRouter();

  const [splitChildSampleRunActionResult] = useLocalStorage<
    MaterialSampleRunActionResult | null | undefined
  >(SPLIT_CHILD_SAMPLE_RUN_ACTION_RESULT_KEY);

  const [splitChildSampleRunConfig, _setSplitChildSampleRunConfig] =
    useLocalStorage<MaterialSampleRunConfig | null | undefined>(
      SPLIT_CHILD_SAMPLE_RUN_CONFIG_KEY
    );

  const buttonBar = (
    <ButtonBar className="justify-content-center">
      <Link href="/collection/material-sample/workflows/split-config">
        <a className="btn btn-info">
          <DinaMessage id="startNewRunConfigLabel" />
        </a>
      </Link>
    </ButtonBar>
  );

  const MATERIAL_SAMPLE_TABLE_COLUMNS: ColumnDefinition<MaterialSample>[] = [
    {
      Cell: ({
        original: { id, materialSampleName, dwcOtherCatalogNumbers }
      }) => (
        <Link href={`/collection/material-sample/view?id=${id}`}>
          {materialSampleName || dwcOtherCatalogNumbers?.join?.(", ") || id}
        </Link>
      ),
      accessor: "materialSampleName"
    },
    { accessor: "materialSampleType.name" },
    dateCell("createdOn")
  ];

  return (
    <div>
      <Head title={formatMessage("workflowCompleteTitle")} />
      <Nav />
      <main className="container-fluid ">
        <h1>
          <DinaMessage id="workflowCompleteTitle" />
        </h1>

        <DinaForm initialValues={{}}>
          <h3>{formatMessage("results")}:</h3>
          <div className="fw-bold">
            {formatMessage("originalMaterialSampleLabel")}:
          </div>
          <span className="">
            {splitChildSampleRunActionResult?.parentSampleId ? (
              <span className="mx-3">
                <Link
                  href={`/collection/material-sample/view?id=${splitChildSampleRunActionResult?.parentSampleId}`}
                >
                  <a target="_blank">
                    {splitChildSampleRunConfig?.configure.baseName}
                  </a>
                  s
                </Link>
              </span>
            ) : (
              <span className="text-primary mx-3">
                {" "}
                {splitChildSampleRunConfig?.configure.baseName}
              </span>
            )}
            {splitChildSampleRunConfig?.configure.destroyOriginal ? (
              <>
                <img src="/static/images/originalDestroyed.png" />
                <span className="text-danger mx-1">
                  {" "}
                  <DinaMessage id="destroyedLabel" />{" "}
                </span>
              </>
            ) : null}
          </span>
          <div className="fw-bold d-flex flex-row justify-content-center ">
            <span>{formatMessage("childMaterialSamplesCreatedLabel")}:</span>
          </div>
          {/* {splitChildSampleRunActionResult?.childrenGenerated?.map(
              (result, idx) => (
                <span className="d-flex flex-row mx-3" key={idx}>
                  <Link
                    href={`/collection/material-sample/view?id=${result.id}`}
                  >
                    <a target="_blank">{result.name}</a>
                  </Link>
                </span>
              )
            )} */}
          <ListPageLayout
            id="material-sample-list"
            queryTableProps={{
              columns: MATERIAL_SAMPLE_TABLE_COLUMNS,
              path: "collection-api/material-sample",
              include: "materialSampleType"
            }}
          />
          {buttonBar}
        </DinaForm>
      </main>
    </div>
  );
}
