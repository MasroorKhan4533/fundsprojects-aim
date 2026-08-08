import React from "react";
import "@testing-library/jest-dom/vitest";

// Compatibility guard for dependencies/transforms that still emit classic JSX calls in tests.
globalThis.React = React;
