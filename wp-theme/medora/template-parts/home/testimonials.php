<?php
/**
 * Customer reviews, from the theme's own review entries: name, avatar, rating and quote.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

$medora_reviews = medora_reviews( 6 );

if ( ! $medora_reviews ) {
	return;
}
?>
<section class="mt-12 bg-white py-12 sm:mt-16 sm:py-16" aria-label="<?php esc_attr_e( 'نظرات مشتریان', 'medora' ); ?>">
	<div class="container">
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
			<div class="reveal lg:col-span-4">
				<span class="text-xs font-medium tracking-wide text-black sm:text-[13px]"><?php echo esc_html( medora_setting( 'testimonials_eyebrow' ) ); ?></span>
				<h2 class="mt-2 text-xl font-bold text-ink sm:text-2xl lg:text-[28px]"><?php echo esc_html( medora_setting( 'testimonials_title' ) ); ?></h2>
				<span class="mt-3 block h-1 w-12 rounded-full bg-teal-800"></span>
				<p class="mt-5 max-w-[380px] text-[13px] leading-7 text-muted sm:text-sm sm:leading-8"><?php echo esc_html( medora_setting( 'testimonials_text' ) ); ?></p>

				<?php $medora_image_id = (int) get_theme_mod( 'medora_testimonials_image', 0 ); ?>
				<?php if ( $medora_image_id ) : ?>
					<div class="mt-7 hidden overflow-hidden rounded-panel lg:block">
						<?php echo medora_image( $medora_image_id, 'large', array( 'class' => 'h-[230px] w-full object-cover', 'alt' => '' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					</div>
				<?php endif; ?>
			</div>

			<div class="lg:col-span-8">
				<div class="no-scrollbar -mx-4 flex cursor-grab snap-x snap-mandatory select-none gap-4 overflow-x-auto px-4 pb-2 active:cursor-grabbing sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0" data-medora-rail>
					<?php foreach ( $medora_reviews as $medora_index => $medora_review ) : ?>
						<?php
						$medora_rating = (int) get_post_meta( $medora_review->ID, '_medora_rating', true );
						$medora_rating = $medora_rating ? min( 5, max( 1, $medora_rating ) ) : 5;
						$medora_city   = (string) get_post_meta( $medora_review->ID, '_medora_city', true );
						?>
						<div class="reveal w-[80%] shrink-0 snap-start sm:w-auto" style="transition-delay: <?php echo esc_attr( min( $medora_index * 90, 360 ) ); ?>ms">
							<figure class="flex h-full flex-col gap-4 rounded-panel border border-line bg-white p-5 shadow-soft sm:p-6">
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-0.5" role="img" aria-label="<?php echo esc_attr( sprintf( __( 'امتیاز %s از ۵', 'medora' ), medora_to_fa( $medora_rating ) ) ); ?>">
										<?php for ( $medora_star = 1; $medora_star <= 5; $medora_star++ ) : ?>
											<span class="<?php echo $medora_star <= $medora_rating ? 'text-gold' : 'text-line'; ?>">
												<?php echo medora_icon( 'star', 'h-4 w-4' . ( $medora_star <= $medora_rating ? ' fill-current' : '' ), 1.6 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
											</span>
										<?php endfor; ?>
									</div>
									<span class="text-teal-100"><?php echo medora_icon( 'quote', 'h-6 w-6' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
								</div>

								<blockquote class="text-[13px] leading-7 text-ink/85 sm:text-sm sm:leading-8">
									«<?php echo esc_html( wp_strip_all_tags( $medora_review->post_content ) ); ?>»
								</blockquote>

								<figcaption class="mt-auto flex items-center gap-3 border-t border-line pt-4">
									<?php
									echo medora_image( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
										(int) get_post_thumbnail_id( $medora_review ),
										'medora-avatar',
										array( 'class' => 'h-11 w-11 rounded-full object-cover ring-2 ring-cream', 'alt' => '' )
									);
									?>
									<span class="text-[13px] font-bold text-ink"><?php echo esc_html( get_the_title( $medora_review ) ); ?></span>
									<?php if ( $medora_city ) : ?>
										<span class="text-[11.5px] text-muted"><?php echo esc_html( $medora_city ); ?></span>
									<?php endif; ?>
								</figcaption>
							</figure>
						</div>
					<?php endforeach; ?>
				</div>
			</div>
		</div>
	</div>
</section>
