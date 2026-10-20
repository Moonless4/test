import { useCallback, useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Categories from './components/Categories'
import SpecialOffers from './components/SpecialOffers'
import MidPromo from './components/MidPromo'
import FoodCategories from './components/FoodCategories'
import LatestFoods from './components/LatestFoods'
import AboutStats from './components/AboutStats'
import Faq from './components/Faq'
import Footer from './components/Footer'

export default function App() {
  const [cartCount, setCartCount] = useState(0)
  const addToCart = useCallback(() => setCartCount((count) => count + 1), [])

  return (
    <div className="min-h-screen bg-white">
      <Header cartCount={cartCount} />
      <main>
        <Hero />
        <Categories />
        <SpecialOffers />
        <MidPromo />
        <FoodCategories onAdd={addToCart} />
        <LatestFoods onAdd={addToCart} />
        <AboutStats />
        <Faq />
      </main>
      <Footer />
    </div>
  )
}
