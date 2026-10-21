import PageHeading from '../PageHeading.jsx';

// The five-step project timeline band.
const STEPS = [
  ['مشـــاوره', 'اولــــــــــیه'],
  ['طراحـــــــی', 'مفهومی'],
  ['بـــــــــــرآورد', 'هزینه ها'],
  ['شـــــروع', 'عملیات اجرایی'],
  ['تــکــمـیل و', 'تــحــویل پروژه'],
];

export default function TimelineSection() {
  return (
    <section className="hp-section hp-timeline">
      <div className="hp-inner">
        <PageHeading title="تایم لاین پــروژه" subtitle="Project timeline" icon="luxina-iconguide-fill" />

        <div className="luxina_timeline_container" style={{ '--timeline-count': STEPS.length }}>
          <div className="luxina_timeline_inner">
            {STEPS.map(([lead, rest], index) => (
              <div
                className="luxina_timeline_item"
                key={lead}
                style={{ backgroundImage: `url(/img/timeline-image${index + 1}.png)` }}
              >
                <span className="luxina_timeline_item_title">{lead}</span>
                <span className="luxina_timeline_item_title">{rest}</span>
                {index < STEPS.length - 1 ? (
                  <i className="luxina_timeline_item_icon luxina-icon-arrow-left-line" aria-hidden="true" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
