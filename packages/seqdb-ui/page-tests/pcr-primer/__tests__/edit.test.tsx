import { OperationsResponse } from "common-ui";
import { PcrPrimerEditPage } from "../../../pages/pcr-primer/edit";
import { mountWithAppContext } from "../../../test-util/mock-app-context";
import { PcrPrimer } from "../../../types/seqdb-api/resources/PcrPrimer";

// Mock out the Link component, which normally fails when used outside of a Next app.
jest.mock("next/link", () => ({ children }) => <div>{children}</div>);

/** Mock Kitsu "get" method. */
const mockGet = jest.fn(async path => {
  if (path === "seqdb-api/pcrPrimer/100") {
    // The request for the primer returns the test primer.
    return { data: TEST_PRIMER };
  } else {
    // Requests for the selectable resources (linked group, region, etc.) return an empty array.
    return { data: [] };
  }
});

/** Mock axios for operations requests. */
const mockPatch = jest.fn();

/** Mock next.js' router "push" function for navigating pages. */
const mockPush = jest.fn();

const apiContext: any = {
  apiClient: { get: mockGet, axios: { patch: mockPatch } }
};

describe("PcrPrimer edit page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Provides a form to add a PcrPrimer.", async () => {
    mockPatch.mockReturnValueOnce({
      data: [
        {
          data: {
            id: "1",
            type: "pcrPrimer"
          },
          status: 201
        }
      ] as OperationsResponse
    });

    const wrapper = mountWithAppContext(
      <PcrPrimerEditPage router={{ query: {}, push: mockPush } as any} />,
      { apiContext }
    );

    // Edit the primer name.
    wrapper.find(".name-field input").simulate("change", {
      target: { name: "name", value: "New PcrPrimer" }
    });

    // Submit the form.
    wrapper.find("form").simulate("submit");

    // Wait for the primer form to load.
    await new Promise(setImmediate);
    wrapper.update();

    expect(mockPatch).lastCalledWith(
      "/seqdb-api/operations",
      [
        {
          op: "POST",
          path: "pcrPrimer",
          value: {
            attributes: {
              lotNumber: 1,
              name: "New PcrPrimer",
              seq: "",
              type: "PRIMER"
            },
            id: "-100",
            type: "pcrPrimer"
          }
        }
      ],
      expect.anything()
    );

    // The user should be redirected to the new primer's details page.
    expect(mockPush).lastCalledWith("/pcr-primer/view?id=1");
  });

  it("Renders an error after form submit if one is returned from the back-end.", async () => {
    // The patch request will return an error.
    mockPatch.mockImplementationOnce(() => ({
      data: [
        {
          errors: [
            {
              detail: "name size must be between 1 and 10",
              status: "422",
              title: "Constraint violation"
            }
          ],
          status: 422
        }
      ] as OperationsResponse
    }));

    const wrapper = mountWithAppContext(
      <PcrPrimerEditPage router={{ query: {}, push: mockPush } as any} />,
      { apiContext }
    );

    // Submit the form.
    wrapper.find("form").simulate("submit");

    // Wait for the primer form to load.
    await new Promise(setImmediate);
    wrapper.update();

    wrapper.update();
    expect(wrapper.find(".alert.alert-danger").text()).toEqual(
      "Constraint violation: name size must be between 1 and 10"
    );
    expect(mockPush).toBeCalledTimes(0);
  });

  it("Provides a form to edit a PcrPrimer.", async () => {
    // The patch request will be successful.
    mockPatch.mockReturnValueOnce({
      data: [
        {
          data: {
            id: "1",
            type: "pcrPrimer"
          },
          status: 201
        }
      ] as OperationsResponse
    });

    const wrapper = mountWithAppContext(
      <PcrPrimerEditPage
        router={{ query: { id: 100 }, push: mockPush } as any}
      />,
      { apiContext }
    );

    // The page should load initially with a loading spinner.
    expect(wrapper.find(".spinner-border").exists()).toEqual(true);

    // Wait for the primer form to load.
    await new Promise(setImmediate);
    wrapper.update();

    // // Check that the existing primer's seq value is in the field.
    expect(wrapper.find(".seq-field input").prop("value")).toEqual(
      "ACTACGATCAGCATCGATG"
    );

    // Modify the "designedBy" value.
    wrapper.find(".seq-field input").simulate("change", {
      target: { name: "seq", value: "new seq value" }
    });

    // Submit the form.
    wrapper.find("form").simulate("submit");

    // Wait for the primer form to load.
    await new Promise(setImmediate);
    wrapper.update();

    // "patch" should have been called with a jsonpatch request containing the existing values
    // and the modified one.
    expect(mockPatch).lastCalledWith(
      "/seqdb-api/operations",
      [
        {
          op: "PATCH",
          path: "pcrPrimer/1",
          value: {
            attributes: expect.objectContaining({
              application: null,
              name: "ITS1",
              seq: "new seq value"
            }),
            id: "1",
            relationships: {
              region: {
                data: expect.objectContaining({ id: "2", type: "region" })
              }
            },
            type: "pcrPrimer"
          }
        }
      ],
      expect.anything()
    );

    // The user should be redirected to the existing primer's details page.
    expect(mockPush).lastCalledWith("/pcr-primer/view?id=1");
  });
});

/** Test Primer with all fields defined. Taken from SeqDB sample data. */
const TEST_PRIMER: Required<PcrPrimer> = {
  application: null,
  dateOrdered: null,
  designDate: null,
  designedBy: "Bob Jones",
  direction: "R",
  id: "1",
  lastModified: "2013-03-19T04:00:00.000+0000",
  lotNumber: 1,
  name: "ITS1",
  note: "ITS4 primer hybridizes at the 5' end of the 28S gene region.",
  position: null,
  purification: "none",
  reference: null,
  region: {
    description: "ITS Region Amplification",
    id: "2",
    name: "Internal Transcribed Spacer",
    symbol: "ITS",
    type: "region"
  },
  seq: "ACTACGATCAGCATCGATG",
  stockConcentration: "10",
  supplier: null,
  targetSpecies: null,
  tmCalculated: "55",
  tmPe: null,
  type: "PRIMER",
  version: null
};
