// The admin panel lives on a path the administrator can rename from Settings.
// Everything that links to the panel reads it through here, so the route, the
// in-panel links and the saved setting never drift apart.
export const DEFAULT_ADMIN_PATH = '/admin';

// Public routes the panel may not take over.
const RESERVED = ['/menu', '/blog', '/about', '/contact', '/cart', '/account', '/food', '/p'];

export const cleanAdminPath = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\/+$/, '');

export const validateAdminPath = (value) => {
  const path = cleanAdminPath(value);
  if (!path.startsWith('/')) return 'مسیر باید با اسلش (/) شروع شود.';
  if (path.length < 4) return 'مسیر باید حداقل ۳ نویسه بعد از اسلش داشته باشد.';
  if (!/^\/[a-z0-9][a-z0-9-]*$/.test(path)) {
    return 'فقط حروف انگلیسی، عدد و خط تیره مجاز است.';
  }
  if (RESERVED.some((reserved) => path === reserved || path.startsWith(`${reserved}/`))) {
    return 'این مسیر با صفحه‌های سایت تداخل دارد؛ مسیر دیگری انتخاب کنید.';
  }
  return '';
};

export const adminPathOf = (site) => {
  const saved = cleanAdminPath(site?.adminPath);
  return validateAdminPath(saved) ? DEFAULT_ADMIN_PATH : saved;
};
