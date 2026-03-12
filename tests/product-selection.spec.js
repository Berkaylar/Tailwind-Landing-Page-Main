const { test, expect } = require('@playwright/test')

test.describe('Product Selection & Chosen Products', () => {

  test('select multiple products on homepage → product page shows correct items', async ({ page }) => {
    await page.goto('/')

    // Select 3 products
    await page.getByTestId('product-checkbox-ai-agents').check()
    await page.getByTestId('product-checkbox-rag-systems').check()
    await page.getByTestId('product-checkbox-process-automation').check()

    // Navigate to product page
    await page.getByTestId('view-products-btn').click()
    await expect(page).toHaveURL(/product\.html/)

    // Chosen products list visible, empty state hidden
    await expect(page.getByTestId('chosen-products-list')).toBeVisible()
    await expect(page.getByTestId('chosen-products-empty')).toBeHidden()

    // Exactly 3 items rendered
    const items = page.locator('[data-testid="chosen-product-item"]')
    await expect(items).toHaveCount(3)

    // Correct products rendered
    const values = await items.evaluateAll(els => els.map(el => el.dataset.value))
    expect(values).toContain('AI Agents')
    expect(values).toContain('RAG Systems')
    expect(values).toContain('Process Automation')
  })

  test('no products selected → product page shows empty state', async ({ page }) => {
    await page.goto('/')

    // Clear any existing selection
    await page.evaluate(() => localStorage.removeItem('manage_selected_products'))
    await page.goto('/product.html')

    await expect(page.getByTestId('chosen-products-empty')).toBeVisible()
    await expect(page.getByTestId('chosen-products-list')).toBeHidden()
    await expect(page.locator('[data-testid="chosen-product-item"]')).toHaveCount(0)
  })

  test('unchecking a product removes it from chosen list', async ({ page }) => {
    await page.goto('/')

    // Select 3
    await page.getByTestId('product-checkbox-ai-agents').check()
    await page.getByTestId('product-checkbox-n8n-workflows').check()
    await page.getByTestId('product-checkbox-ai-strategy').check()

    // Uncheck one
    await page.getByTestId('product-checkbox-n8n-workflows').uncheck()

    await page.goto('/product.html')

    const items = page.locator('[data-testid="chosen-product-item"]')
    await expect(items).toHaveCount(2)

    const values = await items.evaluateAll(els => els.map(el => el.dataset.value))
    expect(values).toContain('AI Agents')
    expect(values).toContain('AI Strategy')
    expect(values).not.toContain('n8n Workflows')
  })

  test('selections persist across page refresh on homepage', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('product-checkbox-custom-integrations').check()
    await page.getByTestId('product-checkbox-rag-systems').check()

    await page.reload()

    // Checkboxes should still be checked after reload
    await expect(page.getByTestId('product-checkbox-custom-integrations')).toBeChecked()
    await expect(page.getByTestId('product-checkbox-rag-systems')).toBeChecked()
    await expect(page.getByTestId('product-checkbox-ai-agents')).not.toBeChecked()
  })

  test('all 6 products can be selected and rendered', async ({ page }) => {
    await page.goto('/')

    const checkboxes = [
      'product-checkbox-ai-agents',
      'product-checkbox-n8n-workflows',
      'product-checkbox-rag-systems',
      'product-checkbox-ai-strategy',
      'product-checkbox-process-automation',
      'product-checkbox-custom-integrations'
    ]
    for (const id of checkboxes) {
      await page.getByTestId(id).check()
    }

    await page.goto('/product.html')

    const items = page.locator('[data-testid="chosen-product-item"]')
    await expect(items).toHaveCount(6)
  })

})
