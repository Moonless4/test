import { useMemo, useState } from 'react'
import SectionHeading from './SectionHeading'
import FoodCard from './FoodCard'
import { menuItems } from '../data/site'

const tabs = [
  { id: 'all', label: 'همه' },
  { id: 'pizza', label: 'پیتزا' },
  { id: 'sandwich', label: 'ساندویچ' },
  { id: 'chicken', label: 'مرغ' },
  { id: 'starter', label: 'پیش غذا' },
  { id: 'drinks', label: 'نوشیدنی' },
]

export default function FoodCategories({ onAdd }) {
  const [active, setActive] = useState('all')

  const foods = useMemo(
    () => (active === 'all' ? menuItems : menuItems.filter((food) => food.category === active)),
    [active],
  )

  return (
    <section id="menu" className="bg-white py-14 md:py-20">
      <div className="container-page">
        <SectionHeading title="غذاها بر اساس دسته‌بندی" action="مشاهده همه" />

        <div className="-mx-1 mb-7 flex gap-2 overflow-x-auto px-1 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition md:text-sm ${
                active === tab.id
                  ? 'border-brand bg-brand text-white shadow-[0_12px_24px_-16px_rgba(184,0,31,0.9)]'
                  : 'border-black/10 bg-white text-ink/70 hover:border-brand/40 hover:text-brand'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {foods.map((food) => (
            <FoodCard key={food.id} food={food} onAdd={onAdd} />
          ))}
        </div>
      </div>
    </section>
  )
}
