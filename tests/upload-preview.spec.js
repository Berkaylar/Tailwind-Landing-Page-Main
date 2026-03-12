const { test, expect } = require('@playwright/test')
const path = require('path')

const fixtures = path.join(__dirname, 'fixtures')

test.describe('File Upload Preview', () => {

  test('uploading an image shows image preview with pending badge', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('upload-preview')).toBeHidden()
    await expect(page.getByTestId('upload-dropzone')).toBeVisible()

    await page.getByTestId('file-input').setInputFiles(path.join(fixtures, 'sample.png'))

    // Full dropzone shrinks, compact one appears
    await expect(page.getByTestId('upload-dropzone-compact')).toBeVisible()

    // Preview with pending badge
    await expect(page.getByTestId('upload-preview')).toBeVisible()
    await expect(page.getByTestId('upload-pending-badge')).toBeVisible()
    await expect(page.getByTestId('preview-image-wrapper')).toBeVisible()
    await expect(page.getByTestId('preview-file-card')).toBeHidden()

    const src = await page.getByTestId('preview-image').getAttribute('src')
    expect(src).toMatch(/^data:image\//)
  })

  test('uploading a PDF shows file info card, canvas preview and pending badge', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('file-input').setInputFiles(path.join(fixtures, 'sample.pdf'))

    await expect(page.getByTestId('upload-preview')).toBeVisible()
    await expect(page.getByTestId('upload-pending-badge')).toBeVisible()
    await expect(page.getByTestId('preview-file-card')).toBeVisible()
    await expect(page.getByTestId('preview-image-wrapper')).toBeHidden()
    await expect(page.getByTestId('preview-file-ext')).toHaveText('PDF')
    await expect(page.getByTestId('preview-file-name')).toHaveText('sample.pdf')

    const size = await page.getByTestId('preview-file-size').textContent()
    expect(size).toMatch(/\d+\.\d+ MB/)

    // PDF canvas rendered
    await expect(page.getByTestId('pdf-canvas-wrapper')).toBeVisible({ timeout: 8000 })
    const canvas = page.getByTestId('pdf-canvas')
    const width = await canvas.evaluate(el => el.width)
    expect(width).toBeGreaterThan(0)
  })

  test('remove button clears preview and restores full dropzone', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('file-input').setInputFiles(path.join(fixtures, 'sample.png'))
    await expect(page.getByTestId('upload-preview')).toBeVisible()

    await page.getByTestId('upload-remove').click()

    await expect(page.getByTestId('upload-preview')).toBeHidden()
    await expect(page.getByTestId('upload-dropzone')).toBeVisible()
    await expect(page.getByTestId('upload-dropzone-compact')).toBeHidden()
  })

  test('submit keeps preview visible and shows success badge alongside it', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('file-input').setInputFiles(path.join(fixtures, 'sample.png'))
    await expect(page.getByTestId('upload-preview')).toBeVisible()
    await expect(page.getByTestId('upload-pending-badge')).toBeVisible()

    await page.getByTestId('upload-submit').click()

    // Preview still visible with the image
    await expect(page.getByTestId('upload-preview')).toBeVisible()
    await expect(page.getByTestId('preview-image-wrapper')).toBeVisible()

    // Pending badge and action buttons gone
    await expect(page.getByTestId('upload-pending-badge')).toBeHidden()
    await expect(page.getByTestId('upload-actions')).toBeHidden()

    // Success badge visible
    await expect(page.getByTestId('upload-success')).toBeVisible()
  })

  test('image preview persists after page refresh', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('file-input').setInputFiles(path.join(fixtures, 'sample.png'))
    await expect(page.getByTestId('preview-image-wrapper')).toBeVisible()

    await page.reload()

    await expect(page.getByTestId('upload-preview')).toBeVisible()
    await expect(page.getByTestId('preview-image-wrapper')).toBeVisible()
    const src = await page.getByTestId('preview-image').getAttribute('src')
    expect(src).toMatch(/^data:image\//)
  })

  test('PDF info persists after page refresh', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('file-input').setInputFiles(path.join(fixtures, 'sample.pdf'))
    await expect(page.getByTestId('preview-file-card')).toBeVisible()

    await page.reload()

    await expect(page.getByTestId('upload-preview')).toBeVisible()
    await expect(page.getByTestId('preview-file-card')).toBeVisible()
    await expect(page.getByTestId('preview-file-ext')).toHaveText('PDF')
    await expect(page.getByTestId('preview-file-name')).toHaveText('sample.pdf')
  })

  test('replacing image with PDF switches preview type', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('file-input').setInputFiles(path.join(fixtures, 'sample.png'))
    await expect(page.getByTestId('preview-image-wrapper')).toBeVisible()

    await page.getByTestId('file-input').setInputFiles(path.join(fixtures, 'sample.pdf'))

    await expect(page.getByTestId('preview-file-card')).toBeVisible()
    await expect(page.getByTestId('preview-image-wrapper')).toBeHidden()
  })

})
