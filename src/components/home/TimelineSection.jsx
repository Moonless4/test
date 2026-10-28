import PageHeading from '../PageHeading.jsx';
import { site } from '../../content/site.js';

// The five-step project timeline band; steps and images come from the panel.
export default function TimelineSection() {
  const heading = site.homeHeadings || {};
  const steps = site.timeline?.steps || [];

  return (
    <section className="hp-section hp-timeline">
      <div className="hp-inner">
        <PageHeading
          title={heading.timelineTitle || 'تایم لاین پــروژه'}
          subtitle={heading.timelineSubtitle || 'Project timeline'}
          icon="luxina-iconguide-fill"
        />

        <div className="luxina_timeline_container" style={{ '--timeline-count': steps.length }}>
          <div className="luxina_timeline_inner">
            {steps.map((step, index) => (
              <div
                className="luxina_timeline_item"
                key={`${step.lead}-${index}`}
                style={{ backgroundImage: `url(${step.image || `/img/timeline-image${index + 1}.png`})` }}
              >
                <span className="luxina_timeline_item_title">{step.lead}</span>
                <span className="luxina_timeline_item_title">{step.rest}</span>
                {index < steps.length - 1 ? (
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
