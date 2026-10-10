<?php
/**
 * A rail of products: the section header plus a scrolling row. Used by every product section so
 * they cannot drift apart.
 *
 * @package Medora
 *
 * @var array $args { products: WC_Product[], title, eyebrow, link_url, link_label, id }
 */

defined( 'ABSPATH' ) || exit;

$medora_products = isset( $args['products'] ) ? $args['products'] : array();

if ( ! $medora_products ) {
	return;
}
?>
<section class="container mt-12 sm:mt-16" aria-label="<?php echo esc_attr( $args['title'] ); ?>">
	<?php
	medora_section_header(
		array(
			'title'      => $args['title'],
			'eyebrow'    => $args['eyebrow'],
			'link_url'   => $args['link_url'],
			'link_label' => isset( $args['link_label'] ) ? $args['link_label'] : __( 'مشاهده همه', 'medora' ),
		)
	);
	?>

	<div class="reveal">
		<div class="flex items-center gap-3 sm:gap-4">
			<div class="no-scrollbar flex min-w-0 flex-1 cursor-grab select-none snap-x gap-3 overflow-x-auto pb-1 active:cursor-grabbing sm:gap-4" data-medora-rail>
				<?php foreach ( $medora_products as $medora_product ) : ?>
					<div class="w-[150px] shrink-0 snap-start sm:w-[180px] lg:w-[calc((100%-48px)/4)] xl:w-[calc((100%-64px)/5)]">
						<?php medora_product_card( $medora_product ); ?>
					</div>
				<?php endforeach; ?>
			</div>

			<button type="button" data-medora-rail-next aria-label="<?php esc_attr_e( 'محصولات بعدی', 'medora' ); ?>" class="hidden h-11 w-11 shrink-0 items-center justify-center self-center rounded-full border border-line bg-white text-cocoa shadow-lift transition-colors hover:bg-cream lg:flex">
				<?php echo medora_icon( 'chevron-left', 'h-5 w-5' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</button>
		</div>
	</div>
</section>
