<?php
/**
 * The mega panel of one top-level menu item.
 *
 * The columns are the item's children — real WordPress menu items, in the administrator's order —
 * and the links inside a column are their own children. The promo tile is the item's own fields
 * (image, badge, text, link) set on the menu item screen.
 *
 * @package Medora
 *
 * @var array $args { node: array }
 */

defined( 'ABSPATH' ) || exit;

$node = isset( $args['node'] ) ? $args['node'] : null;

if ( ! $node || empty( $node['children'] ) ) {
	return;
}

$promo = $node['promo'];
$panel_id = 'mega-' . ( $node['item']->ID ? $node['item']->ID : sanitize_title( $node['item']->title ) );
?>
<div class="medora-mega absolute inset-x-4 top-full z-40 hidden pt-2 sm:inset-x-5 lg:inset-x-6" id="<?php echo esc_attr( $panel_id ); ?>">
	<div class="flex overflow-hidden rounded-panel border border-line bg-white shadow-lift">
		<div class="flex min-w-0 flex-1 flex-col sm:flex-row">
			<ul class="medora-mega-columns grid flex-1 grid-cols-2 gap-x-6 gap-y-6 px-6 py-5 lg:grid-cols-3">
				<?php foreach ( $node['children'] as $column ) : ?>
					<li>
						<a href="<?php echo esc_url( $column['item']->url ); ?>" class="text-[13.5px] font-bold text-ink transition-colors hover:text-teal-800">
							<?php echo esc_html( $column['item']->title ); ?>
						</a>

						<?php if ( ! empty( $column['children'] ) ) : ?>
							<ul class="mt-2 space-y-1.5 border-s border-line ps-3">
								<?php foreach ( $column['children'] as $link ) : ?>
									<li>
										<a href="<?php echo esc_url( $link->url ); ?>" class="block text-[12.5px] text-muted transition-colors hover:text-teal-800">
											<?php echo esc_html( $link->title ); ?>
										</a>
									</li>
								<?php endforeach; ?>
							</ul>
						<?php endif; ?>
					</li>
				<?php endforeach; ?>
			</ul>

			<?php if ( $promo['image'] || $promo['text'] ) : ?>
				<div class="relative w-full shrink-0 bg-[#F7F8FA] p-4 sm:w-[260px]">
					<?php if ( $promo['image'] ) : ?>
						<?php echo medora_image( $promo['image'], 'medora-banner', array( 'class' => 'h-[150px] w-full rounded-xl object-cover', 'loading' => 'lazy', 'alt' => '' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in the helper. ?>
					<?php endif; ?>

					<?php if ( $promo['text'] ) : ?>
						<p class="mt-3 text-[12.5px] leading-6 text-ink/80"><?php echo esc_html( $promo['text'] ); ?></p>
					<?php endif; ?>

					<?php if ( $promo['url'] ) : ?>
						<a href="<?php echo esc_url( $promo['url'] ); ?>" class="mt-3 inline-flex items-center gap-1 text-[12.5px] font-bold text-teal-800 transition-colors hover:text-teal-700">
							<?php esc_html_e( 'مشاهده', 'medora' ); ?>
							<?php echo medora_icon( 'chevron-left', 'h-4 w-4' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						</a>
					<?php endif; ?>
				</div>
			<?php endif; ?>
		</div>
	</div>
</div>
