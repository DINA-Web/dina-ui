import {
  BackToListButton,
  ButtonBar,
  DeleteButton,
  LoadingSpinner,
  useQuery
} from "common-ui";
import Link from "next/link";
import { useRouter } from "next/router";
import { Footer, Head, Nav } from "../../../components";
import { FileView, MetadataDetails } from "../../../components/object-store";
import { DinaMessage } from "../../../intl/dina-ui-intl";
import { Metadata } from "../../../types/objectstore-api";

const OBJECT_DETAILS_PAGE_CSS = `
  .file-viewer-wrapper img {
    max-width: 100%;
    height: auto;
  }
`;

export default function MetadataViewPage() {
  const router = useRouter();

  const id = router.query.id as string;

  const { loading, response } = useQuery<Metadata>(
    {
      include: "acDerivedFrom,managedAttributeMap,acMetadataCreator,dcCreator",
      path: `objectstore-api/metadata/${id}`
    },
    {
      joinSpecs: [
        {
          apiBaseUrl: "/agent-api",
          idField: "acMetadataCreator",
          joinField: "acMetadataCreator",
          path: metadata => `person/${metadata.acMetadataCreator.id}`
        },
        {
          apiBaseUrl: "/agent-api",
          idField: "dcCreator",
          joinField: "dcCreator",
          path: metadata => `person/${metadata.dcCreator.id}`
        }
      ]
    }
  );

  if (loading) {
    return <LoadingSpinner loading={true} />;
  }

  if (response) {
    const metadata = response.data;

    const fileId =
      metadata.acSubType === "THUMBNAIL"
        ? `${metadata.fileIdentifier}.thumbnail`
        : metadata.fileIdentifier;

    const filePath = `/api/objectstore-api/file/${metadata.bucket}/${fileId}`;
    const fileType = metadata.fileExtension.replace(/\./, "").toLowerCase();

    return (
      <div>
        <Head title={metadata.originalFilename} />
        <Nav />
        <ButtonBar>
          <Link href={`/object-store/metadata/edit?ids=${id}`}>
            <a className="btn btn-primary">
              <DinaMessage id="editButtonText" />
            </a>
          </Link>
          <Link href={`/object-store/metadata/revisions?id=${id}`}>
            <a className="btn btn-info">
              <DinaMessage id="revisionsButtonText" />
            </a>
          </Link>
          <BackToListButton entityLink="/object-store/object" />
          <DeleteButton
            className="ml-5"
            id={id}
            options={{ apiBaseUrl: "/objectstore-api" }}
            postDeleteRedirect="/object-store/object/list"
            type="metadata"
          />
        </ButtonBar>
        <style>{OBJECT_DETAILS_PAGE_CSS}</style>
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4">
              <FileView
                clickToDownload={true}
                filePath={filePath}
                fileType={fileType}
              />
            </div>
            <div className="col-md-8">
              <div className="container">
                <div className="form-group">
                  <Link href={`/object-store/metadata/edit?ids=${id}`}>
                    <a className="btn btn-primary">
                      <DinaMessage id="editButtonText" />
                    </a>
                  </Link>
                </div>
                <MetadataDetails metadata={metadata} />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return null;
}
