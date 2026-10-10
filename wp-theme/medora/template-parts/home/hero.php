<?php
/**
 * The hero slider. The slides are the administrator's own entries: image (and an optional phone
 * crop), eyebrow, headline, description, button and button link. Photographs alone reproduce the
 * design exactly; the copy appears only when it has been filled in.
 *
 * @package Medora
 *
 * @var array $args Passed by front-page.php.
 */

defined( 'ABSPATH' ) || exit;

$medora_slides = medora_slides();

if ( ! $medora_slides ) {
	return;
}

$medora_full = (bool) get_theme_mod( 'medora_hero_full', 1 );
$medora_count = count( $medora_slides );
?>
<section class="<?php echo $medora_full ? 'pt-3 sm:pt-4' : 'container mt-6'; ?>" aria-label="<?php esc_attr_e( 'بنر اصلی', 'medora' ); ?>">
	<div class="relative overflow-hidden bg-beige <?php echo $medora_full ? '' : 'rounded-panel'; ?>" data-medora-slider data-interval="7000">
		<?php if ( $medora_full ) : ?>
			<div class="relative aspect-[11/10] sm:aspect-auto sm:min-h-[420px] lg:min-h-[520px]">
		<?php else : ?>
			<div class="relative aspect-[11/10] sm:aspect-auto sm:min-h-[360px]">
		<?php endif; ?>

			<?php
			foreach ( $medora_slides as $medora_index => $medora_post ) :
				$medora_slide = medora_slide_data( $medora_post );
				$medora_overlay = array(
					'light'  => 'bg-ink/20',
					'medium' => 'bg-ink/35',
					'dark'   => 'bg-ink/55',
				);
				?>
				<div
					class="medora-slide absolute inset-0 transition-opacity duration-700 ease-out <?php echo 0 === $medora_index ? 'is-active opacity-100' : 'pointer-events-none opacity-0'; ?>"
					data-medora-slide="<?php echo esc_attr( $medora_index ); ?>"
					aria-hidden="<?php echo 0 === $medora_index ? 'false' : 'true'; ?>"
				>
					<picture>
						<source media="(max-width: 639px)" srcset="<?php echo esc_url( wp_get_attachment_image_url( $medora_slide['phone_image_id'], 'medora-hero-phone' ) ); ?>">
						<?php
						echo wp_get_attachment_image( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core markup.
							$medora_slide['image_id'],
							'medora-hero',
							false,
							array(
								'class'         => 'h-full w-full object-cover object-center',
								'loading'       => 0 === $medora_index ? 'eager' : 'lazy',
								'fetchpriority' => 0 === $medora_index ? 'high' : 'low',
								'decoding'      => 'async',
								'alt'           => '',
							)
						);
						?>
					</picture>

					<?php if ( isset( $medora_overlay[ $medora_slide['overlay'] ] ) ) : ?>
						<span class="absolute inset-0 <?php echo esc_attr( $medora_overlay[ $medora_slide['overlay'] ] ); ?>" aria-hidden="true"></span>
					<?php endif; ?>

					<?php if ( $medora_slide['title'] || $medora_slide['subtitle'] || $medora_slide['button_label'] ) : ?>
						<div class="absolute inset-0 flex items-end sm:items-center">
							<div class="container pb-14 sm:pb-0">
								<div class="max-w-lg text-white">
									<?php if ( $medora_slide['eyebrow'] ) : ?>
										<span class="mb-2 inline-block text-[12px] font-medium tracking-wide text-white/85 sm:text-[13px]"><?php echo esc_html( $medora_slide['eyebrow'] ); ?></span>
									<?php endif; ?>

									<?php if ( $medora_slide['title'] ) : ?>
										<h1 class="text-[26px] font-black leading-tight sm:text-4xl lg:text-[42px]"><?php echo esc_html( $medora_slide['title'] ); ?></h1>
									<?php endif; ?>

									<?php if ( $medora_slide['subtitle'] ) : ?>
										<p class="mt-3 max-w-md text-[13px] leading-7 text-white/85 sm:text-sm"><?php echo esc_html( $medora_slide['subtitle'] ); ?></p>
									<?php endif; ?>

									<?php if ( $medora_slide['button_label'] && $medora_slide['button_url'] ) : ?>
										<a href="<?php echo esc_url( $medora_slide['button_url'] ); ?>" class="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-6 text-[13px] font-bold text-black shadow-soft transition-colors hover:bg-cream">
											<?php echo esc_html( $medora_slide['button_label'] ); ?>
										</a>
									<?php endif; ?>
								</div>
							</div>
						</div>
					<?php endif; ?>
				</div>
			<?php endforeach; ?>

			<?php if ( $medora_count > 1 ) : ?>
				<button type="button" data-medora-slide-prev aria-label="<?php esc_attr_e( 'اسلاید قبلی', 'medora' ); ?>" class="absolute top-1/2 start-4 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-cocoa transition-colors hover:bg-cream lg:flex">
					<?php echo medora_icon( 'chevron-right', 'h-5 w-5' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				</button>
				<button type="button" data-medora-slide-next aria-label="<?php esc_attr_e( 'اسلاید بعدی', 'medora' ); ?>" class="absolute top-1/2 end-4 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-cocoa transition-colors hover:bg-cream lg:flex">
					<?php echo medora_icon( 'chevron-left', 'h-5 w-5' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				</button>

				<div class="absolute inset-x-0 bottom-5 z-20 flex items-center justify-center gap-2">
					<?php foreach ( $medora_slides as $medora_index => $medora_post ) : ?>
						<button
							type="button"
							data-medora-slide-dot="<?php echo esc_attr( $medora_index ); ?>"
							aria-label="<?php echo esc_attr( sprintf( __( 'اسلاید %s', 'medora' ), medora_to_fa( $medora_index + 1 ) ) ); ?>"
							aria-current="<?php echo 0 === $medora_index ? 'true' : 'false'; ?>"
							class="medora-dot h-2.5 w-2.5 rounded-full ring-1 ring-cocoa/10 transition-all duration-300 <?php echo 0 === $medora_index ? 'bg-white' : 'bg-white/60 hover:bg-white/85'; ?>"
						></button>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>
		</div>
	</div>
</section>
