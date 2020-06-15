import {
  AccountContextI,
  AccountProvider,
  ApiClientContextI,
  AuthenticatedApiClientProvider,
  createContextValue,
  ModalProvider
} from "common-ui";
import { mount } from "enzyme";
import { merge, noop } from "lodash";
import { DinaIntlProvider } from "../intl/dina-ui-intl";

interface MockAppContextProviderProps {
  apiContext?: Partial<ApiClientContextI>;
  accountContext?: Partial<AccountContextI>;
  children?: React.ReactNode;
}

/**
 * Wraps a test-rendered component to provide the contexts that would be available in
 * the application.
 */
export function MockAppContextProvider({
  accountContext,
  apiContext,
  children
}: MockAppContextProviderProps) {
  return (
    <AccountProvider
      value={merge({}, DEFAULT_MOCK_ACCOUNT_CONTEXT, accountContext)}
    >
      <AuthenticatedApiClientProvider
        apiContext={merge({}, DEFAULT_API_CONTEXT_VALUE, apiContext)}
      >
        <DinaIntlProvider>
          <ModalProvider appElement={document.querySelector("body")}>
            {children}
          </ModalProvider>
        </DinaIntlProvider>
      </AuthenticatedApiClientProvider>
    </AccountProvider>
  );
}

/**
 * Helper function to get a test wrapper with the required context providers.
 */
export function mountWithAppContext(
  element: React.ReactNode,
  mockAppContextProviderProps?: MockAppContextProviderProps
) {
  return mount(
    <MockAppContextProvider {...mockAppContextProviderProps}>
      {element}
    </MockAppContextProvider>
  );
}

const DEFAULT_MOCK_ACCOUNT_CONTEXT: AccountContextI = {
  authenticated: true,
  initialized: true,
  login: noop,
  logout: noop,
  token: "test-token",
  username: "test-user"
};

const DEFAULT_API_CONTEXT_VALUE = createContextValue({
  getTempIdGenerator: () => () => "00000000-0000-0000-0000-000000000000"
});
