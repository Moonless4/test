// Client-side form validation for the request forms. Keeps the same rules and
// the same `.rb-invalid` / `.rb-field-error` contract as the theme form it
// replaces.
const toEnglishDigits = (value) =>
  value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));

const validators = {
  name: (value) => value.trim().length >= 3 || 'نام را کامل وارد کنید.',
  email: (value) => {
    const text = value.trim();
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(text)) return true;
    const digits = toEnglishDigits(text).replace(/\D/g, '');
    return (digits.length >= 8 && digits.length <= 11) || 'ایمیل یا شماره موبایل معتبر وارد کنید.';
  },
  phone: (value) => {
    const digits = toEnglishDigits(value).replace(/\D/g, '');
    return (digits.length >= 8 && digits.length <= 11) || 'شماره تماس معتبر وارد کنید.';
  },
};

function setFieldError(field, message) {
  field.classList.toggle('rb-invalid', Boolean(message));
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
  const next = field.nextElementSibling;
  const existing = next && next.classList?.contains('rb-field-error') ? next : null;
  if (!message) {
    if (existing) existing.remove();
    return;
  }
  const error = existing || document.createElement('span');
  if (!existing) {
    error.className = 'rb-field-error';
    field.insertAdjacentElement('afterend', error);
  }
  error.textContent = message;
}

async function sendRequest(form) {
  const value = (name) => form.querySelector(`[name="${name}"]`)?.value?.trim() || '';
  const note = form.querySelector('.rb-form-note');
  const button = form.querySelector('.rb-form-submit');
  const originalNote = note?.textContent || '';
  if (button) button.disabled = true;
  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: value('name'),
        phone: value('phone'),
        message: value('message'),
        type: form.dataset.rbForm || 'contact',
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'ارسال پیام ناموفق بود. دوباره تلاش کنید.');
    if (note) {
      note.textContent = originalNote;
      note.hidden = false;
    }
    Array.from(form.querySelectorAll('input, textarea')).forEach((field) => {
      field.value = '';
    });
  } catch (error) {
    if (note) {
      note.textContent = error.message || 'ارسال پیام ناموفق بود. دوباره تلاش کنید.';
      note.hidden = false;
    }
  } finally {
    if (button) button.disabled = false;
  }
}

function handleSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const fields = Array.from(form.querySelectorAll('input, textarea'));
  let valid = true;

  fields.forEach((field) => {
    const validate = validators[field.name];
    if (!validate) {
      setFieldError(field, '');
      return;
    }
    const result = validate(field.value);
    const message = result === true ? '' : result;
    setFieldError(field, message);
    if (message) valid = false;
  });

  if (!valid) {
    form.querySelector('.rb-invalid')?.focus();
    return;
  }

  sendRequest(form);
}

export function initForms(root = document) {
  root.querySelectorAll('.rb-form').forEach((form) => {
    if (form.dataset.rbBound === '1') return;
    form.dataset.rbBound = '1';
    form.addEventListener('submit', handleSubmit);
  });
}
