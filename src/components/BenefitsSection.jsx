import { benefits } from '../data/content.js';
import Icon from './Icons.jsx';

const positions = ['tl', 'tr', 'bl', 'br'];

export default function BenefitsSection() {
  return (
    <section className="benefits section" aria-labelledby="benefits-title">
      <div className="container">
        <div className="benefits__panel">
          <div className="benefits__head">
            <span className="section-heading__eyebrow">
              <img src="/assets/title-symbol.webp" alt="" aria-hidden="true" />
              چرا رستوران نوال؟
            </span>
            <h2 id="benefits-title">هر وعده، یک تجربه کامل</h2>
            <span className="script-note">Taste the difference</span>
          </div>

          <img className="benefits__lines" src="/assets/benefits-lines.png" alt="" aria-hidden="true" />
          <img className="benefits__dots" src="/assets/purple-dots.png" alt="" aria-hidden="true" />

          <div className="benefits__layout">
            {benefits.map((item, index) => (
              <div className={`benefit benefit--${positions[index]}`} key={item.id}>
                <span className="benefit__icon">
                  <Icon name={item.icon} size={26} />
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}

            <div className="benefits__visual">
              <span className="benefits__plate" aria-hidden="true" />
              <img src="/assets/intro-burger.webp" alt="برگر مخصوص رستوران نوال" loading="lazy" />
              <span className="benefits__seal">
                <Icon name="fork" size={17} />
                دست‌ساز و تازه
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
