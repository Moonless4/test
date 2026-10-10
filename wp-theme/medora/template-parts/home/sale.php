<?php
/**
 * The special offer section.
 *
 * The products are WooCommerce sale products filtered by the configured minimum discount — the
 * percentage is computed from each product's regular and sale price, never stored. The countdown
 * counts down to the real end of the sale as WooCommerce recorded it; when no product carries an
 * end date the panel shows the promotion without a timer, and when no product qualifies the whole
 * section disappears.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

$medora_sale_products = medora_sale_products();

if ( ! $medora_sale_products ) {
	return;
}

$medora_end      = medora_sale_end_timestamp( $medora_sale_products );
$medora_min      = (int) medora_setting( 'min_discount' );
$medora_end_date = $medora_end ? medora_to_fa( wp_date( 'j F Y', $medora_end ) ) : '';
?>
<section class="mt-12 bg-white py-10 sm:mt-16 sm:py-14" id="discounts" aria-label="<?php esc_attr_e( 'تخفیف‌های ویژه', 'medora' ); ?>">
	<div class="container">
		<div class="reveal">
			<div class="flex flex-col items-stretch gap-3 lg:flex-row lg:gap-4">
				<?php get_template_part( 'template-parts/home/countdown', null, array( 'end' => $medora_end, 'end_date' => $medora_end_date ) ); ?>

				<div class="no-scrollbar flex min-w-0 flex-1 cursor-grab select-none gap-3 overflow-x-auto pb-1 active:cursor-grabbing xl:gap-4" data-medora-rail>
					<?php foreach ( $medora_sale_products as $medora_product ) : ?>
						<div class="w-[150px] shrink-0 sm:w-[164px] xl:w-[calc((100%-64px)/5)]">
							<?php medora_product_card( $medora_product ); ?>
						</div>
					<?php endforeach; ?>
				</div>

				<button type="button" data-medora-rail-next aria-label="<?php esc_attr_e( 'محصولات تخفیف‌دار بعدی', 'medora' ); ?>" class="hidden h-11 w-11 shrink-0 items-center justify-center self-center rounded-full border border-line bg-white text-cocoa shadow-lift transition-colors hover:bg-cream lg:flex">
					<?php echo medora_icon( 'chevron-left', 'h-5 w-5' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				</button>
			</div>

			<p class="mt-4 text-center text-[11.5px] text-muted lg:text-start">
				<?php
				printf(
					/* translators: %s: minimum discount percentage. */
					esc_html__( 'فقط کالاهایی با تخفیف %s درصد و بیشتر.', 'medora' ),
					esc_html( medora_to_fa( $medora_min ) )
				);
				?>
			</p>
		</div>
	</div>
</section>
