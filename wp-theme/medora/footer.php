<?php
/**
 * Footer: the shop's own copy, menus, contact details, socials, trust badges — and the phone
 * chrome (the bottom tab bar, the category drawer and the cart drawer), which belongs to every
 * page, so it is printed once here.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;
?>
<footer class="mt-16 bg-teal-900 pb-[69px] text-white sm:mt-20 min-[769px]:pb-0">
	<div class="container">
		<div class="grid gap-10 py-12 lg:grid-cols-12 lg:gap-8 lg:py-16">
			<div class="lg:col-span-4">
				<?php echo medora_logo( 'light', 'h-9 w-auto' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>

				<?php $medora_about = get_theme_mod( 'medora_footer_about', '' ); ?>
				<?php if ( $medora_about ) : ?>
					<p class="mt-5 max-w-sm text-[13px] leading-7 text-white/65"><?php echo esc_html( $medora_about ); ?></p>
				<?php endif; ?>

				<form class="mt-6 flex max-w-sm items-center gap-2 rounded-xl bg-white/10 p-1.5 ring-1 ring-white/15" data-medora-newsletter>
					<label for="footer-email" class="sr-only"><?php esc_html_e( 'ایمیل', 'medora' ); ?></label>
					<input id="footer-email" type="email" dir="ltr" required placeholder="<?php esc_attr_e( 'ایمیل خود را وارد کنید', 'medora' ); ?>" class="h-10 w-full bg-transparent px-3 text-left text-[13px] text-white outline-none placeholder:text-right placeholder:text-white/50">
					<button type="submit" class="h-10 shrink-0 rounded-lg bg-white px-4 text-[13px] font-medium text-black transition-colors hover:bg-cream">
						<?php esc_html_e( 'عضویت', 'medora' ); ?>
					</button>
				</form>
				<p class="mt-2 hidden text-[12px] text-teal-200" data-medora-newsletter-message role="status"></p>

				<?php $medora_socials = medora_social_links(); ?>
				<?php if ( $medora_socials ) : ?>
					<div class="mt-6 flex items-center gap-2">
						<?php foreach ( $medora_socials as $social ) : ?>
							<a href="<?php echo esc_url( $social['url'] ); ?>" aria-label="<?php echo esc_attr( $social['label'] ); ?>" rel="noopener noreferrer" target="_blank" class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/80 transition-all duration-300 hover:bg-white hover:text-black">
								<?php echo medora_icon( $social['icon'], 'h-[18px] w-[18px]' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							</a>
						<?php endforeach; ?>
					</div>
				<?php endif; ?>
			</div>

			<?php
			/*
			 * The footer columns are WordPress menus. A store that has not built them yet gets the
			 * shop's own links (categories, account, cart), never a list hard-coded in the theme.
			 */
			$medora_footer_columns = array();

			foreach ( array( 'footer-1', 'footer-2', 'footer-3', 'footer-4' ) as $medora_location ) {
				if ( has_nav_menu( $medora_location ) ) {
					$medora_footer_columns[] = array(
						'location' => $medora_location,
						'items'    => wp_get_nav_menu_items( get_nav_menu_locations()[ $medora_location ] ),
					);
				}
			}

			if ( ! $medora_footer_columns ) {
				$medora_links = array();

				if ( medora_has_woocommerce() ) {
					$medora_links[] = array(
						'title' => __( 'سبد خرید', 'medora' ),
						'url'   => wc_get_cart_url(),
					);
					$medora_links[] = array(
						'title' => __( 'تسویه حساب', 'medora' ),
						'url'   => wc_get_checkout_url(),
					);
					$medora_links[] = array(
						'title' => __( 'حساب کاربری', 'medora' ),
						'url'   => wc_get_page_permalink( 'myaccount' ),
					);
				}

				$medora_links[] = array(
					'title' => __( 'سوالات متداول', 'medora' ),
					'url'   => get_post_type_archive_link( 'medora_faq' ),
				);

				foreach ( medora_top_categories( 4 ) as $medora_category ) {
					$medora_links[] = array(
						'title' => $medora_category['term']->name,
						'url'   => $medora_category['url'],
					);
				}

				$medora_footer_columns[] = array(
					'location' => '',
					'items'    => array_map(
						function ( $link ) {
							return (object) $link;
						},
						$medora_links
					),
				);
			}

			foreach ( $medora_footer_columns as $column ) :
				$medora_items = array_filter( $column['items'], function ( $item ) { return 0 === (int) $item->menu_item_parent; } );
				$medora_first = reset( $medora_items );
				?>
				<nav class="lg:col-span-2" aria-label="<?php echo esc_attr( $medora_first ? $medora_first->title : __( 'پیوندها', 'medora' ) ); ?>">
					<h3 class="mb-4 text-sm font-bold text-white">
						<?php
						// A menu column takes its heading from the menu itself (its name), so the
						// administrator never edits PHP to rename a footer column.
						if ( $column['location'] ) {
							$medora_menu_object = wp_get_nav_menu_object( get_nav_menu_locations()[ $column['location'] ] );
							echo esc_html( $medora_menu_object ? $medora_menu_object->name : __( 'پیوندها', 'medora' ) );
						} else {
							esc_html_e( 'دسترسی سریع', 'medora' );
						}
						?>
					</h3>
					<ul class="space-y-0.5">
						<?php foreach ( $medora_items as $item ) : ?>
							<li>
								<a href="<?php echo esc_url( $item->url ); ?>" class="inline-block py-1 text-[13px] text-white/70 transition-all duration-300 hover:-translate-x-1 hover:text-white hover:underline hover:decoration-teal-300 hover:underline-offset-4">
									<?php echo esc_html( $item->title ); ?>
								</a>
							</li>
						<?php endforeach; ?>
					</ul>
				</nav>
			<?php endforeach; ?>

			<div class="lg:col-span-2">
				<h3 class="mb-4 text-sm font-bold text-white"><?php esc_html_e( 'تماس با ما', 'medora' ); ?></h3>
				<ul class="space-y-3 text-[13px] text-white/70">
					<?php
					$medora_contact = array(
						'phone'   => array(
							'icon' => 'phone',
							'value' => get_theme_mod( 'medora_contact_phone', '' ),
							'ltr'  => true,
						),
						'email'   => array(
							'icon' => 'mail',
							'value' => get_theme_mod( 'medora_contact_email', '' ),
							'ltr'  => true,
						),
						'address' => array(
							'icon' => 'map-pin',
							'value' => get_theme_mod( 'medora_contact_address', '' ),
							'ltr'  => false,
						),
					);

					foreach ( $medora_contact as $medora_item ) :
						if ( ! $medora_item['value'] ) {
							continue;
						}
						?>
						<li class="flex items-<?php echo 'address' === $medora_item['icon'] ? 'start' : 'center'; ?> gap-2">
							<span class="mt-0.5 shrink-0 text-teal-300"><?php echo medora_icon( $medora_item['icon'], 'h-4 w-4' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
							<span<?php echo $medora_item['ltr'] ? ' dir="ltr"' : ''; ?>><?php echo esc_html( $medora_item['value'] ); ?></span>
						</li>
					<?php endforeach; ?>
				</ul>

				<?php $medora_badges = medora_trust_badges(); ?>
				<?php if ( $medora_badges ) : ?>
					<div class="mt-5 flex flex-wrap items-center gap-3">
						<?php foreach ( $medora_badges as $badge ) : ?>
							<?php if ( $badge['url'] ) : ?>
								<a href="<?php echo esc_url( $badge['url'] ); ?>" target="_blank" rel="noopener noreferrer" class="inline-flex rounded-xl bg-white p-2">
									<?php echo medora_image( $badge['image'], 'medium', array( 'class' => 'h-24 w-auto', 'alt' => $badge['title'] ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
								</a>
							<?php else : ?>
								<span class="inline-flex rounded-xl bg-white p-2">
									<?php echo medora_image( $badge['image'], 'medium', array( 'class' => 'h-24 w-auto', 'alt' => $badge['title'] ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
								</span>
							<?php endif; ?>
						<?php endforeach; ?>
					</div>
				<?php endif; ?>
			</div>
		</div>

		<div class="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 sm:flex-row">
			<p class="text-[12px] text-white/55">
				<?php echo esc_html( get_theme_mod( 'medora_footer_copyright', '© ۲۰۲۵ مدورا. تمامی حقوق محفوظ است.' ) ); ?>
			</p>
			<div class="flex items-center gap-5 text-[12px] text-white/55">
				<?php
				if ( has_nav_menu( 'footer-4' ) ) {
					wp_nav_menu(
						array(
							'theme_location' => 'footer-4',
							'container'      => false,
							'depth'          => 1,
							'menu_class'     => 'flex items-center gap-5',
							'fallback_cb'    => false,
						)
					);
				}
				?>
			</div>
		</div>
	</div>
</footer>

<?php
if ( medora_has_woocommerce() ) {
	get_template_part( 'template-parts/header/cart-drawer' );
	get_template_part( 'template-parts/header/category-drawer' );
	get_template_part( 'template-parts/layout/mobile-tab-bar' );
}

wp_footer();
?>
</div><!-- #page -->
</body>
</html>
