const { test, expect } = require('@playwright/test')

const BASE_URL = 'http://localhost:8765'

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL)
  await page.locator('#booking').scrollIntoViewIfNeeded()
})

// ─── Happy Path ────────────────────────────────────────────────

test('happy path - valid submission resets form', async ({ page }) => {
  await page.fill('#booking-name', 'Alice Johnson')
  await page.fill('#booking-email', 'alice.johnson@techstartup.com')
  await page.fill('#booking-website', 'https://techstartup.com')
  await page.click('button[data-value="AI Agents"]')
  await page.click('button[data-value="n8n workflows"]')
  await page.click('button[data-value="ASAP"]')
  await page.fill('#booking-challenge', 'We need to automate our customer onboarding process and reduce manual data entry by at least 80% using AI solutions.')
  await page.click('button[data-value="$5k-$15k"]')
  await page.click('button[type="submit"]')

  await expect(page.locator('#booking-success')).toBeVisible()
  await expect(page.locator('#booking-name')).toHaveValue('')
  await expect(page.locator('.toggle-btn.selected')).toHaveCount(0)
})

test('happy path - back-to-back submissions without reload', async ({ page }) => {
  // Submission 1
  await page.fill('#booking-name', 'Alice Johnson')
  await page.fill('#booking-email', 'alice@techstartup.com')
  await page.fill('#booking-website', 'https://techstartup.com')
  await page.click('button[data-value="AI Agents"]')
  await page.click('button[data-value="ASAP"]')
  await page.fill('#booking-challenge', 'We need to automate our customer onboarding and reduce manual data entry.')
  await page.click('button[data-value="$5k-$15k"]')
  await page.click('button[type="submit"]')
  await expect(page.locator('#booking-success')).toBeVisible()

  // Submission 2 — no reload
  await page.fill('#booking-name', 'Bob Martinez')
  await page.fill('#booking-email', 'bob@enterprise-corp.io')
  await page.fill('#booking-website', 'https://enterprise-corp.io')
  await page.click('button[data-value="RAG Systems"]')
  await page.click('button[data-value="3-6 Months"]')
  await page.fill('#booking-challenge', 'Our legal team needs a document retrieval system that can search thousands of contracts instantly.')
  await page.click('button[data-value="$15k-$30k"]')
  await page.click('button[type="submit"]')
  await expect(page.locator('#booking-success')).toBeVisible()
})

// ─── Validation Errors ─────────────────────────────────────────

test('validation - empty form shows all errors', async ({ page }) => {
  await page.click('button[type="submit"]')

  await expect(page.locator('.booking-error[data-field="name"]')).toBeVisible()
  await expect(page.locator('.booking-error[data-field="email"]')).toBeVisible()
  await expect(page.locator('.booking-error[data-field="website"]')).toBeVisible()
  await expect(page.locator('.booking-error[data-field="services"]')).toBeVisible()
  await expect(page.locator('.booking-error[data-field="timeline"]')).toBeVisible()
  await expect(page.locator('.booking-error[data-field="challenge"]')).toBeVisible()
  await expect(page.locator('.booking-error[data-field="budget"]')).toBeVisible()
})

test('validation - invalid email', async ({ page }) => {
  await page.fill('#booking-name', 'John Doe')
  await page.fill('#booking-email', 'notanemail')
  await page.fill('#booking-website', 'https://example.com')
  await page.click('button[data-value="AI Agents"]')
  await page.click('button[data-value="ASAP"]')
  await page.fill('#booking-challenge', 'We need to fix our entire data pipeline process.')
  await page.click('button[data-value="Under $5k"]')
  await page.click('button[type="submit"]')

  await expect(page.locator('.booking-error[data-field="email"]')).toContainText('valid email')
  await expect(page.locator('#booking-success')).toBeHidden()
})

test('validation - invalid website URL', async ({ page }) => {
  await page.fill('#booking-name', 'John Doe')
  await page.fill('#booking-email', 'john@example.com')
  await page.fill('#booking-website', 'notaurl')
  await page.click('button[data-value="AI Agents"]')
  await page.click('button[data-value="ASAP"]')
  await page.fill('#booking-challenge', 'We need to fix our entire data pipeline process.')
  await page.click('button[data-value="Under $5k"]')
  await page.click('button[type="submit"]')

  await expect(page.locator('.booking-error[data-field="website"]')).toContainText('https://')
  await expect(page.locator('#booking-success')).toBeHidden()
})

test('validation - challenge too short', async ({ page }) => {
  await page.fill('#booking-name', 'John Doe')
  await page.fill('#booking-email', 'john@example.com')
  await page.fill('#booking-website', 'https://example.com')
  await page.click('button[data-value="AI Agents"]')
  await page.click('button[data-value="ASAP"]')
  await page.fill('#booking-challenge', 'Too short')
  await page.click('button[data-value="Under $5k"]')
  await page.click('button[type="submit"]')

  await expect(page.locator('.booking-error[data-field="challenge"]')).toContainText('20 characters')
  await expect(page.locator('#booking-success')).toBeHidden()
})

// ─── Edge Cases ────────────────────────────────────────────────

test('edge case - XSS in name is not executed', async ({ page }) => {
  let alertFired = false
  page.on('dialog', () => { alertFired = true })

  await page.fill('#booking-name', "<script>alert('XSS')</script>")
  await page.fill('#booking-email', 'test@example.com')
  await page.fill('#booking-website', 'https://example.com')
  await page.click('button[data-value="AI Agents"]')
  await page.click('button[data-value="ASAP"]')
  await page.fill('#booking-challenge', 'We need to automate our entire customer onboarding pipeline here.')
  await page.click('button[data-value="Under $5k"]')
  await page.click('button[type="submit"]')

  expect(alertFired).toBe(false)
  await expect(page.locator('#booking-success')).toBeVisible()
})

test('edge case - unicode and emoji inputs accepted', async ({ page }) => {
  await page.fill('#booking-name', 'José María 李明 🚀🎯')
  await page.fill('#booking-email', 'jose@empresa.com')
  await page.fill('#booking-website', 'https://empresa.com')
  await page.click('button[data-value="RAG Systems"]')
  await page.click('button[data-value="Exploring"]')
  await page.fill('#booking-challenge', 'Necesitamos automatizar nuestro proceso 🤖🔥 αβγδ para mejorar el flujo de trabajo.')
  await page.click('button[data-value="$30k+"]')
  await page.click('button[type="submit"]')

  await expect(page.locator('#booking-success')).toBeVisible()
})

test('edge case - 300 char name and 1000 char challenge accepted', async ({ page }) => {
  await page.fill('#booking-name', 'A'.repeat(300))
  await page.fill('#booking-email', 'test@example.com')
  await page.fill('#booking-website', 'https://example.com')
  await page.click('button[data-value="AI Agents"]')
  await page.click('button[data-value="1-3 Months"]')
  await page.fill('#booking-challenge', 'We need to automate our complex enterprise workflow pipeline. '.repeat(17))
  await page.click('button[data-value="$30k+"]')
  await page.click('button[type="submit"]')

  await expect(page.locator('#booking-success')).toBeVisible()
})
