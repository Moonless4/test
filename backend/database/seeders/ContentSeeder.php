<?php

namespace Database\Seeders;

use App\Models\Faq;
use App\Models\Page;
use App\Models\Post;
use Illuminate\Database\Seeder;

/**
 * The content the storefront reads: a few static pages, one blog post and the FAQ groups.
 *
 * Bodies are plain text, never HTML: the API does not emit markup, so a post cannot become a
 * stored-XSS vector for the frontend and the frontend stays free to render it however it likes.
 */
class ContentSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'slug' => 'about',
                'title' => 'درباره مدورا',
                'body' => "مدورا فروشگاه پوشاک و اکسسوری است که با تمرکز بر کیفیت دوخت و انتخاب پارچه فعالیت می‌کند.\n\nهمه سفارش‌ها پیش از ارسال بررسی می‌شوند و امکان بازگشت کالا تا هفت روز وجود دارد.",
            ],
            [
                'slug' => 'terms',
                'title' => 'شرایط و قوانین',
                'body' => "ثبت سفارش در مدورا به معنی پذیرش شرایط زیر است.\n\n۱. قیمت‌ها به تومان و شامل مالیات است.\n۲. بازگشت کالا تا هفت روز پس از دریافت، در صورت سالم بودن بسته‌بندی، پذیرفته می‌شود.\n۳. هزینه ارسال برای سفارش‌های بالای سقف تعیین‌شده بر عهده فروشگاه است.",
            ],
            [
                'slug' => 'shipping',
                'title' => 'شیوه‌های ارسال',
                'body' => "سفارش‌ها پس از تأیید پرداخت، حداکثر تا دو روز کاری بسته‌بندی و تحویل پست یا پیک می‌شوند.\n\nشماره رهگیری پس از ارسال برای شما پیامک می‌شود.",
            ],
        ];

        foreach ($pages as $page) {
            Page::query()->updateOrCreate(
                ['slug' => $page['slug']],
                [
                    'title' => $page['title'],
                    'body' => $page['body'],
                    'status' => Page::STATUS_PUBLISHED,
                    'published_at' => now()->subDays(10),
                ],
            );
        }

        Post::query()->updateOrCreate(
            ['slug' => 'how-to-choose-a-coat'],
            [
                'title' => 'راهنمای انتخاب پالتو مناسب فصل',
                'excerpt' => 'چند نکته ساده برای اینکه پالتویی بخرید که هم اندازه باشد و هم سال‌ها بماند.',
                'body' => "انتخاب پالتو پیش از هر چیز به جنس پارچه بستگی دارد: پشم فشرده گرم‌تر است و ماندگاری بیشتری دارد.\n\nطول آستین باید تا مچ برسد و در حالت ایستاده کمی بالاتر از انگشت شست قرار بگیرد.\n\nرنگ‌های خنثی مثل مشکی، سرمه‌ای و بژ بیشترین هماهنگی را با بقیه لباس‌ها دارند.",
                'status' => Post::STATUS_PUBLISHED,
                'published_at' => now()->subDays(5),
                'tags' => ['راهنمای خرید', 'پالتو'],
            ],
        );

        $faqs = [
            ['group' => 'orders', 'question' => 'چطور سفارشم را پیگیری کنم؟', 'answer' => 'پس از ثبت سفارش، شماره سفارش را نزد خود نگه دارید. با شماره سفارش می‌توانید وضعیت پردازش را ببینید و شماره رهگیری پستی بعد از ارسال برای شما ارسال می‌شود.'],
            ['group' => 'orders', 'question' => 'اگر پرداخت را انجام دهم و صفحه را ببندم چه می‌شود؟', 'answer' => 'پرداخت شما در سرور تأیید و ثبت می‌شود. با ورود به حساب کاربری، سفارش در فهرست سفارش‌های شما با وضعیت «پرداخت‌شده» نمایش داده می‌شود.'],
            ['group' => 'shipping', 'question' => 'هزینه ارسال چقدر است؟', 'answer' => 'هزینه ارسال برای سفارش‌های زیر سقف تعیین‌شده ثابت است و برای سفارش‌های بالای آن، ارسال بر عهده فروشگاه است. مبلغ دقیق پیش از پرداخت در سبد خرید نمایش داده می‌شود.'],
            ['group' => 'returns', 'question' => 'شرایط بازگشت کالا چیست؟', 'answer' => 'تا هفت روز پس از دریافت، در صورتی که کالا استفاده نشده و بسته‌بندی سالم باشد، بازگشت پذیرفته می‌شود.'],
            ['group' => 'account', 'question' => 'رمز عبورم را فراموش کرده‌ام.', 'answer' => 'از صفحه ورود، گزینه «فراموشی رمز عبور» را انتخاب کنید و ایمیل حساب خود را وارد کنید. پیوند بازیابی رمز برای شما ارسال می‌شود.'],
        ];

        foreach ($faqs as $index => $faq) {
            Faq::query()->updateOrCreate(
                ['question' => $faq['question']],
                [
                    'group' => $faq['group'],
                    'answer' => $faq['answer'],
                    'position' => $index,
                    'is_active' => true,
                ],
            );
        }

        $this->command?->info('Content seeded.');
    }
}
