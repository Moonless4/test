import PageHeading from '../PageHeading.jsx';
import Button from '../Button.jsx';

// Dark "our team" band with the photo collage on the opposite side.
export default function HomeTeam() {
  return (
    <section className="hp-team">
      <div className="hp-team-body">
        <PageHeading title="تیــــــــــم مــــــــــا" subtitle="Our Team" icon="luxina-iconteam-fill" />
        <p className="hp-team-text">معماران، مهندسان و مدیران اجرایی؛ یک تیم با یک زبان مشترک.</p>
        <Button href="/cooperation">فرصت‌های همکاری</Button>
      </div>
      <div className="hp-team-media">
        <img src="/img/team.png" width="474" height="552" loading="lazy" decoding="async" alt="" />
      </div>
    </section>
  );
}
