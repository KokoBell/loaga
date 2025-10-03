// A simple, Jest-like test runner for an environment without a full test framework.

let failures = 0;
let passes = 0;
let beforeEachCallbacks: (() => void)[] = [];
let afterAllCallbacks: (() => void)[] = [];
let testQueue: { description: string, fn: () => Promise<void> | void }[] = [];


export const describe = (description: string, fn: () => void) => {
  console.log(`\n--- ${description} ---`);
  // Reset callbacks for each suite. This doesn't support nested suites, but it's fine for this project's structure.
  beforeEachCallbacks = [];
  afterAllCallbacks = [];
  testQueue = [];
  fn(); // This populates the testQueue via `it` calls
};

export const beforeEach = (fn: () => void) => {
  beforeEachCallbacks.push(fn);
};

export const afterAll = (fn: () => void) => {
  afterAllCallbacks.push(fn);
};

export const it = (description: string, fn: () => Promise<void> | void) => {
  testQueue.push({ description, fn });
};

export const expect = (actual: any) => {
  return {
    toEqual: (expected: any) => {
      const actualStr = JSON.stringify(actual);
      const expectedStr = JSON.stringify(expected);
      if (actualStr !== expectedStr) {
        throw new Error(`\nExpected: ${expectedStr}\nReceived: ${actualStr}`);
      }
    },
    toBe: (expected: any) => {
        if (actual !== expected) {
            throw new Error(`\nExpected: ${expected}\nReceived: ${actual}`);
        }
    },
    toBeDefined: () => {
        if (actual === undefined || actual === null) {
            throw new Error(`\nExpected value to be defined, but it was ${actual}`);
        }
    },
    toBeNull: () => {
      if (actual !== null) {
        throw new Error(`\nExpected value to be null, but it was ${actual}`);
      }
    },
    toBeTruthy: () => {
      if (!actual) {
        throw new Error(`\nExpected value to be truthy, but it was ${actual}`);
      }
    },
    toContain: (expected: any) => {
      if (!Array.isArray(actual) || !actual.includes(expected)) {
        throw new Error(`\nExpected array ${JSON.stringify(actual)} to contain ${JSON.stringify(expected)}`);
      }
    },
    not: {
      toEqual: (expected: any) => {
        const actualStr = JSON.stringify(actual);
        const expectedStr = JSON.stringify(expected);
        if (actualStr === expectedStr) {
          throw new Error(`\nExpected values not to be equal:\n${expectedStr}`);
        }
      },
      toBe: (expected: any) => {
        if (actual === expected) {
          throw new Error(`\nExpected value not to be: ${expected}`);
        }
      },
      toBeDefined: () => {
        if (actual !== undefined && actual !== null) {
          throw new Error(`\nExpected value to be undefined or null, but it was defined: ${actual}`);
        }
      },
      toBeNull: () => {
        if (actual === null) {
          throw new Error(`\nExpected value not to be null.`);
        }
      },
      toBeTruthy: () => {
        if (actual) {
          throw new Error(`\nExpected value to be falsy, but it was: ${actual}`);
        }
      },
      toContain: (expected: any) => {
        if (Array.isArray(actual) && actual.includes(expected)) {
          throw new Error(`\nExpected array not to contain ${JSON.stringify(expected)}`);
        }
      },
    },
  };
};

export const runTests = async (testSuite: () => void) => {
    console.log('--- Running Automated Tests ---');
    failures = 0;
    passes = 0;
    
    testSuite(); // This will call describe(), which populates the testQueue

    for (const test of testQueue) {
      try {
        beforeEachCallbacks.forEach(cb => cb());
        await test.fn(); // AWAIT the test function
        console.log(`  ✅ PASS: ${test.description}`);
        passes++;
      } catch (error) {
        console.error(`  ❌ FAIL: ${test.description}`);
        console.error(error);
        failures++;
      }
    }
    
    // Run afterAll callbacks, wrapped in a try/catch to ensure all run.
    try {
        afterAllCallbacks.forEach(cb => cb());
    } catch (e) {
        console.error("Error during afterAll cleanup:", e);
    }


    console.log('\n--- Test Summary ---');
    console.log(`✅ Passes: ${passes}`);
    console.log(`❌ Failures: ${failures}`);
    if(failures > 0) {
        console.error("!! Some tests failed. !!");
    } else {
        console.log("🎉 All tests passed! 🎉");
    }
    console.log('--------------------');
}
