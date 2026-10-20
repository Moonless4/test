import { useEffect, useRef, useState } from 'react';
import { stats } from '../data/content.js';
import Icon from './Icons.jsx';

function StatItem({ stat }) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    let frame;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        const duration = 1400;
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(stat.value * eased));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.35 }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [stat.value]);

  return (
    <div className="stat" ref={ref}>
      <span className="stat__icon">
        <Icon name={stat.icon} size={28} />
      </span>
      <div>
        <strong>
          {value.toLocaleString('fa-IR')}
          {stat.suffix}
        </strong>
        <span>{stat.label}</span>
      </div>
    </div>
  );
}

export default function Stats() {
  return (
    <section className="stats-wrap" aria-label="آمار رستوران نوال">
      <div className="container">
        <div className="stats">
          <span className="stats__ornament stats__ornament--right" aria-hidden="true" />
          <span className="stats__ornament stats__ornament--left" aria-hidden="true" />
          {stats.map((stat) => (
            <StatItem stat={stat} key={stat.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
