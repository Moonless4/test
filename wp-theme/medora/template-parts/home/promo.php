<?php
/**
 * The wide promotional banner, from the banner entries marked "promo".
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

$medora_banners = medora_banners( 'promo', 1 );

if ( ! $medora_banners ) {
	return;
}

$medora_banner = $medora_banners[0];
$medora_url    = get_post_meta( $medora_banner->ID, '_medora_link_url', true );
$medora_url    = $medora_url ? $medora_url : medora_sale_url();
?>
<section class="container mt-12 sm:mt-16" aria-label="<?php esc_attr_e( 'پیشنهاد ویژه', 'medora' ); ?>">
	<div class="reveal">
		<a href="<?php echo esc_url( $medora_url ); ?>" aria-label="<?php echo esc_attr( get_the_title( $medora_banner ) ); ?>" class="group relative block h-[170px] overflow-hidden rounded-lg bg-[#3F4635] sm:h-[220px] lg:h-[280px]">
			<?php
			echo medora_image( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				(int) get_post_thumbnail_id( $medora_banner ),
				'medora-hero',
				array(
					'class' => 'h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]',
					'alt'   => '',
				)
			);
			?>
			<span class="absolute inset-0 bg-gradient-to-l from-ink/55 to-transparent" aria-hidden="true"></span>

			<span class="absolute inset-y-0 start-0 flex flex-col justify-center gap-2 p-6 text-white sm:p-10">
				<span class="text-[18px] font-black sm:text-2xl lg:text-[32px]"><?php echo esc_html( get_the_title( $medora_banner ) ); ?></span>
				<?php if ( $medora_banner->post_content ) : ?>
					<span class="max-w-md text-[13px] leading-7 text-white/85"><?php echo esc_html( wp_trim_words( $medora_banner->post_content, 24 ) ); ?></span>
				<?php endif; ?>
				<span class="mt-1 inline-flex h-10 w-fit items-center rounded-xl bg-white px-5 text-[13px] font-bold text-black">
					<?php esc_html_e( 'مشاهده', 'medora' ); ?>
				</span>
			</span>
		</a>
	</div>
</section>
