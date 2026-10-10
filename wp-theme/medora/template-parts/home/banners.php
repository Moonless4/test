<?php
/**
 * The two promotional tiles under the slider, from the banner entries marked "grid".
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

$medora_banners = medora_banners( 'grid', 2 );

if ( ! $medora_banners ) {
	return;
}
?>
<section class="container mt-12 sm:mt-16" aria-label="<?php esc_attr_e( 'پیشنهادهای فصلی', 'medora' ); ?>">
	<div class="grid gap-3 sm:grid-cols-2 sm:gap-4">
		<?php foreach ( $medora_banners as $medora_index => $medora_banner ) : ?>
			<?php
			$medora_url   = get_post_meta( $medora_banner->ID, '_medora_link_url', true );
			$medora_badge = get_post_meta( $medora_banner->ID, '_medora_badge', true );
			$medora_url   = $medora_url ? $medora_url : medora_shop_url();
			?>
			<div class="reveal" style="transition-delay: <?php echo esc_attr( min( $medora_index * 100, 300 ) ); ?>ms">
				<a href="<?php echo esc_url( $medora_url ); ?>" aria-label="<?php echo esc_attr( get_the_title( $medora_banner ) ); ?>" class="group relative block h-[150px] overflow-hidden rounded-lg bg-[#3F4635] sm:h-[170px] lg:h-[190px]">
					<?php
					echo medora_image( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in the helper.
						(int) get_post_thumbnail_id( $medora_banner ),
						'medora-banner',
						array(
							'class' => 'h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]',
							'alt'   => '',
						)
					);
					?>
					<span class="absolute inset-0 bg-[#3F4635]/30" aria-hidden="true"></span>

					<?php if ( get_the_title( $medora_banner ) ) : ?>
						<span class="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3">
							<span class="text-[15px] font-bold text-white drop-shadow-sm"><?php echo esc_html( get_the_title( $medora_banner ) ); ?></span>
							<?php if ( $medora_badge ) : ?>
								<span class="rounded-md bg-sale px-2 py-0.5 text-[11px] font-bold text-white"><?php echo esc_html( $medora_badge ); ?></span>
							<?php endif; ?>
						</span>
					<?php endif; ?>
				</a>
			</div>
		<?php endforeach; ?>
	</div>
</section>
