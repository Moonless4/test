<?php
/**
 * The newsletter block. The form posts to the theme's own handler (inc/ajax.php), which validates
 * and stores the address — no third-party form service is assumed.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

$medora_image_id = (int) get_theme_mod( 'medora_newsletter_image', 0 );
?>
<section class="container mt-12 sm:mt-16" aria-label="<?php esc_attr_e( 'خبرنامه', 'medora' ); ?>">
	<div class="reveal">
		<div class="grid overflow-hidden rounded-panel bg-teal-800 shadow-card lg:grid-cols-2">
			<?php if ( $medora_image_id ) : ?>
				<div class="relative min-h-[180px] lg:min-h-[300px]">
					<?php echo medora_image( $medora_image_id, 'medora-banner', array( 'class' => 'h-full w-full object-cover', 'alt' => '' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<span class="absolute inset-0 bg-gradient-to-l from-teal-900/70 to-transparent" aria-hidden="true"></span>
				</div>
			<?php endif; ?>

			<div class="p-7 sm:p-10 lg:p-12">
				<span class="text-[11px] font-medium tracking-wide text-teal-200 sm:text-xs"><?php echo esc_html( medora_setting( 'newsletter_eyebrow' ) ); ?></span>
				<h2 class="mt-3 text-[22px] font-black text-white sm:text-[28px]"><?php echo esc_html( medora_setting( 'newsletter_title' ) ); ?></h2>
				<p class="mt-3 text-[13px] leading-7 text-white/70 sm:text-sm"><?php echo esc_html( medora_setting( 'newsletter_text' ) ); ?></p>

				<form class="mt-6 flex flex-col gap-2.5 sm:flex-row" data-medora-newsletter>
					<label for="newsletter-email" class="sr-only"><?php esc_html_e( 'ایمیل شما', 'medora' ); ?></label>
					<div class="flex h-12 flex-1 items-center gap-2 rounded-xl bg-white/10 px-4 ring-1 ring-white/15 focus-within:bg-white/15">
						<span class="shrink-0 text-teal-200"><?php echo medora_icon( 'mail', 'h-4 w-4' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
						<input id="newsletter-email" type="email" required placeholder="<?php esc_attr_e( 'ایمیل خود را وارد کنید', 'medora' ); ?>" class="h-full w-full bg-transparent text-[13px] text-white outline-none placeholder:text-white/50">
					</div>
					<button type="submit" class="h-12 shrink-0 rounded-xl bg-white px-7 text-[13px] font-bold text-black transition-colors hover:bg-cream">
						<?php esc_html_e( 'عضویت', 'medora' ); ?>
					</button>
				</form>

				<p class="mt-3 hidden text-[12.5px] text-teal-100" data-medora-newsletter-message role="status"></p>
			</div>
		</div>
	</div>
</section>
