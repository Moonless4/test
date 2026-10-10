<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;

/**
 * The store's catalogue — the same 32 products, six categories and photos the storefront shipped
 * with, now living in the database the admin panel edits.
 *
 * Photos are **imported**, not uploaded: every row records the address the photo is published at
 * (`media.source_url`), because these are the shop's existing pictures and nothing re-uploads them.
 * A picture an administrator uploads in the panel is stored as a real file instead (MediaService) —
 * both kinds reach the storefront through `Media::url()`.
 *
 * Prices are plain Toman integers. A discounted product carries both numbers: `price` is what the
 * shopper pays and `compare_at_price` is the original shown struck through above it.
 *
 * Idempotent by slug (and by the photo's own address), so the one-shot container setup can re-seed
 * on every start without duplicating anything.
 */
class CatalogSeeder extends Seeder
{
    /** Every photo is published at this size — the 4:5 crop a product card assumes. */
    private const IMAGE_BASE = 'https://images.unsplash.com/photo-';

    private const IMAGE_PARAMS = '?auto=format&fit=crop&w=800&h=1000&q=70';

    /**
     * The sample catalogue an earlier version of this seeder wrote. Those eight rows were
     * placeholders with invented names and prices, and the real catalogue below replaces them —
     * they are removed rather than left behind as near-duplicates. Matched on the SKUs that seeder
     * owned, so a product the owner added in the panel is never touched.
     *
     * @var array<int, string>
     */
    private const SUPERSEDED_SKUS = [
        'MD-W-1001', 'MD-W-1002', 'MD-M-3001', 'MD-M-3002',
        'MD-S-4001', 'MD-S-4002', 'MD-A-2001', 'MD-A-2002',
    ];

    /**
     * slug => [name, subtitle, photo]
     *
     * @var array<string, array{name: string, subtitle: string, photo: string}>
     */
    private const CATEGORIES = [
        'men' => ['name' => 'مردانه', 'subtitle' => 'پوشاک کلاسیک و روزمره', 'photo' => '1512436991641-6745cdb1723f'],
        'women' => ['name' => 'زنانه', 'subtitle' => 'مانتو، پیراهن و شومییز', 'photo' => '1515886657613-9f3515b0c78f'],
        'shoes' => ['name' => 'کفش', 'subtitle' => 'کتانی، چرم و بوت', 'photo' => '1549298916-b41d501d3772'],
        'accessories' => ['name' => 'اکسسوری', 'subtitle' => 'ساعت، عینک و شال', 'photo' => '1523170335258-f5ed11844a49'],
        'bags' => ['name' => 'کیف و کوله', 'subtitle' => 'دستی، دوشی و کوله', 'photo' => '1548036328-c9fa89d128fa'],
        'beauty' => ['name' => 'زیبایی', 'subtitle' => 'عطر و مراقبت پوست', 'photo' => '1596462502278-27bfdc403348'],
    ];

    /**
     * The catalogue, in the order the shop lists it. Each entry is one product:
     *
     *   slug, name, category, sku, price, compare_at_price, stock, sizes, colours,
     *   material, fit, description, is_new, gallery
     *
     * @var array<int, array<string, mixed>>
     */
    private const PRODUCTS = [
        [
            'slug' => 'men-denim-jacket',
            'name' => 'کت جین مردانه',
            'brand' => 'MEDORA',
            'rating' => 4.8,
            'category' => 'men',
            'sku' => 'ST-MEN-DENIM-JACKET',
            'price' => 1995000,
            'compare_at_price' => 2850000,
            'stock' => 18,
            'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
            'colors' => ['سرمه‌ای', 'مشکی', 'زیتونی'],
            'material' => 'جین سنگ‌شور درجه یک',
            'fit' => 'اسلیم‌فیت',
            'summary' => 'کت جین مردانه با دوخت مستحکم و رنگ‌بندی آرام، انتخابی همیشگی برای استایل روزمره.',
            'description' => 'کت جین مردانه با دوخت مستحکم و رنگ‌بندی آرام، انتخابی همیشگی برای استایل روزمره. برش اسلیم‌فیت آن فرم بدن را حفظ می‌کند و در عین حال آزادی حرکت کامل دارد.',
            'is_new' => false,
            'gallery' => ['1434389677669-e08b4cac3105', '1521572163474-6864f9cf17ab', '1479064555552-3ef4979f8908'],
        ],
        [
            'slug' => 'men-ls-shirt',
            'name' => 'پیراهن مردانه آستین بلند',
            'brand' => 'ATRI',
            'rating' => 4.6,
            'category' => 'men',
            'sku' => 'ST-MEN-LS-SHIRT',
            'price' => 1605000,
            'compare_at_price' => 1890000,
            'stock' => 24,
            'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
            'colors' => ['سفید', 'آبی روشن', 'طوسی'],
            'material' => 'نخ پنبه ۱۰۰٪',
            'fit' => 'اسلیم‌فیت',
            'summary' => 'پیراهن آستین بلند با پارچه نخی خنک و یقه‌ای خوش‌فرم؛ گزینه‌ای رسمی برای محیط کار و جلسات، و در عین حال راحت برای استایل نیمه‌رسمی.',
            'description' => 'پیراهن آستین بلند با پارچه نخی خنک و یقه‌ای خوش‌فرم؛ گزینه‌ای رسمی برای محیط کار و جلسات، و در عین حال راحت برای استایل نیمه‌رسمی.',
            'is_new' => false,
            'gallery' => ['1596755094514-f87e34085b2c', '1521572163474-6864f9cf17ab', '1516762689617-e1cffcef479d'],
        ],
        [
            'slug' => 'men-cotton-tee',
            'name' => 'تی‌شرت مردانه پنبه',
            'brand' => 'MEDORA',
            'rating' => 4.7,
            'category' => 'men',
            'sku' => 'ST-MEN-COTTON-TEE',
            'price' => 890000,
            'compare_at_price' => null,
            'stock' => 52,
            'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
            'colors' => ['سفید', 'مشکی', 'سرمه‌ای'],
            'material' => 'پنبه پنبه‌ای ۱۸۰ گرم',
            'fit' => 'رجولار',
            'summary' => 'تی‌شرت پایه‌ی کمد لباس با پنبه‌ی نرم و رنگ‌ثابت.',
            'description' => 'تی‌شرت پایه‌ی کمد لباس با پنبه‌ی نرم و رنگ‌ثابت. یقه‌ی تقویت‌شده مانع از تغییر فرم پس از شست‌وشو می‌شود.',
            'is_new' => false,
            'gallery' => ['1521572163474-6864f9cf17ab', '1519085360753-af0119f7cbe7', '1566174053879-31528523f8ae'],
        ],
        [
            'slug' => 'men-linen-coat',
            'name' => 'کت کتان مردانه',
            'brand' => 'MEDORA',
            'rating' => 4.9,
            'category' => 'men',
            'sku' => 'ST-MEN-LINEN-COAT',
            'price' => 1800000,
            'compare_at_price' => 2400000,
            'stock' => 12,
            'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
            'colors' => ['کرم', 'سرمه‌ای', 'قهوه‌ای'],
            'material' => 'کتان طبیعی',
            'fit' => 'رجولار',
            'summary' => 'کت کتان با وزن سبک و فرم ایستاده، برای فصل‌های گرم طراحی شده است.',
            'description' => 'کت کتان با وزن سبک و فرم ایستاده، برای فصل‌های گرم طراحی شده است. رنگ کرم آن با اغلب رنگ‌های کمد لباس هماهنگ می‌شود.',
            'is_new' => true,
            'gallery' => ['1519085360753-af0119f7cbe7', '1556821840-3a63f95609a7', '1602810318383-e386cc2a3ccf'],
        ],
        [
            'slug' => 'men-hoodie',
            'name' => 'هودی مردانه کلاه‌دار',
            'brand' => 'KANOON',
            'rating' => 4.5,
            'category' => 'men',
            'sku' => 'ST-MEN-HOODIE',
            'price' => 1200000,
            'compare_at_price' => 1600000,
            'stock' => 31,
            'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
            'colors' => ['طوسی', 'سرمه‌ای', 'مشکی'],
            'material' => 'پنبه کشباف',
            'fit' => 'اورسایز',
            'summary' => 'هودی کلاه‌دار با کشباف داخلی نرم و کیفیت دوخت بالا؛ گزینه‌ای گرم و راحت برای روزهای خنک.',
            'description' => 'هودی کلاه‌دار با کشباف داخلی نرم و کیفیت دوخت بالا؛ گزینه‌ای گرم و راحت برای روزهای خنک.',
            'is_new' => true,
            'gallery' => ['1556821840-3a63f95609a7', '1479064555552-3ef4979f8908', '1618354691373-d851c5c3a990'],
        ],
        [
            'slug' => 'men-jeans',
            'name' => 'شلوار جین مردانه',
            'brand' => 'ATRI',
            'rating' => 4.4,
            'category' => 'men',
            'sku' => 'ST-MEN-JEANS',
            'price' => 1450000,
            'compare_at_price' => null,
            'stock' => 27,
            'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
            'colors' => ['سرمه‌ای', 'مشکی'],
            'material' => 'جین مخلوط با الاستان',
            'fit' => 'اسلیم‌فیت',
            'summary' => 'شلوار جین با کمی الاستان که فرم بدن را دنبال می‌کند و در طول روز آزادی حرکت می‌دهد.',
            'description' => 'شلوار جین با کمی الاستان که فرم بدن را دنبال می‌کند و در طول روز آزادی حرکت می‌دهد.',
            'is_new' => false,
            'gallery' => ['1479064555552-3ef4979f8908', '1516762689617-e1cffcef479d', '1512436991641-6745cdb1723f'],
        ],
        [
            'slug' => 'men-polo',
            'name' => 'پولوشرت مردانه',
            'brand' => 'PARSA',
            'rating' => 4.3,
            'category' => 'men',
            'sku' => 'ST-MEN-POLO',
            'price' => 1020000,
            'compare_at_price' => 1200000,
            'stock' => 20,
            'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
            'colors' => ['سرمه‌ای', 'زیتونی', 'شرابی'],
            'material' => 'پنبه پیکه',
            'fit' => 'رجولار',
            'summary' => 'پولوشرت پیکه با یقه‌ی بافت‌شده و دکمه‌های مخفی؛ پوشاکی میانه‌رو میان رسمی و روزمره.',
            'description' => 'پولوشرت پیکه با یقه‌ی بافت‌شده و دکمه‌های مخفی؛ پوشاکی میانه‌رو میان رسمی و روزمره.',
            'is_new' => false,
            'gallery' => ['1516762689617-e1cffcef479d', '1566174053879-31528523f8ae', '1503341504253-dff4815485f1'],
        ],
        [
            'slug' => 'men-winter-jacket',
            'name' => 'کاپشن مردانه زمستانی',
            'brand' => 'ARTA',
            'rating' => 4.7,
            'category' => 'men',
            'sku' => 'ST-MEN-WINTER-JACKET',
            'price' => 3040000,
            'compare_at_price' => 3800000,
            'stock' => 9,
            'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
            'colors' => ['مشکی', 'زیتونی'],
            'material' => 'پلی‌استر ضدآب',
            'fit' => 'رجولار',
            'summary' => 'کاپشن زمستانی با آستر گرم و لایه‌ی ضدآب؛ در برابر باد و باران سبک مقاوم است و برای سفرهای زمستانی انتخاب می‌شود.',
            'description' => 'کاپشن زمستانی با آستر گرم و لایه‌ی ضدآب؛ در برابر باد و باران سبک مقاوم است و برای سفرهای زمستانی انتخاب می‌شود.',
            'is_new' => true,
            'gallery' => ['1566174053879-31528523f8ae', '1602810318383-e386cc2a3ccf', '1434389677669-e08b4cac3105'],
        ],
        [
            'slug' => 'women-linen-manteau',
            'name' => 'مانتو کتان زنانه',
            'brand' => 'VENUS',
            'rating' => 4.8,
            'category' => 'women',
            'sku' => 'ST-WOMEN-LINEN-MANTEAU',
            'price' => 2080000,
            'compare_at_price' => 2600000,
            'stock' => 22,
            'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
            'colors' => ['کرم', 'سرمه‌ای', 'مشکی'],
            'material' => 'کتان طبیعی',
            'fit' => 'رجولار',
            'summary' => 'مانتو کتان با فرم ایستاده و دوخت تمیز؛ برای محیط کار و بیرون‌رفت‌های روزانه طراحی شده و پس از شست‌وشو فرم خود را حفظ می‌کند.',
            'description' => 'مانتو کتان با فرم ایستاده و دوخت تمیز؛ برای محیط کار و بیرون‌رفت‌های روزانه طراحی شده و پس از شست‌وشو فرم خود را حفظ می‌کند.',
            'is_new' => false,
            'gallery' => ['1594938298603-c8148c4dae35', '1515886657613-9f3515b0c78f', '1487412720507-e7ab37603c6f'],
        ],
        [
            'slug' => 'women-floral-dress',
            'name' => 'پیراهن زنانه گل‌دار',
            'brand' => 'VENUS',
            'rating' => 4.6,
            'category' => 'women',
            'sku' => 'ST-WOMEN-FLORAL-DRESS',
            'price' => 1200000,
            'compare_at_price' => 1600000,
            'stock' => 17,
            'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
            'colors' => ['صورتی', 'کرم', 'سرمه‌ای'],
            'material' => 'ویسکوز',
            'fit' => 'رجولار',
            'summary' => 'پیراهن گل‌دار با پارچه‌ی روان و طرح آرام؛ انتخابی دلپذیر برای مهمانی‌های روز و سفرهای بهاری.',
            'description' => 'پیراهن گل‌دار با پارچه‌ی روان و طرح آرام؛ انتخابی دلپذیر برای مهمانی‌های روز و سفرهای بهاری.',
            'is_new' => false,
            'gallery' => ['1544022613-e87ca75a784a', '1594938298603-c8148c4dae35', '1445205170230-053b83016050'],
        ],
        [
            'slug' => 'women-ls-blouse',
            'name' => 'بلوز زنانه آستین بلند',
            'brand' => 'ATRI',
            'rating' => 4.5,
            'category' => 'women',
            'sku' => 'ST-WOMEN-LS-BLOUSE',
            'price' => 1150000,
            'compare_at_price' => null,
            'stock' => 34,
            'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
            'colors' => ['کرم', 'طوسی', 'شرابی'],
            'material' => 'حریر مخلوط',
            'fit' => 'اورسایز',
            'summary' => 'بلوز آستین بلند با فرم آزاد و پارچه‌ی خوش‌ریخت؛ به‌سادگی با شلوار پارچه‌ای یا جین ست می‌شود.',
            'description' => 'بلوز آستین بلند با فرم آزاد و پارچه‌ی خوش‌ریخت؛ به‌سادگی با شلوار پارچه‌ای یا جین ست می‌شود.',
            'is_new' => false,
            'gallery' => ['1496747611176-843222e1e57c', '1544022613-e87ca75a784a', '1595777457583-95e059d581b8'],
        ],
        [
            'slug' => 'women-formal-coat',
            'name' => 'کت زنانه مجلسی',
            'brand' => 'LUXE',
            'rating' => 4.9,
            'category' => 'women',
            'sku' => 'ST-WOMEN-FORMAL-COAT',
            'price' => 2400000,
            'compare_at_price' => 3200000,
            'stock' => 11,
            'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
            'colors' => ['کرم', 'شرابی'],
            'material' => 'فاستونی مخلوط',
            'fit' => 'رجولار',
            'summary' => 'کت مجلسی با آستر کامل و برش تمیز؛ گزینه‌ای شیک برای مراسم و جلسات رسمی پاییز و زمستان.',
            'description' => 'کت مجلسی با آستر کامل و برش تمیز؛ گزینه‌ای شیک برای مراسم و جلسات رسمی پاییز و زمستان.',
            'is_new' => false,
            'gallery' => ['1539533018447-63fcce2678e3', '1496747611176-843222e1e57c', '1490481651871-ab68de25d43d'],
        ],
        [
            'slug' => 'women-trousers',
            'name' => 'شلوار پارچه‌ای زنانه',
            'brand' => 'PARSA',
            'rating' => 4.4,
            'category' => 'women',
            'sku' => 'ST-WOMEN-TROUSERS',
            'price' => 1000000,
            'compare_at_price' => 1250000,
            'stock' => 29,
            'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
            'colors' => ['مشکی', 'سرمه‌ای', 'کرم'],
            'material' => 'پارچه‌ی مخلوط',
            'fit' => 'دم‌پا',
            'summary' => 'شلوار پارچه‌ای با فرم دم‌پا و کمر کشی پنهان؛ ترکیبی از رسمیت و راحتی در یک پوشاک.',
            'description' => 'شلوار پارچه‌ای با فرم دم‌پا و کمر کشی پنهان؛ ترکیبی از رسمیت و راحتی در یک پوشاک.',
            'is_new' => false,
            'gallery' => ['1487412720507-e7ab37603c6f', '1539533018447-63fcce2678e3', '1539109136881-3be0616acf4b'],
        ],
        [
            'slug' => 'women-tunic',
            'name' => 'تونیک زنانه نخی',
            'brand' => 'KANOON',
            'rating' => 4.3,
            'category' => 'women',
            'sku' => 'ST-WOMEN-TUNIC',
            'price' => 980000,
            'compare_at_price' => null,
            'stock' => 38,
            'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
            'colors' => ['سفید', 'آبی روشن', 'صورتی'],
            'material' => 'نخ پنبه',
            'fit' => 'اورسایز',
            'summary' => 'تونیک نخی با فرم آزاد و تهویه‌ی خوب؛ برای روزهای گرم تابستان سبک و خنک است.',
            'description' => 'تونیک نخی با فرم آزاد و تهویه‌ی خوب؛ برای روزهای گرم تابستان سبک و خنک است.',
            'is_new' => true,
            'gallery' => ['1445205170230-053b83016050', '1487412720507-e7ab37603c6f', '1515886657613-9f3515b0c78f'],
        ],
        [
            'slug' => 'women-evening-dress',
            'name' => 'پیراهن مجلسی زنانه',
            'brand' => 'LUXE',
            'rating' => 4.8,
            'category' => 'women',
            'sku' => 'ST-WOMEN-EVENING-DRESS',
            'price' => 2320000,
            'compare_at_price' => 2900000,
            'stock' => 8,
            'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
            'colors' => ['کرم', 'مشکی', 'شرابی'],
            'material' => 'ساتن درجه یک',
            'fit' => 'رجولار',
            'summary' => 'پیراهن مجلسی با پارچه‌ی ساتن و فرم کشیده؛ مناسب مهمانی‌های شب و مراسم خاص.',
            'description' => 'پیراهن مجلسی با پارچه‌ی ساتن و فرم کشیده؛ مناسب مهمانی‌های شب و مراسم خاص.',
            'is_new' => true,
            'gallery' => ['1595777457583-95e059d581b8', '1445205170230-053b83016050', '1594938298603-c8148c4dae35'],
        ],
        [
            'slug' => 'shoes-classic-sneaker',
            'name' => 'کتانی کلاسیک',
            'brand' => 'MEDORA',
            'rating' => 4.7,
            'category' => 'shoes',
            'sku' => 'ST-SHOES-CLASSIC-SNEAKER',
            'price' => 1870000,
            'compare_at_price' => 2200000,
            'stock' => 26,
            'sizes' => ['39', '40', '41', '42', '43', '44'],
            'colors' => ['سفید', 'مشکی'],
            'material' => 'چرم مصنوعی و مش',
            'fit' => 'فرم استاندارد',
            'summary' => 'کتانی کلاسیک با کفی طبی نرم و زیره‌ی ضدلغزش؛ هم برای پیاده‌روی روزانه و هم برای استایل اسپرت مناسب است.',
            'description' => 'کتانی کلاسیک با کفی طبی نرم و زیره‌ی ضدلغزش؛ هم برای پیاده‌روی روزانه و هم برای استایل اسپرت مناسب است.',
            'is_new' => false,
            'gallery' => ['1560769629-975ec94e6a86', '1542291026-7eec264c27ff', '1490114538077-0a7f8cb49891'],
        ],
        [
            'slug' => 'shoes-leather-men',
            'name' => 'کفش چرم مردانه',
            'brand' => 'ARTA',
            'rating' => 4.9,
            'category' => 'shoes',
            'sku' => 'ST-SHOES-LEATHER-MEN',
            'price' => 3400000,
            'compare_at_price' => null,
            'stock' => 14,
            'sizes' => ['39', '40', '41', '42', '43', '44'],
            'colors' => ['قهوه‌ای', 'مشکی'],
            'material' => 'چرم طبیعی',
            'fit' => 'فرم استاندارد',
            'summary' => 'کفش چرم طبیعی با دوخت دست و آستر چرمی؛ با گذشت زمان فرم پا را به خود می‌گیرد و دوام بالایی دارد.',
            'description' => 'کفش چرم طبیعی با دوخت دست و آستر چرمی؛ با گذشت زمان فرم پا را به خود می‌گیرد و دوام بالایی دارد.',
            'is_new' => false,
            'gallery' => ['1600185365483-26d7a4cc7519', '1595950653106-6c9ebd614d3a', '1460353581641-37baddab0fa2'],
        ],
        [
            'slug' => 'shoes-women-sandal',
            'name' => 'صندل زنانه تابستانی',
            'brand' => 'VENUS',
            'rating' => 4.2,
            'category' => 'shoes',
            'sku' => 'ST-SHOES-WOMEN-SANDAL',
            'price' => 935000,
            'compare_at_price' => 1100000,
            'stock' => 33,
            'sizes' => ['39', '40', '41', '42', '43', '44'],
            'colors' => ['کرم', 'قهوه‌ای'],
            'material' => 'چرم مصنوعی',
            'fit' => 'فرم استاندارد',
            'summary' => 'صندل سبک با بند قابل تنظیم و کفی نرم؛ انتخابی راحت برای روزهای گرم سال.',
            'description' => 'صندل سبک با بند قابل تنظیم و کفی نرم؛ انتخابی راحت برای روزهای گرم سال.',
            'is_new' => false,
            'gallery' => ['1490114538077-0a7f8cb49891', '1549298916-b41d501d3772', '1542291026-7eec264c27ff'],
        ],
        [
            'slug' => 'shoes-women-boot',
            'name' => 'بوت زنانه چرم',
            'brand' => 'LUXE',
            'rating' => 4.6,
            'category' => 'shoes',
            'sku' => 'ST-SHOES-WOMEN-BOOT',
            'price' => 2100000,
            'compare_at_price' => 2800000,
            'stock' => 15,
            'sizes' => ['39', '40', '41', '42', '43', '44'],
            'colors' => ['قهوه‌ای', 'مشکی'],
            'material' => 'چرم طبیعی',
            'fit' => 'فرم استاندارد',
            'summary' => 'بوت چرم با پاشنه‌ی کوتاه و ساق میانه؛ برای استایل‌های پاییزی و زمستانی طراحی شده است.',
            'description' => 'بوت چرم با پاشنه‌ی کوتاه و ساق میانه؛ برای استایل‌های پاییزی و زمستانی طراحی شده است.',
            'is_new' => true,
            'gallery' => ['1460353581641-37baddab0fa2', '1560769629-975ec94e6a86', '1595950653106-6c9ebd614d3a'],
        ],
        [
            'slug' => 'shoes-running',
            'name' => 'کفش ورزشی رانینگ',
            'brand' => 'KANOON',
            'rating' => 4.8,
            'category' => 'shoes',
            'sku' => 'ST-SHOES-RUNNING',
            'price' => 2000000,
            'compare_at_price' => 2500000,
            'stock' => 21,
            'sizes' => ['39', '40', '41', '42', '43', '44'],
            'colors' => ['مشکی', 'آبی روشن', 'طوسی'],
            'material' => 'مش تنفسی',
            'fit' => 'فرم ورزشی',
            'summary' => 'کفش رانینگ با زیره‌ی فوم ضربه‌گیر و رویه‌ی مش تنفسی؛ برای دویدن و تمرین‌های روزانه سبک و مانع تعرق است.',
            'description' => 'کفش رانینگ با زیره‌ی فوم ضربه‌گیر و رویه‌ی مش تنفسی؛ برای دویدن و تمرین‌های روزانه سبک و مانع تعرق است.',
            'is_new' => false,
            'gallery' => ['1542291026-7eec264c27ff', '1600185365483-26d7a4cc7519', '1549298916-b41d501d3772'],
        ],
        [
            'slug' => 'shoes-men-boot',
            'name' => 'نیم‌بوت چرم مردانه',
            'brand' => 'ARTA',
            'rating' => 4.5,
            'category' => 'shoes',
            'sku' => 'ST-SHOES-MEN-BOOT',
            'price' => 2550000,
            'compare_at_price' => 3000000,
            'stock' => 13,
            'sizes' => ['39', '40', '41', '42', '43', '44'],
            'colors' => ['قهوه‌ای', 'مشکی'],
            'material' => 'چرم طبیعی',
            'fit' => 'فرم استاندارد',
            'summary' => 'نیم‌بوت چرم با زیره‌ی مقاوم و دوخت تقویت‌شده؛ ترکیبی از دوام و ظاهر رسمی.',
            'description' => 'نیم‌بوت چرم با زیره‌ی مقاوم و دوخت تقویت‌شده؛ ترکیبی از دوام و ظاهر رسمی.',
            'is_new' => false,
            'gallery' => ['1595950653106-6c9ebd614d3a', '1490114538077-0a7f8cb49891', '1560769629-975ec94e6a86'],
        ],
        [
            'slug' => 'acc-women-handbag',
            'name' => 'کیف دستی زنانه چرم',
            'brand' => 'LUXE',
            'rating' => 4.8,
            'category' => 'bags',
            'sku' => 'ST-ACC-WOMEN-HANDBAG',
            'price' => 1840000,
            'compare_at_price' => 2300000,
            'stock' => 19,
            'sizes' => ['تک‌سایز'],
            'colors' => ['قهوه‌ای', 'مشکی', 'کرم'],
            'material' => 'چرم طبیعی',
            'fit' => 'تک‌سایز',
            'summary' => 'کیف دستی با چرم نرم و آستر پارچه‌ای؛ جیب‌های داخلی منظم و بند قابل جداشدن، آن را به گزینه‌ای کاربردی تبدیل می‌کند.',
            'description' => 'کیف دستی با چرم نرم و آستر پارچه‌ای؛ جیب‌های داخلی منظم و بند قابل جداشدن، آن را به گزینه‌ای کاربردی تبدیل می‌کند.',
            'is_new' => false,
            'gallery' => ['1584917865442-de89df76afd3', '1543163521-1bf539c55dd2'],
        ],
        [
            'slug' => 'acc-sunglasses',
            'name' => 'عینک آفتابی کلاسیک',
            'brand' => 'MEDORA',
            'rating' => 4.4,
            'category' => 'accessories',
            'sku' => 'ST-ACC-SUNGLASSES',
            'price' => 1190000,
            'compare_at_price' => 1400000,
            'stock' => 40,
            'sizes' => ['تک‌سایز'],
            'colors' => ['مشکی', 'قهوه‌ای'],
            'material' => 'فریم استات و لنز UV400',
            'fit' => 'تک‌سایز',
            'summary' => 'عینک آفتابی با لنز UV400 و فریم سبک؛ محافظت کامل در برابر نور شدید با استایلی کلاسیک.',
            'description' => 'عینک آفتابی با لنز UV400 و فریم سبک؛ محافظت کامل در برابر نور شدید با استایلی کلاسیک.',
            'is_new' => false,
            'gallery' => ['1511499767150-a48a237f0083', '1523170335258-f5ed11844a49', '1524805444758-089113d48a6d'],
        ],
        [
            'slug' => 'acc-belt',
            'name' => 'کمربند چرم مردانه',
            'brand' => 'ARTA',
            'rating' => 4.6,
            'category' => 'accessories',
            'sku' => 'ST-ACC-BELT',
            'price' => 850000,
            'compare_at_price' => null,
            'stock' => 46,
            'sizes' => ['تک‌سایز'],
            'colors' => ['قهوه‌ای', 'مشکی'],
            'material' => 'چرم طبیعی',
            'fit' => 'قابل کوتاه شدن',
            'summary' => 'کمربند چرم با سگک فلزی مات؛ ضخامت مناسب آن مانع از تاب برداشتن در استفاده‌ی روزمره می‌شود.',
            'description' => 'کمربند چرم با سگک فلزی مات؛ ضخامت مناسب آن مانع از تاب برداشتن در استفاده‌ی روزمره می‌شود.',
            'is_new' => false,
            'gallery' => ['1584370848010-d7fe6bc767ec', '1572635196237-14b3f281503f', '1553062407-98eeb64c6a62'],
        ],
        [
            'slug' => 'acc-watch',
            'name' => 'ساعت مچی مردانه',
            'brand' => 'LUXE',
            'rating' => 4.9,
            'category' => 'accessories',
            'sku' => 'ST-ACC-WATCH',
            'price' => 4050000,
            'compare_at_price' => 4500000,
            'stock' => 7,
            'sizes' => ['تک‌سایز'],
            'colors' => ['قهوه‌ای', 'مشکی'],
            'material' => 'بند چرم و بدنه‌ی استیل',
            'fit' => 'تک‌سایز',
            'summary' => 'ساعت مچی با موتور دقیق و بدنه‌ی استیل ضدزنگ؛ بند چرمی آن ظاهری گرم و کلاسیک به مچ می‌دهد.',
            'description' => 'ساعت مچی با موتور دقیق و بدنه‌ی استیل ضدزنگ؛ بند چرمی آن ظاهری گرم و کلاسیک به مچ می‌دهد.',
            'is_new' => false,
            'gallery' => ['1524805444758-089113d48a6d', '1584917865442-de89df76afd3', '1483985988355-763728e1935b'],
        ],
        [
            'slug' => 'acc-shoulder-bag',
            'name' => 'کیف دوشی چرم',
            'brand' => 'PARSA',
            'rating' => 4.3,
            'category' => 'bags',
            'sku' => 'ST-ACC-SHOULDER-BAG',
            'price' => 1425000,
            'compare_at_price' => 1900000,
            'stock' => 23,
            'sizes' => ['تک‌سایز'],
            'colors' => ['سرمه‌ای', 'قهوه‌ای', 'مشکی'],
            'material' => 'چرم مصنوعی درجه یک',
            'fit' => 'تک‌سایز',
            'summary' => 'کیف دوشی با فضای داخلی کافی برای لپ‌تاپ ۱۴ اینچ؛ سبک، مقاوم و مناسب رفت‌وآمد روزانه.',
            'description' => 'کیف دوشی با فضای داخلی کافی برای لپ‌تاپ ۱۴ اینچ؛ سبک، مقاوم و مناسب رفت‌وآمد روزانه.',
            'is_new' => true,
            'gallery' => ['1553062407-98eeb64c6a62', '1543163521-1bf539c55dd2'],
        ],
        [
            'slug' => 'acc-scarf',
            'name' => 'شال و روسری ابریشمی',
            'brand' => 'VENUS',
            'rating' => 4.5,
            'category' => 'accessories',
            'sku' => 'ST-ACC-SCARF',
            'price' => 624000,
            'compare_at_price' => 780000,
            'stock' => 58,
            'sizes' => ['تک‌سایز'],
            'colors' => ['آبی روشن', 'صورتی', 'کرم'],
            'material' => 'ابریشم مخلوط',
            'fit' => 'تک‌سایز',
            'summary' => 'شال ابریشمی با رنگ‌بندی آرام و لبه‌ی دوخته‌شده؛ سبک است و در طول روز روی شانه می‌ماند.',
            'description' => 'شال ابریشمی با رنگ‌بندی آرام و لبه‌ی دوخته‌شده؛ سبک است و در طول روز روی شانه می‌ماند.',
            'is_new' => false,
            'gallery' => ['1483985988355-763728e1935b', '1584370848010-d7fe6bc767ec', '1523170335258-f5ed11844a49'],
        ],
        [
            'slug' => 'acc-crossbody',
            'name' => 'کیف دوشی کوچک زنانه',
            'brand' => 'ATRI',
            'rating' => 4.4,
            'category' => 'bags',
            'sku' => 'ST-ACC-CROSSBODY',
            'price' => 1250000,
            'compare_at_price' => null,
            'stock' => 25,
            'sizes' => ['تک‌سایز'],
            'colors' => ['کرم', 'قهوه‌ای', 'مشکی'],
            'material' => 'چرم طبیعی',
            'fit' => 'تک‌سایز',
            'summary' => 'کیف دوشی کوچک با بند بلند قابل تنظیم؛ برای همراه‌داشتن ضروری‌ها در بیرون‌رفت‌های کوتاه.',
            'description' => 'کیف دوشی کوچک با بند بلند قابل تنظیم؛ برای همراه‌داشتن ضروری‌ها در بیرون‌رفت‌های کوتاه.',
            'is_new' => true,
            'gallery' => ['1543163521-1bf539c55dd2', '1548036328-c9fa89d128fa'],
        ],
        [
            'slug' => 'beauty-perfume',
            'name' => 'ادوپرفیوم زنانه گل‌دار',
            'brand' => 'GLOW',
            'rating' => 4.8,
            'category' => 'beauty',
            'sku' => 'ST-BEAUTY-PERFUME',
            'price' => 2450000,
            'compare_at_price' => 2900000,
            'stock' => 21,
            'sizes' => ['تک‌سایز'],
            'colors' => ['صورتی', 'کرم'],
            'material' => 'ادوپرفیوم ۱۰۰ میلی‌لیتر',
            'fit' => 'تک‌سایز',
            'summary' => 'ادوپرفیوم با رایحه‌ی گل‌های سفید و ماندگاری بالا؛ انتخابی مناسب برای مهمانی‌های شب و استفاده‌ی روزمره.',
            'description' => 'ادوپرفیوم با رایحه‌ی گل‌های سفید و ماندگاری بالا؛ انتخابی مناسب برای مهمانی‌های شب و استفاده‌ی روزمره.',
            'is_new' => true,
            'gallery' => ['1541643600914-78b084683601', '1620916566398-39f1143ab7be'],
        ],
        [
            'slug' => 'beauty-face-serum',
            'name' => 'سرم روشن‌کننده ویتامین C',
            'brand' => 'GLOW',
            'rating' => 4.7,
            'category' => 'beauty',
            'sku' => 'ST-BEAUTY-FACE-SERUM',
            'price' => 1290000,
            'compare_at_price' => 1650000,
            'stock' => 34,
            'sizes' => ['تک‌سایز'],
            'colors' => ['سفید', 'کرم'],
            'material' => 'سرم ۳۰ میلی‌لیتر',
            'fit' => 'تک‌سایز',
            'summary' => 'سرم ویتامین C با بافت سبک و جذب سریع؛ به یکنواختی رنگ پوست کمک می‌کند و برای استفاده‌ی روزانه مناسب است.',
            'description' => 'سرم ویتامین C با بافت سبک و جذب سریع؛ به یکنواختی رنگ پوست کمک می‌کند و برای استفاده‌ی روزانه مناسب است.',
            'is_new' => false,
            'gallery' => ['1620916566398-39f1143ab7be', '1596462502278-27bfdc403348'],
        ],
        [
            'slug' => 'beauty-skin-spray',
            'name' => 'اسپری آبرسان پوست',
            'brand' => 'GLOW',
            'rating' => 4.5,
            'category' => 'beauty',
            'sku' => 'ST-BEAUTY-SKIN-SPRAY',
            'price' => 690000,
            'compare_at_price' => 850000,
            'stock' => 47,
            'sizes' => ['تک‌سایز'],
            'colors' => ['سفید'],
            'material' => 'اسپری ۱۵۰ میلی‌لیتر',
            'fit' => 'تک‌سایز',
            'summary' => 'اسپری آبرسان با آب‌رسانی فوری؛ برای تازه‌سازی پوست در طول روز و پیش از آرایش استفاده می‌شود.',
            'description' => 'اسپری آبرسان با آب‌رسانی فوری؛ برای تازه‌سازی پوست در طول روز و پیش از آرایش استفاده می‌شود.',
            'is_new' => false,
            'gallery' => ['1556228578-8c89e6adf883', '1596462502278-27bfdc403348'],
        ],
        [
            'slug' => 'beauty-lipstick',
            'name' => 'رژ لب مات مخملی',
            'brand' => 'VENUS',
            'rating' => 4.6,
            'category' => 'beauty',
            'sku' => 'ST-BEAUTY-LIPSTICK',
            'price' => 420000,
            'compare_at_price' => 520000,
            'stock' => 62,
            'sizes' => ['تک‌سایز'],
            'colors' => ['شرابی', 'صورتی'],
            'material' => 'رژ لب جامد',
            'fit' => 'تک‌سایز',
            'summary' => 'رژ لب مات با پوشش کامل و ماندگاری بالا؛ بافت مخملی آن خشکی روی لب ایجاد نمی‌کند.',
            'description' => 'رژ لب مات با پوشش کامل و ماندگاری بالا؛ بافت مخملی آن خشکی روی لب ایجاد نمی‌کند.',
            'is_new' => false,
            'gallery' => ['1586495777744-4413f21062fa', '1556228578-8c89e6adf883'],
        ],
    ];

    public function run(): void
    {
        // The placeholder rows first, so a product that replaces one cannot collide with it.
        Product::query()->whereIn('sku', self::SUPERSEDED_SKUS)->delete();

        $categories = [];
        $position = 0;

        foreach (self::CATEGORIES as $slug => $category) {
            $categories[$slug] = Category::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $category['name'],
                    'description' => $category['subtitle'],
                    'image_media_id' => $this->importedImage($category['photo'], $category['name'])->getKey(),
                    'position' => $position++,
                    'is_active' => true,
                ],
            );
        }

        foreach (self::PRODUCTS as $index => $seed) {
            $product = Product::query()->updateOrCreate(
                ['slug' => $seed['slug']],
                [
                    'category_id' => $categories[$seed['category']]->getKey(),
                    'name' => $seed['name'],
                    'sku' => $seed['sku'],
                    'brand' => $seed['brand'],
                    'rating' => $seed['rating'],
                    'short_description' => $seed['summary'],
                    'description' => $seed['description'],
                    'price' => $seed['price'],
                    'compare_at_price' => $seed['compare_at_price'],
                    'stock_quantity' => $seed['stock'],
                    'is_active' => true,
                    'is_featured' => $seed['compare_at_price'] !== null,
                    // The «جدید» badge is a two-week window, so the new arrivals are dated inside it
                    // and everything else is spread behind them to give «جدیدترین» an order to show.
                    'published_at' => $seed['is_new'] ? now()->subDays(2) : now()->subDays(40 + $index),
                    'attributes' => array_filter([
                        'جنس' => [$seed['material']],
                        'فرم' => [$seed['fit']],
                        'size' => $seed['sizes'],
                        'color' => $seed['colors'],
                    ]),
                ],
            );

            $this->attachGallery($product, $seed['gallery']);
        }

        $this->command?->info('Catalogue seeded: '.count(self::PRODUCTS).' products.');
    }

    /**
     * Records a photo the catalogue publishes at its own address.
     *
     * `media` is unique per (disk, path), and an imported row still has to be told apart from every
     * other one, so its path is a stable name derived from the address itself — never a file that
     * exists here. Re-running the seeder updates that same row instead of adding a second.
     */
    private function importedImage(string $photo, string $alt): Media
    {
        $url = self::IMAGE_BASE.$photo.self::IMAGE_PARAMS;

        return Media::query()->updateOrCreate(
            ['disk' => 'public', 'path' => 'imported/'.sha1($url).'.jpg'],
            [
                'source_url' => $url,
                'original_name' => 'photo-'.$photo.'.jpg',
                'mime_type' => 'image/jpeg',
                'size_bytes' => null,
                'width' => 800,
                'height' => 1000,
                'checksum' => null,
                'is_public' => true,
                'uploaded_by' => null,
            ],
        );
    }

    /**
     * @param  array<int, string>  $gallery
     */
    private function attachGallery(Product $product, array $gallery): void
    {
        $ids = [];

        foreach ($gallery as $position => $photo) {
            $media = $this->importedImage($photo, $product->name);
            $ids[] = $media->getKey();

            ProductImage::query()->updateOrCreate(
                ['product_id' => $product->getKey(), 'media_id' => $media->getKey()],
                ['alt' => $product->name, 'position' => $position],
            );
        }

        // The list above is the product's whole gallery: a photo dropped from it has to leave the
        // product page too, which is why the surplus links are removed rather than left behind.
        ProductImage::query()
            ->where('product_id', $product->getKey())
            ->whereNotIn('media_id', $ids)
            ->delete();
    }
}
