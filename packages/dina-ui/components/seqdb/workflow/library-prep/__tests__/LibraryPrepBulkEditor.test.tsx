import { mountWithAppContext } from "../../../../../test-util/mock-app-context";
import { Chain, ChainStepTemplate } from "../../../../../types/seqdb-api";
import {
  LibraryPrepBulkEditor,
  LibraryPrepBulkEditorProps
} from "../LibraryPrepBulkEditor";

const mockGet = jest.fn();
const mockSave = jest.fn();

const mockCtx = {
  apiClient: {
    get: mockGet
  },
  save: mockSave
};

// Mock out the HandsOnTable which should only be rendered in the browser.
jest.mock("next/dynamic", () => () => {
  return function MockHotTable() {
    return <div>Mock Handsontable</div>;
  };
});

function getWrapper(propsOverride?: Partial<LibraryPrepBulkEditorProps>) {
  return mountWithAppContext(
    <LibraryPrepBulkEditor
      libraryPrepBatch={{
        containerType: {
          baseType: "base type",
          id: "1",
          name: "96 well box",
          numberOfColumns: 12,
          numberOfRows: 8,
          type: "container-type"
        },
        id: "5",
        indexSet: { id: "1234", name: "test index set", type: "index-set" },
        name: "test library prep batch",
        type: "library-prep-batch"
      }}
      chain={{ id: "5", type: "chain" } as Chain}
      sampleSelectionStep={
        { id: "1", type: "chain-step-template" } as ChainStepTemplate
      }
      editMode="DETAILS"
      {...propsOverride}
    />,
    { apiContext: mockCtx as any }
  );
}

const MOCK_LIBRARY_PREPS = [
  {
    id: "3",
    indexI5: { id: "1", type: "ngs-index", name: "i5 index 1" },
    inputNg: 123,
    molecularSample: { id: "6", name: "SAMP600", type: "molecular-sample" },
    size: "big",
    type: "library-prep",
    wellColumn: 5,
    wellRow: "F"
  }
];

const MOCK_SAMPLE_STEPRESOURCES = [
  { molecularSample: { id: "6", name: "SAMP600", type: "molecular-sample" } },
  {
    molecularSample: { id: "10", name: "ZSAMP1000", type: "molecular-sample" }
  },
  { molecularSample: { id: "8", name: "SAMP800", type: "molecular-sample" } }
];

describe("LibraryPrepBulkEditor component", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    mockGet.mockImplementation(async path => {
      // Mock the samples with libraryPreps:
      if (path === "seqdb-api/library-prep-batch/5/libraryPreps") {
        return {
          data: MOCK_LIBRARY_PREPS
        };
      }
      // Mock the samples without well coords:
      if (path === "seqdb-api/step-resource") {
        return {
          data: MOCK_SAMPLE_STEPRESOURCES
        };
      }

      return { data: [] };
    });

    mockSave.mockImplementation(async ops => {
      return ops.map(op => op.resource);
    });
  });

  it("Renders the library prep values.", async () => {
    const wrapper = getWrapper();

    await new Promise(setImmediate);
    wrapper.update();

    const tableData = wrapper.find("MockHotTable").prop<any[]>("data");
    expect(tableData[0].libraryPrep.inputNg).toEqual(123);
  });

  it("Lets you add and edit library prep values.", async () => {
    const wrapper = getWrapper();

    await new Promise(setImmediate);
    wrapper.update();

    const tableData = wrapper.find("MockHotTable").prop<any[]>("data");

    // Change the first inputNg value.
    tableData[0].libraryPrep.inputNg = 999.999;

    // Change the third Quality value.
    tableData[2].libraryPrep.quality = "very good";

    // Submit the bulk editor:
    wrapper.find("button.bulk-editor-submit-button").simulate("click");

    await new Promise(setImmediate);
    wrapper.update();

    // Only the two edited library preps should be submitted:
    expect(mockSave).lastCalledWith(
      [
        expect.objectContaining({
          resource: expect.objectContaining({ inputNg: 999.999 })
        }),
        expect.objectContaining({
          resource: expect.objectContaining({ quality: "very good" })
        })
      ],
      { apiBaseUrl: "/seqdb-api" }
    );
  });

  it("Has an 'INDEX' mode that lets you edit ngs indexes.", async () => {
    const wrapper = getWrapper({ editMode: "INDEX" });

    await new Promise(setImmediate);
    wrapper.update();

    const tableData = wrapper.find("MockHotTable").prop<any[]>("data");

    // The well coordinate column text should be formatted as F05.
    expect(tableData[0].wellCoordinates).toEqual("F05");

    tableData[0].indexI5 = "i5 index 50 (ngs-index/50)";

    // Submit the bulk editor:
    wrapper.find("button.bulk-editor-submit-button").simulate("click");

    await new Promise(setImmediate);
    wrapper.update();

    // Only the edited library preps should be submitted:
    expect(mockSave).lastCalledWith(
      [
        expect.objectContaining({
          resource: expect.objectContaining({
            indexI5: {
              id: "50",
              type: "ngs-index"
            }
          })
        })
      ],
      { apiBaseUrl: "/seqdb-api" }
    );
  });

  it("Should show a warning box if the index set or container type are null.", async () => {
    const wrapper = getWrapper({
      editMode: "INDEX",
      libraryPrepBatch: {
        id: "5",
        name: "test library prep batch",
        type: "library-prep-batch"
      }
    });

    await new Promise(setImmediate);
    wrapper.update();

    expect(wrapper.find(".alert.alert-warning").exists()).toBeTruthy();
  });
});
