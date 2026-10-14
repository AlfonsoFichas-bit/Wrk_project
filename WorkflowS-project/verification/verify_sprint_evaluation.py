from playwright.sync_api import sync_playwright

def verify_evaluations_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Login as Admin (Teacher)
        print("Navigating to login...")
        page.goto("http://localhost:3000/login")
        page.wait_for_selector("input[name='email']")

        print("Logging in...")
        page.fill("input[name='email']", "docente@workflow.com")
        page.fill("input[name='password']", "admin123")
        page.click("button[type='submit']")

        # Manually wait a bit for potential navigation start, then check url
        # Sometimes 'wait_for_url' is strict about transitions.
        # We can just wait for an element on the dashboard.
        print("Waiting for dashboard element...")
        try:
             # Wait for sidebar project link or something specific to dashboard
             page.wait_for_selector("a[href='/projects']", timeout=15000)
        except Exception:
             print("Dashboard didn't load. Taking error screenshot.")
             page.screenshot(path="verification/error_login.png")
             raise

        print("Navigating to Evaluations...")
        page.goto("http://localhost:3000/evaluations")

        # Wait for header
        print("Waiting for Sprint Grading header...")
        try:
            page.wait_for_selector("h1:has-text('Gestión de Calificaciones (Sprints)')", timeout=15000)
            print("Successfully found 'Gestión de Calificaciones (Sprints)' header.")
        except Exception as e:
            print("Failed to find header. Taking error screenshot.")
            page.screenshot(path="verification/error_evaluations_page.png")
            raise e

        # Take screenshot
        page.screenshot(path="verification/evaluations_page.png")

        print("Screenshot taken at verification/evaluations_page.png")
        browser.close()

if __name__ == "__main__":
    verify_evaluations_page()
