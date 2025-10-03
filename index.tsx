import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { runAllTests } from './tests/runTests';

// Mount the application immediately so the UI is not blocked
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Run automated tests in the background without blocking the UI
runAllTests().catch(error => {
  console.error("An error occurred during the test run:", error);
});
