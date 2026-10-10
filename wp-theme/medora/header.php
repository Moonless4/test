<?php
/**
 * The header: the promotional strip, the logo, the product search, the account and cart entries
 * and the main menu with its mega panels. The menu is a real WordPress menu.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="theme-color" content="#123F50">
	<link rel="profile" href="https://gmpg.org/xfn/11">
	<?php wp_head(); ?>
</head>

<body <?php body_class( 'flex min-h-screen flex-col bg-white font-sans text-ink antialiased' ); ?>>
<?php wp_body_open(); ?>

<div id="page" class="flex min-h-screen flex-col">

	<a class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-[100] focus:rounded-lg focus:bg-teal-900 focus:px-4 focus:py-2 focus:text-white" href="#primary">
		<?php esc_html_e( 'پرش به محتوا', 'medora' ); ?>
	</a>

	<header id="masthead" class="sticky top-0 z-50 bg-white transition-shadow duration-300" data-medora-header>
		<?php
		$medora_note     = get_theme_mod( 'medora_header_note', '' );
		$medora_note_url = get_theme_mod( 'medora_header_note_url', '' );
		?>
		<?php if ( $medora_note ) : ?>
			<div class="bg-teal-900 text-white">
				<?php if ( $medora_note_url ) : ?>
					<a href="<?php echo esc_url( $medora_note_url ); ?>" class="container block py-2 text-center text-[12px] transition-opacity hover:opacity-90"><?php echo esc_html( $medora_note ); ?></a>
				<?php else : ?>
					<p class="container py-2 text-center text-[12px]"><?php echo esc_html( $medora_note ); ?></p>
				<?php endif; ?>
			</div>
		<?php endif; ?>

		<div class="container relative">
			<div class="flex h-[64px] items-center gap-3 lg:h-[74px] lg:gap-6">
				<div class="flex min-w-0 flex-1 items-center gap-3">
					<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="flex shrink-0 items-center" rel="home">
						<?php echo medora_logo( 'dark' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in the helper. ?>
					</a>

					<div class="hidden min-w-0 max-w-[620px] flex-1 lg:block">
						<?php
						if ( medora_has_woocommerce() ) {
							get_product_search_form();
						} else {
							get_search_form();
						}
						?>
					</div>
				</div>

				<div class="ms-auto flex items-center gap-1 lg:ms-0">
					<a href="<?php echo esc_url( home_url( '/?s=' ) ); ?>" aria-label="<?php esc_attr_e( 'جستجو', 'medora' ); ?>" class="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink transition-colors hover:bg-cream lg:hidden">
						<?php echo medora_icon( 'search', 'h-5 w-5' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					</a>

					<?php $medora_wishlist = get_theme_mod( 'medora_wishlist_url', '' ); ?>
					<?php if ( $medora_wishlist ) : ?>
						<a href="<?php echo esc_url( $medora_wishlist ); ?>" aria-label="<?php esc_attr_e( 'علاقه‌مندی‌ها', 'medora' ); ?>" class="relative hidden h-10 w-10 items-center justify-center rounded-xl text-ink transition-colors hover:bg-cream min-[769px]:flex">
							<?php echo medora_icon( 'heart', 'h-5 w-5' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						</a>
					<?php endif; ?>

					<?php if ( medora_has_woocommerce() ) : ?>
						<a href="<?php echo esc_url( wc_get_page_permalink( 'myaccount' ) ); ?>" aria-label="<?php esc_attr_e( 'حساب کاربری', 'medora' ); ?>" class="relative hidden h-10 w-10 items-center justify-center rounded-xl text-ink transition-colors hover:bg-cream min-[769px]:flex">
							<?php echo medora_icon( 'user', 'h-5 w-5' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						</a>

						<button type="button" data-medora-cart-open aria-label="<?php esc_attr_e( 'سبد خرید', 'medora' ); ?>" class="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink transition-colors hover:bg-cream">
							<?php echo medora_icon( 'bag', 'h-5 w-5' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							<?php medora_cart_count(); ?>
						</button>
					<?php else : ?>
						<a href="<?php echo esc_url( admin_url() ); ?>" aria-label="<?php esc_attr_e( 'پیشخوان', 'medora' ); ?>" class="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink transition-colors hover:bg-cream">
							<?php echo medora_icon( 'user', 'h-5 w-5' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						</a>
					<?php endif; ?>
				</div>
			</div>

			<?php
			$medora_tree = medora_menu_tree( 'primary' );

			if ( ! $medora_tree ) {
				$medora_tree = medora_menu_fallback_tree();
			}

			if ( $medora_tree ) :
				?>
				<nav class="hidden items-center gap-1 pb-2 min-[769px]:flex" aria-label="<?php esc_attr_e( 'ناوبری اصلی', 'medora' ); ?>" data-medora-nav>
					<ul class="flex flex-wrap items-center gap-1">
						<?php foreach ( $medora_tree as $medora_node ) : ?>
							<li class="medora-nav-item relative<?php echo $medora_node['children'] ? ' has-children' : ''; ?>"<?php echo $medora_node['children'] ? ' data-medora-menu-item' : ''; ?>>
								<a
									href="<?php echo esc_url( $medora_node['item']->url ); ?>"
									class="relative flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors xl:px-3 xl:text-sm <?php echo $medora_node['active'] ? 'text-black' : 'text-ink/75 hover:bg-cream hover:text-ink'; ?>"
									<?php echo $medora_node['children'] ? 'aria-haspopup="true" aria-expanded="false"' : ''; ?>
								>
									<?php echo esc_html( $medora_node['item']->title ); ?>
									<?php if ( $medora_node['children'] ) : ?>
										<?php echo medora_icon( 'chevron-down', 'h-3.5 w-3.5 opacity-60' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
									<?php endif; ?>
									<?php if ( ! empty( $medora_node['promo']['badge'] ) ) : ?>
										<span class="rounded-md bg-sale px-1.5 py-0.5 text-[10px] font-bold text-white"><?php echo esc_html( $medora_node['promo']['badge'] ); ?></span>
									<?php endif; ?>
									<?php if ( $medora_node['active'] ) : ?>
										<span class="absolute inset-x-2.5 bottom-0.5 h-0.5 rounded-full bg-teal-700"></span>
									<?php endif; ?>
								</a>

								<?php
								if ( $medora_node['children'] ) {
									get_template_part( 'template-parts/header/mega-menu', null, array( 'node' => $medora_node ) );
								}
								?>
							</li>
						<?php endforeach; ?>
					</ul>
				</nav>
			<?php endif; ?>
		</div>
	</header>
