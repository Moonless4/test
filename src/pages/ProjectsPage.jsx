import { useMemo, useState } from 'react';
import PageHero from '../components/editorial/PageHero.jsx';
import Band from '../components/editorial/Band.jsx';
import WorkCard from '../components/editorial/WorkCard.jsx';
import SectionHead from '../components/services/SectionHead.jsx';
import ServiceCta from '../components/services/ServiceCta.jsx';
import { projects } from '../content/projects.js';
import { findProjectDetails } from '../content/project-details.js';

const ALL = 'همه';

// Portfolio index: the projects as architectural case studies, filtered by
// building use, in an editorial grid of wide and tall works.
export default function ProjectsPage() {
  const [filter, setFilter] = useState(ALL);

  const works = useMemo(
    () =>
      projects.map((project) => ({
        project,
        details: findProjectDetails(project.slug),
      })),
    []
  );

  const categories = useMemo(() => {
    const counts = new Map();
    works.forEach(({ details }) => {
      const category = details?.category || 'سایر';
      counts.set(category, (counts.get(category) || 0) + 1);
    });
    return [{ label: ALL, count: works.length }, ...[...counts].map(([label, count]) => ({ label, count }))];
  }, [works]);

  const visible = filter === ALL ? works : works.filter(({ details }) => details?.category === filter);
  const sizes = ['wide', 'narrow', 'wide', 'narrow', 'third', 'third', 'third'];

  return (
    <div className="ed-page">
      <PageHero
        image="/img/Building-Types-Hero.webp"
        eyebrow="پروژه‌های لوکسینا"
        icon="luxina-icon-grid-fill"
        title="پروژه‌ها"
        lead="منتخبی از پروژه‌های مسکونی، اداری و تجاری لوکسینا؛ هر پروژه با کاربری، موقعیت و مشخصات اجرایی خودش."
        breadcrumbs={[{ href: '/', label: 'خانه' }, { label: 'پروژه‌ها' }]}
        facts={[
          { label: 'پروژه‌های فعال', value: '۴ پروژه' },
          { label: 'کاربری', value: 'مسکونی و اداری' },
          { label: 'موقعیت', value: 'تهران' },
          { label: 'مدل همکاری', value: 'طراحی تا اجرا' },
        ]}
        actions={[{ label: 'درخواست مشاوره', href: '/consultation' }]}
      />

      <Band tone="soft">
        <SectionHead
          kicker="فهرست پروژه‌ها"
          title="کارها را بر اساس کاربری ببینید"
          text="هر پروژه از یک مسئلهٔ مشخص شروع شده است؛ برای دیدن روند طراحی، متریال و جزئیات اجرایی وارد صفحهٔ پروژه شوید."
        />

        <div className="ed-filters" role="group" aria-label="فیلتر پروژه‌ها">
          {categories.map((category) => (
            <button
              type="button"
              key={category.label}
              className={category.label === filter ? 'ed-filter is-active' : 'ed-filter'}
              aria-pressed={category.label === filter}
              onClick={() => setFilter(category.label)}
            >
              {category.label}
              <span className="ed-filter-count">{category.count}</span>
            </button>
          ))}
        </div>

        <div className="ed-portfolio">
          {visible.map(({ project, details }, index) => (
            <WorkCard
              key={project.slug}
              project={project}
              details={details}
              index={index}
              size={sizes[index % sizes.length]}
            />
          ))}
          {!visible.length ? <p className="ed-portfolio-empty">پروژه‌ای در این دسته ثبت نشده است.</p> : null}
        </div>
      </Band>

      <Band>
        <ServiceCta
          image="/img/NA1442_shutterstock_355734689.webp"
          title="پروژهٔ بعدی می‌تواند مال شما باشد"
          text="اگر زمینی دارید یا خانه‌ای آمادهٔ بازسازی است، در یک جلسهٔ مشاوره محدودیت‌ها، بودجه و مسیر پیشنهادی اجرا را بررسی می‌کنیم."
        />
      </Band>
    </div>
  );
}
