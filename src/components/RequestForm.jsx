// Contact / consultation / cooperation form. It keeps the markup contract the
// validation layer expects (`.rb-form`, `data-rb-form`, `.form-control`,
// `.rb-form-note`), so the behaviour is unchanged while the markup is React.
// Each field sits in its own rounded box with an icon, inside a white card.
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
    <div className="luxina_contact_form-wrap rb-request-form">
      <form className="wpcf7-form rb-form" data-rb-form={type} noValidate>
        <div className="rb-form-grid">
          <label className="rb-field">
            <i className="luxinaicon luxina-icon-user-6-line rb-field-icon" aria-hidden="true" />
            <input className="form-control" name="name" type="text" placeholder={namePlaceholder} required />
          </label>
          <label className="rb-field">
            <i className="luxinaicon luxina-icon-customer-service-2-line rb-field-icon" aria-hidden="true" />
            <input className="form-control" name="phone" type="tel" placeholder={contactPlaceholder} required />
          </label>
        </div>
        {showMessage ? (
          <label className="rb-field rb-field-area">
            <i className="luxinaicon luxina-icon-question-answer-fill rb-field-icon" aria-hidden="true" />
            <textarea className="form-control" name="message" placeholder={messagePlaceholder} />
          </label>
        ) : null}
        <div className="rb-form-footer">
          <button type="submit" className="button button-start rounded button-primary rb-form-submit">
            <span className="button-text">{submit}</span>
            <i className="luxinaicon luxina-icon-arrow-left-line button-icon" aria-hidden="true" />
          </button>
          <p className="rb-form-note" hidden>
            {note}
          </p>
        </div>
      </form>
    </div>
  );
}
