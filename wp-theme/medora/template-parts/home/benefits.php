<?php
/**
 * The four trust promises, from the theme's settings page.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

$medora_benefits = medora_setting( 'benefits' );

if ( ! $medora_benefits ) {
	return;
}
?>
<section class="container mt-12 sm:mt-16" aria-label="<?php esc_attr_e( 'مزایای خرید', 'medora' ); ?>">
	<div class="reveal">
		<div class="grid grid-cols-2 gap-x-4 gap-y-7 rounded-panel border border-line bg-cream px-5 py-8 sm:px-8 lg:grid-cols-4 lg:gap-6">
			<?php foreach ( $medora_benefits as $medora_benefit ) : ?>
				<div class="flex flex-col items-center gap-3 text-center">
					<span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black shadow-soft">
						<?php echo medora_icon( $medora_benefit['icon'], 'h-6 w-6', 1.7 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					</span>
					<div>
						<h3 class="text-[13px] font-bold text-ink sm:text-[15px]"><?php echo esc_html( $medora_benefit['title'] ); ?></h3>
						<p class="mt-1 text-[11px] text-muted sm:text-[13px]"><?php echo esc_html( $medora_benefit['text'] ); ?></p>
					</div>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
</section>
