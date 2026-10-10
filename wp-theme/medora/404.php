<?php
/**
 * 404 — a search box and the shop's own entries, rather than a dead end.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="primary" class="medora-main container flex-1 py-14">
	<div class="mx-auto max-w-xl text-center">
		<p class="text-[42px] font-black text-teal-800"><?php echo esc_html( medora_to_fa( '404' ) ); ?></p>
		<h1 class="mt-2 text-xl font-bold text-ink sm:text-2xl"><?php esc_html_e( 'این صفحه پیدا نشد', 'medora' ); ?></h1>
		<p class="mt-3 text-[13px] leading-7 text-muted">
			<?php esc_html_e( 'ممکن است نشانی تغییر کرده باشد یا محصول از فروشگاه برداشته شده باشد. با جستجو یا از دسته‌بندی‌ها پیدا کنید.', 'medora' ); ?>
		</p>

		<div class="mx-auto mt-6 max-w-md">
			<?php
			if ( medora_has_woocommerce() ) {
				get_product_search_form();
			} else {
				get_search_form();
			}
			?>
		</div>

		<div class="mt-6 flex flex-wrap items-center justify-center gap-2">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="rounded-full border border-line bg-white px-4 py-2 text-[12.5px] text-ink transition-colors hover:border-teal-300"><?php esc_html_e( 'صفحهٔ اصلی', 'medora' ); ?></a>
			<a href="<?php echo esc_url( medora_shop_url() ); ?>" class="rounded-full border border-line bg-white px-4 py-2 text-[12.5px] text-ink transition-colors hover:border-teal-300"><?php esc_html_e( 'فروشگاه', 'medora' ); ?></a>
			<?php foreach ( medora_top_categories( 3 ) as $medora_category ) : ?>
				<a href="<?php echo esc_url( $medora_category['url'] ); ?>" class="rounded-full border border-line bg-white px-4 py-2 text-[12.5px] text-ink transition-colors hover:border-teal-300"><?php echo esc_html( $medora_category['term']->name ); ?></a>
			<?php endforeach; ?>
		</div>
	</div>

	<?php
	$medora_popular = medora_best_sellers( 4 );

	if ( $medora_popular ) {
		get_template_part(
			'template-parts/product/rail',
			null,
			array(
				'products'   => $medora_popular,
				'title'      => __( 'پرفروش‌ترین‌ها', 'medora' ),
				'eyebrow'    => __( 'پیشنهاد ما', 'medora' ),
				'link_url'   => medora_shop_url(),
				'link_label' => __( 'مشاهده همه', 'medora' ),
			)
		);
	}
	?>
</main>
<?php
get_footer();
