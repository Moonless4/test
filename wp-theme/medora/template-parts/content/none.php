<?php
/**
 * The "nothing here" state, used by archives and search.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;
?>
<div class="rounded-panel border border-line bg-cream px-6 py-12 text-center">
	<h2 class="text-lg font-bold text-ink"><?php esc_html_e( 'چیزی پیدا نشد', 'medora' ); ?></h2>
	<p class="mt-2 text-[13px] text-muted">
		<?php esc_html_e( 'عبارت دیگری را جستجو کنید یا از دسته‌بندی‌های فروشگاه شروع کنید.', 'medora' ); ?>
	</p>

	<div class="mx-auto mt-5 max-w-md">
		<?php
		if ( medora_has_woocommerce() ) {
			get_product_search_form();
		} else {
			get_search_form();
		}
		?>
	</div>

	<a href="<?php echo esc_url( medora_shop_url() ); ?>" class="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-teal-800 px-6 text-[13px] font-medium text-white shadow-soft transition-colors hover:bg-teal-700">
		<?php esc_html_e( 'مشاهدهٔ همهٔ محصولات', 'medora' ); ?>
	</a>
</div>
