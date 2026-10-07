import { avatarImg, heroImg, img, wideImg } from './images';
import type {
  BlogPost,
  Category,
  CategoryId,
  Coupon,
  MegaMenuSection,
  Product,
  ProductColor,
  ProductReview,
  Testimonial,
} from './types';

/* ------------------------------------------------------------------ *
 * Shared option sets
 * ------------------------------------------------------------------ */

const COLOR = {
  navy: { name: 'سرمه‌ای', hex: '#123F50' },
  black: { name: 'مشکی', hex: '#1C1C1C' },
  cream: { name: 'کرم', hex: '#E9DED0' },
  white: { name: 'سفید', hex: '#FFFFFF' },
  brown: { name: 'قهوه‌ای', hex: '#6B4A32' },
  olive: { name: 'زیتونی', hex: '#4E5B3A' },
  blue: { name: 'آبی روشن', hex: '#6FA5B8' },
  wine: { name: 'شرابی', hex: '#7B2D3B' },
  grey: { name: 'طوسی', hex: '#8A8F94' },
  pink: { name: 'صورتی', hex: '#E8B4B8' },
  tan: { name: 'عسلی', hex: '#C9A227' },
} satisfies Record<string, ProductColor>;

const CLOTH_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const SHOE_SIZES = ['39', '40', '41', '42', '43', '44'];
const ONE_SIZE = ['تک‌سایز'];

const REVIEW_TEXT = [
  'کیفیت لباس‌ها بسیار خوب بود و بسته‌بندی هم عالی انجام شده بود.',
  'محصول دقیقاً مطابق عکس بود. از خرید خودم کاملاً راضی هستم.',
  'ارسال سریع و پشتیبانی بسیار خوب.',
  'جنس پارچه نرم و خوش‌دوخت است، حتماً دوباره خرید می‌کنم.',
];
const AVATARS = [
  '1494790108377-be9c29b29330',
  '1507003211169-0a1dd7228f2d',
  '1534528741775-53994a69daeb',
  '1517841905240-472988babdf9',
  '1544005313-94ddf0286df2',
];
const REVIEWER_NAMES = ['سارا محمدی', 'امیر رضایی', 'نگار کریمی', 'مهدی تهرانی', 'الهام نوری'];
const REVIEW_DATES = ['۱۴ مهر ۱۴۰۴', '۲ مهر ۱۴۰۴', '۲۸ شهریور ۱۴۰۴', '۱۵ شهریور ۱۴۰۴'];

const buildReviews = (offset: number): ProductReview[] =>
  [0, 1, 2].map((n) => {
    const i = (offset + n) % REVIEW_TEXT.length;
    return {
      name: REVIEWER_NAMES[(offset + n) % REVIEWER_NAMES.length],
      avatar: avatarImg(AVATARS[(offset + n) % AVATARS.length]),
      rating: n === 2 ? 4 : 5,
      date: REVIEW_DATES[(offset + n) % REVIEW_DATES.length],
      text: REVIEW_TEXT[i],
    };
  });

/* ------------------------------------------------------------------ *
 * Product seeds
 * ------------------------------------------------------------------ */

type Seed = {
  id: string;
  name: string;
  category: CategoryId;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  sizes: string[];
  colors: ProductColor[];
  stock: number;
  isNew?: boolean;
  material: string;
  fit: string;
  description: string;
};

const SEEDS: Seed[] = [
  /* ---------------------------- مردانه ---------------------------- */
  {
    id: 'men-denim-jacket',
    name: 'کت جین مردانه',
    category: 'men',
    brand: 'STYLEON',
    price: 1995000,
    originalPrice: 2850000,
    rating: 4.8,
    reviewCount: 124,
    image: '1434389677669-e08b4cac3105',
    sizes: CLOTH_SIZES,
    colors: [COLOR.navy, COLOR.black, COLOR.olive],
    stock: 18,
    material: 'جین سنگ‌شور درجه یک',
    fit: 'اسلیم‌فیت',
    description:
      'کت جین مردانه با دوخت مستحکم و رنگ‌بندی آرام، انتخابی همیشگی برای استایل روزمره. برش اسلیم‌فیت آن فرم بدن را حفظ می‌کند و در عین حال آزادی حرکت کامل دارد.',
  },
  {
    id: 'men-ls-shirt',
    name: 'پیراهن مردانه آستین بلند',
    category: 'men',
    brand: 'ATRI',
    price: 1605000,
    originalPrice: 1890000,
    rating: 4.6,
    reviewCount: 86,
    image: '1596755094514-f87e34085b2c',
    sizes: CLOTH_SIZES,
    colors: [COLOR.white, COLOR.blue, COLOR.grey],
    stock: 24,
    material: 'نخ پنبه ۱۰۰٪',
    fit: 'اسلیم‌فیت',
    description:
      'پیراهن آستین بلند با پارچه نخی خنک و یقه‌ای خوش‌فرم؛ گزینه‌ای رسمی برای محیط کار و جلسات، و در عین حال راحت برای استایل نیمه‌رسمی.',
  },
  {
    id: 'men-cotton-tee',
    name: 'تی‌شرت مردانه پنبه',
    category: 'men',
    brand: 'STYLEON',
    price: 890000,
    rating: 4.7,
    reviewCount: 203,
    image: '1521572163474-6864f9cf17ab',
    sizes: CLOTH_SIZES,
    colors: [COLOR.white, COLOR.black, COLOR.navy],
    stock: 52,
    material: 'پنبه پنبه‌ای ۱۸۰ گرم',
    fit: 'رجولار',
    description:
      'تی‌شرت پایه‌ی کمد لباس با پنبه‌ی نرم و رنگ‌ثابت. یقه‌ی تقویت‌شده مانع از تغییر فرم پس از شست‌وشو می‌شود.',
  },
  {
    id: 'men-linen-coat',
    name: 'کت کتان مردانه',
    category: 'men',
    brand: 'STYLEON',
    price: 1800000,
    originalPrice: 2400000,
    rating: 4.9,
    reviewCount: 64,
    image: '1519085360753-af0119f7cbe7',
    sizes: CLOTH_SIZES,
    colors: [COLOR.cream, COLOR.navy, COLOR.brown],
    stock: 12,
    isNew: true,
    material: 'کتان طبیعی',
    fit: 'رجولار',
    description:
      'کت کتان با وزن سبک و فرم ایستاده، برای فصل‌های گرم طراحی شده است. رنگ کرم آن با اغلب رنگ‌های کمد لباس هماهنگ می‌شود.',
  },
  {
    id: 'men-hoodie',
    name: 'هودی مردانه کلاه‌دار',
    category: 'men',
    brand: 'KANOON',
    price: 1200000,
    originalPrice: 1600000,
    rating: 4.5,
    reviewCount: 178,
    image: '1556821840-3a63f95609a7',
    sizes: CLOTH_SIZES,
    colors: [COLOR.grey, COLOR.navy, COLOR.black],
    stock: 31,
    isNew: true,
    material: 'پنبه کشباف',
    fit: 'اورسایز',
    description:
      'هودی کلاه‌دار با کشباف داخلی نرم و کیفیت دوخت بالا؛ گزینه‌ای گرم و راحت برای روزهای خنک.',
  },
  {
    id: 'men-jeans',
    name: 'شلوار جین مردانه',
    category: 'men',
    brand: 'ATRI',
    price: 1450000,
    rating: 4.4,
    reviewCount: 92,
    image: '1479064555552-3ef4979f8908',
    sizes: CLOTH_SIZES,
    colors: [COLOR.navy, COLOR.black],
    stock: 27,
    material: 'جین مخلوط با الاستان',
    fit: 'اسلیم‌فیت',
    description:
      'شلوار جین با کمی الاستان که فرم بدن را دنبال می‌کند و در طول روز آزادی حرکت می‌دهد.',
  },
  {
    id: 'men-polo',
    name: 'پولوشرت مردانه',
    category: 'men',
    brand: 'PARSA',
    price: 1020000,
    originalPrice: 1200000,
    rating: 4.3,
    reviewCount: 57,
    image: '1516762689617-e1cffcef479d',
    sizes: CLOTH_SIZES,
    colors: [COLOR.navy, COLOR.olive, COLOR.wine],
    stock: 20,
    material: 'پنبه پیکه',
    fit: 'رجولار',
    description:
      'پولوشرت پیکه با یقه‌ی بافت‌شده و دکمه‌های مخفی؛ پوشاکی میانه‌رو میان رسمی و روزمره.',
  },
  {
    id: 'men-winter-jacket',
    name: 'کاپشن مردانه زمستانی',
    category: 'men',
    brand: 'ARTA',
    price: 3040000,
    originalPrice: 3800000,
    rating: 4.7,
    reviewCount: 41,
    image: '1566174053879-31528523f8ae',
    sizes: CLOTH_SIZES,
    colors: [COLOR.black, COLOR.olive],
    stock: 9,
    isNew: true,
    material: 'پلی‌استر ضدآب',
    fit: 'رجولار',
    description:
      'کاپشن زمستانی با آستر گرم و لایه‌ی ضدآب؛ در برابر باد و باران سبک مقاوم است و برای سفرهای زمستانی انتخاب می‌شود.',
  },

  /* ---------------------------- زنانه ---------------------------- */
  {
    id: 'women-linen-manteau',
    name: 'مانتو کتان زنانه',
    category: 'women',
    brand: 'VENUS',
    price: 2080000,
    originalPrice: 2600000,
    rating: 4.8,
    reviewCount: 156,
    image: '1594938298603-c8148c4dae35',
    sizes: CLOTH_SIZES,
    colors: [COLOR.cream, COLOR.navy, COLOR.black],
    stock: 22,
    material: 'کتان طبیعی',
    fit: 'رجولار',
    description:
      'مانتو کتان با فرم ایستاده و دوخت تمیز؛ برای محیط کار و بیرون‌رفت‌های روزانه طراحی شده و پس از شست‌وشو فرم خود را حفظ می‌کند.',
  },
  {
    id: 'women-floral-dress',
    name: 'پیراهن زنانه گل‌دار',
    category: 'women',
    brand: 'VENUS',
    price: 1200000,
    originalPrice: 1600000,
    rating: 4.6,
    reviewCount: 88,
    image: '1544022613-e87ca75a784a',
    sizes: CLOTH_SIZES,
    colors: [COLOR.pink, COLOR.cream, COLOR.navy],
    stock: 17,
    material: 'ویسکوز',
    fit: 'رجولار',
    description:
      'پیراهن گل‌دار با پارچه‌ی روان و طرح آرام؛ انتخابی دلپذیر برای مهمانی‌های روز و سفرهای بهاری.',
  },
  {
    id: 'women-ls-blouse',
    name: 'بلوز زنانه آستین بلند',
    category: 'women',
    brand: 'ATRI',
    price: 1150000,
    rating: 4.5,
    reviewCount: 112,
    image: '1496747611176-843222e1e57c',
    sizes: CLOTH_SIZES,
    colors: [COLOR.cream, COLOR.grey, COLOR.wine],
    stock: 34,
    material: 'حریر مخلوط',
    fit: 'اورسایز',
    description:
      'بلوز آستین بلند با فرم آزاد و پارچه‌ی خوش‌ریخت؛ به‌سادگی با شلوار پارچه‌ای یا جین ست می‌شود.',
  },
  {
    id: 'women-formal-coat',
    name: 'کت زنانه مجلسی',
    category: 'women',
    brand: 'LUXE',
    price: 2400000,
    originalPrice: 3200000,
    rating: 4.9,
    reviewCount: 73,
    image: '1539533018447-63fcce2678e3',
    sizes: CLOTH_SIZES,
    colors: [COLOR.cream, COLOR.wine],
    stock: 11,
    material: 'فاستونی مخلوط',
    fit: 'رجولار',
    description:
      'کت مجلسی با آستر کامل و برش تمیز؛ گزینه‌ای شیک برای مراسم و جلسات رسمی پاییز و زمستان.',
  },
  {
    id: 'women-trousers',
    name: 'شلوار پارچه‌ای زنانه',
    category: 'women',
    brand: 'PARSA',
    price: 1000000,
    originalPrice: 1250000,
    rating: 4.4,
    reviewCount: 96,
    image: '1487412720507-e7ab37603c6f',
    sizes: CLOTH_SIZES,
    colors: [COLOR.black, COLOR.navy, COLOR.cream],
    stock: 29,
    material: 'پارچه‌ی مخلوط',
    fit: 'دم‌پا',
    description:
      'شلوار پارچه‌ای با فرم دم‌پا و کمر کشی پنهان؛ ترکیبی از رسمیت و راحتی در یک پوشاک.',
  },
  {
    id: 'women-tunic',
    name: 'تونیک زنانه نخی',
    category: 'women',
    brand: 'KANOON',
    price: 980000,
    rating: 4.3,
    reviewCount: 61,
    image: '1445205170230-053b83016050',
    sizes: CLOTH_SIZES,
    colors: [COLOR.white, COLOR.blue, COLOR.pink],
    stock: 38,
    isNew: true,
    material: 'نخ پنبه',
    fit: 'اورسایز',
    description:
      'تونیک نخی با فرم آزاد و تهویه‌ی خوب؛ برای روزهای گرم تابستان سبک و خنک است.',
  },
  {
    id: 'women-evening-dress',
    name: 'پیراهن مجلسی زنانه',
    category: 'women',
    brand: 'LUXE',
    price: 2320000,
    originalPrice: 2900000,
    rating: 4.8,
    reviewCount: 47,
    image: '1595777457583-95e059d581b8',
    sizes: CLOTH_SIZES,
    colors: [COLOR.cream, COLOR.black, COLOR.wine],
    stock: 8,
    isNew: true,
    material: 'ساتن درجه یک',
    fit: 'رجولار',
    description:
      'پیراهن مجلسی با پارچه‌ی ساتن و فرم کشیده؛ مناسب مهمانی‌های شب و مراسم خاص.',
  },

  /* ----------------------------- کفش ----------------------------- */
  {
    id: 'shoes-classic-sneaker',
    name: 'کتانی کلاسیک',
    category: 'shoes',
    brand: 'STYLEON',
    price: 1870000,
    originalPrice: 2200000,
    rating: 4.7,
    reviewCount: 214,
    image: '1560769629-975ec94e6a86',
    sizes: SHOE_SIZES,
    colors: [COLOR.white, COLOR.black],
    stock: 26,
    material: 'چرم مصنوعی و مش',
    fit: 'فرم استاندارد',
    description:
      'کتانی کلاسیک با کفی طبی نرم و زیره‌ی ضدلغزش؛ هم برای پیاده‌روی روزانه و هم برای استایل اسپرت مناسب است.',
  },
  {
    id: 'shoes-leather-men',
    name: 'کفش چرم مردانه',
    category: 'shoes',
    brand: 'ARTA',
    price: 3400000,
    rating: 4.9,
    reviewCount: 68,
    image: '1600185365483-26d7a4cc7519',
    sizes: SHOE_SIZES,
    colors: [COLOR.brown, COLOR.black],
    stock: 14,
    material: 'چرم طبیعی',
    fit: 'فرم استاندارد',
    description:
      'کفش چرم طبیعی با دوخت دست و آستر چرمی؛ با گذشت زمان فرم پا را به خود می‌گیرد و دوام بالایی دارد.',
  },
  {
    id: 'shoes-women-sandal',
    name: 'صندل زنانه تابستانی',
    category: 'shoes',
    brand: 'VENUS',
    price: 935000,
    originalPrice: 1100000,
    rating: 4.2,
    reviewCount: 39,
    image: '1490114538077-0a7f8cb49891',
    sizes: SHOE_SIZES,
    colors: [COLOR.cream, COLOR.brown],
    stock: 33,
    material: 'چرم مصنوعی',
    fit: 'فرم استاندارد',
    description:
      'صندل سبک با بند قابل تنظیم و کفی نرم؛ انتخابی راحت برای روزهای گرم سال.',
  },
  {
    id: 'shoes-women-boot',
    name: 'بوت زنانه چرم',
    category: 'shoes',
    brand: 'LUXE',
    price: 2100000,
    originalPrice: 2800000,
    rating: 4.6,
    reviewCount: 52,
    image: '1460353581641-37baddab0fa2',
    sizes: SHOE_SIZES,
    colors: [COLOR.brown, COLOR.black],
    stock: 15,
    isNew: true,
    material: 'چرم طبیعی',
    fit: 'فرم استاندارد',
    description:
      'بوت چرم با پاشنه‌ی کوتاه و ساق میانه؛ برای استایل‌های پاییزی و زمستانی طراحی شده است.',
  },
  {
    id: 'shoes-running',
    name: 'کفش ورزشی رانینگ',
    category: 'shoes',
    brand: 'KANOON',
    price: 2000000,
    originalPrice: 2500000,
    rating: 4.8,
    reviewCount: 187,
    image: '1542291026-7eec264c27ff',
    sizes: SHOE_SIZES,
    colors: [COLOR.black, COLOR.blue, COLOR.grey],
    stock: 21,
    material: 'مش تنفسی',
    fit: 'فرم ورزشی',
    description:
      'کفش رانینگ با زیره‌ی فوم ضربه‌گیر و رویه‌ی مش تنفسی؛ برای دویدن و تمرین‌های روزانه سبک و مانع تعرق است.',
  },
  {
    id: 'shoes-men-boot',
    name: 'نیم‌بوت چرم مردانه',
    category: 'shoes',
    brand: 'ARTA',
    price: 2550000,
    originalPrice: 3000000,
    rating: 4.5,
    reviewCount: 44,
    image: '1595950653106-6c9ebd614d3a',
    sizes: SHOE_SIZES,
    colors: [COLOR.brown, COLOR.black],
    stock: 13,
    material: 'چرم طبیعی',
    fit: 'فرم استاندارد',
    description:
      'نیم‌بوت چرم با زیره‌ی مقاوم و دوخت تقویت‌شده؛ ترکیبی از دوام و ظاهر رسمی.',
  },

  /* --------------------------- اکسسوری --------------------------- */
  {
    id: 'acc-women-handbag',
    name: 'کیف دستی زنانه چرم',
    category: 'bags',
    brand: 'LUXE',
    price: 1840000,
    originalPrice: 2300000,
    rating: 4.8,
    reviewCount: 121,
    image: '1584917865442-de89df76afd3',
    sizes: ONE_SIZE,
    colors: [COLOR.brown, COLOR.black, COLOR.cream],
    stock: 19,
    material: 'چرم طبیعی',
    fit: 'تک‌سایز',
    description:
      'کیف دستی با چرم نرم و آستر پارچه‌ای؛ جیب‌های داخلی منظم و بند قابل جداشدن، آن را به گزینه‌ای کاربردی تبدیل می‌کند.',
  },
  {
    id: 'acc-sunglasses',
    name: 'عینک آفتابی کلاسیک',
    category: 'accessories',
    brand: 'STYLEON',
    price: 1190000,
    originalPrice: 1400000,
    rating: 4.4,
    reviewCount: 78,
    image: '1511499767150-a48a237f0083',
    sizes: ONE_SIZE,
    colors: [COLOR.black, COLOR.brown],
    stock: 40,
    material: 'فریم استات و لنز UV400',
    fit: 'تک‌سایز',
    description:
      'عینک آفتابی با لنز UV400 و فریم سبک؛ محافظت کامل در برابر نور شدید با استایلی کلاسیک.',
  },
  {
    id: 'acc-belt',
    name: 'کمربند چرم مردانه',
    category: 'accessories',
    brand: 'ARTA',
    price: 850000,
    rating: 4.6,
    reviewCount: 55,
    image: '1584370848010-d7fe6bc767ec',
    sizes: ONE_SIZE,
    colors: [COLOR.brown, COLOR.black],
    stock: 46,
    material: 'چرم طبیعی',
    fit: 'قابل کوتاه شدن',
    description:
      'کمربند چرم با سگک فلزی مات؛ ضخامت مناسب آن مانع از تاب برداشتن در استفاده‌ی روزمره می‌شود.',
  },
  {
    id: 'acc-watch',
    name: 'ساعت مچی مردانه',
    category: 'accessories',
    brand: 'LUXE',
    price: 4050000,
    originalPrice: 4500000,
    rating: 4.9,
    reviewCount: 34,
    image: '1524805444758-089113d48a6d',
    sizes: ONE_SIZE,
    colors: [COLOR.brown, COLOR.black],
    stock: 7,
    material: 'بند چرم و بدنه‌ی استیل',
    fit: 'تک‌سایز',
    description:
      'ساعت مچی با موتور دقیق و بدنه‌ی استیل ضدزنگ؛ بند چرمی آن ظاهری گرم و کلاسیک به مچ می‌دهد.',
  },
  {
    id: 'acc-shoulder-bag',
    name: 'کیف دوشی چرم',
    category: 'bags',
    brand: 'PARSA',
    price: 1425000,
    originalPrice: 1900000,
    rating: 4.3,
    reviewCount: 66,
    image: '1553062407-98eeb64c6a62',
    sizes: ONE_SIZE,
    colors: [COLOR.navy, COLOR.brown, COLOR.black],
    stock: 23,
    isNew: true,
    material: 'چرم مصنوعی درجه یک',
    fit: 'تک‌سایز',
    description:
      'کیف دوشی با فضای داخلی کافی برای لپ‌تاپ ۱۴ اینچ؛ سبک، مقاوم و مناسب رفت‌وآمد روزانه.',
  },
  {
    id: 'acc-scarf',
    name: 'شال و روسری ابریشمی',
    category: 'accessories',
    brand: 'VENUS',
    price: 624000,
    originalPrice: 780000,
    rating: 4.5,
    reviewCount: 143,
    image: '1483985988355-763728e1935b',
    sizes: ONE_SIZE,
    colors: [COLOR.blue, COLOR.pink, COLOR.cream],
    stock: 58,
    material: 'ابریشم مخلوط',
    fit: 'تک‌سایز',
    description:
      'شال ابریشمی با رنگ‌بندی آرام و لبه‌ی دوخته‌شده؛ سبک است و در طول روز روی شانه می‌ماند.',
  },
  {
    id: 'acc-crossbody',
    name: 'کیف دوشی کوچک زنانه',
    category: 'bags',
    brand: 'ATRI',
    price: 1250000,
    rating: 4.4,
    reviewCount: 29,
    image: '1543163521-1bf539c55dd2',
    sizes: ONE_SIZE,
    colors: [COLOR.cream, COLOR.brown, COLOR.black],
    stock: 25,
    isNew: true,
    material: 'چرم طبیعی',
    fit: 'تک‌سایز',
    description:
      'کیف دوشی کوچک با بند بلند قابل تنظیم؛ برای همراه‌داشتن ضروری‌ها در بیرون‌رفت‌های کوتاه.',
  },

  /* ---------------------------- زیبایی ---------------------------- */
  {
    id: 'beauty-perfume',
    name: 'ادوپرفیوم زنانه گل‌دار',
    category: 'beauty',
    brand: 'GLOW',
    price: 2450000,
    originalPrice: 2900000,
    rating: 4.8,
    reviewCount: 96,
    image: '1541643600914-78b084683601',
    sizes: ONE_SIZE,
    colors: [COLOR.pink, COLOR.cream],
    stock: 21,
    isNew: true,
    material: 'ادوپرفیوم ۱۰۰ میلی‌لیتر',
    fit: 'تک‌سایز',
    description:
      'ادوپرفیوم با رایحه‌ی گل‌های سفید و ماندگاری بالا؛ انتخابی مناسب برای مهمانی‌های شب و استفاده‌ی روزمره.',
  },
  {
    id: 'beauty-face-serum',
    name: 'سرم روشن‌کننده ویتامین C',
    category: 'beauty',
    brand: 'GLOW',
    price: 1290000,
    originalPrice: 1650000,
    rating: 4.7,
    reviewCount: 143,
    image: '1620916566398-39f1143ab7be',
    sizes: ONE_SIZE,
    colors: [COLOR.white, COLOR.cream],
    stock: 34,
    material: 'سرم ۳۰ میلی‌لیتر',
    fit: 'تک‌سایز',
    description:
      'سرم ویتامین C با بافت سبک و جذب سریع؛ به یکنواختی رنگ پوست کمک می‌کند و برای استفاده‌ی روزانه مناسب است.',
  },
  {
    id: 'beauty-skin-spray',
    name: 'اسپری آبرسان پوست',
    category: 'beauty',
    brand: 'GLOW',
    price: 690000,
    originalPrice: 850000,
    rating: 4.5,
    reviewCount: 78,
    image: '1556228578-8c89e6adf883',
    sizes: ONE_SIZE,
    colors: [COLOR.white],
    stock: 47,
    material: 'اسپری ۱۵۰ میلی‌لیتر',
    fit: 'تک‌سایز',
    description:
      'اسپری آبرسان با آب‌رسانی فوری؛ برای تازه‌سازی پوست در طول روز و پیش از آرایش استفاده می‌شود.',
  },
  {
    id: 'beauty-lipstick',
    name: 'رژ لب مات مخملی',
    category: 'beauty',
    brand: 'VENUS',
    price: 420000,
    originalPrice: 520000,
    rating: 4.6,
    reviewCount: 118,
    image: '1586495777744-4413f21062fa',
    sizes: ONE_SIZE,
    colors: [COLOR.wine, COLOR.pink],
    stock: 62,
    material: 'رژ لب جامد',
    fit: 'تک‌سایز',
    description:
      'رژ لب مات با پوشش کامل و ماندگاری بالا؛ بافت مخملی آن خشکی روی لب ایجاد نمی‌کند.',
  },
];

/* ------------------------------------------------------------------ *
 * Derived catalog
 * ------------------------------------------------------------------ */

const POOLS: Record<CategoryId, string[]> = {
  men: [
    '1434389677669-e08b4cac3105',
    '1521572163474-6864f9cf17ab',
    '1596755094514-f87e34085b2c',
    '1519085360753-af0119f7cbe7',
    '1556821840-3a63f95609a7',
    '1479064555552-3ef4979f8908',
    '1516762689617-e1cffcef479d',
    '1566174053879-31528523f8ae',
    '1602810318383-e386cc2a3ccf',
    '1618354691373-d851c5c3a990',
    '1512436991641-6745cdb1723f',
    '1503341504253-dff4815485f1',
  ],
  women: [
    '1594938298603-c8148c4dae35',
    '1544022613-e87ca75a784a',
    '1496747611176-843222e1e57c',
    '1539533018447-63fcce2678e3',
    '1487412720507-e7ab37603c6f',
    '1445205170230-053b83016050',
    '1595777457583-95e059d581b8',
    '1490481651871-ab68de25d43d',
    '1539109136881-3be0616acf4b',
    '1515886657613-9f3515b0c78f',
  ],
  shoes: [
    '1560769629-975ec94e6a86',
    '1600185365483-26d7a4cc7519',
    '1490114538077-0a7f8cb49891',
    '1460353581641-37baddab0fa2',
    '1542291026-7eec264c27ff',
    '1595950653106-6c9ebd614d3a',
    '1549298916-b41d501d3772',
  ],
  accessories: [
    '1584917865442-de89df76afd3',
    '1511499767150-a48a237f0083',
    '1584370848010-d7fe6bc767ec',
    '1524805444758-089113d48a6d',
    '1553062407-98eeb64c6a62',
    '1483985988355-763728e1935b',
    '1543163521-1bf539c55dd2',
    '1523170335258-f5ed11844a49',
    '1572635196237-14b3f281503f',
  ],
  bags: [
    '1584917865442-de89df76afd3',
    '1553062407-98eeb64c6a62',
    '1543163521-1bf539c55dd2',
    '1590874103328-eac38a683ce7',
    '1548036328-c9fa89d128fa',
  ],
  beauty: [
    '1541643600914-78b084683601',
    '1620916566398-39f1143ab7be',
    '1596462502278-27bfdc403348',
    '1556228578-8c89e6adf883',
    '1586495777744-4413f21062fa',
  ],
};

export const products: Product[] = SEEDS.map((seed, index) => {
  const pool = POOLS[seed.category].filter((id) => id !== seed.image);
  const gallery = [
    seed.image,
    pool[index % pool.length],
    pool[(index + 4) % pool.length],
  ].filter((id, i, arr) => arr.indexOf(id) === i);

  const originalPrice = seed.originalPrice ?? seed.price;
  const discount =
    seed.originalPrice != null
      ? Math.round((1 - seed.price / seed.originalPrice) * 100)
      : 0;

  return {
    id: seed.id,
    name: seed.name,
    category: seed.category,
    brand: seed.brand,
    price: seed.price,
    originalPrice,
    discount,
    rating: seed.rating,
    reviewCount: seed.reviewCount,
    images: gallery.map((id) => img(id)),
    sizes: seed.sizes,
    colors: seed.colors,
    stock: seed.stock,
    isNew: Boolean(seed.isNew),
    description: seed.description,
    specs: [
      { label: 'جنس', value: seed.material },
      { label: 'فرم', value: seed.fit },
      { label: 'برند', value: seed.brand },
      { label: 'کد کالا', value: `ST-${seed.id.toUpperCase()}` },
      { label: 'کشور تولید', value: 'ایران' },
      { label: 'نحوه شست‌وشو', value: 'شست‌وشوی دستی با آب سرد' },
    ],
    reviews: buildReviews(index),
  };
});

export const getProduct = (id?: string): Product | undefined =>
  products.find((p) => p.id === id);

export const getByCategory = (category: CategoryId): Product[] =>
  products.filter((p) => p.category === category);

export const discountedProducts = products
  .filter((p) => p.discount > 0)
  .sort((a, b) => b.discount - a.discount);

export const newArrivals = [
  'men-linen-coat',
  'acc-women-handbag',
  'shoes-classic-sneaker',
  'men-hoodie',
  'acc-sunglasses',
  'acc-belt',
]
  .map((id) => getProduct(id))
  .filter((p): p is Product => Boolean(p));

export const relatedProducts = (product: Product, count = 4): Product[] =>
  products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .concat(products.filter((p) => p.id !== product.id && p.category !== product.category))
    .slice(0, count);

/* ------------------------------------------------------------------ *
 * Static content
 * ------------------------------------------------------------------ */

const countIn = (id: CategoryId): number =>
  products.filter((p) => p.category === id).length;

export const categories: Category[] = [
  {
    id: 'men',
    title: 'مردانه',
    subtitle: 'پوشاک کلاسیک و روزمره',
    image: img('1512436991641-6745cdb1723f', 800, 1000),
    itemCount: countIn('men'),
  },
  {
    id: 'women',
    title: 'زنانه',
    subtitle: 'مانتو، پیراهن و شومییز',
    image: img('1515886657613-9f3515b0c78f', 800, 1000),
    itemCount: countIn('women'),
  },
  {
    id: 'shoes',
    title: 'کفش',
    subtitle: 'کتانی، چرم و بوت',
    image: img('1549298916-b41d501d3772', 800, 1000),
    itemCount: countIn('shoes'),
  },
  {
    id: 'accessories',
    title: 'اکسسوری',
    subtitle: 'ساعت، عینک و شال',
    image: img('1523170335258-f5ed11844a49', 800, 1000),
    itemCount: countIn('accessories'),
  },
  {
    id: 'bags',
    title: 'کیف و کوله',
    subtitle: 'دستی، دوشی و کوله',
    image: img('1548036328-c9fa89d128fa', 800, 1000),
    itemCount: countIn('bags'),
  },
  {
    id: 'beauty',
    title: 'زیبایی',
    subtitle: 'عطر و مراقبت پوست',
    image: img('1596462502278-27bfdc403348', 800, 1000),
    itemCount: countIn('beauty'),
  },
];

/**
 * Sub-sections of the header mega menu. Hovering a top-level nav item opens that
 * category's menu: the rail lists its sub-sections and the panel shows the links of
 * the selected one — every link runs the matching catalog search.
 */
export const megaMenu: Record<CategoryId, MegaMenuSection[]> = {
  men: [
    {
      id: 'men-clothing',
      title: 'لباس مردانه',
      image: img('1521572163474-6864f9cf17ab', 160, 160),
      q: 'مردانه',
      links: [
        { label: 'پیراهن مردانه', q: 'پیراهن مردانه' },
        { label: 'تی‌شرت مردانه', q: 'تی‌شرت' },
        { label: 'پولوشرت مردانه', q: 'پولوشرت' },
        { label: 'هودی و سویشرت مردانه', q: 'هودی' },
        { label: 'کت و کاپشن مردانه', q: 'کت مردانه' },
        { label: 'کاپشن و پالتو مردانه', q: 'کاپشن' },
        { label: 'شلوار جین مردانه', q: 'شلوار جین' },
        { label: 'شلوار مردانه', q: 'شلوار مردانه' },
      ],
    },
    {
      id: 'men-shoes',
      title: 'کفش مردانه',
      image: img('1542291026-7eec264c27ff', 160, 160),
      q: 'کفش مردانه',
      links: [
        { label: 'کفش چرم مردانه', q: 'کفش چرم' },
        { label: 'نیم‌بوت چرم مردانه', q: 'نیم‌بوت' },
        { label: 'کفش ورزشی مردانه', q: 'ورزشی' },
        { label: 'کتانی کلاسیک', q: 'کتانی' },
      ],
    },
    {
      id: 'men-accessories',
      title: 'اکسسوری مردانه',
      image: img('1523170335258-f5ed11844a49', 160, 160),
      q: 'اکسسوری',
      links: [
        { label: 'کمربند چرم مردانه', q: 'کمربند' },
        { label: 'ساعت مچی مردانه', q: 'ساعت' },
        { label: 'عینک آفتابی', q: 'عینک' },
        { label: 'شال و روسری', q: 'شال' },
      ],
    },
    {
      id: 'men-bags',
      title: 'کیف مردانه',
      image: img('1553062407-98eeb64c6a62', 160, 160),
      q: 'کیف',
      links: [
        { label: 'کیف چرم', q: 'کیف چرم' },
        { label: 'کیف دوشی', q: 'کیف دوشی' },
        { label: 'همه کیف‌ها', q: 'کیف' },
      ],
    },
  ],
  women: [
    {
      id: 'women-clothing',
      title: 'لباس زنانه',
      image: img('1594938298603-c8148c4dae35', 160, 160),
      q: 'زنانه',
      links: [
        { label: 'مانتو زنانه', q: 'مانتو' },
        { label: 'پیراهن زنانه', q: 'پیراهن زنانه' },
        { label: 'بلوز و شومیز زنانه', q: 'بلوز' },
        { label: 'کت زنانه', q: 'کت زنانه' },
        { label: 'شلوار زنانه', q: 'شلوار زنانه' },
        { label: 'تونیک زنانه', q: 'تونیک' },
        { label: 'پیراهن مجلسی زنانه', q: 'پیراهن مجلسی' },
      ],
    },
    {
      id: 'women-shoes',
      title: 'کفش زنانه',
      image: img('1490114538077-0a7f8cb49891', 160, 160),
      q: 'کفش زنانه',
      links: [
        { label: 'بوت زنانه', q: 'بوت زنانه' },
        { label: 'صندل زنانه', q: 'صندل' },
        { label: 'کتانی و اسپرت', q: 'کتانی' },
        { label: 'کفش ورزشی', q: 'ورزشی' },
      ],
    },
    {
      id: 'women-bags',
      title: 'کیف زنانه',
      image: img('1584917865442-de89df76afd3', 160, 160),
      q: 'کیف',
      links: [
        { label: 'کیف دستی زنانه', q: 'کیف دستی' },
        { label: 'کیف دوشی چرم', q: 'کیف دوشی چرم' },
        { label: 'کیف دوشی کوچک', q: 'کیف دوشی کوچک' },
      ],
    },
    {
      id: 'women-accessories',
      title: 'اکسسوری زنانه',
      image: img('1483985988355-763728e1935b', 160, 160),
      q: 'اکسسوری',
      links: [
        { label: 'شال و روسری', q: 'شال' },
        { label: 'عینک آفتابی', q: 'عینک' },
        { label: 'ساعت مچی', q: 'ساعت' },
      ],
    },
  ],
  shoes: [
    {
      id: 'shoes-men',
      title: 'کفش مردانه',
      image: img('1542291026-7eec264c27ff', 160, 160),
      q: 'کفش مردانه',
      links: [
        { label: 'کفش چرم مردانه', q: 'کفش چرم' },
        { label: 'نیم‌بوت چرم', q: 'نیم‌بوت' },
        { label: 'کفش ورزشی رانینگ', q: 'رانینگ' },
      ],
    },
    {
      id: 'shoes-women',
      title: 'کفش زنانه',
      image: img('1543163521-1bf539c55dd2', 160, 160),
      q: 'کفش زنانه',
      links: [
        { label: 'بوت زنانه چرم', q: 'بوت زنانه' },
        { label: 'صندل تابستانی', q: 'صندل' },
      ],
    },
    {
      id: 'shoes-sneakers',
      title: 'کتانی و اسپرت',
      image: img('1560769629-975ec94e6a86', 160, 160),
      q: 'کتانی',
      links: [
        { label: 'کتانی کلاسیک', q: 'کتانی' },
        { label: 'کفش ورزشی رانینگ', q: 'ورزشی' },
        { label: 'کفش روزمره', q: 'کفش' },
      ],
    },
    {
      id: 'shoes-leather',
      title: 'چرم طبیعی',
      image: img('1600185365483-26d7a4cc7519', 160, 160),
      q: 'چرم',
      links: [
        { label: 'کفش چرم مردانه', q: 'کفش چرم' },
        { label: 'نیم‌بوت چرم', q: 'نیم‌بوت' },
        { label: 'بوت زنانه چرم', q: 'بوت زنانه' },
      ],
    },
  ],
  accessories: [
    {
      id: 'acc-glasses-watch',
      title: 'عینک و ساعت',
      image: img('1523170335258-f5ed11844a49', 160, 160),
      q: 'اکسسوری',
      links: [
        { label: 'عینک آفتابی', q: 'عینک' },
        { label: 'ساعت مچی مردانه', q: 'ساعت' },
      ],
    },
    {
      id: 'acc-leather',
      title: 'کمربند و چرم',
      image: img('1553062407-98eeb64c6a62', 160, 160),
      q: 'چرم',
      links: [
        { label: 'کمربند چرم مردانه', q: 'کمربند' },
        { label: 'کیف دوشی چرم', q: 'کیف چرم' },
      ],
    },
    {
      id: 'acc-scarf',
      title: 'شال و روسری',
      image: img('1584370848010-d7fe6bc767ec', 160, 160),
      q: 'شال',
      links: [
        { label: 'شال ابریشمی', q: 'شال' },
        { label: 'روسری', q: 'روسری' },
      ],
    },
  ],
  bags: [
    {
      id: 'bags-hand',
      title: 'کیف دستی',
      image: img('1584917865442-de89df76afd3', 160, 160),
      q: 'کیف دستی',
      links: [
        { label: 'کیف دستی زنانه', q: 'کیف دستی' },
        { label: 'کیف چرم', q: 'کیف چرم' },
      ],
    },
    {
      id: 'bags-shoulder',
      title: 'کیف دوشی',
      image: img('1553062407-98eeb64c6a62', 160, 160),
      q: 'کیف دوشی',
      links: [
        { label: 'کیف دوشی چرم', q: 'کیف دوشی چرم' },
        { label: 'کیف دوشی کوچک', q: 'کیف دوشی کوچک' },
      ],
    },
    {
      id: 'bags-all',
      title: 'همه کیف‌ها',
      image: img('1548036328-c9fa89d128fa', 160, 160),
      q: 'کیف',
      links: [
        { label: 'کیف دستی زنانه', q: 'کیف دستی' },
        { label: 'کیف دوشی چرم', q: 'کیف دوشی' },
      ],
    },
  ],
  beauty: [
    {
      id: 'beauty-perfume',
      title: 'عطر و ادوپرفیوم',
      image: img('1541643600914-78b084683601', 160, 160),
      q: 'ادوپرفیوم',
      links: [
        { label: 'ادوپرفیوم زنانه', q: 'ادوپرفیوم' },
        { label: 'عطر گل‌دار', q: 'گل‌دار' },
      ],
    },
    {
      id: 'beauty-skin',
      title: 'مراقبت پوست',
      image: img('1620916566398-39f1143ab7be', 160, 160),
      q: 'پوست',
      links: [
        { label: 'سرم روشن‌کننده', q: 'سرم' },
        { label: 'اسپری آبرسان', q: 'اسپری' },
      ],
    },
    {
      id: 'beauty-makeup',
      title: 'آرایش',
      image: img('1586495777744-4413f21062fa', 160, 160),
      q: 'رژ',
      links: [
        { label: 'رژ لب مات', q: 'رژ' },
      ],
    },
  ],
};

export const heroSlides = [
  {
    image: wideImg('1521572163474-6864f9cf17ab', 1800, 780),
    eyebrow: 'کالکشن پاییز و زمستان',
    title: ['استایل خاص', 'برای هر لحظه'],
    text: 'جدیدترین ترندهای لباس مردانه، زنانه و اکسسوری‌های خاص را اینجا پیدا کنید.',
    cta: { label: 'مشاهده مجموعه', to: '/shop' },
  },
  {
    image: wideImg('1539109136881-3be0616acf4b', 1800, 780),
    eyebrow: 'کالکشن زنانه',
    title: ['ظاهری مدرن', 'با حس روزمره'],
    text: 'ترکیبی از راحتی و ظرافت برای استایل‌های روزانه و مهمانی‌های خاص.',
    cta: { label: 'مشاهده مجموعه', to: '/shop/women' },
  },
  {
    image: wideImg('1552374196-c4e7ffc6e126', 1800, 780),
    eyebrow: 'جدیدترین‌ها',
    title: ['ساده، دقیق', 'و همیشه شیک'],
    text: 'پوشاکی که با کیفیت دوخت و پارچه‌ی درست، سال‌ها همراه شما می‌ماند.',
    cta: { label: 'مشاهده مجموعه', to: '/shop/men' },
  },
];

export const testimonials: Testimonial[] = [
  {
    name: 'سارا محمدی',
    avatar: avatarImg('1494790108377-be9c29b29330'),
    rating: 5,
    text: 'کیفیت لباس‌ها بسیار خوب بود و بسته‌بندی هم عالی انجام شده بود.',
  },
  {
    name: 'امیر رضایی',
    avatar: avatarImg('1507003211169-0a1dd7228f2d'),
    rating: 5,
    text: 'محصول دقیقاً مطابق عکس بود. از خرید خودم کاملاً راضی هستم.',
  },
  {
    name: 'نگار کریمی',
    avatar: avatarImg('1534528741775-53994a69daeb'),
    rating: 5,
    text: 'ارسال سریع و پشتیبانی بسیار خوب.',
  },
  {
    name: 'مهدی تهرانی',
    avatar: avatarImg('1517841905240-472988babdf9'),
    rating: 4,
    text: 'دوخت تمیز و جنس پارچه دقیقاً همان چیزی بود که انتظار داشتم.',
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: 'autumn-layers',
    title: 'راهنمای ست کردن لایه‌ها در پاییز',
    excerpt: 'چطور با سه تکه‌ی ساده، چند استایل متفاوت برای روزهای خنک بسازیم.',
    image: img('1441986300917-64674bd600d8', 900, 700),
    date: '۱۲ مهر ۱۴۰۴',
    author: 'تیم استایل استایل‌آن',
    readTime: '۶ دقیقه مطالعه',
    body: [
      'لایه‌کردن لباس ساده‌ترین راه برای ساختن چند استایل با تعداد کمی تکه است. با سه قطعه — یک زیرپوش سبک، یک لایه‌ی میانی و یک رویه‌ی مقاوم — می‌توانید استایل روزمره، کاری و عصرانه داشته باشید.',
      'لایه‌ی اول را همیشه نازک و چسبان انتخاب کنید؛ تی‌شرت پنبه‌ای یا پولوشرت نازک بهترین گزینه است. لایه‌ی میانی جایی است که رنگ و بافت بازی می‌کند: هودی، بلوز بافت یا پیراهن آستین بلند.',
      'رویه را کمی گشادتر از لایه‌های زیر انتخاب کنید تا روی هم جمع نشود. کاپشن یا کت کتان با یک درجه تیره‌تر از لایه‌ی میانی، همیشه نتیجه‌ی شیکی می‌دهد.',
      'برای تکمیل ست، کفش و کیف را هم‌رنگ انتخاب کنید و اجازه دهید رنگ‌های شاخص در لایه‌ی میانی دیده شود. همین قاعده‌ی ساده کافی است تا کمد لباستان چند برابر کاراتر شود.',
    ],
  },
  {
    id: 'fabric-guide',
    title: 'پارچه‌شناسی برای خرید بهتر',
    excerpt: 'تفاوت پنبه، کتان و ویسکوز را بشناسید تا انتخاب دقیق‌تری داشته باشید.',
    image: img('1620799140408-edc6dcb6d633', 900, 700),
    date: '۲ مهر ۱۴۰۴',
    author: 'تیم استایل استایل‌آن',
    readTime: '۷ دقیقه مطالعه',
    body: [
      'پیش از خرید آنلاین، شناختن پارچه مهم‌تر از دیدن عکس است. پنبه‌ی خالص نفس‌کش است، رطوبت را جذب می‌کند و برای تی‌شرت و شلوار راحت انتخاب اول است.',
      'کتان خنک‌تر از پنبه است اما چین می‌خورد. برای روزهای گرم و استایل‌های غیررسمی عالی است؛ اگر می‌خواهید کم‌تر چین بخورد، مخلوط کتان و ویسکوز را انتخاب کنید.',
      'ویسکوز افتادگی زیبایی دارد و مثل ابریشم می‌نشیند، اما در شست‌وشو حساستر است. برای بلوز و تونیک گزینه‌ی مناسبی است، به شرطی که با آب سرد و برنامه‌ی ملایم شسته شود.',
      'دوخت را هم بررسی کنید: درزهای یکنواخت، جیب‌های راست و کشسانی که بی‌جهت کشیده نشده باشد، نشانه‌ی کیفیت است. اگر اندازه‌ها مرزی است، به جای کوچک‌تر، سایز بالاتر را بردارید تا پارچه پس از شست‌وشو راحت بماند.',
    ],
  },
  {
    id: 'shoe-care',
    title: 'نگهداری از کفش چرم',
    excerpt: 'چند قدم ساده که عمر کفش چرم شما را چند برابر می‌کند.',
    image: img('1600185365483-26d7a4cc7519', 900, 700),
    date: '۲۴ شهریور ۱۴۰۴',
    author: 'تیم استایل استایل‌آن',
    readTime: '۵ دقیقه مطالعه',
    body: [
      'چرم طبیعی با مراقبت درست سال‌ها همراهتان می‌ماند. اولین قدم، تمیز کردن گرد و غبار با یک برس نرم یا پارچه‌ی نخی خشک بعد از هر استفاده است.',
      'هفته‌ای یک بار از واکس یا کرم مخصوص چرم استفاده کنید. مقدار کم را با پارچه‌ی نخی روی سطح پخش کنید و بگذارید نیم ساعت جذب شود.',
      'کفش خیس را هرگز کنار شوفاژ یا زیر آفتاب نگذارید؛ چرم ترک می‌خورد. روزنامه‌ی فشرده داخل کفش بگذارید و در دمای اتاق خشک کنید.',
      'برای نگهداری بلندمدت، از قالب چوبی استفاده کنید و کفش‌ها را در کاور پارچه‌ای بگذارید. چرخش چند جفت کفش هم باعث می‌شود هر جفت زمان کافی برای بازیابی داشته باشد.',
    ],
  },
  {
    id: 'color-palette',
    title: 'رنگ‌های پایه‌ای که هر کمد لباس لازم دارد',
    excerpt: 'با چند رنگ خنثی می‌توانید بیشتر تکه‌های لباستان را با هم ست کنید.',
    image: img('1515886657613-9f3515b0c78f', 900, 700),
    date: '۱۸ شهریور ۱۴۰۴',
    author: 'تیم استایل استایل‌آن',
    readTime: '۵ دقیقه مطالعه',
    body: [
      'یک کمد لباس کارا روی چند رنگ خنثی بنا می‌شود: مشکی، سفید، کرم، طوسی و سرمه‌ای. این پنج رنگ تقریباً با هر چیزی ست می‌شوند و خرید بعدی شما را ساده‌تر می‌کنند.',
      'قاعده‌ی نسبت ۶۰، ۳۰ و ۱۰ کمک می‌کند تعادل حفظ شود: شصت درصد تکه‌های خنثی، سی درصد رنگ‌های مکمل مثل زیتونی یا قهوه‌ای و ده درصد رنگ شاخص مثل شرابی.',
      'اگر تازه شروع کرده‌اید، از بالا تنه شروع کنید. سه پیراهن یا پیراهن یقه‌دار با تن‌های مختلف خنثی، پایه‌ی بیشتر استایل‌ها خواهد بود.',
      'در نهایت به جنس و بافت هم فکر کنید؛ دو رنگ خنثی وقتی بافت متفاوتی دارند (مثلاً چرم و پنبه) خسته‌کننده به نظر نمی‌رسند.',
    ],
  },
  {
    id: 'winter-shoes',
    title: 'انتخاب کفش زمستانی مناسب شهر',
    excerpt: 'بوت یا نیم‌بوت؟ چه ویژگی‌هایی برای روزهای سرد شهری مهم است.',
    image: img('1549298916-b41d501d3772', 900, 700),
    date: '۱۰ شهریور ۱۴۰۴',
    author: 'تیم استایل استایل‌آن',
    readTime: '۴ دقیقه مطالعه',
    body: [
      'برای شهر، مهم‌ترین ویژگی کفش زمستانی ضدنفوذ بودن و زیره‌ی نچسب است. زیره‌ی لاستیکی با آج‌های عمیق روی سطح خیس بهتر عمل می‌کند.',
      'بوت ساقه‌بلند گرم‌تر است و استایل رسمی‌تری دارد؛ نیم‌بوت راحت‌تر می‌شود و برای رفت‌وآمد روزمره و کار مناسب‌تر است.',
      'آستر کرکی یا پشمی را جدی بگیرید، اما اگر داخل کفش خیلی گرم باشد پای شما عرق می‌کند و سرما بیشتر حس می‌شود. یک لایه‌ی پشمی متوسط، بهترین تعادل است.',
      'اگر کفش چرم می‌خرید، همان روز اول یک لایه محافظ روی آن بزنید تا آب و لکه‌ی نمک به چرم نفوذ نکند.',
    ],
  },
  {
    id: 'bag-guide',
    title: 'راهنمای انتخاب کیف مناسب هر روز',
    excerpt: 'اندازه، جنس و تعداد جیب‌های کیف را بر اساس برنامه‌ی روزانه انتخاب کنید.',
    image: img('1548036328-c9fa89d128fa', 900, 700),
    date: '۳ شهریور ۱۴۰۴',
    author: 'تیم استایل استایل‌آن',
    readTime: '۵ دقیقه مطالعه',
    body: [
      'اول برنامه‌ی روزتان را مشخص کنید: اگر لپ‌تاپ و دفتر همراه دارید، کیف دوشی با فضای مستند مناسب‌تر است؛ برای قرارهای کوتاه، کیف دستی کوچک کافی است.',
      'جنس کیف تعیین می‌کند چقدر دوام بیاورد. چرم طبیعی با گذر زمان زیباتر می‌شود، اما به مراقبت نیاز دارد؛ چرم مصنوعی سبک‌تر و ارزان‌تر است.',
      'تعداد و محل جیب‌ها را بررسی کنید. یک جیب داخلی زیپ‌دار برای وسایل کوچک و یک جیب بیرونی برای موبایل، کار روزمره را بسیار راحت‌تر می‌کند.',
      'بند کیف را تنظیم کنید تا لبه‌ی بالای کیف هم‌تراز کمر باشد؛ این ارتفاع هم به شانه فشار نمی‌آورد و هم به ظاهر استایل کمک می‌کند.',
    ],
  },
];

export const promises = [
  {
    icon: 'truck',
    title: 'ارسال سریع',
    text: 'به سراسر کشور',
  },
  {
    icon: 'shield',
    title: 'پرداخت امن',
    text: 'با تمامی کارت‌ها',
  },
  {
    icon: 'badge',
    title: 'کیفیت تضمین‌شده',
    text: 'ضمانت اصالت کالا',
  },
  {
    icon: 'refresh',
    title: 'بازگشت کالا',
    text: 'تا ۷ روز',
  },
];

export const promoArt = {
  men: heroImg('1519085360753-af0119f7cbe7'),
  women: heroImg('1490481651871-ab68de25d43d'),
  collection: wideImg('1441986300917-64674bd600d8', 1600, 700),
  newsletter: wideImg('1521334884684-d80222895322', 1000, 800),
  testimonials: img('1483985988355-763728e1935b', 700, 900),
  floatingOne: img('1542291026-7eec264c27ff', 300, 300),
  floatingTwo: img('1584917865442-de89df76afd3', 300, 300),
};

export const sortOptions = [
  { value: 'newest', label: 'جدیدترین' },
  { value: 'popular', label: 'محبوب‌ترین' },
  { value: 'price-asc', label: 'ارزان‌ترین' },
  { value: 'price-desc', label: 'گران‌ترین' },
  { value: 'discount', label: 'بیشترین تخفیف' },
];

export const allSizes = Array.from(new Set(products.flatMap((p) => p.sizes)));
export const allColors = products
  .flatMap((p) => p.colors)
  .filter((c, i, arr) => arr.findIndex((x) => x.name === c.name) === i);
export const allBrands = Array.from(new Set(products.map((p) => p.brand))).sort();

/**
 * Discount codes shoppers can type in the cart. There is no server, so the list lives
 * here: add the codes you hand out and they start working right away.
 */
export const coupons: Coupon[] = [
  { code: 'STYLEON10', percent: 10, label: '۱۰٪ تخفیف روی کل سبد' },
  {
    code: 'WELCOME15',
    percent: 15,
    minSpend: 2000000,
    label: '۱۵٪ تخفیف برای خریدهای بالای ۲ میلیون',
  },
  { code: 'MODURA50', amount: 50000, minSpend: 1000000, label: 'تخفیف نقدی ۵۰ هزار روی سبد' },
];

/** «مدورا کوین»: loyalty coins earned on every order and spendable on a later one. */
export const COIN_TITLE = 'مدورا کوین';
/** One coin is earned per this many paid. */
export const COIN_PER_AMOUNT = 100000;
/** What a single coin takes off an order. */
export const COIN_VALUE = 10000;
/** Balance a shopper needs before coins can be spent at all. */
export const COIN_MIN_REDEEM = 10;
/** Coins an order earns: the pricier the basket, the more coins it pays back. */
export const coinsFor = (amount: number) => Math.max(1, Math.floor(amount / COIN_PER_AMOUNT));
