import Button from '../Button.jsx';

// The studio: photograph on one side, the team promise and collaboration route
// on the other.
export default function HomeTeam() {
  return (
    <section className="hp-band hp-band--sand">
      <div className="hp-inner">
        <div className="ed-split hp-team-split">
          <div className="ed-split-body">
            <span className="sp-kicker">
              <span className="sp-kicker-rule" aria-hidden="true" />
              تیم لوکسینا
            </span>
            <h2 className="ed-split-title">لوکسینا برای تحقق رویاهای معماری شما تلاش می‌کند</h2>
            <p className="ed-split-text">
              معماران، مهندسان سازه و مدیران اجرایی لوکسینا در یک تیم کار می‌کنند؛ به همین دلیل تصمیم‌های طراحی هیچ‌وقت
              از واقعیت اجرا جدا نمی‌شود. هر پروژه یک مدیر پروژهٔ ثابت دارد که از جلسهٔ اول تا تحویل کلید پاسخ‌گو است.
            </p>
            <blockquote className="ed-quote">
              <i className="luxinaicon luxina-icon-question-answer-fill" aria-hidden="true" />
              <span>کار ما ساختن ساختمان نیست؛ ساختن فضایی است که سال‌ها درست کار کند.</span>
            </blockquote>
            <div className="hp-team-actions">
              <Button href="/cooperation">فرصت‌های همکاری</Button>
              <Button href="/about" variant="gray">
                دربارهٔ لوکسینا
              </Button>
            </div>
          </div>

          <div className="ed-split-media">
            <figure className="ed-split-figure">
              <img src="/img/team.png" width="474" height="552" loading="lazy" decoding="async" alt="تیم لوکسینا" />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
