import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

/**
 * Banner photos come from Lorem Picsum (https://picsum.photos), a stable
 * public placeholder-photo service - each seed below always resolves to the
 * same image, so the banners don't shuffle on every reload. Swap any `image`
 * value for your own photo (e.g. /banners/your-photo.jpg in frontend/public/)
 * for full control over what's shown.
 */
const SLIDES = [
  {
    key: 'electronics',
    image: 'https://6a3b95a50a4149112241767e.imgix.net/pexels-emre-akyol-320381804-17571837.jpg',
    eyebrow: 'Top Deals',
    title: 'Shop the latest electronics & gadgets',
    text: 'From smartwatches to headphones - great gifts for the tech-lover in your life.',
    primary: { label: 'Shop Electronics', to: '/products?category=electronics' },
    secondary: { label: 'Browse All Gifts', to: '/products' },
  },
  {
    key: 'shops',
    image: 'https://6a3b95a50a4149112241767e.imgix.net/franki-chamaki-ivfp_yxZuYQ-unsplash.jpg',
    eyebrow: 'Marketplace',
    title: 'Shop from trusted, verified vendor stores',
    text: 'Every shop on GiftGenius is reviewed by our team before going live, so you can buy with confidence.',
    primary: { label: 'Explore Shops', to: '/products' },
    secondary: { label: 'Become a Vendor', to: '/vendor/register' },
  },
  {
    key: 'finder',
    image: 'https://6a3b95a50a4149112241767e.imgix.net/pexels-stranger-knight-1913409400-28826082.jpg',
    eyebrow: 'AI-Powered',
    title: 'Find the perfect gift in under a minute',
    text: 'Tell us their age, relationship, occasion and budget - our AI Gift Finder instantly suggests thoughtful gifts.',
    primary: { label: 'Find a Gift Now', to: '/gift-finder' },
    secondary: { label: 'See Trending', to: '/products' },
  },
  {
    key: 'checkout',
    image: 'https://6a3b95a50a4149112241767e.imgix.net/Capture.PNG',
    eyebrow: 'Fast & Secure',
    title: 'Checkout instantly with M-Pesa or PayPal',
    text: 'Quick STK push or PayPal checkout - no cash on delivery hassle, just fast, secure payment.',
    primary: { label: 'Start Shopping', to: '/products' },
    secondary: { label: 'How It Works', to: '/gift-finder' },
  },
]

const AUTO_ADVANCE_MS = 5500

export default function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (paused) return
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length)
    }, AUTO_ADVANCE_MS)
    return () => clearInterval(timerRef.current)
  }, [paused, index])

  const goTo = (i) => setIndex(((i % SLIDES.length) + SLIDES.length) % SLIDES.length)
  const slide = SLIDES[index]

  return (
    <section
      className="relative overflow-hidden bg-[#131921]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <img src={slide.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#131921] via-[#131921]/80 to-[#131921]/20" />
        </motion.div>
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative min-h-[420px] flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.key}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl text-white"
          >
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-5">
              {slide.eyebrow}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight mb-5">
              {slide.title}
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-xl">{slide.text}</p>
            <div className="flex flex-wrap gap-4">
              <Link
                to={slide.primary.to}
                className="btn-accent font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                {slide.primary.label} <FaArrowRight />
              </Link>
              <Link
                to={slide.secondary.to}
                className="border border-white/60 text-white font-semibold px-6 py-3 rounded-full hover:bg-white/10 transition-colors"
              >
                {slide.secondary.label}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={() => goTo(index - 1)}
        aria-label="Previous slide"
        className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
      >
        <FaChevronLeft />
      </button>
      <button
        onClick={() => goTo(index + 1)}
        aria-label="Next slide"
        className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
      >
        <FaChevronRight />
      </button>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.key}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-[#FF9900]' : 'w-2 bg-white/40 hover:bg-white/70'}`}
          />
        ))}
      </div>
    </section>
  )
}
