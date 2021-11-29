import { SelectNavigation } from "packages/dina-ui/components/bulk-material-sample/SelectNavigation";
import { MaterialSample } from "packages/dina-ui/types/collection-api/resources/MaterialSample";
import { ReactNode, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";

export interface MaterialSampleBulkNavigatorProps {
  samples: Partial<MaterialSample>[];
  renderOneSample: (sample: Partial<MaterialSample>) => ReactNode;
}

/**
 * Under 10 samples: Shows tabs.
 * 10 or more samples: Shows dropdown navigator with arrow buttons.
 */
export function MaterialSampleBulkNavigator({
  samples,
  renderOneSample
}: MaterialSampleBulkNavigatorProps) {
  const [tabIndex, setTabIndex] = useState(0);

  const tooManySamplesForTabs = samples.length >= 10;

  if (tooManySamplesForTabs) {
    return (
      <div>
        <SelectNavigation
          elements={samples}
          value={tabIndex}
          onChange={setTabIndex}
          optionLabel={sample => sample.materialSampleName}
        />
        {samples.map((sample, index) => (
          <div key={index} className={tabIndex !== index ? "d-none" : ""}>
            {renderOneSample(sample)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <Tabs
      // Prevent unmounting the form on tab switch to avoid losing the form state:
      forceRenderTabPanel={true}
    >
      <TabList>
        {samples.map((sample, index) => (
          <Tab key={index}>{sample.materialSampleName || `#${index + 1}`}</Tab>
        ))}
      </TabList>
      {samples.map((sample, index) => (
        <TabPanel key={index}>{renderOneSample(sample)}</TabPanel>
      ))}
    </Tabs>
  );
}
