<?php
/**
 * The FAQ page, shared by the page template and the FAQ archive.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

$medora_groups = medora_faq_groups();

if ( ! $medora_groups ) {
	?>
	<div class="rounded-panel border border-line bg-cream px-6 py-12 text-center">
		<p class="text-[13px] text-muted"><?php esc_html_e( 'هنوز پرسشی ثبت نشده است. از پیشخوان، بخش «سوالات متداول»، پرسش‌ها را اضافه کنید.', 'medora' ); ?></p>
	</div>
	<?php
	return;
}

$medora_topics = array();

foreach ( $medora_groups as $medora_group ) {
	if ( $medora_group['term'] ) {
		$medora_topics[] = $medora_group['term'];
	}
}
?>
<div class="medora-faq" data-medora-faq>
	<?php if ( count( $medora_topics ) > 1 ) : ?>
		<div class="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="<?php esc_attr_e( 'موضوع‌ها', 'medora' ); ?>">
			<button type="button" class="medora-faq-chip is-active" data-medora-faq-filter="all" role="tab" aria-selected="true">
				<?php esc_html_e( 'همه', 'medora' ); ?>
			</button>
			<?php foreach ( $medora_topics as $medora_topic ) : ?>
				<button type="button" class="medora-faq-chip" data-medora-faq-filter="<?php echo esc_attr( $medora_topic->slug ); ?>" role="tab" aria-selected="false">
					<?php echo esc_html( $medora_topic->name ); ?>
					<span class="text-[11px] text-muted"><?php echo esc_html( medora_to_fa( $medora_topic->count ) ); ?></span>
				</button>
			<?php endforeach; ?>
		</div>
	<?php endif; ?>

	<div class="space-y-8">
		<?php
		foreach ( $medora_groups as $medora_index => $medora_group ) {
			get_template_part(
				'template-parts/faq/group',
				null,
				array(
					'group'      => $medora_group,
					'open_first' => 0 === $medora_index,
				)
			);
		}
		?>
	</div>
</div>
