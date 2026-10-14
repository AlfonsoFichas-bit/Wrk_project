from playwright.sync_api import sync_playwright

def verify_student_dashboard():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Login as Team Developer (Student)
        page.goto("http://localhost:3000/login")
        page.fill("input[name='email']", "student@workflow.com")
        page.fill("input[name='password']", "password123")
        page.click("button[type='submit']")

        # Wait for dashboard
        page.wait_for_selector("text=Herramientas Comunes", timeout=10000)

        # Take screenshot
        page.screenshot(path="verification/student_dashboard.png")
        print("Screenshot taken at verification/student_dashboard.png")
        browser.close()

if __name__ == "__main__":
    verify_student_dashboard()
