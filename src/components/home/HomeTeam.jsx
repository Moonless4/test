import PageHeading from '../PageHeading.jsx';
import Button from '../Button.jsx';

// Dark "our team" band with the photo collage on the opposite side.
export default function HomeTeam() {
  return (
    <section className="hp-team">
      <div className="hp-team-body">
        <PageHeading title="تیــــــــــم مــــــــــا" subtitle="Our Team" icon="luxina-iconteam-fill" />
        <p className="hp-team-text">لوکسینا برای تحقق رویاهای معماری شما تلاش می کند!</p>
        <Button href="/cooperation">فرصت‌های همکاری</Button>
      </div>
      <div className="hp-team-media">
        <img src="/img/team.png" width="474" height="552" loading="lazy" decoding="async" alt="" />
      </div>
    </section>
  );
}
