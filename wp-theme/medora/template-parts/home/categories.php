<?php
/**
 * Category tiles. The categories are WooCommerce product categories with their own images, so
 * the rail follows the shop's catalogue.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

$medora_categories = medora_top_categories( (int) medora_setting( 'categories_limit', 6 ) );

if ( ! $medora_categories ) {
	return;
}
?>
<section class="container mt-10 sm:mt-14" aria-label="<?php esc_attr_e( 'دسته‌بندی‌ها', 'medora' ); ?>">
	<div class="flex items-center gap-3 sm:gap-4">
		<div class="no-scrollbar flex min-w-0 flex-1 cursor-grab select-none gap-3 overflow-x-auto pb-1 active:cursor-grabbing sm:gap-4 lg:grid lg:grid-cols-6 lg:overflow-visible lg:pb-0" data-medora-rail>
			<?php foreach ( $medora_categories as $medora_index => $medora_category ) : ?>
				<div class="w-[136px] shrink-0 sm:w-[168px] lg:w-auto">
					<div class="reveal" style="transition-delay: <?php echo esc_attr( min( $medora_index * 60, 360 ) ); ?>ms">
						<a href="<?php echo esc_url( $medora_category['url'] ); ?>" class="group flex flex-col items-center text-center transition-transform duration-500 ease-out group-hover:-translate-y-1">
							<?php echo medora_image( $medora_category['image_id'], 'medora-square', array( 'class' => 'aspect-square w-full rounded-lg bg-cream object-cover shadow-soft', 'alt' => '' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							<h3 class="mt-2.5 text-[13px] font-bold text-ink transition-colors duration-300 group-hover:text-black sm:text-sm lg:text-[15px]">
								<?php echo esc_html( $medora_category['term']->name ); ?>
							</h3>
							<span class="mt-0.5 text-[11px] text-muted"><?php echo esc_html( sprintf( __( '%s کالا', 'medora' ), medora_to_fa( $medora_category['term']->count ) ) ); ?></span>
						</a>
					</div>
				</div>
			<?php endforeach; ?>
		</div>

		<button type="button" data-medora-rail-next aria-label="<?php esc_attr_e( 'دسته‌بندی‌های بعدی', 'medora' ); ?>" class="hidden h-11 w-11 shrink-0 items-center justify-center self-center rounded-full border border-line bg-white text-cocoa shadow-lift transition-colors hover:bg-cream sm:flex lg:hidden">
			<?php echo medora_icon( 'chevron-left', 'h-5 w-5' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		</button>
	</div>
</section>
