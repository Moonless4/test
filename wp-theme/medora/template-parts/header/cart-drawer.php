<?php
/**
 * The cart drawer. Its body is WooCommerce's own mini cart template, so the drawer shows the
 * real cart — the same one the cart page and the checkout read.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

if ( ! medora_has_woocommerce() ) {
	return;
}
?>
<div class="fixed inset-0 z-[80] hidden" data-medora-cart-drawer aria-hidden="true">
	<button type="button" data-medora-cart-close aria-label="<?php esc_attr_e( 'بستن سبد خرید', 'medora' ); ?>" class="absolute inset-0 h-full w-full bg-teal-950/50 backdrop-blur-sm"></button>

	<div class="absolute inset-y-0 end-0 flex w-full max-w-[420px] flex-col bg-white shadow-2xl" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'سبد خرید', 'medora' ); ?>">
		<div class="flex items-center justify-between gap-3 border-b border-line px-4 py-4">
			<h2 class="text-[15px] font-bold text-ink"><?php esc_html_e( 'سبد خرید', 'medora' ); ?></h2>
			<button type="button" data-medora-cart-close aria-label="<?php esc_attr_e( 'بستن', 'medora' ); ?>" class="flex h-9 w-9 items-center justify-center rounded-xl bg-cream text-ink transition-colors hover:bg-line">
				<?php echo medora_icon( 'x', 'h-4 w-4' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</button>
		</div>

		<div class="medora-mini-cart-body flex-1 overflow-y-auto px-4 py-4">
			<?php woocommerce_mini_cart(); ?>
		</div>

		<div class="flex items-center gap-2 border-t border-line px-4 py-4">
			<a href="<?php echo esc_url( wc_get_cart_url() ); ?>" class="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-teal-800/25 text-[13px] font-medium text-black transition-colors hover:bg-teal-800 hover:text-white">
				<?php esc_html_e( 'مشاهدهٔ سبد', 'medora' ); ?>
			</a>
			<a href="<?php echo esc_url( wc_get_checkout_url() ); ?>" class="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-teal-800 text-[13px] font-medium text-white shadow-soft transition-colors hover:bg-teal-700">
				<?php esc_html_e( 'تسویه حساب', 'medora' ); ?>
			</a>
		</div>
	</div>
</div>
