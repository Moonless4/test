const img = (id, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

export const formatPrice = (value) => value.toLocaleString('fa-IR')

export const navLinks = [
  { label: 'خانه', href: '#home' },
  { label: 'منو', href: '#menu' },
  { label: 'درباره ما', href: '#about' },
  { label: 'تماس با ما', href: '#contact' },
  { label: 'وبلاگ', href: '#news' },
]

export const heroSlides = [
  {
    id: 'h1',
    name: 'پیتزا پپرونی مخصوص',
    image: img('1565299624946-b28f40a0ae38', 600),
    discount: 50,
  },
  {
    id: 'h2',
    name: 'برگر دوبل دست‌ساز',
    image: img('1568901346375-23c9450c58cd', 600),
    discount: 50,
  },
  {
    id: 'h3',
    name: 'استیک گریل سرآشپز',
    image: img('1544025162-d76694265947', 600),
    discount: 50,
  },
  {
    id: 'h4',
    name: 'مرغ سوخاری تند',
    image: img('1562967914-608f82629710', 600),
    discount: 50,
  },
]

export const categories = [
  { id: 'drinks', label: 'نوشیدنی', icon: 'CupSoda' },
  { id: 'chicken', label: 'مرغ', icon: 'Drumstick' },
  { id: 'potato', label: 'سیب زمینی', icon: 'Cookie' },
  { id: 'sandwich', label: 'ساندویچ', icon: 'Sandwich' },
  { id: 'starter', label: 'پیش غذا', icon: 'Salad' },
  { id: 'pizza', label: 'پیتزا', icon: 'Pizza' },
]

export const specialOffers = [
  {
    id: 's1',
    name: 'پیتزا مخصوص نوال',
    description: 'خمیر نازک ایتالیایی، پنیر موزارلا و سوسیس گوشت تازه',
    price: 350000,
    oldPrice: 420000,
    image: img('1513104890138-7c749659a591', 500),
  },
  {
    id: 's2',
    name: 'جوجه کباب زعفرانی',
    description: 'سینه مرغ مزه‌دار شده با زعفران قائنات',
    price: 280000,
    oldPrice: 320000,
    image: img('1544025162-d76694265947', 500),
  },
  {
    id: 's3',
    name: 'برگر دست‌ساز دوبل',
    description: 'دو لایه گوشت چرخ‌کرده، پنیر چدار و سس مخصوص',
    price: 195000,
    oldPrice: 240000,
    image: img('1550547660-d9450f859349', 500),
  },
  {
    id: 's4',
    name: 'سالاد فصل با سس مخصوص',
    description: 'سبزیجات تازه فصل با روغن زیتون و لیمو',
    price: 80000,
    oldPrice: 110000,
    image: img('1512621776951-a57141f2eefd', 500),
  },
]

export const menuItems = [
  {
    id: 'm1',
    name: 'پیتزا مارگاریتا',
    description: 'پنیر موزارلا، گوجه و ریحان تازه',
    price: 245000,
    oldPrice: 290000,
    discount: 15,
    category: 'pizza',
    rating: '۴.۸',
    image: img('1565299624946-b28f40a0ae38', 600),
  },
  {
    id: 'm2',
    name: 'برگر چدار مخصوص',
    description: 'گوشت گریل‌شده با پنیر چدار و سیب‌زمینی',
    price: 198000,
    oldPrice: 235000,
    discount: 16,
    category: 'sandwich',
    rating: '۴.۷',
    image: img('1551782450-a2132b4ba21d', 600),
  },
  {
    id: 'm3',
    name: 'مرغ سوخاری کریسپی',
    description: 'تکه‌های مرغ با پوشش ترد و ادویه‌های مخصوص',
    price: 220000,
    oldPrice: 265000,
    discount: 20,
    category: 'chicken',
    rating: '۴.۹',
    image: img('1562967914-608f82629710', 600),
  },
  {
    id: 'm4',
    name: 'استیک ریب‌آی گریل',
    description: 'گوشت گوساله با سس قارچ و سبزیجات',
    price: 340000,
    oldPrice: 395000,
    discount: 14,
    category: 'chicken',
    rating: '۴.۸',
    image: img('1600891964092-4316c288032e', 600),
  },
  {
    id: 'm5',
    name: 'پاستا آلفردو',
    description: 'پاستا با سس خامه، قارچ و پارمزان',
    price: 185000,
    oldPrice: 215000,
    discount: 12,
    category: 'starter',
    rating: '۴.۶',
    image: img('1473093295043-cdd812d0e601', 600),
  },
  {
    id: 'm6',
    name: 'سوپ کرم قارچ',
    description: 'سوپ گرم و مخملی با قارچ تازه',
    price: 95000,
    oldPrice: 120000,
    discount: 20,
    category: 'starter',
    rating: '۴.۵',
    image: img('1547592166-23ac45744acd', 600),
  },
  {
    id: 'm7',
    name: 'لیموناد نعنا',
    description: 'نوشیدنی خنک با لیموی تازه و نعنا',
    price: 80000,
    oldPrice: 100000,
    discount: 20,
    category: 'drinks',
    rating: '۴.۷',
    image: img('1513558161293-cdaf765ed2fd', 600),
  },
  {
    id: 'm8',
    name: 'سیب‌زمینی سرخ‌کرده',
    description: 'سیب‌زمینی ترد با پنیر و سس مخصوص',
    price: 110000,
    oldPrice: 140000,
    discount: 21,
    category: 'sandwich',
    rating: '۴.۹',
    image: img('1573080496219-bb080dd4f877', 600),
  },
]

export const latestFoods = [
  {
    id: 'l1',
    name: 'ساندویچ کلاب مرغ',
    description: 'نان تست، مرغ گریل و سبزیجات تازه',
    price: 165000,
    oldPrice: 195000,
    discount: 15,
    category: 'sandwich',
    rating: '۴.۸',
    image: img('1504754524776-8f4f37790ca0', 600),
  },
  {
    id: 'l2',
    name: 'پیتزا پپرونی چدار',
    description: 'پپرونی گوشت و پنیر چدار ذوب‌شده',
    price: 295000,
    oldPrice: 345000,
    discount: 14,
    category: 'pizza',
    rating: '۴.۹',
    image: img('1626082927389-6cd097cdc6ec', 600),
  },
  {
    id: 'l3',
    name: 'کیک شکلاتی گرم',
    description: 'کیک شکلاتی با مغز روان و بستنی',
    price: 120000,
    oldPrice: 150000,
    discount: 20,
    category: 'starter',
    rating: '۵.۰',
    image: img('1567620905732-2d1ec7ab7445', 600),
  },
  {
    id: 'l4',
    name: 'کباب کوبیده دو سیخ',
    description: 'گوشت تازه با برنج ایرانی زعفرانی',
    price: 320000,
    oldPrice: 370000,
    discount: 13,
    category: 'chicken',
    rating: '۴.۸',
    image: img('1544025162-d76694265947', 600),
  },
]

export const features = [
  {
    icon: 'Leaf',
    title: 'مواد اولیه تازه و ارگانیک',
    text: 'هر روز صبح مواد اولیه از بازار تازه تهیه می‌شود.',
  },
  {
    icon: 'ChefHat',
    title: 'سرآشپزهای حرفه‌ای',
    text: 'تیم آشپزی ما بیش از ۲۵ سال تجربه حرفه‌ای دارد.',
  },
  {
    icon: 'Truck',
    title: 'ارسال سریع و به‌موقع',
    text: 'سفارش شما گرم و به‌موقع به دستتان می‌رسد.',
  },
  {
    icon: 'BadgeCheck',
    title: 'کیفیت و طعم تضمینی',
    text: 'رضایت شما پشتوانه کیفیت غذاهای ما است.',
  },
]

export const stats = [
  { icon: 'ChefHat', value: '۲۵', label: 'سال تجربه' },
  { icon: 'Users', value: '۱۲,۰۰۰', label: 'مشتری راضی' },
  { icon: 'UtensilsCrossed', value: '۱۲۰', label: 'دستور ویژه' },
  { icon: 'Soup', value: '۸۰۰', label: 'وعده در روز' },
]

export const faqs = [
  {
    q: 'آیا امکان سفارش آنلاین وجود دارد؟',
    a: 'بله، می‌توانید از همین سایت منوی کامل را ببینید و سفارش خود را ثبت کنید. سفارش شما بلافاصله در آشپزخانه آماده می‌شود.',
  },
  {
    q: 'آیا می‌توانم میز رزرو کنم؟',
    a: 'بله، از بخش «رزرو یا سفارش آنلاین» یا با تماس با شماره رستوران می‌توانید میز خود را برای تاریخ و ساعت دلخواه رزرو کنید.',
  },
  {
    q: 'زمان ارسال سفارش چقدر است؟',
    a: 'سفارش‌ها معمولاً بین ۳۰ تا ۴۵ دقیقه به دست شما می‌رسند. در ساعات پیک ممکن است زمان کمی بیشتر شود.',
  },
  {
    q: 'آیا غذاهای رژیمی هم دارید؟',
    a: 'بله، در منو بخشی برای غذاهای سبک و کم‌کالری وجود دارد و می‌توانید هنگام سفارش درخواست خود را یادداشت کنید.',
  },
  {
    q: 'شیوه‌های پرداخت کدام‌اند؟',
    a: 'پرداخت آنلاین از طریق درگاه بانکی و همچنین پرداخت در محل هنگام تحویل سفارش امکان‌پذیر است.',
  },
  {
    q: 'آیا امکان لغو یا تغییر سفارش هست؟',
    a: 'تا زمانی که سفارش وارد مرحله پخت نشده باشد، با تماس با پشتیبانی می‌توانید سفارش خود را لغو یا تغییر دهید.',
  },
]

export const testimonials = [
  {
    id: 't1',
    quote:
      'طعم غذاها واقعاً یادم نمی‌رود! پیتزای مخصوص نوال بهترین پیتزایی است که در تهران خورده‌ام، مواد اولیه تازه و کیفیت بی‌نظیر.',
    name: 'سارا محمدی',
    role: 'مشتری دائمی',
    avatar: img('1494790108377-be9c29b29330', 200),
  },
  {
    id: 't2',
    quote:
      'سفارش آنلاین خیلی راحت بود و غذا در کمتر از ۴۰ دقیقه گرم و سالم به دستم رسید. پرسنل هم بسیار خوش‌برخورد بودند.',
    name: 'امیر رضایی',
    role: 'مشتری جدید',
    avatar: img('1500648767791-00dcc994a43e', 200),
  },
  {
    id: 't3',
    quote:
      'برای تولد همسرم میز رزرو کردیم؛ فضای رستوران دنج و دلنشین بود و سرآشپز یک دسر ویژه هم مهمان‌نوازی کرد.',
    name: 'نگار احمدی',
    role: 'مشتری وفادار',
    avatar: img('1534528741775-53994a69daeb', 200),
  },
]

export const news = [
  {
    id: 'n1',
    title: 'راز ترد شدن مرغ سوخاری نوال چیست؟',
    excerpt: 'نگاهی به دستور پخت و ادویه‌های مخصوص سرآشپز ما که طعمی متفاوت می‌سازد.',
    date: '۱۲ مهر ۱۴۰۴',
    image: img('1562967914-608f82629710', 600),
  },
  {
    id: 'n2',
    title: '۵ پیشنهاد غذای گرم برای شب‌های پاییز',
    excerpt: 'از سوپ کرم قارچ تا کباب سنتی؛ انتخاب‌هایی که حال‌وهوای پاییز را کامل می‌کنند.',
    date: '۲۸ مهر ۱۴۰۴',
    image: img('1473093295043-cdd812d0e601', 600),
  },
  {
    id: 'n3',
    title: 'چطور میز رستوران برای مهمانی رزرو کنیم؟',
    excerpt: 'راهنمای ساده برای رزرو میز، انتخاب منو و هماهنگی برای جمع‌های خانوادگی.',
    date: '۵ آبان ۱۴۰۴',
    image: img('1541592106381-b31e9677c0e5', 600),
  },
]

export const contactInfo = [
  { icon: 'Mail', label: 'ایمیل', value: 'info@naval-restaurant.ir' },
  { icon: 'Phone', label: 'تلفن', value: '۰۲۱ - ۲۲ ۳۴ ۵۶ ۷۸' },
  { icon: 'Clock', label: 'ساعات کاری', value: '۸ صبح تا ۵ عصر' },
  { icon: 'MapPin', label: 'آدرس', value: 'تهران، سعادت آباد' },
]
