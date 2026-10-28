import PageHeading from '../PageHeading.jsx';
import Button from '../Button.jsx';
import { site } from '../../content/site.js';

// Dark "our team" band with the photo collage on the opposite side.
export default function HomeTeam() {
  const { team } = site;

  return (
    <section className="hp-team">
      <div className="hp-team-body">
        <PageHeading title="تیــــــــــم مــــــــــا" subtitle="Our Team" icon="luxina-iconteam-fill" />
        <p className="hp-team-text">{team.intro}</p>
        <Button href="/cooperation">فرصت‌های همکاری</Button>
      </div>
      <div className="hp-team-media">
        <img src={team.image} width="474" height="552" loading="lazy" decoding="async" alt="" />
      </div>
    </section>
  );
}
