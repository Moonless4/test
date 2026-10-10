<?php
/**
 * The phone and tablet bottom bar: cart, categories, the brand mark, wishlist and account.
 * Hidden from 769px up, where the header carries the same entries.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

$medora_wishlist   = get_theme_mod( 'medora_wishlist_url', '' );
$medora_shop_active = function_exists( 'is_shop' ) && ( is_shop() || is_product_taxonomy() || is_product() );
$medora_account    = medora_has_woocommerce() ? wc_get_page_permalink( 'myaccount' ) : admin_url();
?>
<div class="fixed inset-x-0 bottom-0 z-[60] min-[769px]:hidden" data-medora-tab-bar>
	<nav aria-label="<?php esc_attr_e( 'ناوبری موبایل', 'medora' ); ?>" class="border-t border-line bg-cream pb-[max(6px,env(safe-area-inset-bottom))]">
		<div class="mx-auto flex h-[62px] max-w-[640px] items-center px-2">
			<?php if ( medora_has_woocommerce() ) : ?>
				<button type="button" data-medora-cart-open class="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-1.5 text-[10.5px] font-medium text-ink/70 transition-colors hover:text-ink">
					<?php echo medora_icon( 'bag', 'h-5 w-5' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<?php esc_html_e( 'سبد خرید', 'medora' ); ?>
					<span class="absolute top-0 end-3 flex h-4 min-w-4 items-center justify-center">
						<span class="medora-cart-count medora-cart-count--sale"></span>
					</span>
				</button>
			<?php endif; ?>

			<button type="button" data-medora-category-open class="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-1.5 text-[10.5px] font-medium transition-colors <?php echo $medora_shop_active ? 'text-teal-800' : 'text-ink/70 hover:text-ink'; ?>">
				<?php echo medora_icon( 'grid', 'h-5 w-5' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<?php esc_html_e( 'دسته‌بندی', 'medora' ); ?>
			</button>

			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>" class="mx-1 flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-white ring-1 <?php echo is_front_page() ? 'ring-teal-800' : 'ring-line'; ?>">
				<img src="<?php echo esc_url( MEDORA_URI . '/assets/images/medora-mark.webp' ); ?>" alt="" width="96" height="72" class="h-6 w-auto">
			</a>

			<?php if ( $medora_wishlist ) : ?>
				<a href="<?php echo esc_url( $medora_wishlist ); ?>" class="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-1.5 text-[10.5px] font-medium text-ink/70 transition-colors hover:text-ink">
					<?php echo medora_icon( 'heart', 'h-5 w-5' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<?php esc_html_e( 'علاقه‌مندی', 'medora' ); ?>
				</a>
			<?php endif; ?>

			<a href="<?php echo esc_url( $medora_account ); ?>" class="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-1.5 text-[10.5px] font-medium transition-colors <?php echo ( function_exists( 'is_account_page' ) && is_account_page() ) ? 'text-teal-800' : 'text-ink/70 hover:text-ink'; ?>">
				<?php echo medora_icon( 'user', 'h-5 w-5' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<?php esc_html_e( 'پروفایل', 'medora' ); ?>
			</a>
		</div>
	</nav>
</div>
