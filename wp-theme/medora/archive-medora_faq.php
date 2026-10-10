<?php
/**
 * The FAQ archive (its entries are public, so /faq works out of the box).
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="primary" class="medora-main container flex-1 py-8">
	<header class="mb-8 max-w-2xl">
		<h1 class="text-xl font-bold text-ink sm:text-2xl lg:text-[28px]"><?php post_type_archive_title(); ?></h1>
		<span class="mt-3 block h-1 w-12 rounded-full bg-teal-800"></span>
		<p class="mt-4 text-[13px] leading-7 text-muted">
			<?php esc_html_e( 'پرسش‌های پرتکرار دربارهٔ خرید، ارسال، پرداخت و بازگشت کالا. اگر پاسخ پرسش‌تان را پیدا نکردید، با پشتیبانی تماس بگیرید.', 'medora' ); ?>
		</p>
	</header>

	<?php get_template_part( 'template-parts/faq/page' ); ?>
</main>
<?php
get_footer();
