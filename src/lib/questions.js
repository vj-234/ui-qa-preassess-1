// src/lib/questions.js
// Candidate-safe question data — NO correct answers, NO rubrics

export const QUESTIONS = [
  { id: 1, section: "Python Fundamentals", sectionIdx: 0, type: "mcq", difficulty: "Easy", time: 90,
    question: "Which Python library is most commonly used as the base for browser automation in UI testing?",
    options: ["requests", "selenium", "pytest-ui", "mechanize"] },

  { id: 2, section: "Python Fundamentals", sectionIdx: 0, type: "mcq", difficulty: "Easy", time: 90,
    question: "What does the following locator strategy return?\n\ndriver.find_elements(By.CLASS_NAME, 'btn-primary')",
    options: [
      "The first element with class 'btn-primary'",
      "A list of all elements with class 'btn-primary'",
      "An error — find_elements requires XPath",
      "A single WebElement object"
    ] },

  { id: 3, section: "Python Fundamentals", sectionIdx: 0, type: "code", difficulty: "Medium", time: 300,
    question: "Write a Python function using Selenium that:\n1. Navigates to a URL\n2. Waits up to 10 seconds for a button with id='submit-btn' to be clickable\n3. Clicks it\n4. Returns True on success, False on timeout\n\nUse explicit waits (not time.sleep).",
    placeholder: "from selenium import webdriver\nfrom selenium.webdriver.common.by import By\nfrom selenium.webdriver.support.ui import WebDriverWait\nfrom selenium.webdriver.support import expected_conditions as EC\n\ndef click_submit(driver, url):\n    # Your code here\n    pass" },

  { id: 4, section: "Python Fundamentals", sectionIdx: 0, type: "mcq", difficulty: "Medium", time: 120,
    question: "In pytest, which decorator is used to parametrize a test function with multiple input sets?",
    options: ["@pytest.fixture", "@pytest.parametrize", "@pytest.mark.parametrize", "@pytest.mark.params"] },

  { id: 5, section: "Python Fundamentals", sectionIdx: 0, type: "mcq", difficulty: "Hard", time: 150,
    question: "You have a test that intermittently fails due to StaleElementReferenceException. What is the BEST approach?",
    options: [
      "Add time.sleep(2) before every element interaction",
      "Re-locate the element inside a retry loop using WebDriverWait",
      "Use driver.refresh() before each assertion",
      "Increase the implicit wait timeout to 30 seconds"
    ] },

  { id: 6, section: "Selenium Deep Dive", sectionIdx: 1, type: "mcq", difficulty: "Easy", time: 90,
    question: "Which Selenium wait type blocks ALL further commands until the condition is met or timeout expires?",
    options: ["Implicit Wait", "Explicit Wait", "Fluent Wait", "Page Load Wait"] },

  { id: 7, section: "Selenium Deep Dive", sectionIdx: 1, type: "mcq", difficulty: "Medium", time: 120,
    question: "What is the XPath to find a <button> element that contains exactly the text 'Login'?",
    options: [
      "//button[@text='Login']",
      "//button[text()='Login']",
      "//button[contains(@value, 'Login')]",
      "//button[@id='Login']"
    ] },

  { id: 8, section: "Selenium Deep Dive", sectionIdx: 1, type: "code", difficulty: "Medium", time: 360,
    question: "Implement a Page Object Model (POM) class for a Login Page with:\n- URL: https://example.com/login\n- Email field: id='email'\n- Password field: id='password'\n- Submit button: css='.btn-login'\n- Error message: xpath=//div[@class='error-msg']\n\nInclude a login() method and a get_error() method.",
    placeholder: "from selenium.webdriver.common.by import By\nfrom selenium.webdriver.support.ui import WebDriverWait\nfrom selenium.webdriver.support import expected_conditions as EC\n\nclass LoginPage:\n    URL = 'https://example.com/login'\n    \n    def __init__(self, driver):\n        # Your code here\n        pass" },

  { id: 9, section: "Selenium Deep Dive", sectionIdx: 1, type: "mcq", difficulty: "Hard", time: 150,
    question: "To interact with an element inside a shadow DOM, which approach works in Selenium 4?",
    options: [
      "driver.find_element(By.SHADOW_DOM, '#inner-el')",
      "Use JavaScript: driver.execute_script('return document.querySelector(\"host\").shadowRoot').find_element(By.CSS_SELECTOR, '#inner-el')",
      "shadow_root = driver.find_element(By.CSS_SELECTOR, 'host-element').shadow_root, then shadow_root.find_element(...)",
      "Shadow DOM elements are inaccessible via Selenium"
    ] },

  { id: 10, section: "Selenium Deep Dive", sectionIdx: 1, type: "mcq", difficulty: "Hard", time: 180,
    question: "Your CI pipeline runs 200 Selenium tests sequentially and takes 45 minutes. Which strategy would MOST effectively reduce runtime?",
    options: [
      "Switch from Chrome to headless Firefox",
      "Use Selenium Grid with parallel test execution across multiple nodes",
      "Increase implicit wait to reduce flakiness",
      "Convert all XPath selectors to CSS selectors"
    ] },

  { id: 11, section: "Selenium Deep Dive", sectionIdx: 1, type: "code", difficulty: "Hard", time: 420,
    question: "Write a Python context manager called managed_driver that:\n1. Accepts a browser name ('chrome' or 'firefox') and headless flag\n2. Yields a configured WebDriver instance\n3. Ensures driver.quit() is always called (even on exceptions)\n4. Supports Chrome options: --headless, --no-sandbox, --disable-dev-shm-usage",
    placeholder: "from contextlib import contextmanager\nfrom selenium import webdriver\n\n@contextmanager\ndef managed_driver(browser='chrome', headless=False):\n    # Your code here\n    pass" },

  { id: 12, section: "JavaScript Testing", sectionIdx: 2, type: "mcq", difficulty: "Easy", time: 90,
    question: "In Jest, which matcher checks that a function throws an error when called?",
    options: ["expect(fn).toThrow()", "expect(fn()).toError()", "expect(fn).toRaiseError()", "expect(fn).throws()"] },

  { id: 13, section: "JavaScript Testing", sectionIdx: 2, type: "code", difficulty: "Medium", time: 300,
    question: "Using Cypress, write a test that:\n1. Visits '/dashboard'\n2. Asserts the page title contains 'Dashboard'\n3. Finds a table with data-testid='user-table'\n4. Asserts it has more than 0 rows (tr elements inside tbody)\n5. Clicks the first row and asserts the URL changes to match /users/\\d+",
    placeholder: "describe('Dashboard', () => {\n  it('shows user table and navigates on row click', () => {\n    // Your code here\n  });\n});" },

  { id: 14, section: "JavaScript Testing", sectionIdx: 2, type: "mcq", difficulty: "Medium", time: 120,
    question: "In Playwright, what is the key advantage of auto-waiting over Selenium's explicit/implicit waits?",
    options: [
      "Playwright waits are faster because they use setTimeout internally",
      "Playwright automatically retries assertions and actions until elements are stable/visible/enabled — no wait config needed",
      "Playwright does not support waits — it assumes pages load instantly",
      "Playwright uses machine learning to predict when elements appear"
    ] },

  { id: 15, section: "JavaScript Testing", sectionIdx: 2, type: "mcq", difficulty: "Hard", time: 150,
    question: "You need to test a React component in isolation without a real browser. Which tool is BEST suited?",
    options: [
      "Selenium WebDriver with headless Chrome",
      "Cypress Component Testing or React Testing Library with Jest",
      "Playwright in API-only mode",
      "Puppeteer with full browser launch"
    ] },

  { id: 16, section: "JavaScript Testing", sectionIdx: 2, type: "code", difficulty: "Hard", time: 360,
    question: "Write a Playwright test (TypeScript) that intercepts an API call to '/api/users' and mocks the response with 2 users, then asserts those user names appear on the page.\n\nAssume the page renders user names in <li> elements.",
    placeholder: "import { test, expect } from '@playwright/test';\n\ntest('displays mocked users', async ({ page }) => {\n  // Your code here\n});" },

  { id: 17, section: "Scenario & Design", sectionIdx: 3, type: "essay", difficulty: "Medium", time: 360,
    question: "A checkout flow has 6 steps: Cart → Shipping → Payment → Review → Confirm → Receipt.\n\nDescribe how you would structure your automation test suite for this flow. Cover:\n- Test organization strategy\n- What to test at each layer (unit/integration/e2e)\n- How to handle test data\n- How to avoid brittle tests",
    placeholder: "Write your approach here...\n\nConsider: test pyramid, data management, POM patterns, CI integration..." },

  { id: 18, section: "Scenario & Design", sectionIdx: 3, type: "mcq", difficulty: "Hard", time: 120,
    question: "Your team's E2E test suite has 30% flakiness rate. Which combination of fixes addresses ROOT CAUSES most effectively?",
    options: [
      "Rerun failed tests 3 times automatically + increase all timeouts to 60s",
      "Audit and replace implicit waits with explicit waits + use API calls to set test state instead of UI navigation + fix race conditions with proper assertions",
      "Switch test runner from pytest to Robot Framework",
      "Run tests only during off-peak hours when the app is less loaded"
    ] },
];

export const SECTIONS       = ["Python Fundamentals", "Selenium Deep Dive", "JavaScript Testing", "Scenario & Design"];
export const SECTION_COLORS = ["#00d4ff", "#a78bfa", "#34d399", "#fb923c"];
export const SECTION_TIME   = [15, 20, 15, 10];
export const DIFF_COLOR     = { Easy: "#34d399", Medium: "#fbbf24", Hard: "#f87171" };
export const MAX_PTS        = { mcq: 10, code: 20, essay: 15 };
