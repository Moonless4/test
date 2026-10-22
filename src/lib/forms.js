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

  const note = form.querySelector('.rb-form-note');
  if (note) note.hidden = false;
  fields.forEach((field) => {
    field.value = '';
  });
}

export function initForms(root = document) {
  root.querySelectorAll('.rb-form').forEach((form) => {
    if (form.dataset.rbBound === '1') return;
    form.dataset.rbBound = '1';
    form.addEventListener('submit', handleSubmit);
  });
}
