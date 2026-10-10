<?php
/**
 * The phone category drawer: the shop's own categories on one side, their children on the other.
 * Both levels are WooCommerce terms, so the drawer follows whatever the store sells.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

$medora_categories = medora_top_categories( 12 );

if ( ! $medora_categories ) {
	return;
}
?>
<div class="fixed inset-0 z-[70] hidden min-[769px]:hidden" data-medora-category-drawer aria-hidden="true">
	<button type="button" data-medora-category-close aria-label="<?php esc_attr_e( 'بستن دسته‌بندی', 'medora' ); ?>" class="absolute inset-0 h-full w-full bg-teal-950/50 backdrop-blur-sm"></button>

	<div class="absolute inset-y-0 start-0 flex w-full flex-col bg-white shadow-2xl" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'دسته‌بندی‌ها', 'medora' ); ?>">
		<div class="flex items-center gap-2 p-3">
			<button type="button" data-medora-category-close aria-label="<?php esc_attr_e( 'بستن', 'medora' ); ?>" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cream text-ink ring-1 ring-line transition-colors hover:bg-white">
				<?php echo medora_icon( 'x', 'h-5 w-5' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</button>
			<div class="min-w-0 flex-1">
				<?php get_product_search_form(); ?>
			</div>
		</div>

		<div class="flex min-h-0 flex-1">
			<div class="no-scrollbar flex w-[104px] shrink-0 flex-col gap-1.5 overflow-y-auto border-e border-line bg-cream/60 p-2">
				<?php foreach ( $medora_categories as $index => $category ) : ?>
					<button
						type="button"
						data-medora-category-tab="<?php echo esc_attr( $category['term']->term_id ); ?>"
						aria-current="<?php echo 0 === $index ? 'true' : 'false'; ?>"
						class="medora-category-tab relative flex w-full flex-col items-center gap-1.5 rounded-2xl border border-transparent px-1.5 py-3 text-ink transition-colors hover:bg-white/70 <?php echo 0 === $index ? 'is-active' : ''; ?>"
					>
						<?php echo medora_image( $category['image_id'], 'medora-avatar', array( 'class' => 'h-11 w-11 rounded-full object-cover', 'alt' => '' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						<span class="text-[11px] font-medium"><?php echo esc_html( $category['term']->name ); ?></span>
					</button>
				<?php endforeach; ?>
			</div>

			<div class="min-w-0 flex-1 overflow-y-auto">
				<?php foreach ( $medora_categories as $index => $category ) : ?>
					<?php
					$medora_children = get_terms(
						array(
							'taxonomy'   => 'product_cat',
							'hide_empty' => true,
							'parent'     => $category['term']->term_id,
						)
					);
					?>
					<div class="medora-category-panel<?php echo 0 === $index ? ' is-active' : ''; ?>" data-medora-category-panel="<?php echo esc_attr( $category['term']->term_id ); ?>"<?php echo 0 === $index ? '' : ' hidden'; ?>>
						<div class="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5">
							<h2 class="text-[15px] font-bold text-ink"><?php echo esc_html( $category['term']->name ); ?></h2>
							<a href="<?php echo esc_url( $category['url'] ); ?>" class="text-[12.5px] font-medium text-teal-800 transition-colors hover:text-teal-700">
								<?php esc_html_e( 'مشاهده همه', 'medora' ); ?>
							</a>
						</div>

						<?php if ( ! is_wp_error( $medora_children ) && $medora_children ) : ?>
							<ul>
								<?php foreach ( $medora_children as $child ) : ?>
									<?php
									$medora_grandchildren = get_terms(
										array(
											'taxonomy'   => 'product_cat',
											'hide_empty' => true,
											'parent'     => $child->term_id,
										)
									);
									?>
									<li class="border-b border-line last:border-0">
										<a href="<?php echo esc_url( get_term_link( $child ) ); ?>" class="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-cream">
											<?php echo medora_image( (int) get_term_meta( $child->term_id, 'thumbnail_id', true ), 'medora-avatar', array( 'class' => 'h-10 w-10 shrink-0 rounded-full object-cover', 'alt' => '' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
											<span class="flex-1 text-start text-[13.5px] font-medium text-ink"><?php echo esc_html( $child->name ); ?></span>
											<span class="text-[11px] text-muted"><?php echo esc_html( medora_to_fa( $child->count ) ); ?></span>
										</a>

										<?php if ( ! is_wp_error( $medora_grandchildren ) && $medora_grandchildren ) : ?>
											<ul class="grid grid-cols-2 gap-x-3 gap-y-1.5 px-4 pb-4">
												<?php foreach ( $medora_grandchildren as $grandchild ) : ?>
													<li>
														<a href="<?php echo esc_url( get_term_link( $grandchild ) ); ?>" class="block py-1 text-[12.5px] text-muted transition-colors hover:text-teal-800">
															<?php echo esc_html( $grandchild->name ); ?>
														</a>
													</li>
												<?php endforeach; ?>
											</ul>
										<?php endif; ?>
									</li>
								<?php endforeach; ?>
							</ul>
						<?php else : ?>
							<p class="px-4 py-6 text-[13px] text-muted"><?php esc_html_e( 'زیر‌دسته‌ای برای این بخش ثبت نشده است.', 'medora' ); ?></p>
						<?php endif; ?>
					</div>
				<?php endforeach; ?>

				<div class="flex flex-wrap gap-2 px-4 pb-6 pt-4">
					<a href="<?php echo esc_url( medora_shop_url() ); ?>" class="rounded-full border border-line bg-white px-3 py-1.5 text-[12px] text-ink transition-colors hover:border-teal-300"><?php esc_html_e( 'همهٔ محصولات', 'medora' ); ?></a>
					<a href="<?php echo esc_url( medora_sale_url() ); ?>" class="rounded-full border border-line bg-white px-3 py-1.5 text-[12px] text-ink transition-colors hover:border-teal-300"><?php esc_html_e( 'تخفیف‌دارها', 'medora' ); ?></a>
					<?php if ( get_post_type_archive_link( 'medora_faq' ) ) : ?>
						<a href="<?php echo esc_url( get_post_type_archive_link( 'medora_faq' ) ); ?>" class="rounded-full border border-line bg-white px-3 py-1.5 text-[12px] text-ink transition-colors hover:border-teal-300"><?php esc_html_e( 'سوالات متداول', 'medora' ); ?></a>
					<?php endif; ?>
				</div>
			</div>
		</div>
	</div>
</div>
