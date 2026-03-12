const btn = document.getElementById('menu-btn')
const nav = document.getElementById('menu')

if (btn && nav) {
  btn.addEventListener('click', () => {
    btn.classList.toggle('open')
    nav.classList.toggle('flex')
    nav.classList.toggle('hidden')
  })
}

// ── Booking Form ──────────────────────────────────────────────

// Toggle button selection (multi for services, single for timeline/budget)
document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.dataset.group
    const isSingle = btn.classList.contains('single')

    if (isSingle) {
      // Deselect all siblings in this group first
      document.querySelectorAll(`.toggle-btn[data-group="${group}"]`).forEach(b => {
        b.classList.remove('selected', 'bg-darkBlue', 'text-white', 'border-darkBlue', 'bg-brightRed', 'border-brightRed')
      })
    }

    // Toggle this button
    if (btn.classList.contains('selected')) {
      btn.classList.remove('selected')
      if (group === 'services') {
        btn.classList.remove('bg-brightRed', 'text-white')
        btn.classList.add('text-brightRed')
      } else {
        btn.classList.remove('bg-darkBlue', 'text-white', 'border-darkBlue')
      }
    } else {
      btn.classList.add('selected')
      if (group === 'services') {
        btn.classList.add('bg-brightRed', 'text-white')
        btn.classList.remove('text-brightRed')
      } else {
        btn.classList.add('bg-darkBlue', 'text-white', 'border-darkBlue')
      }
    }

    // Clear error for this group when user interacts
    clearError(group)
  })
})

function getSelected(group) {
  return Array.from(document.querySelectorAll(`.toggle-btn[data-group="${group}"].selected`))
    .map(b => b.dataset.value)
}

function showError(field, message) {
  const el = document.querySelector(`.booking-error[data-field="${field}"]`)
  const input = document.getElementById(`booking-${field}`)
  if (el) { el.textContent = message; el.classList.remove('hidden') }
  if (input) input.style.borderColor = 'hsl(12, 88%, 59%)'
}

function clearError(field) {
  const el = document.querySelector(`.booking-error[data-field="${field}"]`)
  const input = document.getElementById(`booking-${field}`)
  if (el) { el.textContent = ''; el.classList.add('hidden') }
  if (input) input.style.borderColor = ''
}

function validateBookingForm() {
  let valid = true

  const name = document.getElementById('booking-name').value.trim()
  const email = document.getElementById('booking-email').value.trim()
  const website = document.getElementById('booking-website').value.trim()
  const challenge = document.getElementById('booking-challenge').value.trim()
  const services = getSelected('services')
  const timeline = getSelected('timeline')
  const budget = getSelected('budget')

  // Clear all errors first
  ;['name','email','website','services','timeline','challenge','budget'].forEach(clearError)

  if (!name) {
    showError('name', 'Full name is required.')
    valid = false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) {
    showError('email', 'Email address is required.')
    valid = false
  } else if (!emailRegex.test(email)) {
    showError('email', 'Please enter a valid email address.')
    valid = false
  }

  const urlRegex = /^https?:\/\/.+\..+/
  if (!website) {
    showError('website', 'Website URL is required.')
    valid = false
  } else if (!urlRegex.test(website)) {
    showError('website', 'Please enter a valid URL starting with http:// or https://')
    valid = false
  }

  if (services.length === 0) {
    showError('services', 'Please select at least one service.')
    valid = false
  }

  if (timeline.length === 0) {
    showError('timeline', 'Please select a timeline.')
    valid = false
  }

  if (!challenge) {
    showError('challenge', 'Please describe your challenge.')
    valid = false
  } else if (challenge.length < 20) {
    showError('challenge', `Challenge description must be at least 20 characters (currently ${challenge.length}).`)
    valid = false
  }

  if (budget.length === 0) {
    showError('budget', 'Please select a budget range.')
    valid = false
  }

  return valid
}

function resetBookingForm() {
  document.getElementById('booking-form').reset()
  // Deselect all toggle buttons
  document.querySelectorAll('.toggle-btn').forEach(b => {
    b.classList.remove('selected', 'bg-brightRed', 'bg-darkBlue', 'text-white', 'border-darkBlue')
    if (b.dataset.group === 'services') b.classList.add('text-brightRed')
  })
  ;['name','email','website','services','timeline','challenge','budget'].forEach(clearError)
}

// ── ROI Calculator ────────────────────────────────────────────

const roiInputIds = ['roi-team-size', 'roi-hours-saved', 'roi-hourly-rate', 'roi-monthly-investment']

function calculateROI() {
  const teamSize        = parseFloat(document.getElementById('roi-team-size').value)
  const hoursPerWeek    = parseFloat(document.getElementById('roi-hours-saved').value)
  const hourlyRate      = parseFloat(document.getElementById('roi-hourly-rate').value)
  const monthlyInvest   = parseFloat(document.getElementById('roi-monthly-investment').value)

  const results    = document.getElementById('roi-results')
  const placeholder = document.getElementById('roi-placeholder')

  // Show placeholder if any field is empty or invalid
  if ([teamSize, hoursPerWeek, hourlyRate, monthlyInvest].some(v => isNaN(v) || v < 0)) {
    results.style.display = 'none'
    placeholder.style.display = 'block'
    return
  }

  // Formulas
  const monthlySavings = teamSize * hoursPerWeek * 4.33 * hourlyRate
  const annualSavings  = monthlySavings * 12
  const annualInvest   = monthlyInvest * 12
  const roi            = annualInvest > 0 ? ((annualSavings - annualInvest) / annualInvest) * 100 : 0

  const fmt = n => '$' + Math.round(n).toLocaleString('en-US')
  const fmtRoi = n => (n >= 0 ? '+' : '') + Math.round(n) + '%'

  document.getElementById('roi-monthly-savings').textContent = fmt(monthlySavings)
  document.getElementById('roi-annual-savings').textContent  = fmt(annualSavings)
  document.getElementById('roi-percentage').textContent      = fmtRoi(roi)

  results.style.display = 'grid'
  placeholder.style.display = 'none'
}

roiInputIds.forEach(id => {
  const el = document.getElementById(id)
  if (el) el.addEventListener('input', calculateROI)
})

// ── Products Checkbox List (homepage) ─────────────────────────

const PRODUCTS_KEY = 'manage_selected_products'

function getSelectedProducts() {
  return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]')
}

function saveSelectedProducts(selected) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(selected))
}

// Init checkboxes from localStorage and listen for changes
document.querySelectorAll('.product-checkbox').forEach(checkbox => {
  const saved = getSelectedProducts()
  if (saved.includes(checkbox.dataset.value)) {
    checkbox.checked = true
    checkbox.closest('label').classList.add('border-brightRed', 'bg-brightRedSupLight')
    checkbox.closest('label').classList.remove('border-gray-200')
  }

  checkbox.addEventListener('change', () => {
    const selected = getSelectedProducts()
    const value = checkbox.dataset.value
    if (checkbox.checked) {
      if (!selected.includes(value)) selected.push(value)
      checkbox.closest('label').classList.add('border-brightRed', 'bg-brightRedSupLight')
      checkbox.closest('label').classList.remove('border-gray-200')
    } else {
      const idx = selected.indexOf(value)
      if (idx > -1) selected.splice(idx, 1)
      checkbox.closest('label').classList.remove('border-brightRed', 'bg-brightRedSupLight')
      checkbox.closest('label').classList.add('border-gray-200')
    }
    saveSelectedProducts(selected)
  })
})

// ── Chosen Products (product page) ────────────────────────────

const chosenList = document.getElementById('chosen-products-list')
const chosenEmpty = document.getElementById('chosen-products-empty')

if (chosenList && chosenEmpty) {
  const selected = getSelectedProducts()
  if (selected.length === 0) {
    chosenEmpty.style.display = 'block'
  } else {
    chosenList.style.display = 'grid'
    selected.forEach(name => {
      const card = document.createElement('div')
      card.dataset.testid = 'chosen-product-item'
      card.dataset.value = name
      card.className = 'flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-brightRed'
      card.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-brightRed flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <span class="font-semibold text-darkBlue text-sm">${name}</span>
      `
      chosenList.appendChild(card)
    })
  }
}

// ── File Upload Preview ───────────────────────────────────────

const UPLOAD_KEY = 'manage_upload_preview'

function setDropzoneCompact(compact) {
  document.getElementById('upload-dropzone-full').style.display = compact ? 'none' : 'flex'
  document.getElementById('upload-dropzone-compact').style.display = compact ? 'flex' : 'none'
}

function showImagePreview(src, submitted = false) {
  document.getElementById('upload-preview').style.display = 'block'
  document.getElementById('preview-image-wrapper').style.display = 'block'
  document.getElementById('preview-file-card').style.display = 'none'
  document.getElementById('preview-image').src = src
  document.getElementById('upload-pending-badge').style.display = submitted ? 'none' : 'flex'
  document.getElementById('upload-actions').style.display = submitted ? 'none' : 'flex'
  document.getElementById('upload-success').style.display = submitted ? 'inline-flex' : 'none'
  setDropzoneCompact(true)
}

function showFileCard(name, ext, sizeMB, submitted = false, pdfDataUrl = null) {
  document.getElementById('upload-preview').style.display = 'block'
  document.getElementById('preview-image-wrapper').style.display = 'none'
  document.getElementById('preview-file-card').style.display = 'flex'
  document.getElementById('preview-file-ext').textContent = ext
  document.getElementById('preview-file-name').textContent = name
  document.getElementById('preview-file-size').textContent = `${sizeMB} MB`
  document.getElementById('upload-pending-badge').style.display = submitted ? 'none' : 'flex'
  document.getElementById('upload-actions').style.display = submitted ? 'none' : 'flex'
  document.getElementById('upload-success').style.display = submitted ? 'inline-flex' : 'none'
  setDropzoneCompact(true)

  if (pdfDataUrl && ext === 'PDF') {
    renderPdfPreview(pdfDataUrl)
  }
}

async function renderPdfPreview(dataUrl) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
    const pdf = await pdfjsLib.getDocument(dataUrl).promise
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = document.getElementById('pdf-canvas')
    canvas.height = viewport.height
    canvas.width = viewport.width
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
    document.getElementById('pdf-canvas-wrapper').style.display = 'block'
  } catch (e) {
    // PDF render failed silently — file card still shows
  }
}

function clearUploadPreview() {
  document.getElementById('upload-preview').style.display = 'none'
  document.getElementById('upload-success').style.display = 'none'
  document.getElementById('preview-image').src = ''
  document.getElementById('preview-file-card').style.display = 'none'
  document.getElementById('preview-image-wrapper').style.display = 'none'
  document.getElementById('pdf-canvas-wrapper').style.display = 'none'
  document.getElementById('upload-pending-badge').style.display = 'flex'
  document.getElementById('upload-actions').style.display = 'flex'
  document.getElementById('file-input').value = ''
  setDropzoneCompact(false)
  localStorage.removeItem(UPLOAD_KEY)
}

// Restore from localStorage on load
;(function restoreUploadPreview() {
  const saved = localStorage.getItem(UPLOAD_KEY)
  if (!saved) return
  const data = JSON.parse(saved)
  if (data.type === 'image') {
    showImagePreview(data.src, !!data.submitted)
  } else {
    showFileCard(data.name, data.ext, data.sizeMB, !!data.submitted, data.dataUrl || null)
  }
})()

document.getElementById('file-input').addEventListener('change', (e) => {
  const file = e.target.files[0]
  if (!file) return

  // Compact dropzone immediately (synchronous)
  setDropzoneCompact(true)

  if (file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      const src = ev.target.result
      showImagePreview(src)
      localStorage.setItem(UPLOAD_KEY, JSON.stringify({ type: 'image', src }))
    }
    reader.readAsDataURL(file)
  } else {
    const ext = file.name.split('.').pop().toUpperCase()
    const sizeMB = (file.size / 1024 / 1024).toFixed(2)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      showFileCard(file.name, ext, sizeMB, false, dataUrl)
      localStorage.setItem(UPLOAD_KEY, JSON.stringify({ type: 'file', name: file.name, ext, sizeMB, dataUrl }))
    }
    reader.readAsDataURL(file)
  }
})

document.getElementById('upload-remove').addEventListener('click', clearUploadPreview)

document.getElementById('upload-submit').addEventListener('click', () => {
  document.getElementById('upload-pending-badge').style.display = 'none'
  document.getElementById('upload-actions').style.display = 'none'
  document.getElementById('upload-success').style.display = 'inline-flex'
  const saved = localStorage.getItem(UPLOAD_KEY)
  if (saved) {
    const data = JSON.parse(saved)
    localStorage.setItem(UPLOAD_KEY, JSON.stringify({ ...data, submitted: true }))
  }
})

// ── Rating Persistence ────────────────────────────────────────

const RATING_KEY = 'manage_user_rating'
const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']

function loadSavedRating() {
  const saved = localStorage.getItem(RATING_KEY)
  if (!saved) return
  const { value, label } = JSON.parse(saved)
  const badge = document.getElementById('previous-rating-badge')
  const text = document.getElementById('previous-rating-text')
  text.textContent = `You previously rated us ${value} stars — ${label}`
  badge.classList.remove('hidden')
}

loadSavedRating()

// ── Rating Modal ──────────────────────────────────────────────

const ratingBackdrop = document.getElementById('rating-modal-backdrop')
const ratingSubmitBtn = document.getElementById('rating-submit')
const ratingLabel = document.getElementById('rating-selected-label')
let selectedRating = 0

document.getElementById('open-rating-modal').addEventListener('click', () => {
  ratingBackdrop.classList.remove('hidden')
})

function closeRatingModal() {
  ratingBackdrop.classList.add('hidden')
}

document.getElementById('rating-cancel').addEventListener('click', closeRatingModal)

// Close on backdrop click
ratingBackdrop.addEventListener('click', (e) => {
  if (e.target === ratingBackdrop) closeRatingModal()
})

document.querySelectorAll('.star-btn').forEach(star => {
  star.addEventListener('click', () => {
    selectedRating = parseInt(star.dataset.value)

    // Update star colors
    document.querySelectorAll('.star-btn').forEach(s => {
      s.classList.toggle('text-yellow-400', parseInt(s.dataset.value) <= selectedRating)
      s.classList.toggle('text-gray-300', parseInt(s.dataset.value) > selectedRating)
    })

    const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']
    ratingLabel.textContent = `${selectedRating} / 5 — ${labels[selectedRating]}`
    ratingSubmitBtn.disabled = false
  })
})

ratingSubmitBtn.addEventListener('click', () => {
  const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']
  const banner = document.getElementById('rating-banner')
  const bannerText = document.getElementById('rating-banner-text')

  bannerText.textContent = `Thanks for your ${selectedRating}-star rating! (${labels[selectedRating]})`
  banner.classList.remove('hidden')

  // Persist to localStorage
  localStorage.setItem(RATING_KEY, JSON.stringify({ value: selectedRating, label: labels[selectedRating] }))

  closeRatingModal()

  // Reset modal state
  selectedRating = 0
  document.querySelectorAll('.star-btn').forEach(s => {
    s.classList.remove('text-yellow-400')
    s.classList.add('text-gray-300')
  })
  ratingLabel.textContent = ''
  ratingSubmitBtn.disabled = true
})

// ── Booking Form ──────────────────────────────────────────────

document.getElementById('booking-form').addEventListener('submit', (e) => {
  e.preventDefault()
  if (!validateBookingForm()) return

  // Show success, reset form, allow re-submit
  const successEl = document.getElementById('booking-success')
  successEl.classList.remove('hidden')
  resetBookingForm()

  // Scroll success message into view
  successEl.scrollIntoView({ behavior: 'smooth', block: 'center' })

  // Hide success after 4 seconds so back-to-back submissions show it again
  setTimeout(() => successEl.classList.add('hidden'), 4000)
})
