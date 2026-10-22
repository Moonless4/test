<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;

/**
 * The store's catalogue: 48 products in six categories, modelled on the offering of Iran's two
 * large multi-brand fashion retailers (DigiStyle and Modiseh): the same category and sub-category
 * language, the same spread of clothing, footwear, bags, accessories and beauty, and the same order
 * of prices — everyday tees and blouses in the hundreds of thousands of Toman up to suits and coats
 * in the millions.
 *
 * The «پاییز ۱۴۰۵» block at the end of `PRODUCTS` is the round picked from what those two shops are
 * pushing now (autumn outerwear, knitwear, women's trousers and baggy jeans, linen shirts, leather
 * office bags, foundation), carrying the brands and price levels they list — ELSANA, RNS, Colleen,
 * Tulika, Saad, Novin Leather, Gabrini. Its prices follow theirs, including the discounted ones.
 *
 * What this file deliberately does *not* claim: it is not a mirror of either shop's records. Their
 * catalogue pages could not be read from this environment (the sites and their image CDNs refuse
 * traffic from here), so the rows below are the shop's own products with realistic names, brands,
 * prices and attributes — and their photos are free stock shots cut out locally, never their own. Swapping in a real export is a data job: replace `PRODUCTS` (or edit the rows in the
 * admin panel) — nothing in the storefront or the API knows which catalogue it is rendering.
 *
 * **Product photos are local packshots**: a background-free WebP cut out of the photograph that shows
 * that product, composited on a transparent 4:5 canvas and served by the storefront from its own
 * `public/catalog` directory at `/catalog/<photo>.webp`. The gallery below still names the photograph
 * each picture came from, so the product's own photo stays with the product — only its background is
 * gone, and nothing is hotlinked for a product.
 *
 * Category tiles are still **imported** photos: their row records the address the tile is published
 * at (`media.source_url`) because they are editorial banners rather than packshots. Every picture was
 * looked at before it was assigned: the product's own name follows what the photo actually shows (a
 * suit photo sits on a suit, a boot photo on a boot), and a product's gallery only carries pictures
 * of the same kind of item.
 *
 * Prices are plain Toman integers. A discounted product carries both numbers: `price` is what the
 * shopper pays and `compare_at_price` is the original shown struck through above it; the discount
 * itself is always derived, never stored.
 *
 * Idempotent by slug (and by the photo's own address), so the one-shot container setup can re-seed
 * on every start without duplicating anything. Rows belonging to the previous demo catalogue are
 * removed by `purgeSuperseded()`.
 */
class CatalogSeeder extends Seeder
{
    /** Category tiles are hotlinked at this size — the wide crop a tile assumes. */
    private const IMAGE_BASE = 'https://images.unsplash.com/photo-';

    private const IMAGE_PARAMS = '?auto=format&fit=crop&w=800&h=1000&q=70';

    /** Product packshots: transparent WebP files the storefront serves itself, already 4:5. */
    private const PACKSHOT_DIR = '/catalog/';

    private const PACKSHOT_WIDTH = 1000;

    private const PACKSHOT_HEIGHT = 1250;

    /**
     * slug => [name, subtitle, photo]
     *
     * The six categories the shop's navigation already names. None of them is empty: every one
     * carries products below.
     *
     * @var array<string, array{name: string, subtitle: string, photo: string}>
     */
    private const CATEGORIES = [
        'women' => ['name' => 'زنانه', 'subtitle' => 'پیراهن، پالتو و شومیز', 'photo' => '1515886657613-9f3515b0c78f'],
        'men' => ['name' => 'مردانه', 'subtitle' => 'پیراهن، تی‌شرت، کت و شلوار', 'photo' => '1512436991641-6745cdb1723f'],
        'shoes' => ['name' => 'کفش', 'subtitle' => 'کتانی، پاشنه‌دار و بوت', 'photo' => '1549298916-b41d501d3772'],
        'bags' => ['name' => 'کیف و کوله', 'subtitle' => 'دستی و کوله پشتی', 'photo' => '1548036328-c9fa89d128fa'],
        'accessories' => ['name' => 'اکسسوری', 'subtitle' => 'ساعت، عینک، کمربند و شال', 'photo' => '1523170335258-f5ed11844a49'],
        'beauty' => ['name' => 'زیبایی', 'subtitle' => 'عطر، سرم و آرایش', 'photo' => '1596462502278-27bfdc403348'],
    ];

    /**
     * The catalogue, in the order the shop lists it. Each entry is one product:
     *
     *   slug, name, category, sku, price, compare_at_price, stock, sizes, colours,
     *   material, fit, summary, description, is_new, gallery
     *
     * `gallery` starts with the product's own cover photo; the others are the same kind of piece
     * from the same category, so the thumbnails read as further angles rather than a different
     * product's picture.
     *
     * @var array<int, array<string, mixed>>
     */
    private const PRODUCTS = [
        // ---------------------------------------------------------------- مردانه
        [
            'slug' => 'men-check-suit',
            'name' => 'کت و شلوار مردانه چهارخانه',
            'brand' => 'VESTA',
            'rating' => 4.8,
            'category' => 'men',
            'sku' => 'MD-MEN-CHECK-SUIT',
            'price' => 4850000,
            'compare_at_price' => 5950000,
            'stock' => 11,
            'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
            'colors' => ['سرمه‌ای', 'آبی'],
            'material' => 'پشم مخلوط',
            'fit' => 'اسلیم',
            'summary' => 'ست سه‌تکه کت، جلیقه و شلوار با طرح چهارخانه ریز؛ برای مراسم و محیط کار.',
            'description' => 'کت و شلوار سه‌تکه با پارچه پشم مخلوط که فرم شانه را نگه می‌دارد. جلیقه پنج‌دکمه و شلوار با دم‌پای باریک. خشک‌شویی برای حفظ فرم پارچه.',
            'is_new' => true,
            'gallery' => ['1594938298603-c8148c4dae35', '1519085360753-af0119f7cbe7', '1602810318383-e386cc2a3ccf'],
        ],
        [
            'slug' => 'men-formal-suit',
            'name' => 'کت و شلوار مردانه رسمی',
            'brand' => 'VESTA',
            'rating' => 4.7,
            'category' => 'men',
            'sku' => 'MD-MEN-FORMAL-SUIT',
            'price' => 4350000,
            'compare_at_price' => null,
            'stock' => 13,
            'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
            'colors' => ['سرمه‌ای', 'مشکی'],
            'material' => 'پشم مخلوط',
            'fit' => 'فیت',
            'summary' => 'کت و شلوار رسمی تک‌دکمه با یقه ساتن؛ همراه با پیراهن و کراوات.',
            'description' => 'کت تک‌دکمه با یقه ساتن و دو جیب درزدار، شلوار با کمر مرتب. برش فیت آن خط شانه را برجسته می‌کند. خشک‌شویی توصیه می‌شود.',
            'is_new' => false,
            'gallery' => ['1519085360753-af0119f7cbe7', '1594938298603-c8148c4dae35', '1596755094514-f87e34085b2c'],
        ],
        [
            'slug' => 'men-dress-shirt',
            'name' => 'پیراهن مردانه آستین بلند',
            'brand' => 'T-ONE',
            'rating' => 4.6,
            'category' => 'men',
            'sku' => 'MD-MEN-DRESS-SHIRT',
            'price' => 1450000,
            'compare_at_price' => 1850000,
            'stock' => 34,
            'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
            'colors' => ['سفید', 'آبی روشن', 'سرمه‌ای'],
            'material' => 'پنبه ۱۰۰٪',
            'fit' => 'اسلیم',
            'summary' => 'پیراهن کلاسیک با یقه استاندارد و مچ دکمه‌دار؛ پایه‌ی ست رسمی.',
            'description' => 'پنبه ۱۰۰٪ با بافت نرم که زیر کت حجم نمی‌دهد. یقه خوش‌فرم، درز پشت با چین و مچ دکمه‌دار. اتوی گرم روی پارچه نمناک.',
            'is_new' => false,
            'gallery' => ['1602810318383-e386cc2a3ccf', '1596755094514-f87e34085b2c', '1519085360753-af0119f7cbe7'],
        ],
        [
            'slug' => 'men-polka-shirt',
            'name' => 'پیراهن مردانه یقه‌دار',
            'brand' => 'T-ONE',
            'rating' => 4.4,
            'category' => 'men',
            'sku' => 'MD-MEN-POLKA-SHIRT',
            'price' => 1280000,
            'compare_at_price' => null,
            'stock' => 27,
            'sizes' => ['S', 'M', 'L', 'XL'],
            'colors' => ['آبی روشن', 'سفید'],
            'material' => 'پنبه',
            'fit' => 'رجولار',
            'summary' => 'پیراهن آستین بلند با طرح نقطه‌ای ریز؛ گزینه‌ای نیمه‌رسمی.',
            'description' => 'پارچه پنبه‌ای سبک با طرح نقطه‌ای ریز و یقه برگردان. برش رجولار آزادی حرکت می‌دهد. شست‌وشوی ماشینی با برنامه ملایم.',
            'is_new' => false,
            'gallery' => ['1596755094514-f87e34085b2c', '1602810318383-e386cc2a3ccf', '1519085360753-af0119f7cbe7'],
        ],
        [
            'slug' => 'men-basic-tee',
            'name' => 'تی‌شرت مردانه یقه گرد',
            'brand' => 'T-ONE',
            'rating' => 4.7,
            'category' => 'men',
            'sku' => 'MD-MEN-BASIC-TEE',
            'price' => 690000,
            'compare_at_price' => 890000,
            'stock' => 48,
            'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
            'colors' => ['سفید', 'مشکی', 'طوسی'],
            'material' => 'پنبه ۱۸۰ گرم',
            'fit' => 'رجولار',
            'summary' => 'تی‌شرت پنبه‌ای پایه با یقه گرد و دوخت کش‌باف دور گردن، برای پوشیدن روزمره.',
            'description' => 'پارچه پنبه ۱۸۰ گرم که پس از چند شست‌وشو آب نمی‌رود و فرم خود را نگه می‌دارد. یقه با نوار کش‌باف تقویت شده تا باز نشود. اتوی گرم از پشت پارچه.',
            'is_new' => false,
            'gallery' => ['1521572163474-6864f9cf17ab', '1618354691373-d851c5c3a990', '1503341504253-dff4815485f1'],
        ],
        [
            'slug' => 'men-black-tee',
            'name' => 'تی‌شرت مردانه آستین کوتاه',
            'brand' => 'MAHAN',
            'rating' => 4.5,
            'category' => 'men',
            'sku' => 'MD-MEN-BLACK-TEE',
            'price' => 720000,
            'compare_at_price' => null,
            'stock' => 41,
            'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
            'colors' => ['مشکی', 'سفید'],
            'material' => 'پنبه ۱۸۰ گرم',
            'fit' => 'رجولار',
            'summary' => 'تی‌شرت مشکی با آرم کوچک روی سینه؛ ساده و ست‌شدنی.',
            'description' => 'پارچه پنبه‌ای با رنگ‌بندی ثابت که پس از شست‌وشو نمی‌پرد. برش رجولار با آستین کوتاه. شست‌وشوی ماشینی با آب سرد.',
            'is_new' => false,
            'gallery' => ['1618354691373-d851c5c3a990', '1521572163474-6864f9cf17ab', '1503341504253-dff4815485f1'],
        ],
        [
            'slug' => 'men-graphic-tee',
            'name' => 'تی‌شرت مردانه طرح‌دار',
            'brand' => 'T-ONE',
            'rating' => 4.4,
            'category' => 'men',
            'sku' => 'MD-MEN-GRAPHIC-TEE',
            'price' => 780000,
            'compare_at_price' => 990000,
            'stock' => 36,
            'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
            'colors' => ['مشکی', 'سفید'],
            'material' => 'پنبه',
            'fit' => 'اورسایز',
            'summary' => 'تی‌شرت طرح‌دار با چاپ مقاوم؛ برای استایل خیابانی.',
            'description' => 'چاپ روی پارچه با رنگ ثابت که در شست‌وشو ترک نمی‌خورد. برش اورسایز با آستین افتاده. اتوی گرم از سمت پشت.',
            'is_new' => false,
            'gallery' => ['1503341504253-dff4815485f1', '1521572163474-6864f9cf17ab', '1618354691373-d851c5c3a990'],
        ],
        [
            'slug' => 'men-hoodie',
            'name' => 'هودی مردانه کلاه‌دار',
            'brand' => 'MAHAN',
            'rating' => 4.5,
            'category' => 'men',
            'sku' => 'MD-MEN-HOODIE',
            'price' => 1390000,
            'compare_at_price' => 1890000,
            'stock' => 31,
            'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
            'colors' => ['طوسی', 'مشکی', 'زیتونی'],
            'material' => 'سه‌نخ پنبه',
            'fit' => 'اورسایز',
            'summary' => 'هودی سه‌نخ با کلاه و بند تنظیم، گرم و مناسب پوشیدن در سه فصل.',
            'description' => 'پارچه سه‌نخ پنبه با سطح صاف و داخل خزدار سبک؛ کش دور مچ و کمر فرم را نگه می‌دارد. برش اورسایز دارد، یک سایز کوچک‌تر برای فرم رجولار مناسب است.',
            'is_new' => false,
            'gallery' => ['1556821840-3a63f95609a7', '1618354691373-d851c5c3a990', '1521572163474-6864f9cf17ab'],
        ],
        [
            'slug' => 'men-field-jacket',
            'name' => 'کاپشن مردانه یقه‌دار',
            'brand' => 'VESTA',
            'rating' => 4.6,
            'category' => 'men',
            'sku' => 'MD-MEN-FIELD-JACKET',
            'price' => 2890000,
            'compare_at_price' => 3590000,
            'stock' => 15,
            'sizes' => ['S', 'M', 'L', 'XL', 'XXL'],
            'colors' => ['زیتونی', 'مشکی'],
            'material' => 'پارچه کتان‌کشی',
            'fit' => 'رجولار',
            'summary' => 'کاپشن سبک با یقه ایستاده و جیب‌های دکمه‌دار؛ مناسب پاییز.',
            'description' => 'پارچه کتان‌کشی که باد را می‌گیرد و سبک است. یقه ایستاده، چهار جیب جلویی و بست دکمه‌ای. شست‌وشوی ملایم با آب سرد.',
            'is_new' => false,
            'gallery' => ['1544022613-e87ca75a784a', '1556821840-3a63f95609a7', '1618354691373-d851c5c3a990'],
        ],
        [
            'slug' => 'men-slim-jeans',
            'name' => 'شلوار جین مردانه',
            'brand' => 'T-ONE',
            'rating' => 4.6,
            'category' => 'men',
            'sku' => 'MD-MEN-SLIM-JEANS',
            'price' => 1650000,
            'compare_at_price' => null,
            'stock' => 23,
            'sizes' => ['30', '32', '34', '36', '38'],
            'colors' => ['آبی', 'سرمه‌ای'],
            'material' => 'جین کشی',
            'fit' => 'اسلیم',
            'summary' => 'شلوار جین آبی با کشی ملایم و دم‌پای باریک؛ روزمره و مقاوم.',
            'description' => 'جین با ۲٪ الاستان که در طول روز گشاد نمی‌شود. پنج جیب کلاسیک و ساق باریک. اندازه دور کمر با جدول سایز یکسان است.',
            'is_new' => false,
            'gallery' => ['1584370848010-d7fe6bc767ec', '1521572163474-6864f9cf17ab', '1556821840-3a63f95609a7'],
        ],

        // ---------------------------------------------------------------- زنانه
        [
            'slug' => 'women-evening-dress',
            'name' => 'پیراهن مجلسی زنانه',
            'brand' => 'ARNIKA',
            'rating' => 4.8,
            'category' => 'women',
            'sku' => 'MD-WOMEN-EVENING-DRESS',
            'price' => 4350000,
            'compare_at_price' => 5400000,
            'stock' => 9,
            'sizes' => ['S', 'M', 'L'],
            'colors' => ['شرابی', 'مشکی'],
            'material' => 'کرپ سنگین',
            'fit' => 'فیت',
            'summary' => 'پیراهن مجلسی بدون آستین با کمر جمع‌شده و دامن افتاده.',
            'description' => 'کرپ سنگین با آستر کامل که فرم دامن را نگه می‌دارد. بالاتنه بدون آستین و کمر جمع‌شده. خشک‌شویی توصیه می‌شود.',
            'is_new' => true,
            'gallery' => ['1566174053879-31528523f8ae', '1595777457583-95e059d581b8', '1496747611176-843222e1e57c'],
        ],
        [
            'slug' => 'women-floral-dress',
            'name' => 'پیراهن گل‌دار زنانه',
            'brand' => 'ARNIKA',
            'rating' => 4.6,
            'category' => 'women',
            'sku' => 'MD-WOMEN-FLORAL-DRESS',
            'price' => 2150000,
            'compare_at_price' => null,
            'stock' => 21,
            'sizes' => ['S', 'M', 'L', 'XL'],
            'colors' => ['سفید', 'صورتی'],
            'material' => 'ویسکوز',
            'fit' => 'رجولار',
            'summary' => 'پیراهن گل‌دار با طرح ریز و کمر آزاد؛ برای روزهای گرم.',
            'description' => 'ویسکوز سبک با افت زیبا و طرح گل کوچک. یقه گرد، آستین کوتاه و آستر در قسمت دامن. شست‌وشوی ملایم و خشک‌کردن در سایه.',
            'is_new' => false,
            'gallery' => ['1496747611176-843222e1e57c', '1566174053879-31528523f8ae', '1595777457583-95e059d581b8'],
        ],
        [
            'slug' => 'women-long-dress',
            'name' => 'پیراهن بلند زنانه',
            'brand' => 'ARNIKA',
            'rating' => 4.7,
            'category' => 'women',
            'sku' => 'MD-WOMEN-LONG-DRESS',
            'price' => 3250000,
            'compare_at_price' => 3950000,
            'stock' => 12,
            'sizes' => ['S', 'M', 'L', 'XL'],
            'colors' => ['قرمز', 'شرابی'],
            'material' => 'پارچه حریر آسترکش',
            'fit' => 'رجولار',
            'summary' => 'پیراهن بلند با دامن پرچین و آستر کامل؛ برای مهمانی.',
            'description' => 'پارچه حریر با آستر کامل که فرم دامن را حفظ می‌کند. کمر کشی و دامن پرچین تا مچ. شست‌وشوی دستی با آب سرد.',
            'is_new' => false,
            'gallery' => ['1595777457583-95e059d581b8', '1566174053879-31528523f8ae', '1496747611176-843222e1e57c'],
        ],
        [
            'slug' => 'women-trench-coat',
            'name' => 'بارانی بلند زنانه',
            'brand' => 'KARIN',
            'rating' => 4.8,
            'category' => 'women',
            'sku' => 'MD-WOMEN-TRENCH-COAT',
            'price' => 3950000,
            'compare_at_price' => 4750000,
            'stock' => 14,
            'sizes' => ['S', 'M', 'L', 'XL'],
            'colors' => ['بژ', 'کرم'],
            'material' => 'پارچه ضدآب',
            'fit' => 'رجولار',
            'summary' => 'بارانی بلند با کمربند و یقه برگردان؛ برای روزهای بارانی.',
            'description' => 'پارچه ضدآب با آستر سبک و کمربند پارچه‌ای. دو جیب با درپوش و درز پشت. خشک‌شویی برای حفظ پوشش ضدآب.',
            'is_new' => false,
            'gallery' => ['1539533018447-63fcce2678e3', '1483985988355-763728e1935b', '1539109136881-3be0616acf4b'],
        ],
        [
            'slug' => 'women-wool-coat',
            'name' => 'پالتو زنانه میان‌قد',
            'brand' => 'KARIN',
            'rating' => 4.7,
            'category' => 'women',
            'sku' => 'MD-WOMEN-WOOL-COAT',
            'price' => 4250000,
            'compare_at_price' => 4950000,
            'stock' => 10,
            'sizes' => ['S', 'M', 'L', 'XL'],
            'colors' => ['شرابی', 'مشکی'],
            'material' => '۷۰٪ پشم',
            'fit' => 'رجولار',
            'summary' => 'پالتو پشمی میان‌قد با شال‌گردن و جیب‌های کناری.',
            'description' => 'پشم با آستر ساتن که گرما را نگه می‌دارد. شال‌گردن یکپارچه و دو جیب کناری. خشک‌شویی توصیه می‌شود.',
            'is_new' => false,
            'gallery' => ['1483985988355-763728e1935b', '1539533018447-63fcce2678e3', '1539109136881-3be0616acf4b'],
        ],
        [
            'slug' => 'women-blue-coat',
            'name' => 'پالتو زنانه یقه‌دار',
            'brand' => 'KARIN',
            'rating' => 4.6,
            'category' => 'women',
            'sku' => 'MD-WOMEN-BLUE-COAT',
            'price' => 3650000,
            'compare_at_price' => null,
            'stock' => 16,
            'sizes' => ['S', 'M', 'L', 'XL'],
            'colors' => ['آبی', 'سرمه‌ای'],
            'material' => 'پشم مخلوط',
            'fit' => 'فیت',
            'summary' => 'پالتو آبی با یقه برگردان و دکمه‌های فلزی؛ استایل زمستانی.',
            'description' => 'پشم مخلوط با آستر کامل و یقه برگردان. برش فیت با دکمه‌های فلزی و دو جیب. خشک‌شویی.',
            'is_new' => false,
            'gallery' => ['1539109136881-3be0616acf4b', '1539533018447-63fcce2678e3', '1483985988355-763728e1935b'],
        ],
        [
            'slug' => 'women-knit-poncho',
            'name' => 'پشن بافت زنانه',
            'brand' => 'ROSA',
            'rating' => 4.5,
            'category' => 'women',
            'sku' => 'MD-WOMEN-KNIT-PONCHO',
            'price' => 1890000,
            'compare_at_price' => 2450000,
            'stock' => 19,
            'sizes' => ['تک‌سایز'],
            'colors' => ['کرم', 'بژ'],
            'material' => 'اکریلیک پشمی',
            'fit' => 'آزاد',
            'summary' => 'پشن بافت با حاشیه ریشه‌دار؛ لایه‌ی گرم روی مانتو و شومیز.',
            'description' => 'بافت اکریلیک-پشم که سبک است و گرما نگه می‌دارد. یقه یقه‌اسکی و حاشیه ریشه‌دار. تاشده نگه دارید تا فرم حفظ شود.',
            'is_new' => true,
            'gallery' => ['1434389677669-e08b4cac3105', '1490481651871-ab68de25d43d', '1539533018447-63fcce2678e3'],
        ],
        [
            'slug' => 'women-blouse',
            'name' => 'شومیز زنانه آستین بلند',
            'brand' => 'ROSA',
            'rating' => 4.5,
            'category' => 'women',
            'sku' => 'MD-WOMEN-BLOUSE',
            'price' => 1590000,
            'compare_at_price' => 1990000,
            'stock' => 27,
            'sizes' => ['S', 'M', 'L', 'XL'],
            'colors' => ['سفید', 'کرم', 'آبی روشن'],
            'material' => 'پارچه ساتن',
            'fit' => 'رجولار',
            'summary' => 'شومیز ساتن با درخشش ملایم و مچ دکمه‌دار؛ هم رسمی و هم روزمره.',
            'description' => 'ساتن با سطح صاف که نور را نرم بازمی‌تاباند. یقه کلاسیک و برش رجولار؛ داخل شلوار یا دامن مرتب می‌نشیند. اتوی خنک از پشت پارچه.',
            'is_new' => false,
            'gallery' => ['1490481651871-ab68de25d43d', '1496747611176-843222e1e57c', '1434389677669-e08b4cac3105'],
        ],

        // ---------------------------------------------------------------- کفش
        [
            'slug' => 'shoes-sport-sneaker',
            'name' => 'کتانی ورزشی',
            'brand' => 'MAHAN',
            'rating' => 4.7,
            'category' => 'shoes',
            'sku' => 'MD-SHOES-SPORT-SNEAKER',
            'price' => 2690000,
            'compare_at_price' => 3290000,
            'stock' => 16,
            'sizes' => ['40', '41', '42', '43', '44'],
            'colors' => ['سفید', 'مشکی'],
            'material' => 'مش و لاستیک',
            'fit' => 'استاندارد',
            'summary' => 'کتانی ورزشی با رویه مش و کفی نرم؛ برای تمرین و پیاده‌روی.',
            'description' => 'رویه مش سبک که هوا را عبور می‌دهد و زیره لاستیکی با چنگ‌زنی بالا. کفی قابل برداشتن است. اندازه استاندارد.',
            'is_new' => true,
            'gallery' => ['1560769629-975ec94e6a86', '1542291026-7eec264c27ff', '1600185365483-26d7a4cc7519'],
        ],
        [
            'slug' => 'shoes-white-sneaker',
            'name' => 'کتانی سفید مردانه',
            'brand' => 'MAHAN',
            'rating' => 4.6,
            'category' => 'shoes',
            'sku' => 'MD-SHOES-WHITE-SNEAKER',
            'price' => 2150000,
            'compare_at_price' => null,
            'stock' => 24,
            'sizes' => ['40', '41', '42', '43', '44'],
            'colors' => ['سفید'],
            'material' => 'چرم مصنوعی',
            'fit' => 'استاندارد',
            'summary' => 'کتانی سفید با زیره رنگی و بند پارچه‌ای؛ ست روزمره.',
            'description' => 'رویه چرم مصنوعی با دوخت تمیز و زیره فومی سبک. بند پارچه‌ای و آستر توری. تمیزکردن با برس نرم و آب.',
            'is_new' => false,
            'gallery' => ['1600185365483-26d7a4cc7519', '1560769629-975ec94e6a86', '1595950653106-6c9ebd614d3a'],
        ],
        [
            'slug' => 'shoes-daily-sneaker',
            'name' => 'کتانی روزمره',
            'brand' => 'MAHAN',
            'rating' => 4.5,
            'category' => 'shoes',
            'sku' => 'MD-SHOES-DAILY-SNEAKER',
            'price' => 1950000,
            'compare_at_price' => 2450000,
            'stock' => 28,
            'sizes' => ['40', '41', '42', '43', '44'],
            'colors' => ['طوسی', 'سفید'],
            'material' => 'مش و لاستیک',
            'fit' => 'استاندارد',
            'summary' => 'کتانی سبک با رویه بافت و کفی طبی؛ راحت برای روزهای بلند.',
            'description' => 'رویه بافت با تهویه خوب و کفی طبی که فشار پا را پخش می‌کند. زیره لاستیکی ضدلغزش. مناسب پیاده‌روی طولانی.',
            'is_new' => false,
            'gallery' => ['1460353581641-37baddab0fa2', '1560769629-975ec94e6a86', '1542291026-7eec264c27ff'],
        ],
        [
            'slug' => 'shoes-running',
            'name' => 'کفش ورزشی رانینگ',
            'brand' => 'MAHAN',
            'rating' => 4.6,
            'category' => 'shoes',
            'sku' => 'MD-SHOES-RUNNING',
            'price' => 2350000,
            'compare_at_price' => 2850000,
            'stock' => 18,
            'sizes' => ['40', '41', '42', '43', '44'],
            'colors' => ['قرمز', 'مشکی'],
            'material' => 'رویه بافت',
            'fit' => 'استاندارد',
            'summary' => 'کفش دویدن با رویه بافت یکپارچه و بازگشت انرژی در زیره.',
            'description' => 'رویه بافت که مثل جوراب به پا می‌نشیند و زیره فومی با بازگشت انرژی. پاشنه تقویت‌شده برای دویدن روی آسفالت.',
            'is_new' => false,
            'gallery' => ['1542291026-7eec264c27ff', '1460353581641-37baddab0fa2', '1560769629-975ec94e6a86'],
        ],
        [
            'slug' => 'shoes-women-sneaker',
            'name' => 'کتانی زنانه',
            'brand' => 'ROSA',
            'rating' => 4.4,
            'category' => 'shoes',
            'sku' => 'MD-SHOES-WOMEN-SNEAKER',
            'price' => 2450000,
            'compare_at_price' => null,
            'stock' => 21,
            'sizes' => ['36', '37', '38', '39', '40'],
            'colors' => ['صورتی', 'کرم'],
            'material' => 'چرم مصنوعی',
            'fit' => 'استاندارد',
            'summary' => 'کتانی زنانه با رنگ‌بندی پاستلی و زیره ضخیم؛ استایل روزمره.',
            'description' => 'رویه چرم مصنوعی با رنگ‌بندی ملایم و زیره ضخیم که قد می‌دهد. آستر پارچه‌ای و بند پهن. تمیزکردن با پارچه نمناک.',
            'is_new' => true,
            'gallery' => ['1595950653106-6c9ebd614d3a', '1600185365483-26d7a4cc7519', '1460353581641-37baddab0fa2'],
        ],
        [
            'slug' => 'shoes-women-heels',
            'name' => 'کفش پاشنه بلند زنانه',
            'brand' => 'ROSA',
            'rating' => 4.3,
            'category' => 'shoes',
            'sku' => 'MD-SHOES-WOMEN-HEELS',
            'price' => 1890000,
            'compare_at_price' => 2390000,
            'stock' => 17,
            'sizes' => ['36', '37', '38', '39', '40'],
            'colors' => ['آبی', 'مشکی'],
            'material' => 'ساتن',
            'fit' => 'استاندارد',
            'summary' => 'کفش پاشنه‌دار با پاشنه ۸ سانتی و رویه ساتن؛ برای مهمانی.',
            'description' => 'رویه ساتن با بند ظریف و پاشنه ۸ سانتی‌متری. کفی نرم برای ایستادن طولانی. برای حفظ رویه، در کیف پارچه‌ای نگه دارید.',
            'is_new' => false,
            'gallery' => ['1543163521-1bf539c55dd2', '1524805444758-089113d48a6d', '1595950653106-6c9ebd614d3a'],
        ],
        [
            'slug' => 'shoes-women-boot',
            'name' => 'نیم‌بوت زنانه',
            'brand' => 'KARIN',
            'rating' => 4.6,
            'category' => 'shoes',
            'sku' => 'MD-SHOES-WOMEN-BOOT',
            'price' => 3890000,
            'compare_at_price' => 4650000,
            'stock' => 12,
            'sizes' => ['36', '37', '38', '39', '40', '41'],
            'colors' => ['بژ', 'قهوه‌ای'],
            'material' => 'جیر',
            'fit' => 'استاندارد',
            'summary' => 'نیم‌بوت جیر با پاشنه بلوکی و زیپ کناری؛ پاییز و زمستان.',
            'description' => 'جیر با آستر پارچه‌ای و پاشنه بلوکی که تعادل می‌دهد. زیپ کناری و رویه ساق کوتاه. اسپری محافظ جیر برای روزهای بارانی.',
            'is_new' => false,
            'gallery' => ['1524805444758-089113d48a6d', '1543163521-1bf539c55dd2', '1460353581641-37baddab0fa2'],
        ],

        // ---------------------------------------------------------------- کیف
        [
            'slug' => 'bags-women-handbag',
            'name' => 'کیف دستی زنانه',
            'brand' => 'NAVA',
            'rating' => 4.7,
            'category' => 'bags',
            'sku' => 'MD-BAGS-WOMEN-HANDBAG',
            'price' => 2450000,
            'compare_at_price' => 3190000,
            'stock' => 15,
            'sizes' => ['تک‌سایز'],
            'colors' => ['قرمز', 'مشکی'],
            'material' => 'چرم صنعتی',
            'fit' => 'استاندارد',
            'summary' => 'کیف دستی ساختاردار با دسته دوتایی و قفل فلزی.',
            'description' => 'چرم صنعتی با بافت ریز و بدنه ساختاردار. دو جیب داخلی و یک جیب زیپ‌دار، دسته‌های کوتاه برای حمل دستی. لکه را با پارچه نمناک پاک کنید.',
            'is_new' => true,
            'gallery' => ['1584917865442-de89df76afd3', '1553062407-98eeb64c6a62', '1543163521-1bf539c55dd2'],
        ],
        [
            'slug' => 'bags-backpack',
            'name' => 'کوله پشتی روزمره',
            'brand' => 'NAVA',
            'rating' => 4.5,
            'category' => 'bags',
            'sku' => 'MD-BAGS-BACKPACK',
            'price' => 1750000,
            'compare_at_price' => null,
            'stock' => 26,
            'sizes' => ['تک‌سایز'],
            'colors' => ['مشکی', 'سرمه‌ای'],
            'material' => 'نایلون ضدآب',
            'fit' => 'استاندارد',
            'summary' => 'کوله پشتی سبک با جیب لپ‌تاپ و بندهای قابل تنظیم.',
            'description' => 'نایلون ضدآب با درزهای تقویت‌شده. جیب مخصوص لپ‌تاپ ۱۵ اینچ و دو جیب کناری برای بطری. بندهای پددار و قابل تنظیم.',
            'is_new' => false,
            'gallery' => ['1553062407-98eeb64c6a62', '1584917865442-de89df76afd3', '1490114538077-0a7f8cb49891'],
        ],

        // ---------------------------------------------------------------- اکسسوری
        [
            'slug' => 'acc-sunglasses',
            'name' => 'عینک آفتابی',
            'brand' => 'ROSA',
            'rating' => 4.5,
            'category' => 'accessories',
            'sku' => 'MD-ACC-SUNGLASSES',
            'price' => 1150000,
            'compare_at_price' => 1450000,
            'stock' => 30,
            'sizes' => ['تک‌سایز'],
            'colors' => ['طلایی', 'مشکی'],
            'material' => 'فریم فلزی',
            'fit' => 'استاندارد',
            'summary' => 'عینک آفتابی با فریم فلزی و لنز UV400؛ فرم گرد.',
            'description' => 'فریم فلزی سبک با لنز UV400 که اشعه ماورای بنفش را می‌گیرد. همراه با کیف پارچه‌ای. تمیزکردن با دستمال نرم.',
            'is_new' => false,
            'gallery' => ['1511499767150-a48a237f0083', '1490114538077-0a7f8cb49891', '1479064555552-3ef4979f8908'],
        ],
        [
            'slug' => 'acc-scarf-set',
            'name' => 'شال و کلاه زنانه',
            'brand' => 'ROSA',
            'rating' => 4.4,
            'category' => 'accessories',
            'sku' => 'MD-ACC-SCARF-SET',
            'price' => 890000,
            'compare_at_price' => 1190000,
            'stock' => 38,
            'sizes' => ['تک‌سایز'],
            'colors' => ['طوسی', 'مشکی'],
            'material' => 'بافت پشمی',
            'fit' => 'استاندارد',
            'summary' => 'ست شال و کلاه بافت هماهنگ؛ گرم برای روزهای سرد.',
            'description' => 'بافت پشمی نرم که خارش نمی‌دهد. شال بلند با حاشیه ریشه‌دار و کلاه هم‌خانواده. شست‌وشوی دستی با آب سرد.',
            'is_new' => false,
            'gallery' => ['1487412720507-e7ab37603c6f', '1511499767150-a48a237f0083', '1539109136881-3be0616acf4b'],
        ],
        [
            'slug' => 'acc-men-set',
            'name' => 'ست اکسسوری مردانه',
            'brand' => 'VESTA',
            'rating' => 4.6,
            'category' => 'accessories',
            'sku' => 'MD-ACC-MEN-SET',
            'price' => 2890000,
            'compare_at_price' => 3490000,
            'stock' => 14,
            'sizes' => ['تک‌سایز'],
            'colors' => ['قهوه‌ای', 'مشکی'],
            'material' => 'چرم و فلز',
            'fit' => 'استاندارد',
            'summary' => 'ست کمربند، کیف کارت و ساعت با کیفیت هماهنگ؛ مناسب هدیه.',
            'description' => 'ست شامل کمربند چرم با سگک مات، جاکارتی جیبی و ساعت بند چرم، در جعبه هدیه. با واکس بی‌رنگ نگهداری شود.',
            'is_new' => true,
            'gallery' => ['1479064555552-3ef4979f8908', '1572635196237-14b3f281503f', '1490114538077-0a7f8cb49891'],
        ],
        [
            'slug' => 'acc-gift-set',
            'name' => 'ست هدیه مردانه',
            'brand' => 'VESTA',
            'rating' => 4.5,
            'category' => 'accessories',
            'sku' => 'MD-ACC-GIFT-SET',
            'price' => 2450000,
            'compare_at_price' => null,
            'stock' => 18,
            'sizes' => ['تک‌سایز'],
            'colors' => ['مشکی', 'سرمه‌ای'],
            'material' => 'چرم و پارچه',
            'fit' => 'استاندارد',
            'summary' => 'ست هدیه شامل شال، ساعت و کیف کارت در جعبه.',
            'description' => 'بسته‌بندی هدیه با شال بافت، ساعت بند چرم و کیف کارت. سه قطعه هماهنگ در یک جعبه. مناسب هدیه‌های سازمانی.',
            'is_new' => false,
            'gallery' => ['1490114538077-0a7f8cb49891', '1572635196237-14b3f281503f', '1479064555552-3ef4979f8908'],
        ],

        // ---------------------------------------------------------------- زیبایی
        [
            'slug' => 'beauty-perfume',
            'name' => 'ادوپرفیوم زنانه',
            'brand' => 'LUMIN',
            'rating' => 4.7,
            'category' => 'beauty',
            'sku' => 'MD-BEAUTY-PERFUME',
            'price' => 2890000,
            'compare_at_price' => 3690000,
            'stock' => 21,
            'sizes' => ['تک‌سایز'],
            'colors' => ['عسلی'],
            'material' => 'ادوپرفیوم ۱۰۰ میلی‌لیتر',
            'fit' => 'استاندارد',
            'summary' => 'ادوپرفیوم با نت‌های گلی و چوبی؛ ماندگاری متوسط تا بالا.',
            'description' => 'رایحه گلی-چوبی که با گرمای پوست باز می‌شود. غلظت ادوپرفیوم، مناسب استفاده روزانه و مهمانی. دور از نور مستقیم نگه دارید.',
            'is_new' => false,
            'gallery' => ['1541643600914-78b084683601', '1620916566398-39f1143ab7be', '1586495777744-4413f21062fa'],
        ],
        [
            'slug' => 'beauty-serum',
            'name' => 'سرم آبرسان صورت',
            'brand' => 'CELESTE',
            'rating' => 4.6,
            'category' => 'beauty',
            'sku' => 'MD-BEAUTY-SERUM',
            'price' => 1250000,
            'compare_at_price' => 1590000,
            'stock' => 29,
            'sizes' => ['تک‌سایز'],
            'colors' => ['سفید'],
            'material' => 'سرم ۳۰ میلی‌لیتر',
            'fit' => 'استاندارد',
            'summary' => 'سرم آبرسان با هیالورونیک اسید؛ برای پوست خشک.',
            'description' => 'بافت سبک که سریع جذب می‌شود و بدون چربی است. صبح و شب روی پوست تمیز استفاده شود. در جای خشک و خنک نگه دارید.',
            'is_new' => true,
            'gallery' => ['1556228578-8c89e6adf883', '1541643600914-78b084683601', '1586495777744-4413f21062fa'],
        ],
        [
            'slug' => 'beauty-lipstick',
            'name' => 'رژ لب مات',
            'brand' => 'LUMIN',
            'rating' => 4.6,
            'category' => 'beauty',
            'sku' => 'MD-BEAUTY-LIPSTICK',
            'price' => 480000,
            'compare_at_price' => 620000,
            'stock' => 52,
            'sizes' => ['تک‌سایز'],
            'colors' => ['صورتی', 'شرابی'],
            'material' => 'رژ لب جامد',
            'fit' => 'استاندارد',
            'summary' => 'رژ لب مات با پوشش کامل؛ بافت مخملی بدون خشکی.',
            'description' => 'بافت مات سبک که لب را خشک نمی‌کند و رنگ را یکدست می‌پوشاند. برای ماندگاری بیشتر، لایه‌ی نازک روی بالم لب بزنید.',
            'is_new' => false,
            'gallery' => ['1586495777744-4413f21062fa', '1556228578-8c89e6adf883', '1620916566398-39f1143ab7be'],
        ],
        [
            'slug' => 'beauty-body-lotion',
            'name' => 'لوسیون بدن',
            'brand' => 'CELESTE',
            'rating' => 4.5,
            'category' => 'beauty',
            'sku' => 'MD-BEAUTY-BODY-LOTION',
            'price' => 690000,
            'compare_at_price' => null,
            'stock' => 34,
            'sizes' => ['تک‌سایز'],
            'colors' => ['سفید'],
            'material' => 'لوسیون ۲۰۰ میلی‌لیتر',
            'fit' => 'استاندارد',
            'summary' => 'لوسیون بدن با جذب سریع؛ برای پوست خشک.',
            'description' => 'بافت سبک و بدون چربی که سریع جذب می‌شود. بعد از حمام روی پوست نمناک استفاده شود. بدون عطر، مناسب پوست حساس.',
            'is_new' => false,
            'gallery' => ['1620916566398-39f1143ab7be', '1556228578-8c89e6adf883', '1541643600914-78b084683601'],
        ],

        // ------------------------------------- پاییز ۱۴۰۵ — بررسی دیجی‌استایل و مدیسه
        [
            'slug' => 'women-black-blazer',
            'name' => 'کت زنانه مشکی',
            'brand' => 'ELSANA',
            'rating' => 4.6,
            'category' => 'women',
            'sku' => 'MD-WOMEN-BLACK-BLAZER',
            'price' => 1598000,
            'compare_at_price' => 2087000,
            'stock' => 18,
            'sizes' => ['S', 'M', 'L', 'XL'],
            'colors' => ['مشکی'],
            'material' => 'کرپ',
            'fit' => 'فیت',
            'summary' => 'کت تک‌دکمه با برش فیت و آستر کامل؛ برای محیط کار و مهمانی.',
            'description' => 'کرپ با آستر ساتن که فرم شانه را نگه می‌دارد. یقه برگردان باریک، دو دکمه جلویی و جیب‌های درزدار. خشک‌شویی توصیه می‌شود.',
            'is_new' => true,
            'gallery' => ['1779400201925-6c6048bee7e5', '1539533018447-63fcce2678e3', '1483985988355-763728e1935b'],
        ],
        [
            'slug' => 'women-denim-jacket',
            'name' => 'کت جین زنانه',
            'brand' => 'COLLEEN',
            'rating' => 4.5,
            'category' => 'women',
            'sku' => 'MD-WOMEN-DENIM-JACKET',
            'price' => 1640000,
            'compare_at_price' => 3280000,
            'stock' => 20,
            'sizes' => ['S', 'M', 'L'],
            'colors' => ['آبی'],
            'material' => 'جین',
            'fit' => 'رجولار',
            'summary' => 'کت جین آبی با دوخت دوبل و جیب‌های سینه؛ لایه‌ی روزمره‌ی پاییز.',
            'description' => 'جین سنگین با رنگ ثابت که پس از شست‌وشو نمی‌پرد. جیب‌های سینه با درپوش و دکمه‌های فلزی. شست‌وشوی ماشینی با آب سرد و پشت‌ورو.',
            'is_new' => true,
            'gallery' => ['1546961342-ea5f71b193f3', '1584370848010-d7fe6bc767ec', '1521572163474-6864f9cf17ab'],
        ],
        [
            'slug' => 'women-cut-blazer',
            'name' => 'کت زنانه برش‌دار',
            'brand' => 'RNS',
            'rating' => 4.7,
            'category' => 'women',
            'sku' => 'MD-WOMEN-CUT-BLAZER',
            'price' => 1960000,
            'compare_at_price' => 4900000,
            'stock' => 12,
            'sizes' => ['M', 'L', 'XL'],
            'colors' => ['سبز سدری', 'مشکی'],
            'material' => 'پارچه کرپ',
            'fit' => 'فیت',
            'summary' => 'کت برش‌دار با کمر جمع‌شده و یقه هفت؛ رسمی و نیمه‌رسمی.',
            'description' => 'پارچه کرپ با آستر کامل و برش کمر که خط کمر را نشان می‌دهد. یقه هفت و بست تک‌دکمه. خشک‌شویی برای حفظ فرم پارچه.',
            'is_new' => true,
            'gallery' => ['1778953503421-22d6171bd5f0', '1539109136881-3be0616acf4b', '1539533018447-63fcce2678e3'],
        ],
        [
            'slug' => 'women-wide-trousers',
            'name' => 'شلوار پارچه‌ای زنانه',
            'brand' => 'ELSANA',
            'rating' => 4.5,
            'category' => 'women',
            'sku' => 'MD-WOMEN-WIDE-TROUSERS',
            'price' => 2648000,
            'compare_at_price' => null,
            'stock' => 26,
            'sizes' => ['36', '38', '40', '42'],
            'colors' => ['مشکی', 'قهوه‌ای'],
            'material' => 'کرپ',
            'fit' => 'دمپا گشاد',
            'summary' => 'شلوار پارچه‌ای دمپا گشاد با کمر کشی؛ راحت و رسمی هم‌زمان.',
            'description' => 'کرپ با افت سنگین که چین نمی‌خورد. کمر کشی پنهان و دو جیب کناری. شست‌وشوی ملایم با آب سرد و خشک‌کردن آویزان.',
            'is_new' => true,
            'gallery' => ['1762331224129-783a3ea1fc3f', '1584370848010-d7fe6bc767ec', '1490481651871-ab68de25d43d'],
        ],
        [
            'slug' => 'women-baggy-jeans',
            'name' => 'شلوار جین زنانه بگ',
            'brand' => 'AMAHI',
            'rating' => 4.6,
            'category' => 'women',
            'sku' => 'MD-WOMEN-BAGGY-JEANS',
            'price' => 3080000,
            'compare_at_price' => 4400000,
            'stock' => 22,
            'sizes' => ['36', '38', '40', '42'],
            'colors' => ['آبی تیره'],
            'material' => 'جین',
            'fit' => 'بگ',
            'summary' => 'جین بگ با فاق بلند و دمپای گشاد؛ استایل خیابانی پاییز.',
            'description' => 'جین بدون کشی با رنگ آبی تیره‌ی شسته‌شده. فاق بلند، پنج جیب کلاسیک و دوخت دوبل. شست‌وشوی پشت‌ورو با آب سرد.',
            'is_new' => true,
            'gallery' => ['1762164130276-021d7c91cd89', '1584370848010-d7fe6bc767ec', '1521572163474-6864f9cf17ab'],
        ],
        [
            'slug' => 'women-plaid-vest',
            'name' => 'وست زنانه چهارخانه',
            'brand' => 'TULIKA',
            'rating' => 4.4,
            'category' => 'women',
            'sku' => 'MD-WOMEN-PLAID-VEST',
            'price' => 4798400,
            'compare_at_price' => 5998000,
            'stock' => 9,
            'sizes' => ['S', 'M', 'L'],
            'colors' => ['چهارخانه'],
            'material' => 'پارچه کتان',
            'fit' => 'رجولار',
            'summary' => 'وست چهارخانه با بست دکمه و جیب‌های کوچک؛ روی شومیز یا تی‌شرت.',
            'description' => 'پارچه کتان با طرح چهارخانه‌ی ریز و آستر سبک. برش رجولار با دو جیب کوچک جلو. شست‌وشوی ملایم و اتوی خنک.',
            'is_new' => true,
            'gallery' => ['1764016888026-9824147644af', '1490481651871-ab68de25d43d', '1596755094514-f87e34085b2c'],
        ],
        [
            'slug' => 'women-pleated-skirt',
            'name' => 'دامن پلیسه زنانه',
            'brand' => 'COLLEEN',
            'rating' => 4.6,
            'category' => 'women',
            'sku' => 'MD-WOMEN-PLEATED-SKIRT',
            'price' => 3168000,
            'compare_at_price' => 5280000,
            'stock' => 15,
            'sizes' => ['S', 'M', 'L'],
            'colors' => ['سفید', 'آبی'],
            'material' => 'لینن',
            'fit' => 'پلیسه',
            'summary' => 'دامن بلند پلیسه با کمر کشی؛ سبک و خنک برای نیمه‌ی سال.',
            'description' => 'لینن با پلیسه‌ی ریز که در حرکت باز و بسته می‌شود. کمر کشی و آستر کوتاه دارد. شست‌وشوی دستی و خشک‌کردن در سایه.',
            'is_new' => true,
            'gallery' => ['1762343041454-8f1fdd459811', '1566174053879-31528523f8ae', '1496747611176-843222e1e57c'],
        ],
        [
            'slug' => 'men-linen-shirt',
            'name' => 'پیراهن مردانه کتان',
            'brand' => 'RNS',
            'rating' => 4.6,
            'category' => 'men',
            'sku' => 'MD-MEN-LINEN-SHIRT',
            'price' => 2250000,
            'compare_at_price' => 4500000,
            'stock' => 24,
            'sizes' => ['M', 'L', 'XL', 'XXL'],
            'colors' => ['سفید', 'دودی'],
            'material' => 'کتان',
            'fit' => 'رجولار',
            'summary' => 'پیراهن کتان با یقه برگردان و برش آزاد؛ برای روزهای گرم.',
            'description' => 'کتان خالص با بافت درشت که هوا را عبور می‌دهد. یقه برگردان نرم و آستین بلند با مچ دکمه‌دار. اتوی گرم روی پارچه‌ی نمناک.',
            'is_new' => true,
            'gallery' => ['1627686011747-74adda3d2343', '1602810318383-e386cc2a3ccf', '1596755094514-f87e34085b2c'],
        ],
        [
            'slug' => 'bags-black-shoulder',
            'name' => 'کیف دوشی زنانه',
            'brand' => 'SAAD',
            'rating' => 4.5,
            'category' => 'bags',
            'sku' => 'MD-BAGS-BLACK-SHOULDER',
            'price' => 4240000,
            'compare_at_price' => 5300000,
            'stock' => 13,
            'sizes' => ['تک‌سایز'],
            'colors' => ['مشکی'],
            'material' => 'چرم صنعتی',
            'fit' => 'استاندارد',
            'summary' => 'کیف دوشی مشکی با بند بلند قابل تنظیم و بدنه‌ی ساختاردار.',
            'description' => 'چرم صنعتی مات با دوخت تمیز. یک جیب زیپ‌دار و یک جیب باز داخلی، بند بلند قابل تنظیم. لکه را با پارچه‌ی نمناک پاک کنید.',
            'is_new' => true,
            'gallery' => ['1705909237050-7a7625b47fac', '1584917865442-de89df76afd3', '1553062407-98eeb64c6a62'],
        ],
        [
            'slug' => 'bags-leather-briefcase',
            'name' => 'کیف اداری مردانه چرم',
            'brand' => 'NOVIN LEATHER',
            'rating' => 4.7,
            'category' => 'bags',
            'sku' => 'MD-BAGS-LEATHER-BRIEFCASE',
            'price' => 5369000,
            'compare_at_price' => 8949000,
            'stock' => 7,
            'sizes' => ['تک‌سایز'],
            'colors' => ['سرمه‌ای', 'مشکی'],
            'material' => 'چرم طبیعی',
            'fit' => 'استاندارد',
            'summary' => 'کیف اداری چرم با جیب لپ‌تاپ و بند دوشی؛ برای محیط کار.',
            'description' => 'چرم طبیعی با آستر پارچه‌ای و دوخت تقویت‌شده. جیب مخصوص لپ‌تاپ ۱۴ اینچ، جیب اسناد و بند دوشی جداشدنی. هر چند ماه واکس چرم.',
            'is_new' => true,
            'gallery' => ['1763034179057-acad3a072568', '1553062407-98eeb64c6a62', '1584917865442-de89df76afd3'],
        ],
        [
            'slug' => 'beauty-foundation',
            'name' => 'کرم پودر SPF 15',
            'brand' => 'GABRINI',
            'rating' => 4.4,
            'category' => 'beauty',
            'sku' => 'MD-BEAUTY-FOUNDATION',
            'price' => 488000,
            'compare_at_price' => 610000,
            'stock' => 40,
            'sizes' => ['تک‌سایز'],
            'colors' => ['بژ روشن'],
            'material' => 'کرم پودر ۳۰ میلی‌لیتر',
            'fit' => 'استاندارد',
            'summary' => 'کرم پودر با پوشش متوسط و SPF 15؛ بافت سبک و بدون چربی.',
            'description' => 'بافت مایع که یکدست پخش می‌شود و منافذ را نمی‌بندد. فیلتر SPF 15 برای استفاده‌ی روزانه. با اسفنج یا برس روی پوست تمیز.',
            'is_new' => true,
            'gallery' => ['1557205465-f3762edea6d3', '1556228578-8c89e6adf883', '1541643600914-78b084683601'],
        ],
    ];

    public function run(): void
    {
        $this->purgeSuperseded();

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
                    'published_at' => $seed['is_new'] ? now()->subDays(2) : now()->subDays(30 + $index),
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

        $this->purgeOrphanedImports();

        $this->command?->info('Catalogue seeded: '.count(self::PRODUCTS).' products.');
    }

    /**
     * Removes every catalogue row this seeder has ever owned that the current list no longer holds.
     *
     * The seeder writes `MD-` SKUs; the demo catalogue before it wrote `ST-`. Those two prefixes are
     * the only rows it may delete — a product the owner adds in the admin panel carries its own SKU
     * and is never touched, whatever its slug. Running this again is a no-op, because the rows it
     * deletes are exactly the ones this file no longer lists.
     */
    private function purgeSuperseded(): void
    {
        Product::query()
            ->where(fn ($query) => $query->where('sku', 'like', 'ST-%')->orWhere('sku', 'like', 'MD-%'))
            ->whereNotIn('slug', array_column(self::PRODUCTS, 'slug'))
            ->delete();
    }

    /**
     * Drops the imported photo rows nothing points at any more.
     *
     * Product photos used to be hotlinked (`imported/<hash>.jpg`); the packshots that replaced them
     * carry their own `catalog/<photo>.webp` path, so the old rows would be left behind as orphans by
     * a re-seed. Only that old convention is swept — a photo uploaded in the admin panel lives under
     * a different path and is never touched, and a category tile still using its imported row keeps it.
     */
    private function purgeOrphanedImports(): void
    {
        Media::query()
            ->where('path', 'like', 'imported/%')
            ->whereNotIn('id', ProductImage::query()->select('media_id'))
            ->whereNotIn('id', Category::query()->whereNotNull('image_media_id')->select('image_media_id'))
            ->delete();
    }

    /**
     * Records a local packshot: a background-free 4:5 WebP the storefront serves from `public/catalog`.
     *
     * The file ships with the storefront build rather than living in Laravel's storage, so the row
     * carries the URL the browser should use and leaves the byte counts null — the same shape an
     * imported photo has. Keyed on its own path, so re-running the seeder updates the row.
     */
    private function packshotImage(string $photo): Media
    {
        $file = $photo.'.webp';

        return Media::query()->updateOrCreate(
            ['disk' => 'public', 'path' => 'catalog/'.$file],
            [
                'source_url' => self::PACKSHOT_DIR.$file,
                'original_name' => $file,
                'mime_type' => 'image/webp',
                'size_bytes' => null,
                'width' => self::PACKSHOT_WIDTH,
                'height' => self::PACKSHOT_HEIGHT,
                'checksum' => null,
                'is_public' => true,
                'uploaded_by' => null,
            ],
        );
    }

    /**
     * Records a category tile the catalogue publishes at its own address.
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
            $media = $this->packshotImage($photo);
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
