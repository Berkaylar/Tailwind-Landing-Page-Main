const { test, expect } = require('@playwright/test')

// Mirror the exact same formulas used in script.js
function expectedROI({ teamSize, hoursPerWeek, hourlyRate, monthlyInvest }) {
  const monthlySavings = teamSize * hoursPerWeek * 4.33 * hourlyRate
  const annualSavings  = monthlySavings * 12
  const annualInvest   = monthlyInvest * 12
  const roi            = annualInvest > 0 ? ((annualSavings - annualInvest) / annualInvest) * 100 : 0
  const fmt    = n => '$' + Math.round(n).toLocaleString('en-US')
  const fmtRoi = n => (n >= 0 ? '+' : '') + Math.round(n) + '%'
  return {
    monthly: fmt(monthlySavings),
    annual:  fmt(annualSavings),
    roi:     fmtRoi(roi),
  }
}

test.describe('ROI Calculator', () => {

  test('results hidden and placeholder shown before inputs are filled', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('roi-results')).toBeHidden()
    await expect(page.getByTestId('roi-placeholder')).toBeVisible()
  })

  test('results appear after all four fields are filled', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('roi-team-size').fill('10')
    await page.getByTestId('roi-hours-saved').fill('5')
    await page.getByTestId('roi-hourly-rate').fill('75')
    await page.getByTestId('roi-monthly-investment').fill('2000')

    await expect(page.getByTestId('roi-results')).toBeVisible()
    await expect(page.getByTestId('roi-placeholder')).toBeHidden()
  })

  test('calculates correct monthly savings, annual savings and ROI', async ({ page }) => {
    await page.goto('/')

    const inputs = { teamSize: 10, hoursPerWeek: 5, hourlyRate: 75, monthlyInvest: 2000 }
    const expected = expectedROI(inputs)

    await page.getByTestId('roi-team-size').fill(String(inputs.teamSize))
    await page.getByTestId('roi-hours-saved').fill(String(inputs.hoursPerWeek))
    await page.getByTestId('roi-hourly-rate').fill(String(inputs.hourlyRate))
    await page.getByTestId('roi-monthly-investment').fill(String(inputs.monthlyInvest))

    await expect(page.getByTestId('roi-monthly-savings')).toHaveText(expected.monthly)
    await expect(page.getByTestId('roi-annual-savings')).toHaveText(expected.annual)
    await expect(page.getByTestId('roi-percentage')).toHaveText(expected.roi)
  })

  test('result updates in real-time when an input changes', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('roi-team-size').fill('5')
    await page.getByTestId('roi-hours-saved').fill('4')
    await page.getByTestId('roi-hourly-rate').fill('50')
    await page.getByTestId('roi-monthly-investment').fill('1000')

    const first = expectedROI({ teamSize: 5, hoursPerWeek: 4, hourlyRate: 50, monthlyInvest: 1000 })
    await expect(page.getByTestId('roi-monthly-savings')).toHaveText(first.monthly)

    // Change team size to 20
    await page.getByTestId('roi-team-size').fill('20')

    const updated = expectedROI({ teamSize: 20, hoursPerWeek: 4, hourlyRate: 50, monthlyInvest: 1000 })
    await expect(page.getByTestId('roi-monthly-savings')).toHaveText(updated.monthly)
    await expect(page.getByTestId('roi-annual-savings')).toHaveText(updated.annual)
    await expect(page.getByTestId('roi-percentage')).toHaveText(updated.roi)
  })

  test('results hide again if a field is cleared', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('roi-team-size').fill('10')
    await page.getByTestId('roi-hours-saved').fill('5')
    await page.getByTestId('roi-hourly-rate').fill('75')
    await page.getByTestId('roi-monthly-investment').fill('2000')

    await expect(page.getByTestId('roi-results')).toBeVisible()

    // Clear one field
    await page.getByTestId('roi-hourly-rate').fill('')

    await expect(page.getByTestId('roi-results')).toBeHidden()
    await expect(page.getByTestId('roi-placeholder')).toBeVisible()
  })

  test('large team: calculates correctly', async ({ page }) => {
    await page.goto('/')

    const inputs = { teamSize: 500, hoursPerWeek: 10, hourlyRate: 120, monthlyInvest: 50000 }
    const expected = expectedROI(inputs)

    await page.getByTestId('roi-team-size').fill(String(inputs.teamSize))
    await page.getByTestId('roi-hours-saved').fill(String(inputs.hoursPerWeek))
    await page.getByTestId('roi-hourly-rate').fill(String(inputs.hourlyRate))
    await page.getByTestId('roi-monthly-investment').fill(String(inputs.monthlyInvest))

    await expect(page.getByTestId('roi-monthly-savings')).toHaveText(expected.monthly)
    await expect(page.getByTestId('roi-annual-savings')).toHaveText(expected.annual)
    await expect(page.getByTestId('roi-percentage')).toHaveText(expected.roi)
  })

})
