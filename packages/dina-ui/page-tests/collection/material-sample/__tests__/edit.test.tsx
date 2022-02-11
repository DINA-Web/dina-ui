import { InputResource, KitsuResourceLink } from "kitsu";
import { default as ReactSwitch, default as Switch } from "react-switch";
import {
  MaterialSampleForm,
  nextSampleInitialValues
} from "../../../../pages/collection/material-sample/edit";
import { mountWithAppContext } from "../../../../test-util/mock-app-context";
import {
  AcquisitionEvent,
  blankMaterialSample,
  CollectingEvent,
  MaterialSample
} from "../../../../types/collection-api";

// Mock out the dynamic component, which should only be rendered in the browser
jest.mock("next/dynamic", () => () => {
  return function MockDynamicComponent() {
    return <div>Mock dynamic component</div>;
  };
});

function testCollectionEvent(): Partial<CollectingEvent> {
  return {
    startEventDateTime: "2021-04-13",
    verbatimEventDateTime: "2021-04-13",
    id: "1",
    type: "collecting-event",
    group: "test group"
  };
}

function testAcquisitionEvent(): Partial<AcquisitionEvent> {
  return {
    id: "1",
    type: "acquisition-event",
    group: "test group",
    createdBy: "poffm",
    createdOn: "2021-11-15",
    receptionRemarks: "test reception remarks"
  };
}

function testMaterialSample(): InputResource<MaterialSample> {
  return {
    id: "1",
    type: "material-sample",
    group: "test group",
    materialSampleName: "my-sample-name",
    collectingEvent: {
      id: "1",
      type: "collecting-event"
    },
    acquisitionEvent: {
      id: "1",
      type: "acquisition-event"
    },
    attachment: [{ id: "attach-1", type: "metadata" }],
    ...blankMaterialSample()
  };
}

const TEST_MANAGED_ATTRIBUTE = {
  id: "1",
  type: "managed-attribute",
  name: "testAttr",
  key: "test_attr"
};

const mockGet = jest.fn<any, any>(async path => {
  switch (path) {
    case "collection-api/collecting-event":
      return { data: [testCollectionEvent()] };
    case "collection-api/collecting-event/1?include=collectors,attachment,collectionMethod":
      // Populate the linker table:
      return { data: testCollectionEvent() };
    case "collection-api/acquisition-event/1":
      // Populate the linker table:
      return { data: testAcquisitionEvent() };
    case "collection-api/acquisition-event":
      // Populate the linker table:
      return { data: [testAcquisitionEvent()] };
    case "collection-api/material-sample/1":
      return { data: testMaterialSample() };
    case "collection-api/material-sample":
      return {
        data: [
          { id: "1", materialSampleName: "test name", type: "material-sample" }
        ]
      };
    case "collection-api/preparation-type":
    case "collection-api/managed-attribute":
    case "collection-api/material-sample-type":
    case "user-api/group":
    case "agent-api/person":
    case "collection-api/vocabulary/srs":
    case "collection-api/vocabulary/coordinateSystem":
    case "collection-api/vocabulary/degreeOfEstablishment":
    case "collection-api/vocabulary/materialSampleState":
    case "collection-api/vocabulary/typeStatus":
    case "collection-api/storage-unit-type":
    case "collection-api/storage-unit":
    case "objectstore-api/metadata":
    case "collection-api/collection":
    case "collection-api/collection-method":
    case "collection-api/storage-unit/76575":
    case "collection-api/project":
    case "collection-api/vocabulary/associationType":
      return { data: [], meta: { totalResourceCount: 0 } };
  }
});

const mockSave = jest.fn<any, any>(async saves => {
  return saves.map(save => {
    // Test duplicate name error:
    if (
      save.type === "material-sample" &&
      save.resource.materialSampleName === "test-duplicate-name" &&
      !save.resource.allowDuplicateName
    ) {
      throw new Error(
        "Data integrity violation: could not execute statement; SQL [n/a]; constraint [material_sample_name_unique]; nested exception is org.hibernate.exception.ConstraintViolationException: could not execute statement"
      );
    }
    return {
      ...save.resource,
      id: save.resource.id ?? "11111111-1111-1111-1111-111111111111"
    };
  });
});

const mockBulkGet = jest.fn<any, any>(async paths => {
  if (!paths.length) {
    return [];
  }
  if ((paths[0] as string).startsWith("/managed-attribute")) {
    return [TEST_MANAGED_ATTRIBUTE];
  }
});

const testCtx = {
  apiContext: {
    bulkGet: mockBulkGet,
    save: mockSave,
    apiClient: {
      get: mockGet
    }
  }
};

const mockOnSaved = jest.fn();

describe("Material Sample Edit Page", () => {
  beforeEach(jest.clearAllMocks);

  it("Submits a new material-sample with a new CollectingEvent.", async () => {
    const wrapper = mountWithAppContext(
      <MaterialSampleForm onSaved={mockOnSaved} />,
      testCtx
    );

    await new Promise(setImmediate);
    wrapper.update();

    // Enable Collecting Event and catalogue info form sections:
    wrapper.find(".enable-collecting-event").find(Switch).prop<any>("onChange")(
      true
    );
    wrapper.find(".enable-catalogue-info").find(Switch).prop<any>("onChange")(
      true
    );

    wrapper
      .find(".materialSampleName-field input")
      .simulate("change", { target: { value: "test-material-sample-id" } });
    wrapper
      .find(".verbatimEventDateTime-field input")
      .simulate("change", { target: { value: "2019-12-21T16:00" } });
    wrapper.find("form").simulate("submit");

    await new Promise(setImmediate);
    wrapper.update();

    // Saves the Collecting Event and the Material Sample:
    expect(mockSave.mock.calls).toEqual([
      [
        // New collecting-event:
        [
          {
            resource: {
              dwcOtherRecordNumbers: null,
              dwcVerbatimCoordinateSystem: null,
              dwcVerbatimSRS: "WGS84 (EPSG:4326)",
              geoReferenceAssertions: [
                {
                  isPrimary: true
                }
              ],
              relationships: {
                attachment: {
                  data: []
                }
              },
              verbatimEventDateTime: "2019-12-21T16:00",
              publiclyReleasable: true, // Default value
              type: "collecting-event"
            },
            type: "collecting-event"
          }
        ],
        { apiBaseUrl: "/collection-api" }
      ],
      [
        // New material-sample:
        [
          {
            resource: {
              acquisitionEvent: {
                id: null,
                type: "acquisition-event"
              },
              associations: [],
              collectingEvent: {
                id: "11111111-1111-1111-1111-111111111111",
                type: "collecting-event"
              },
              storageUnit: { id: null, type: "storage-unit" },
              materialSampleName: "test-material-sample-id",
              hostOrganism: null,
              managedAttributes: {},
              publiclyReleasable: true, // Default value
              relationships: { organism: { data: [] } },
              type: "material-sample"
            },
            type: "material-sample"
          }
        ],
        { apiBaseUrl: "/collection-api" }
      ]
    ]);
  });

  it("Submits a new material-sample linked to an existing CollectingEvent.", async () => {
    const wrapper = mountWithAppContext(
      <MaterialSampleForm onSaved={mockOnSaved} />,
      testCtx
    );

    await new Promise(setImmediate);
    wrapper.update();

    // Enable Collecting Event and catalogue info form sections:
    wrapper.find(".enable-collecting-event").find(Switch).prop<any>("onChange")(
      true
    );
    wrapper.find(".enable-catalogue-info").find(Switch).prop<any>("onChange")(
      true
    );

    await new Promise(setImmediate);
    wrapper.update();

    wrapper
      .find(".materialSampleName-field input")
      .simulate("change", { target: { value: "test-material-sample-id" } });

    wrapper.find("button.collecting-event-link-button").simulate("click");

    await new Promise(setImmediate);
    wrapper.update();

    wrapper.find("form").simulate("submit");

    await new Promise(setImmediate);
    wrapper.update();

    // Saves the Collecting Event and the Material Sample:
    expect(mockSave.mock.calls).toEqual([
      [
        // Doesn't save the existing Collecting Event because it wasn't edited:
        [
          // New material-sample:
          {
            resource: {
              acquisitionEvent: {
                id: null,
                type: "acquisition-event"
              },
              associations: [],
              collectingEvent: {
                id: "1",
                type: "collecting-event"
              },
              storageUnit: { id: null, type: "storage-unit" },
              materialSampleName: "test-material-sample-id",
              hostOrganism: null,
              managedAttributes: {},
              collection: undefined,
              publiclyReleasable: true, // Default value
              type: "material-sample",
              relationships: {
                organism: { data: [] }
              }
            },
            type: "material-sample"
          }
        ],
        { apiBaseUrl: "/collection-api" }
      ]
    ]);
  });

  it("Edits an existing material-sample", async () => {
    const wrapper = mountWithAppContext(
      <MaterialSampleForm
        materialSample={testMaterialSample()}
        onSaved={mockOnSaved}
      />,
      testCtx
    );

    await new Promise(setImmediate);
    wrapper.update();

    // Existing CollectingEvent should show up:
    expect(
      wrapper.find(".startEventDateTime-field input").prop("value")
    ).toEqual("2021-04-13");

    wrapper
      .find(".materialSampleName-field input")
      .simulate("change", { target: { value: "test-material-sample-id" } });

    wrapper.find("form").simulate("submit");

    await new Promise(setImmediate);
    wrapper.update();

    expect(mockSave.mock.calls).toEqual([
      [
        // Edits existing material-sample
        // And only includes the updated field:
        [
          {
            resource: {
              id: "1",
              type: "material-sample",
              materialSampleName: "test-material-sample-id",
              relationships: {}
            },
            type: "material-sample"
          }
        ],
        { apiBaseUrl: "/collection-api" }
      ]
    ]);
  });

  it("Lets you remove the attached Collecting Event.", async () => {
    const wrapper = mountWithAppContext(
      <MaterialSampleForm
        materialSample={testMaterialSample()}
        onSaved={mockOnSaved}
      />,
      testCtx
    );

    await new Promise(setImmediate);
    wrapper.update();

    // Existing CollectingEvent should show up:
    expect(
      wrapper.find(".verbatimEventDateTime-field input").prop("value")
    ).toEqual("2021-04-13");

    wrapper
      .find("#collecting-event-section button.detach-resource-button")
      .simulate("click");

    await new Promise(setImmediate);
    wrapper.update();

    // Existing CollectingEvent should be gone:
    expect(
      wrapper.find(".verbatimEventDateTime-field input").prop("value")
    ).toEqual("");

    // Set the new Collecting Event's verbatimEventDateTime:
    wrapper
      .find(".verbatimEventDateTime-field input")
      .simulate("change", { target: { value: "2019-12-21T16:00" } });

    wrapper.find("form").simulate("submit");

    await new Promise(setImmediate);
    wrapper.update();

    expect(mockSave.mock.calls).toEqual([
      [
        // New collecting-event created:
        [
          {
            resource: {
              dwcOtherRecordNumbers: null,
              dwcVerbatimCoordinateSystem: null,
              dwcVerbatimSRS: "WGS84 (EPSG:4326)",
              geoReferenceAssertions: [
                {
                  isPrimary: true
                }
              ],
              relationships: {
                attachment: {
                  data: []
                }
              },
              verbatimEventDateTime: "2019-12-21T16:00",
              publiclyReleasable: true, // Default Value
              type: "collecting-event"
            },
            type: "collecting-event"
          }
        ],
        { apiBaseUrl: "/collection-api" }
      ],
      [
        // Existing material-sample updated:
        [
          {
            resource: {
              collectingEvent: {
                id: "11111111-1111-1111-1111-111111111111",
                type: "collecting-event"
              },
              id: "1",
              type: "material-sample",
              relationships: {}
            },
            type: "material-sample"
          }
        ],
        { apiBaseUrl: "/collection-api" }
      ]
    ]);
  });

  it("Renders an existing Material Sample with the Preparations section enabled.", async () => {
    const wrapper = mountWithAppContext(
      <MaterialSampleForm
        materialSample={{
          type: "material-sample",
          id: "333",
          materialSampleName: "test-ms",
          preparationType: {
            id: "65765",
            type: "preparation-type",
            name: "test-prep-type"
          } as KitsuResourceLink
        }}
        onSaved={mockOnSaved}
      />,
      testCtx
    );

    await new Promise(setImmediate);
    wrapper.update();

    // Preparations are enabled:
    expect(
      wrapper.find(".enable-catalogue-info").find(ReactSwitch).prop("checked")
    ).toEqual(true);
  });

  it("Renders an existing Material Sample with the Storage section enabled.", async () => {
    const wrapper = mountWithAppContext(
      <MaterialSampleForm
        materialSample={{
          type: "material-sample",
          id: "333",
          materialSampleName: "test-ms",
          storageUnit: {
            id: "76575",
            type: "storage-unit",
            name: "test-storage-unit"
          } as KitsuResourceLink
        }}
        onSaved={mockOnSaved}
      />,
      testCtx
    );

    await new Promise(setImmediate);
    wrapper.update();

    // Storage is enabled:
    expect(
      wrapper.find(".enable-storage").find(ReactSwitch).prop("checked")
    ).toEqual(true);
    expect(wrapper.find("#storage-section").exists()).toEqual(true);
  });

  it("Renders an existing Material Sample with the Organisms section enabled.", async () => {
    const wrapper = mountWithAppContext(
      <MaterialSampleForm
        materialSample={{
          type: "material-sample",
          id: "333",
          materialSampleName: "test-ms",
          organism: [
            {
              type: "organism",
              determination: [
                { verbatimScientificName: "test verbatim scientific name" }
              ]
            }
          ]
        }}
        onSaved={mockOnSaved}
      />,
      testCtx
    );

    await new Promise(setImmediate);
    wrapper.update();

    // Determinations are enabled:
    expect(
      wrapper.find(".enable-organisms").find(ReactSwitch).prop("checked")
    ).toEqual(true);
    expect(wrapper.find(".organisms-section").exists()).toEqual(true);
  });

  it("Renders an existing Material Sample with the Assoication section enabled.", async () => {
    const wrapper = mountWithAppContext(
      <MaterialSampleForm
        materialSample={{
          type: "material-sample",
          id: "333",
          materialSampleName: "test-ms",
          associations: [
            { associatedSample: "test name", associationType: "host" }
          ]
        }}
        onSaved={mockOnSaved}
      />,
      testCtx
    );

    await new Promise(setImmediate);
    wrapper.update();

    // Assoications are enabled:
    expect(
      wrapper.find(".enable-associations").find(ReactSwitch).prop("checked")
    ).toEqual(true);
    expect(wrapper.find("#associations-section").exists()).toEqual(true);
  });

  it("Save association with uuid mapped correctly for saving.", async () => {
    const wrapper = mountWithAppContext(
      <MaterialSampleForm
        materialSample={{
          ...testMaterialSample(),
          id: "333",
          materialSampleName: "test-ms",
          associations: [{ associatedSample: "1", associationType: "host" }]
        }}
        onSaved={mockOnSaved}
      />,
      testCtx
    );

    await new Promise(setImmediate);
    wrapper.update();

    // Associations are enabled:
    expect(
      wrapper.find(".enable-associations").find(ReactSwitch).prop("checked")
    ).toEqual(true);
    expect(wrapper.find("#associations-section").exists()).toEqual(true);

    wrapper.find("form").simulate("submit");

    await new Promise(setImmediate);
    wrapper.update();

    // Saves the Material Sample:
    expect(mockSave.mock.calls).toEqual([
      [
        [
          {
            resource: {
              id: "333",
              relationships: {},
              attachment: undefined,
              preparationAttachment: undefined,
              projects: undefined,
              type: "material-sample"
            },
            type: "material-sample"
          }
        ],
        {
          apiBaseUrl: "/collection-api"
        }
      ]
    ]);
  });

  it("Renders an existing Material Sample with all toggleable data components disabled.", async () => {
    const wrapper = mountWithAppContext(
      <MaterialSampleForm
        materialSample={{
          type: "material-sample",
          id: "333",
          materialSampleName: "test-ms",
          preparationAttachment: [], // This empty array should be treated as a blank value.
          attachment: [],
          organism: []
        }}
        onSaved={mockOnSaved}
      />,
      testCtx
    );

    await new Promise(setImmediate);
    wrapper.update();

    // Data components are disabled:
    expect(
      wrapper.find(".enable-collecting-event").find(ReactSwitch).prop("checked")
    ).toEqual(false);
    expect(
      wrapper
        .find(".enable-acquisition-event")
        .find(ReactSwitch)
        .prop("checked")
    ).toEqual(false);
    expect(
      wrapper.find(".enable-catalogue-info").find(ReactSwitch).prop("checked")
    ).toEqual(false);
    expect(
      wrapper.find(".enable-organisms").find(ReactSwitch).prop("checked")
    ).toEqual(false);
    expect(
      wrapper.find(".enable-storage").find(ReactSwitch).prop("checked")
    ).toEqual(false);
    expect(
      wrapper
        .find(".enable-scheduled-actions")
        .find(ReactSwitch)
        .prop("checked")
    ).toEqual(false);
  });

  it("Renders an existing Material Sample with the managed attribute when there is selected attribute with assinged value", async () => {
    const wrapper = mountWithAppContext(
      <MaterialSampleForm
        materialSample={{
          ...testMaterialSample(),
          id: "333",
          materialSampleName: "test-ms",
          managedAttributes: {
            test_attr: "do the test"
          }
        }}
        onSaved={mockOnSaved}
      />,
      testCtx
    );

    await new Promise(setImmediate);
    wrapper.update();

    wrapper.find("form").simulate("submit");

    await new Promise(setImmediate);
    wrapper.update();

    expect(mockSave.mock.calls).toEqual([
      [
        [
          {
            resource: {
              id: "333",
              relationships: {},
              type: "material-sample"
            },
            type: "material-sample"
          }
        ],
        {
          apiBaseUrl: "/collection-api"
        }
      ]
    ]);
  });

  it("Submits a new Material Sample with 3 Determinations.", async () => {
    const wrapper = mountWithAppContext(
      <MaterialSampleForm onSaved={mockOnSaved} />,
      testCtx
    );

    await new Promise(setImmediate);
    wrapper.update();

    // Set the group:
    wrapper.find(".group-field Select").prop<any>("onChange")({
      label: "group",
      value: "test group"
    });

    wrapper
      .find(".materialSampleName-field input")
      .simulate("change", { target: { value: "test-material-sample-id" } });

    // Enable the Organisms form section:
    wrapper.find(".enable-organisms").find(Switch).prop<any>("onChange")(true);
    await new Promise(setImmediate);
    wrapper.update();

    // Add a determination:
    wrapper.find(".determination-section button.add-button").simulate("click");
    await new Promise(setImmediate);
    wrapper.update();

    function fillOutDetermination(num: number) {
      wrapper
        .find(".verbatimScientificName-field input")
        .last()
        .simulate("change", { target: { value: `test-name-${num}` } });
      wrapper
        .find(".verbatimDeterminer-field input")
        .last()
        .simulate("change", { target: { value: `test-agent-${num}` } });
    }

    // Enter the first determination:
    fillOutDetermination(1);

    // Enter the second determination:
    wrapper.find(".determination-section button.add-button").simulate("click");
    await new Promise(setImmediate);
    fillOutDetermination(2);

    // Enter the third determination:
    wrapper.find(".determination-section button.add-button").simulate("click");
    await new Promise(setImmediate);
    fillOutDetermination(3);

    wrapper.find("form").simulate("submit");

    await new Promise(setImmediate);
    wrapper.update();

    // Saves the Material Sample:
    expect(mockSave.mock.calls).toEqual([
      // First submits the organism in one transaction:
      [
        [
          {
            resource: {
              determination: [
                {
                  verbatimDeterminer: "test-agent-1",
                  verbatimScientificName: "test-name-1"
                },
                {
                  verbatimDeterminer: "test-agent-2",
                  verbatimScientificName: "test-name-2"
                },
                {
                  verbatimDeterminer: "test-agent-3",
                  verbatimScientificName: "test-name-3"
                }
              ],
              // The organism should get the same group as the Material Sample:
              group: "test group",
              type: "organism"
            },
            type: "organism"
          }
        ],
        { apiBaseUrl: "/collection-api" }
      ],
      // Submits the sample with the linked organism:
      [
        [
          {
            resource: expect.objectContaining({
              group: "test group",
              relationships: expect.objectContaining({
                organism: {
                  data: [
                    {
                      id: "11111111-1111-1111-1111-111111111111",
                      type: "organism"
                    }
                  ]
                }
              }),
              type: "material-sample"
            }),
            type: "material-sample"
          }
        ],
        { apiBaseUrl: "/collection-api" }
      ]
    ]);
  });

  it("Creates the next material sample based on the original sample's values.", () => {
    expect(
      nextSampleInitialValues({
        id: "123",
        type: "material-sample",
        createdBy: "Mat",
        createdOn: "2020-05-04",
        materialSampleName: "MY-SAMPLE-001"
      })
    ).toEqual({
      // Omits id/createdBy/createdOn, increments the name:
      type: "material-sample",
      materialSampleName: "MY-SAMPLE-002"
    });

    expect(
      nextSampleInitialValues({
        id: "123",
        type: "material-sample",
        materialSampleName: "MY-SAMPLE-9"
      })
    ).toEqual({
      // Increments the name:
      type: "material-sample",
      materialSampleName: "MY-SAMPLE-10"
    });

    expect(
      nextSampleInitialValues({
        id: "123",
        type: "material-sample",
        materialSampleName: "1-MY-SAMPLE"
      })
    ).toEqual({
      // No way to increment the name, so it becomes blank:
      type: "material-sample",
      materialSampleName: ""
    });
  });

  it("Creates a material sample with a new Acquisition Event", async () => {
    const wrapper = mountWithAppContext(
      <MaterialSampleForm onSaved={mockOnSaved} />,
      testCtx
    );

    await new Promise(setImmediate);
    wrapper.update();

    // Enable Collecting Event and catalogue info form sections:
    wrapper
      .find(".enable-acquisition-event")
      .find(Switch)
      .prop<any>("onChange")(true);

    await new Promise(setImmediate);
    wrapper.update();

    wrapper
      .find(".receptionRemarks-field textarea")
      .simulate("change", { target: { value: "new acq event remarks" } });

    wrapper.find("form").simulate("submit");

    await new Promise(setImmediate);
    wrapper.update();

    // Saves the Acq Event and the Material Sample:
    expect(mockSave.mock.calls).toEqual([
      [
        [
          {
            resource: {
              receptionRemarks: "new acq event remarks",
              type: "acquisition-event"
            },
            type: "acquisition-event"
          }
        ],
        {
          apiBaseUrl: "/collection-api"
        }
      ],
      [
        [
          {
            resource: expect.objectContaining({
              acquisitionEvent: {
                id: "11111111-1111-1111-1111-111111111111",
                type: "acquisition-event"
              }
            }),
            type: "material-sample"
          }
        ],
        { apiBaseUrl: "/collection-api" }
      ]
    ]);
  });

  it("Created a material sample linked to an existing Acquisition event", async () => {
    const wrapper = mountWithAppContext(
      <MaterialSampleForm onSaved={mockOnSaved} />,
      testCtx
    );

    await new Promise(setImmediate);
    wrapper.update();

    // Enable Collecting Event and catalogue info form sections:
    wrapper
      .find(".enable-acquisition-event")
      .find(Switch)
      .prop<any>("onChange")(true);

    await new Promise(setImmediate);
    wrapper.update();

    wrapper.find("button.acquisition-event-link-button").simulate("click");

    await new Promise(setImmediate);
    wrapper.update();

    wrapper.find("form").simulate("submit");

    await new Promise(setImmediate);
    wrapper.update();

    // Saves the Material Sample:
    expect(mockSave.mock.calls).toEqual([
      [
        [
          {
            resource: expect.objectContaining({
              acquisitionEvent: {
                id: "1",
                type: "acquisition-event"
              }
            }),
            type: "material-sample"
          }
        ],
        {
          apiBaseUrl: "/collection-api"
        }
      ]
    ]);
  });

  it("Lets you remove the attached Acquisition Event", async () => {
    const wrapper = mountWithAppContext(
      <MaterialSampleForm
        materialSample={testMaterialSample()}
        onSaved={mockOnSaved}
      />,
      testCtx
    );

    await new Promise(setImmediate);
    wrapper.update();

    // Existing AcquisitionEvent should show up:
    expect(
      wrapper.find(".receptionRemarks-field textarea").prop("value")
    ).toEqual("test reception remarks");

    wrapper
      .find("#acquisition-event-section button.detach-resource-button")
      .simulate("click");

    await new Promise(setImmediate);
    wrapper.update();

    // Existing AcquisitionEvent should be gone:
    expect(
      wrapper.find(".receptionRemarks-field textarea").prop("value")
    ).toEqual("");

    // Set the new Acquisition Event's receptionRemarks:
    wrapper
      .find(".receptionRemarks-field textarea")
      .simulate("change", { target: { value: "new remarks value" } });

    wrapper.find("form").simulate("submit");

    await new Promise(setImmediate);
    wrapper.update();

    expect(mockSave.mock.calls).toEqual([
      [
        [
          {
            resource: {
              receptionRemarks: "new remarks value",
              type: "acquisition-event"
            },
            type: "acquisition-event"
          }
        ],
        { apiBaseUrl: "/collection-api" }
      ],
      [
        [
          {
            resource: {
              id: "1",
              type: "material-sample",
              acquisitionEvent: {
                id: "11111111-1111-1111-1111-111111111111",
                type: "acquisition-event"
              },
              relationships: {}
            },
            type: "material-sample"
          }
        ],
        { apiBaseUrl: "/collection-api" }
      ]
    ]);
  });

  it("Submits a new Material Sample with a duplicate sample name: Shows an error", async () => {
    const wrapper = mountWithAppContext(
      <MaterialSampleForm onSaved={mockOnSaved} />,
      testCtx
    );

    await new Promise(setImmediate);
    wrapper.update();

    wrapper
      .find(".materialSampleName-field input")
      .simulate("change", { target: { value: "test-duplicate-name" } });

    wrapper.find("form").simulate("submit");
    await new Promise(setImmediate);
    wrapper.update();

    expect(
      wrapper.find(".materialSampleName-field input").hasClass("is-invalid")
    ).toEqual(true);

    // You should not be able to submit the form until this error is resolved:
    wrapper.find("form").simulate("submit");
    await new Promise(setImmediate);
    wrapper.update();

    expect(mockOnSaved).toHaveBeenCalledTimes(0);

    // Click the "allow" button:
    wrapper.find("button.allow-duplicate-button").first().simulate("click");
    await new Promise(setImmediate);
    wrapper.update();

    expect(
      wrapper.find(".materialSampleName-field input").hasClass("is-invalid")
    ).toEqual(false);

    // Submit the form with no errors:
    wrapper.find("form").simulate("submit");
    await new Promise(setImmediate);
    wrapper.update();

    // Form submitted successfully:
    expect(mockOnSaved).lastCalledWith("11111111-1111-1111-1111-111111111111");
  });

  it("Add the associated sample selected from search result list to a new association  .", async () => {
    // Mount a new material sample with no values
    const wrapper = mountWithAppContext(
      <MaterialSampleForm onSaved={mockOnSaved} />,
      testCtx
    );

    await new Promise(setImmediate);
    wrapper.update();

    // Enable association:
    wrapper
      .find(".enable-associations")
      .find(ReactSwitch)
      .prop<any>("onChange")(true);

    await new Promise(setImmediate);
    wrapper.update();

    // Add a new association
    wrapper.find("button.add-button").simulate("click");
    await new Promise(setImmediate);
    wrapper.update();

    expect(wrapper.find("button.searchSample")).toBeTruthy();

    // Click the search button to find from a material sample list
    wrapper.find("button.searchSample").simulate("click");

    await new Promise(setImmediate);
    wrapper.update();

    // Search table is shown:
    expect(wrapper.find(".associated-sample-search").exists()).toEqual(true);

    // Select one sample from search result list
    wrapper.find("button.associated-sample-search").simulate("click");

    await new Promise(setImmediate);
    wrapper.update();

    // Expect the selected sample being populated to the sample input
    expect(wrapper.find(".associated-sample-link").text()).toEqual(
      "my-sample-name"
    );
  });

  it("Lets you add an organism to an existing Material Sample", async () => {
    const wrapper = mountWithAppContext(
      <MaterialSampleForm
        materialSample={{
          type: "material-sample",
          id: "333",
          group: "test-group",
          materialSampleName: "test-ms"
        }}
        onSaved={mockOnSaved}
      />,
      testCtx
    );

    await new Promise(setImmediate);
    wrapper.update();

    // Enable the Organisms form section:
    wrapper.find(".enable-organisms").find(Switch).prop<any>("onChange")(true);
    await new Promise(setImmediate);
    wrapper.update();

    // Add 1 new organism:
    wrapper
      .find(".organismsQuantity-field input")
      .simulate("change", { target: { value: 1 } });

    wrapper
      .find(".lifeStage-field input")
      .at(0)
      .simulate("change", { target: { value: "test lifestage" } });

    wrapper.find("form").simulate("submit");

    await new Promise(setImmediate);
    wrapper.update();

    expect(mockSave.mock.calls).toEqual([
      // Separate transaction to add the organism:
      [
        [
          {
            resource: {
              // The group is copied from the sample:
              group: "test-group",
              lifeStage: "test lifestage",
              type: "organism"
            },
            type: "organism"
          }
        ],
        { apiBaseUrl: "/collection-api" }
      ],
      // Submits the sample:
      [
        [
          {
            resource: expect.objectContaining({
              id: "333",
              relationships: expect.objectContaining({
                organism: {
                  data: [
                    {
                      id: "11111111-1111-1111-1111-111111111111",
                      type: "organism"
                    }
                  ]
                }
              }),
              type: "material-sample"
            }),
            type: "material-sample"
          }
        ],
        { apiBaseUrl: "/collection-api" }
      ]
    ]);
  });

  it("Removed linked organisms when you decrease the Organism Quantity and then submit.", async () => {
    const wrapper = mountWithAppContext(
      <MaterialSampleForm
        materialSample={{
          type: "material-sample",
          id: "333",
          group: "test-group",
          materialSampleName: "test-ms",
          // This sample already has 3 organisms:
          organism: [
            {
              type: "organism",
              id: "organism-1",
              lifeStage: "lifestage 1",
              group: "test-group"
            },
            {
              type: "organism",
              id: "organism-2",
              lifeStage: "lifestage 2",
              group: "test-group"
            },
            {
              type: "organism",
              id: "organism-3",
              lifeStage: "lifestage 3",
              group: "test-group"
            }
          ]
        }}
        onSaved={mockOnSaved}
      />,
      testCtx
    );

    await new Promise(setImmediate);
    wrapper.update();

    expect(wrapper.find(".organisms-section").exists()).toEqual(true);

    // Expand all organism sections:
    wrapper.find("button.expand-organism.not-expanded").at(0).simulate("click");
    wrapper.find("button.expand-organism.not-expanded").at(0).simulate("click");
    wrapper.find("button.expand-organism.not-expanded").at(0).simulate("click");

    // Edit the 3rd organism and leave the 2nd one alone to make sure new and old data is being removed:
    wrapper
      .find(".lifeStage-field input")
      .at(2)
      .simulate("change", { target: { value: "this should be removed" } });

    // Reduce the organisms to 1:
    wrapper
      .find(".organismsQuantity-field input")
      .simulate("change", { target: { value: "1" } });

    wrapper.find("form").simulate("submit");

    await new Promise(setImmediate);
    wrapper.update();

    expect(mockSave.mock.calls).toEqual([
      [
        [
          // Only the first organism is kept:
          {
            resource: {
              id: "organism-1",
              group: "test-group",
              lifeStage: "lifestage 1",
              type: "organism"
            },
            type: "organism"
          }
        ],
        { apiBaseUrl: "/collection-api" }
      ],
      [
        [
          {
            resource: expect.objectContaining({
              id: "333",
              relationships: expect.objectContaining({
                organism: {
                  data: [
                    {
                      id: "organism-1",
                      type: "organism"
                    }
                  ]
                }
              }),
              type: "material-sample"
            }),
            type: "material-sample"
          }
        ],
        { apiBaseUrl: "/collection-api" }
      ]
    ]);
  });
});
