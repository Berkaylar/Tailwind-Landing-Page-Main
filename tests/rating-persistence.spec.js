const { test, expect } = require('@playwright/test')

test.describe('Rating localStorage Persistence', () => {

  test('submitted rating persists after page refresh', async ({ page }) => {
    await page.goto('/')

    // No badge on fresh load
    await expect(page.getByTestId('previous-rating-badge')).toBeHidden()

    // Open modal and select 5 stars
    await page.getByTestId('open-rating-modal').click()
    await page.getByTestId('star-5').click()
    await page.getByTestId('rating-submit').click()

    // Banner visible after submit
    await expect(page.getByTestId('rating-banner')).toBeVisible()

    // Verify localStorage was written
    const stored = await page.evaluate(() => localStorage.getItem('manage_user_rating'))
    expect(JSON.parse(stored)).toMatchObject({ value: 5, label: 'Excellent' })

    // Refresh the page
    await page.reload()

    // Badge should now be visible with correct text
    await expect(page.getByTestId('previous-rating-badge')).toBeVisible()
    await expect(page.getByTestId('previous-rating-text')).toHaveText('You previously rated us 5 stars — Excellent')
  })

  test('no badge shown when localStorage is empty', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.removeItem('manage_user_rating'))
    await page.reload()

    await expect(page.getByTestId('previous-rating-badge')).toBeHidden()
  })

  test('updating rating overwrites previous localStorage value', async ({ page }) => {
    await page.goto('/')

    // First rating: 3 stars
    await page.getByTestId('open-rating-modal').click()
    await page.getByTestId('star-3').click()
    await page.getByTestId('rating-submit').click()

    // Second rating: 1 star
    await page.getByTestId('open-rating-modal').click()
    await page.getByTestId('star-1').click()
    await page.getByTestId('rating-submit').click()

    // Refresh — should show latest rating
    await page.reload()

    await expect(page.getByTestId('previous-rating-text')).toHaveText('You previously rated us 1 stars — Poor')

    const stored = await page.evaluate(() => localStorage.getItem('manage_user_rating'))
    expect(JSON.parse(stored)).toMatchObject({ value: 1, label: 'Poor' })
  })

})
