const { test, expect } = require('@playwright/test')

test.describe('Page Navigation', () => {

  test('index → pricing: select a plan → back to home', async ({ page }) => {
    // Start on home
    await page.goto('/')
    await expect(page).toHaveURL('/')

    // Navigate to Pricing
    await page.getByTestId('nav-pricing').click()
    await expect(page).toHaveURL(/pricing\.html/)
    await expect(page.getByTestId('pricing-hero')).toBeVisible()

    // Do an action: click the Pro plan CTA
    await page.getByTestId('plan-pro-cta').click()

    // Should land back on index at #booking
    await expect(page).toHaveURL(/index\.html#booking|localhost.*#booking|^\/$|#booking/)
  })

  test('index → product: click demo CTA → back to home', async ({ page }) => {
    // Start on home
    await page.goto('/')

    // Navigate to Product
    await page.getByTestId('nav-product').click()
    await expect(page).toHaveURL(/product\.html/)
    await expect(page.getByTestId('product-hero')).toBeVisible()

    // Do an action: click Book a Demo
    await page.getByTestId('product-cta').click()

    // Should land back on index at #booking
    await expect(page).toHaveURL(/index\.html#booking|localhost.*#booking|^\/$|#booking/)
  })

  test('pricing → back to home via nav button', async ({ page }) => {
    await page.goto('/pricing.html')
    await expect(page.getByTestId('pricing-hero')).toBeVisible()

    // Click "Back to Home" button in nav
    await page.getByTestId('nav-back-home').click()
    await expect(page).toHaveURL(/localhost:.*\/$|index\.html/)
  })

})
