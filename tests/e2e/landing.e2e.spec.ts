import { expect, test } from "@playwright/test"

/**
 * E2E tests for jkboard landing page.
 *
 * These tests verify the complete user journey through the application,
 * which unit and interface tests cannot cover: real browser rendering,
 * network requests, and end-to-state transitions.
 */

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("should load landing page successfully", async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Jkboard/)

    // Verify main heading
    await expect(page.getByRole("heading", { name: /Project management for teams/i })).toBeVisible()

    // Verify hero section
    await expect(page.getByText(/Build, track, and ship faster/i)).toBeVisible()

    // Verify CTA button exists
    await expect(page.getByRole("link", { name: /Start free trial/i })).toBeVisible()
  })

  test("should navigate to sign up flow", async ({ page }) => {
    const ctaButton = page.getByRole("link", { name: /start free trial/i })
    await ctaButton.click()

    // Should navigate to sign-up page
    await expect(page).toHaveURL(/\/sign[-_]up/)

    // Verify sign-up form is visible
    await expect(page.getByPlaceholder("Enter your email")).toBeVisible()
  })

  test("should display features section", async ({ page }) => {
    // Scroll to features section
    await page.evaluate(() => window.scrollTo(0, 500))

    // Verify features are visible
    await expect(page.getByText(/Dashboard/i)).toBeVisible()
    await expect(page.getByText(/Projects/i)).toBeVisible()
    await expect(page.getByText(/Tasks/i)).toBeVisible()
  })

  test("should work on mobile viewport", async ({ page }) => {
    // Resize to mobile dimensions
    await page.setViewportSize({ width: 375, height: 667 })

    // Verify responsive design
    await expect(page).toHaveTitle(/Jkboard/)
    await expect(page.getByRole("heading", { name: /Project management for teams/i })).toBeVisible()

    // Hamburger menu should be visible
    await expect(page.locator('[aria-label="Toggle navigation"]').first()).toBeVisible()
  })
})
