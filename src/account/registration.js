/* Customer auth is a local simulation. Only an explicit registration counts;
   a guest profile or an account silently created by the old login must not. */
export const isRegisteredAccount = (key, account) =>
  Boolean(key && key !== 'guest' && account?.registrationCompleted === true && account.user);

export const loginAccount = (accounts, key) => {
  if (!isRegisteredAccount(key, accounts[key])) {
    return {
      ok: false,
      error: 'حساب ثبت‌شده‌ای با این شماره یا ایمیل وجود ندارد؛ ابتدا ثبت‌نام را تکمیل کنید.',
    };
  }
  return { ok: true, account: accounts[key] };
};
