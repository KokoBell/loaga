import { runTests } from './testRunner';
import { runLocalStorageTests } from './localStorage.test';

const LOCAL_STORAGE_KEY = 'react-site-builder-project';

export const runAllTests = async () => {
    try {
        await runTests(() => {
            runLocalStorageTests();
            // Add other test suites here in the future
        });
    } finally {
        // As a final, rock-solid guarantee, clear the project from the REAL localStorage
        // after all tests (including mocks) are done. This prevents any test data
        // from ever leaking into the user's session.
        try {
            window.localStorage.removeItem(LOCAL_STORAGE_KEY);
        } catch (e) {
            // Silently fail if localStorage is not accessible (e.g., in a sandboxed iframe).
            // The original error log here was causing test failures in secure environments.
        }
    }
};