<?php
/**
 * One FAQ group: its heading and the answers in it. The first answer of the first group is open,
 * matching the design; the rest open on click.
 *
 * @package Medora
 *
 * @var array $args { group: array { term, questions }, open_first: bool }
 */

defined( 'ABSPATH' ) || exit;

$medora_group = isset( $args['group'] ) ? $args['group'] : null;

if ( ! $medora_group ) {
	return;
}

$medora_open_first = ! empty( $args['open_first'] );
$medora_slug       = $medora_group['term'] ? $medora_group['term']->slug : 'general';
$medora_title      = $medora_group['term'] ? $medora_group['term']->name : __( 'پرسش‌های عمومی', 'medora' );
?>
<div class="medora-faq-group" data-medora-faq-group="<?php echo esc_attr( $medora_slug ); ?>">
	<h2 class="mb-4 text-[17px] font-bold text-ink sm:text-lg"><?php echo esc_html( $medora_title ); ?></h2>

	<div class="space-y-2.5">
		<?php foreach ( $medora_group['questions'] as $medora_index => $medora_question ) : ?>
			<?php $medora_is_open = $medora_open_first && 0 === $medora_index; ?>
			<div class="medora-faq-item overflow-hidden rounded-panel border border-line bg-white">
				<h3 class="m-0">
					<button
						type="button"
						class="medora-faq-toggle flex w-full items-center justify-between gap-4 px-4 py-4 text-start sm:px-5"
						aria-expanded="<?php echo $medora_is_open ? 'true' : 'false'; ?>"
					>
						<span class="text-[13.5px] font-bold text-ink sm:text-[14.5px]"><?php echo esc_html( get_the_title( $medora_question ) ); ?></span>
						<span class="medora-faq-icon shrink-0 text-teal-800" aria-hidden="true"><?php echo medora_icon( 'chevron-down', 'h-4 w-4' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
					</button>
				</h3>

				<div class="medora-faq-answer px-4 pb-4 sm:px-5"<?php echo $medora_is_open ? '' : ' hidden'; ?>>
					<div class="medora-prose border-t border-line pt-3 text-[13px] leading-7 text-muted">
						<?php echo wp_kses_post( apply_filters( 'the_content', $medora_question->post_content ) ); ?>
					</div>
				</div>
			</div>
		<?php endforeach; ?>
	</div>
</div>
