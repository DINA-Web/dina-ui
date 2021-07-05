import { Footer, Head, Nav } from "../../components";
import { DinaMessage, useDinaIntl } from "../../intl/dina-ui-intl";
import { WorkbookUploader } from "../../components/workbook/WorkbookUploader";

export default function UploadWorkbookPage() {
  const { formatMessage } = useDinaIntl();

  return (
    <div>
      <Head title={formatMessage("workbookGroupUploadTitle")} />
      <Nav />
      <h1>
        <DinaMessage id="workbookGroupUploadTitle" />
      </h1>
      <WorkbookUploader />
      <Footer />
    </div>
  );
}
