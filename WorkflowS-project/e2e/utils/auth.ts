import type { Page } from "@playwright/test";

export async function loginAs(page: Page, email: string, pass: string) {
	await page.goto("/login");
	await page.fill('input[type="email"]', email);
	await page.fill('input[type="password"]', pass);
	await page.getByRole("button", { name: "Iniciar Sesión" }).click();
	// Wait for navigation to dashboard or home or login-success
	// The app might redirect to /login-success first
	await page.waitForURL(/\/|\/login-success/);
}
