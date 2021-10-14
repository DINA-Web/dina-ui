import { LanguageSelector, NavbarUserControl, useAccount } from "common-ui";
import Link from "next/link";
import React from "react";
import { DinaMessage, useDinaIntl } from "../../../intl/dina-ui-intl";
import { SeqdbMessage } from "../../../intl/seqdb-intl";
import { useContext, useState } from "react";
import { intlContext } from "../../../../common-ui/lib/intl/IntlSupport";
import Dropdown from "react-bootstrap/Dropdown";

export function Nav() {
  const { roles } = useAccount();
  const { formatMessage } = useDinaIntl();
  const { locale } = useContext(intlContext);

  // Only show the Users UI to collection-managers and admins:
  const showUsersLinks =
    roles.includes("collection-manager") || roles.includes("admin");

  return (
    <>
      <div id="wb-tphp" className="d-flex flex-column align-items-center">
        <a className="wb-link-inv wb-sl" href="#wb-cont">
          <DinaMessage id="skipToMainContent" />
        </a>
        <a className="wb-link-inv wb-sl" href="#wb-info">
          <DinaMessage id="skipToAboutThisApplication" />
        </a>
        <a className="wb-link-inv wb-sl" rel="alternate" href="?wbdisable=true">
          <DinaMessage id="skipToBasicHtmlVersion" />
        </a>
      </div>

      <header className="py-3">
        <div id="wb-bnr" className="container">
          <div className="row d-flex">
            <div
              className="brand col-5 col-md-4"
              property="publisher"
              typeof="GovernmentOrganization"
            >
              <img
                src="https://www.canada.ca/etc/designs/canada/cdts/gcweb/v4_0_32/assets/sig-blk-en.svg"
                alt={formatMessage("governmentOfCanada")}
                property="logo"
              />
              <span className="wb-inv" property="name">
                <span lang={locale}>
                  <DinaMessage id="governmentOfCanada" />
                </span>
              </span>
              <meta property="areaServed" typeof="Country" content="Canada" />
            </div>
            <section id="wb-lng" className="text-end ms-auto col-7 col-md-8">
              <ul className="list-inline">
                <li className="list-inline-item mx-2">
                  <NavbarUserControl />
                </li>
                <li className="list-inline-item mx-2 my-auto">
                  <a
                    className="btn btn-info"
                    href="https://github.com/AAFC-BICoE/dina-planning/issues/new?labels=demo%20feedback"
                    target="_blank"
                  >
                    <DinaMessage id="feedbackButtonText" />
                  </a>
                </li>
                <li className="list-inline-item mx-2">
                  <LanguageSelector />
                </li>
              </ul>
            </section>
          </div>
        </div>
        <div className="app-bar">
          <div className="container">
            <ul className="list-inline d-flex m-0">
              <li className="list-inline-item me-4">
                <Link href="/">
                  <a className="app-name px-0">
                    <DinaMessage id="appTitle" />
                  </a>
                </Link>
              </li>
              <li className="list-inline-item my-auto">
                <NavObjectStoreDropdown />
              </li>
              <li className="list-inline-item my-auto">
                <NavAgentsDropdown />
              </li>
              <li className="list-inline-item my-auto">
                <NavSeqDBDropdown />
              </li>
              <li className="list-inline-item my-auto">
                <NavCollectionDropdown />
              </li>
              {showUsersLinks && (
                <li className="list-inline-item my-auto">
                  <NavDinaUserDropdown />
                </li>
              )}
            </ul>
          </div>
        </div>
      </header>
    </>
  );
}

function menuDisplayControl() {
  const [show, setShow] = useState(false);
  const showDropdown = () => {
    setShow(true);
  };
  const hideDropdown = () => {
    setShow(false);
  };
  function onKeyDown(e) {
    if (!show && (e.key === "ArrowDown" || e.key === "ArrowUp")) showDropdown();
    else if (e.key === "Escape" || (e.shiftKey && e.key === "Tab"))
      hideDropdown();
  }
  return { show, showDropdown, hideDropdown, onKeyDown };
}

/** Object Store links. */
function NavObjectStoreDropdown() {
  const { show, showDropdown, hideDropdown, onKeyDown } = menuDisplayControl();
  return (
    <Dropdown
      onMouseOver={showDropdown}
      onKeyDown={onKeyDown}
      onMouseLeave={hideDropdown}
      show={show}
    >
      <Dropdown.Toggle className="nav-link">
        <DinaMessage id="objectStoreTitle" />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item href="/object-store/upload">
          <DinaMessage id="uploadPageTitle" />
        </Dropdown.Item>
        <Dropdown.Item href="/object-store/object/list">
          <DinaMessage id="objectListTitle" />
        </Dropdown.Item>
        <Dropdown.Item href="/object-store/managedAttributesView/listView">
          <DinaMessage id="managedAttributeListTitle" />
        </Dropdown.Item>
        <Dropdown.Item href="/object-store/object-subtype/list">
          <DinaMessage id="objectSubtypeListTitle" />
        </Dropdown.Item>
        <Dropdown.Item
          href="/object-store/revisions-by-user"
          onBlur={hideDropdown}
        >
          <DinaMessage id="revisionsByUserPageTitle" />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

/** Agents links. */
function NavAgentsDropdown() {
  const { show, showDropdown, hideDropdown, onKeyDown } = menuDisplayControl();
  return (
    <Dropdown
      show={show}
      onMouseOver={showDropdown}
      onMouseLeave={hideDropdown}
      onKeyDown={onKeyDown}
    >
      <Dropdown.Toggle className="nav-link">
        <DinaMessage id="agentsSectionTitle" />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item href="/person/list">
          <DinaMessage id="personListTitle" />
        </Dropdown.Item>
        <Dropdown.Item href="/organization/list" onBlur={hideDropdown}>
          <DinaMessage id="organizationListTitle" />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

/** Dina User links. */
function NavDinaUserDropdown() {
  const { subject } = useAccount();
  const { show, showDropdown, hideDropdown, onKeyDown } = menuDisplayControl();

  return (
    <Dropdown
      show={show}
      onMouseOver={showDropdown}
      onMouseLeave={hideDropdown}
      onKeyDown={onKeyDown}
    >
      <Dropdown.Toggle className="nav-link">
        <DinaMessage id="dinaUserSectionTitle" />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item href="/dina-user/list">
          <DinaMessage id="userListTitle" />
        </Dropdown.Item>
        <Dropdown.Item
          href={`/dina-user/view?id=${subject}`}
          onBlur={hideDropdown}
        >
          <DinaMessage id="whoAmITitle" />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

/** Seqdb UI links. */
function NavSeqDBDropdown() {
  const { show, showDropdown, hideDropdown, onKeyDown } = menuDisplayControl();
  return (
    <Dropdown
      show={show}
      onMouseOver={showDropdown}
      onMouseLeave={hideDropdown}
      onKeyDown={onKeyDown}
    >
      <Dropdown.Toggle className="nav-link" href="#">
        <SeqdbMessage id="seqdbTitle" />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item href="/seqdb/workflow/list">
          <SeqdbMessage id="workflowListTitle" />
        </Dropdown.Item>
        <Dropdown.Item href="/seqdb/sanger-workflow/list">
          <SeqdbMessage id="sangerWorkflowListTitle" />
        </Dropdown.Item>
        <Dropdown.Item href="/seqdb/index-set/list">
          <SeqdbMessage id="indexSetListTitle" />
        </Dropdown.Item>
        <Dropdown.Item href="/seqdb/pcr-primer/list">
          <SeqdbMessage id="pcrPrimerListTitle" />
        </Dropdown.Item>
        <Dropdown.Item href="/seqdb/pcr-profile/list">
          <SeqdbMessage id="pcrProfileListTitle" />
        </Dropdown.Item>
        <Dropdown.Item href="/seqdb/pcr-batch/list">
          <SeqdbMessage id="pcrBatchListTitle" />
        </Dropdown.Item>
        <Dropdown.Item href="/seqdb/product/list">
          <SeqdbMessage id="productListTitle" />
        </Dropdown.Item>
        <Dropdown.Item href="/seqdb/protocol/list">
          <SeqdbMessage id="protocolListTitle" />
        </Dropdown.Item>
        <Dropdown.Item href="/seqdb/region/list">
          <SeqdbMessage id="regionListTitle" />
        </Dropdown.Item>
        <Dropdown.Item
          href="/seqdb/molecular-sample/list"
          onBlur={hideDropdown}
        >
          <SeqdbMessage id="molecularSampleListTitle" />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

/** Collecting event links. */
function NavCollectionDropdown() {
  const { show, showDropdown, hideDropdown, onKeyDown } = menuDisplayControl();
  return (
    <Dropdown
      show={show}
      onMouseOver={showDropdown}
      onMouseLeave={hideDropdown}
      onKeyDown={onKeyDown}
    >
      <Dropdown.Toggle className="nav-link" href="#">
        <DinaMessage id="collectionSectionTitle" />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item href="/collection/collection/list">
          <DinaMessage id="collectionListTitle" />
        </Dropdown.Item>
        <Dropdown.Item href="/collection/collection-method/list">
          <DinaMessage id="collectionMethodListTitle" />
        </Dropdown.Item>
        <Dropdown.Item href="/collection/institution/list">
          <DinaMessage id="institutionListTitle" />
        </Dropdown.Item>
        <Dropdown.Item href="/collection/collecting-event/list">
          <DinaMessage id="collectingEventListTitle" />
        </Dropdown.Item>
        <Dropdown.Item href="/collection/material-sample/list">
          <DinaMessage id="materialSampleListTitle" />
        </Dropdown.Item>
        <Dropdown.Item href="/collection/material-sample-type/list">
          <DinaMessage id="materialSampleTypeListTitle" />
        </Dropdown.Item>
        <Dropdown.Item href="/collection/preparation-type/list">
          <DinaMessage id="preparationTypeListTitle" />
        </Dropdown.Item>
        <Dropdown.Item href="/collection/storage-unit-type/list">
          <DinaMessage id="storageUnitTypeListTitle" />
        </Dropdown.Item>
        <Dropdown.Item href="/collection/storage-unit/list">
          <DinaMessage id="storageUnitListTitle" />
        </Dropdown.Item>
        <Dropdown.Item href="/collection/managed-attribute/list">
          <DinaMessage id="managedAttributeListTitle" />
        </Dropdown.Item>
        <Dropdown.Item href="/collection/workflow-template/list">
          <DinaMessage id="workflowTemplateListTitle" />
        </Dropdown.Item>
        <Dropdown.Item
          href="/collection/revisions-by-user/"
          onBlur={hideDropdown}
        >
          <DinaMessage id="revisionsByUserPageTitle" />
        </Dropdown.Item>
        <Dropdown.Item
          className="d-none"
          href="/collection/collector-group/list"
        >
          <DinaMessage id="collectorGroupListTitle" />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export function Footer() {
  const { formatMessage } = useDinaIntl();
  return (
    <footer id="wb-info" className="my-3" style={{ zIndex: 0 }}>
      <div className="brand">
        <div className="container">
          <div className="row">
            <nav className="col-md-10 ftr-urlt-lnk py-3">
              <ul>
                <li>
                  <a href="https://www.canada.ca/en/contact.html">
                    <DinaMessage id="footerContactInfo" />
                  </a>
                </li>
                <li>
                  <a href="https://www.canada.ca/en/transparency/terms.html">
                    <DinaMessage id="footerTermsAndConditions" />
                  </a>
                </li>
                <li>
                  <a href="https://www.canada.ca/en/transparency/privacy.html">
                    <DinaMessage id="footerPrivacy" />
                  </a>
                </li>
              </ul>
              <div>
                {process.env.UI_APP_VERSION && (
                  <DinaMessage
                    id="uiAppVersion"
                    values={{ version: process.env.UI_APP_VERSION }}
                  />
                )}
              </div>
            </nav>
            <div className="col-6 col-md-3 col-lg-2 text-end">
              <img
                src="https://www.canada.ca/etc/designs/canada/cdts/gcweb/v4_0_32/assets/wmms-blk.svg"
                alt={formatMessage("governmentOfCanadaSymbol")}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
