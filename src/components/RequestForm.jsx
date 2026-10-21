// Contact / consultation / cooperation form. It keeps the markup contract the
// validation layer expects (`.rb-form`, `data-rb-form`, `.form-control`,
// `.rb-form-note`), so the behaviour is unchanged while the markup is React.
export default function RequestForm({
  type,
  namePlaceholder = 'نام و نام خانوادگی',
  contactPlaceholder = 'شماره تماس',
  messagePlaceholder = 'متن پیام شما',
  submit = 'ارسال',
  note = 'درخواست شما ثبت شد؛ به‌زودی با شما تماس می‌گیریم.',
  showMessage = true,
}) {
  return (
    <div className="luxina_contact_form-wrap">
      <form className="wpcf7-form rb-form" data-rb-form={type} noValidate>
        <div className="luxina-cf7-first-row">
          <p>
            <input className="form-control" name="name" type="text" placeholder={namePlaceholder} required />
            <input className="form-control" name="phone" type="text" placeholder={contactPlaceholder} required />
          </p>
        </div>
        {showMessage ? (
          <div className="luxina-cf7-second-row">
            <p>
              <textarea className="form-control" name="message" placeholder={messagePlaceholder} />
            </p>
          </div>
        ) : null}
        <button type="submit" className="button button-start rounded button-primary rb-form-submit">
          <span className="button-text">{submit}</span>
        </button>
        <p className="rb-form-note" hidden>
          {note}
        </p>
      </form>
    </div>
  );
}
