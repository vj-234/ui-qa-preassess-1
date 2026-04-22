// src/lib/answerKey.js
// ⚠️  INTERVIEWER ONLY — never import this in CandidatePage.js

export const ANSWER_KEY = {
  1:  { correct: 1, explanation: "Selenium WebDriver is the industry-standard Python library for browser automation and UI testing." },
  2:  { correct: 1, explanation: "find_elements() (plural) returns a list. find_element() (singular) returns the first match only." },
  3:  {
    sampleAnswer: `def click_submit(driver, url):
    try:
        driver.get(url)
        wait = WebDriverWait(driver, 10)
        btn = wait.until(EC.element_to_be_clickable((By.ID, "submit-btn")))
        btn.click()
        return True
    except TimeoutException:
        return False`,
    rubric: [
      { text: "Uses WebDriverWait(driver, 10)", pts: 4 },
      { text: "Uses EC.element_to_be_clickable", pts: 4 },
      { text: "Catches TimeoutException (not bare except)", pts: 4 },
      { text: "Returns True on success, False on timeout", pts: 4 },
      { text: "Calls driver.get(url) before waiting", pts: 4 },
    ]
  },
  4:  { correct: 2, explanation: "@pytest.mark.parametrize runs the same test with multiple argument sets." },
  5:  { correct: 1, explanation: "StaleElementReference means DOM re-rendered. Re-locating with explicit wait is the robust fix. sleep() and implicit wait are anti-patterns." },
  6:  { correct: 0, explanation: "Implicit wait is global and blocking on all find_element calls. Explicit/Fluent are scoped to specific conditions." },
  7:  { correct: 1, explanation: "text()='Login' matches exact text content. @text is not a valid XPath attribute." },
  8:  {
    sampleAnswer: `class LoginPage:
    URL = 'https://example.com/login'
    EMAIL  = (By.ID, 'email')
    PASSWORD = (By.ID, 'password')
    SUBMIT = (By.CSS_SELECTOR, '.btn-login')
    ERROR  = (By.XPATH, "//div[@class='error-msg']")

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    def open(self):
        self.driver.get(self.URL)
        return self

    def login(self, email, password):
        self.wait.until(EC.visibility_of_element_located(self.EMAIL)).send_keys(email)
        self.driver.find_element(*self.PASSWORD).send_keys(password)
        self.driver.find_element(*self.SUBMIT).click()
        return self

    def get_error(self):
        return self.wait.until(EC.visibility_of_element_located(self.ERROR)).text`,
    rubric: [
      { text: "Locators defined as class-level tuples (not inline strings)", pts: 3 },
      { text: "WebDriverWait initialized in __init__", pts: 3 },
      { text: "login() accepts email+password and submits form", pts: 4 },
      { text: "get_error() uses explicit wait before reading text", pts: 4 },
      { text: "Unpacks locator tuples with * operator correctly", pts: 3 },
      { text: "Returns self for method chaining (bonus)", pts: 3 },
    ]
  },
  9:  { correct: 2, explanation: "Selenium 4 natively exposes WebElement.shadow_root, returning a ShadowRoot you can query normally." },
  10: { correct: 1, explanation: "Selenium Grid distributes tests across nodes for true parallelism — the only option that cuts wall-clock time substantially." },
  11: {
    sampleAnswer: `@contextmanager
def managed_driver(browser='chrome', headless=False):
    driver = None
    try:
        if browser == 'chrome':
            opts = ChromeOptions()
            if headless:
                opts.add_argument('--headless')
                opts.add_argument('--no-sandbox')
                opts.add_argument('--disable-dev-shm-usage')
            driver = webdriver.Chrome(options=opts)
        elif browser == 'firefox':
            opts = FirefoxOptions()
            if headless:
                opts.add_argument('--headless')
            driver = webdriver.Firefox(options=opts)
        yield driver
    finally:
        if driver:
            driver.quit()`,
    rubric: [
      { text: "Uses @contextmanager decorator", pts: 3 },
      { text: "Handles both 'chrome' and 'firefox' branches", pts: 3 },
      { text: "Applies --headless, --no-sandbox, --disable-dev-shm-usage conditionally", pts: 4 },
      { text: "yield inside try block (not before)", pts: 4 },
      { text: "driver.quit() in finally block", pts: 3 },
      { text: "Guards against driver=None in finally", pts: 3 },
    ]
  },
  12: { correct: 0, explanation: "expect(fn).toThrow() — the function must be wrapped (not called) when passed to expect." },
  13: {
    sampleAnswer: `describe('Dashboard', () => {
  it('shows user table and navigates on row click', () => {
    cy.visit('/dashboard');
    cy.title().should('include', 'Dashboard');
    cy.get('[data-testid="user-table"]')
      .find('tbody tr')
      .should('have.length.greaterThan', 0)
      .first()
      .click();
    cy.url().should('match', /\\/users\\/\\d+/);
  });
});`,
    rubric: [
      { text: "cy.visit('/dashboard')", pts: 3 },
      { text: "cy.title().should('include', 'Dashboard')", pts: 3 },
      { text: "Correct data-testid attribute selector", pts: 3 },
      { text: "Chains .find('tbody tr') on the table", pts: 4 },
      { text: "Asserts length.greaterThan(0)", pts: 4 },
      { text: "cy.url().should('match', regex)", pts: 3 },
    ]
  },
  14: { correct: 1, explanation: "Playwright checks actionability (visible, enabled, stable) automatically before acting, eliminating manual wait code." },
  15: { correct: 1, explanation: "RTL + Jest / Cypress Component Testing render in a virtual DOM — fast, isolated, no real browser needed." },
  16: {
    sampleAnswer: `test('displays mocked users', async ({ page }) => {
  await page.route('/api/users', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Alice Smith' },
        { id: 2, name: 'Bob Jones' }
      ])
    });
  });
  await page.goto('/users');
  const items = page.locator('li');
  await expect(items).toHaveCount(2);
  await expect(items.first()).toContainText('Alice Smith');
  await expect(items.last()).toContainText('Bob Jones');
});`,
    rubric: [
      { text: "page.route('/api/users', ...) for interception", pts: 4 },
      { text: "route.fulfill() with correct status + contentType", pts: 4 },
      { text: "JSON.stringify() for body", pts: 2 },
      { text: "page.goto() called AFTER route setup", pts: 3 },
      { text: "Asserts count = 2", pts: 3 },
      { text: "Asserts text content of items", pts: 4 },
    ]
  },
  17: {
    rubric: [
      { text: "Mentions test pyramid / layered strategy (unit → integration → e2e)", pts: 2 },
      { text: "E2E tests cover critical happy path end-to-end", pts: 2 },
      { text: "Unit/integration tests for individual step logic", pts: 2 },
      { text: "Test data isolation — fixtures, factories, or API seeding", pts: 2 },
      { text: "Page Object Model or equivalent abstraction layer", pts: 2 },
      { text: "Avoids UI for state setup — uses API calls directly", pts: 2 },
      { text: "CI/CD integration (parallelism, reporting)", pts: 2 },
      { text: "Flakiness mitigation — explicit waits, stable selectors", pts: 1 },
    ]
  },
  18: { correct: 1, explanation: "Root causes: timing (explicit waits), interdependence (API state seeding), race conditions (proper assertions). Retries and timeout inflation mask problems without solving them." },
};
