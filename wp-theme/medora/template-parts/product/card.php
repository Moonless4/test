<?php
/**
 * The product card.
 *
 * One card for every surface — the homepage rails, the shop loop, related products and search —
 * so a product cannot look like two different products depending on where it is found. The price
 * block is the shared helper, which carries the store's price rule.
 *
 * @package Medora
 *
 * @var array $args { product: WC_Product, args: array }
 */

defined( 'ABSPATH' ) || exit;

$product = isset( $args['product'] ) ? $args['product'] : null;

if ( ! $product instanceof WC_Product ) {
	return;
}

$permalink = get_permalink( $product->get_id() );
$discount  = medora_discount_percent( $product );
$is_new    = medora_is_new( $product ) && ! $product->is_on_sale();
$rating    = (int) $product->get_average_rating();
$reviews   = (int) $product->get_review_count();
?>
<article class="relative flex h-full flex-col overflow-hidden rounded-lg bg-white" aria-label="<?php echo esc_attr( $product->get_name() ); ?>">
	<div class="relative overflow-hidden">
		<a href="<?php echo esc_url( $permalink ); ?>" aria-label="<?php echo esc_attr( $product->get_name() ); ?>" tabindex="-1">
			<div class="aspect-[4/5] w-full overflow-hidden bg-cream">
				<?php
				echo $product->get_image( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- WooCommerce markup.
					'medora-card',
					array(
						'class'    => 'h-full w-full object-cover',
						'loading'  => 'lazy',
						'decoding' => 'async',
						'alt'      => $product->get_name(),
					)
				);
				?>
			</div>
		</a>

		<?php if ( $is_new ) : ?>
			<span class="pointer-events-none absolute top-2 end-2 rounded-md bg-teal-800 px-2 py-0.5 text-[10px] font-medium text-white"><?php esc_html_e( 'جدید', 'medora' ); ?></span>
		<?php elseif ( ! $product->is_in_stock() ) : ?>
			<span class="pointer-events-none absolute top-2 end-2 rounded-md bg-ink/80 px-2 py-0.5 text-[10px] font-medium text-white"><?php esc_html_e( 'ناموجود', 'medora' ); ?></span>
		<?php endif; ?>
	</div>

	<div class="flex flex-1 flex-col gap-1.5 p-2.5">
		<a href="<?php echo esc_url( $permalink ); ?>" class="line-clamp-2 min-h-[2.5em] text-start text-[12px] font-medium leading-5 text-ink sm:text-[13px]">
			<?php echo esc_html( $product->get_name() ); ?>
		</a>

		<?php if ( $rating > 0 && $reviews > 0 ) : ?>
			<div class="flex min-w-0 items-center gap-1 text-[11px]" role="img" aria-label="<?php echo esc_attr( sprintf( __( 'امتیاز %1$s از ۵ از %2$s نظر', 'medora' ), medora_to_fa( number_format( $rating, 1 ) ), medora_to_fa( $reviews ) ) ); ?>">
				<span class="text-gold"><?php echo medora_icon( 'star', 'h-3.5 w-3.5 fill-current' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
				<span class="font-medium text-ink"><?php echo esc_html( medora_to_fa( number_format( $rating, 1 ) ) ); ?></span>
				<span class="truncate text-muted">(<?php echo esc_html( medora_to_fa( $reviews ) ); ?>)</span>
			</div>
		<?php endif; ?>

		<div class="mt-auto flex justify-end pt-1">
			<?php echo medora_price_display( $product, array( 'size' => 'sm', 'align' => 'end' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped inside the helper. ?>
		</div>
	</div>
</article>
