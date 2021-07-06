import { Footer, Head, Nav } from "../../components";
import { DinaMessage, useDinaIntl } from "../../intl/dina-ui-intl";
import { ApiClientContext } from "common-ui";
import { useContext } from "react";
import WorkbookConversion from "../../components/workbook/WorkbookConversion";

export default function UploadWorkbookPage() {
  const { formatMessage } = useDinaIntl();
  const { apiClient } = useContext(ApiClientContext);

  return (
    <div>
      <Head title={formatMessage("workbookGroupUploadTitle")} />
      <Nav />
      <div className="container">
        <h1>
          <DinaMessage id="workbookGroupUploadTitle" />
        </h1>
        <WorkbookConversion apiClient={apiClient} />
      </div>
      <Footer />
    </div>
  );
}
