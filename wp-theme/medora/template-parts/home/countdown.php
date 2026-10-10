<?php
/**
 * The countdown panel of the special offer: a full-width strip on phones and tablets, a side
 * card from lg up — the same two shapes the design uses.
 *
 * @package Medora
 *
 * @var array $args { end: int timestamp, end_date: string }
 */

defined( 'ABSPATH' ) || exit;

$medora_end      = isset( $args['end'] ) ? (int) $args['end'] : 0;
$medora_end_date = isset( $args['end_date'] ) ? $args['end_date'] : '';
$medora_url      = medora_sale_url();
?>
<div class="flex w-full shrink-0 flex-col lg:w-[210px] xl:w-[230px]">
	<a href="<?php echo esc_url( $medora_url ); ?>" class="flex items-center justify-between gap-1.5 rounded-panel bg-gradient-to-l from-teal-950 to-teal-800 px-2.5 py-3 text-white lg:hidden">
		<span class="flex min-w-0 items-center gap-1.5">
			<?php echo medora_icon( 'percent', 'h-4 w-4 shrink-0' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<span class="truncate text-[12px] font-black"><?php echo esc_html( medora_setting( 'sale_title' ) ); ?></span>
		</span>

		<span class="flex shrink-0 items-center gap-1.5">
			<?php if ( $medora_end ) : ?>
				<span class="flex shrink-0 items-center gap-1" data-medora-countdown="<?php echo esc_attr( $medora_end ); ?>">
					<span class="flex flex-col items-center rounded-lg bg-white px-2 py-1.5 text-teal-950">
						<span class="text-[15px] font-black leading-5" data-medora-cd="hours">--</span>
						<span class="text-[9px] leading-3 text-teal-950/70"><?php esc_html_e( 'ساعت', 'medora' ); ?></span>
					</span>
					<span aria-hidden class="text-[12px] font-bold text-white/60">:</span>
					<span class="flex flex-col items-center rounded-lg bg-white px-2 py-1.5 text-teal-950">
						<span class="text-[15px] font-black leading-5" data-medora-cd="minutes">--</span>
						<span class="text-[9px] leading-3 text-teal-950/70"><?php esc_html_e( 'دقیقه', 'medora' ); ?></span>
					</span>
					<span aria-hidden class="text-[12px] font-bold text-white/60">:</span>
					<span class="flex flex-col items-center rounded-lg bg-white px-2 py-1.5 text-teal-950">
						<span class="text-[15px] font-black leading-5" data-medora-cd="seconds">--</span>
						<span class="text-[9px] leading-3 text-teal-950/70"><?php esc_html_e( 'ثانیه', 'medora' ); ?></span>
					</span>
				</span>
			<?php endif; ?>

			<span aria-hidden class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream text-teal-900">
				<?php echo medora_icon( 'chevron-left', 'h-4 w-4' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</span>
		</span>
	</a>

	<div class="hidden flex-1 flex-col items-center justify-center gap-4 rounded-panel bg-gradient-to-b from-teal-800 to-teal-950 px-4 py-6 text-center text-white lg:flex">
		<span class="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
			<?php echo medora_icon( 'percent', 'h-6 w-6 text-gold' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		</span>

		<div>
			<h3 class="text-lg font-black sm:text-xl"><?php echo esc_html( medora_setting( 'sale_title' ) ); ?></h3>
			<p class="mt-1 text-[11px] text-white/75 sm:text-xs"><?php echo esc_html( medora_setting( 'sale_subtitle' ) ); ?></p>
		</div>

		<?php if ( $medora_end ) : ?>
			<div class="flex items-start gap-1.5" data-medora-countdown="<?php echo esc_attr( $medora_end ); ?>">
				<div class="flex flex-col items-center gap-1">
					<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-base font-bold text-teal-900 sm:h-11 sm:w-11 sm:text-lg" data-medora-cd="hours">--</span>
					<span class="text-[10px] text-white/80 sm:text-[11px]"><?php esc_html_e( 'ساعت', 'medora' ); ?></span>
				</div>
				<div class="flex flex-col items-center gap-1">
					<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-base font-bold text-teal-900 sm:h-11 sm:w-11 sm:text-lg" data-medora-cd="minutes">--</span>
					<span class="text-[10px] text-white/80 sm:text-[11px]"><?php esc_html_e( 'دقیقه', 'medora' ); ?></span>
				</div>
				<div class="flex flex-col items-center gap-1">
					<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-base font-bold text-teal-900 sm:h-11 sm:w-11 sm:text-lg" data-medora-cd="seconds">--</span>
					<span class="text-[10px] text-white/80 sm:text-[11px]"><?php esc_html_e( 'ثانیه', 'medora' ); ?></span>
				</div>
			</div>
		<?php endif; ?>

		<?php if ( $medora_end_date ) : ?>
			<p class="text-[11px] text-white/70">
				<?php
				printf(
					/* translators: %s: date the sale ends. */
					esc_html__( 'تا پایان %s', 'medora' ),
					esc_html( $medora_end_date )
				);
				?>
			</p>
		<?php endif; ?>

		<a href="<?php echo esc_url( $medora_url ); ?>" class="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-white text-[13px] font-bold text-teal-900 transition-colors hover:bg-cream">
			<?php esc_html_e( 'مشاهده همه', 'medora' ); ?>
			<?php echo medora_icon( 'chevron-left', 'h-4 w-4' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		</a>
	</div>
</div>
