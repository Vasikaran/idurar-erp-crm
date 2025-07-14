/* eslint-disable @typescript-eslint/no-require-imports */
require("@testing-library/jest-dom");

// Setup global polyfills for Next.js
global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  cache: (fn) => fn,
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));

global.React = require("react");

// Setup global fetch mock
global.fetch = jest.fn();

global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
