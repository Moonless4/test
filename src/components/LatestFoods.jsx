import SectionHeading from './SectionHeading'
import FoodCard from './FoodCard'
import { latestFoods } from '../data/site'

export default function LatestFoods({ onAdd }) {
  return (
    <section className="bg-canvas/60 py-14 md:py-20">
      <div className="container-page">
        <SectionHeading title="جدیدترین غذاهای منو ما" action="مشاهده همه" />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {latestFoods.map((food) => (
            <FoodCard key={food.id} food={food} onAdd={onAdd} />
          ))}
        </div>
      </div>
    </section>
  )
}
