const { test, expect } = require('@playwright/test')

test.describe('Rating Modal', () => {

  test('open modal → select 4 stars → submit → modal closes → banner appears on page', async ({ page }) => {
    await page.goto('/')

    // Modal should not be visible initially
    await expect(page.getByTestId('rating-modal-backdrop')).toBeHidden()

    // Open modal
    await page.getByTestId('open-rating-modal').click()
    await expect(page.getByTestId('rating-modal')).toBeVisible()

    // Submit should be disabled before selecting a star
    await expect(page.getByTestId('rating-submit')).toBeDisabled()

    // Select 4 stars
    await page.getByTestId('star-4').click()
    await expect(page.getByTestId('rating-selected-label')).toHaveText('4 / 5 — Great')

    // Submit should now be enabled
    await expect(page.getByTestId('rating-submit')).toBeEnabled()

    // Submit
    await page.getByTestId('rating-submit').click()

    // Modal should close
    await expect(page.getByTestId('rating-modal-backdrop')).toBeHidden()

    // Banner should appear on page with correct text
    await expect(page.getByTestId('rating-banner')).toBeVisible()
    await expect(page.getByTestId('rating-banner-text')).toHaveText('Thanks for your 4-star rating! (Great)')
  })

  test('cancel closes modal without showing banner', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('open-rating-modal').click()
    await expect(page.getByTestId('rating-modal')).toBeVisible()

    await page.getByTestId('rating-cancel').click()

    await expect(page.getByTestId('rating-modal-backdrop')).toBeHidden()
    await expect(page.getByTestId('rating-banner')).toBeHidden()
  })

  test('clicking backdrop closes modal', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('open-rating-modal').click()
    await expect(page.getByTestId('rating-modal')).toBeVisible()

    // Click outside the modal (on the backdrop)
    await page.getByTestId('rating-modal-backdrop').click({ position: { x: 10, y: 10 } })

    await expect(page.getByTestId('rating-modal-backdrop')).toBeHidden()
  })

  test('each star value shows correct label', async ({ page }) => {
    const labels = ['Poor', 'Fair', 'Good', 'Great', 'Excellent']

    await page.goto('/')
    await page.getByTestId('open-rating-modal').click()

    for (let i = 1; i <= 5; i++) {
      await page.getByTestId(`star-${i}`).click()
      await expect(page.getByTestId('rating-selected-label')).toHaveText(`${i} / 5 — ${labels[i - 1]}`)
    }
  })

})
