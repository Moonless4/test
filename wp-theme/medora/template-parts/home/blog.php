<?php
/**
 * The latest blog posts — real WordPress posts with their own featured images.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

$medora_posts = medora_latest_posts( (int) medora_setting( 'blog_limit', 3 ) );

if ( ! $medora_posts ) {
	return;
}

$medora_posts_page = get_option( 'page_for_posts' );
?>
<section class="container mt-12 sm:mt-16" aria-label="<?php esc_attr_e( 'آخرین نوشته‌ها', 'medora' ); ?>">
	<?php
	medora_section_header(
		array(
			'title'      => medora_setting( 'blog_title' ),
			'eyebrow'    => medora_setting( 'blog_eyebrow' ),
			'link_url'   => $medora_posts_page ? get_permalink( $medora_posts_page ) : '',
			'link_label' => __( 'همهٔ نوشته‌ها', 'medora' ),
		)
	);
	?>

	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
		<?php foreach ( $medora_posts as $medora_index => $medora_post ) : ?>
			<div class="reveal" style="transition-delay: <?php echo esc_attr( min( $medora_index * 90, 360 ) ); ?>ms">
				<article class="flex h-full flex-col overflow-hidden rounded-panel border border-line bg-white shadow-soft">
					<a href="<?php echo esc_url( get_permalink( $medora_post ) ); ?>" class="block aspect-[16/10] w-full overflow-hidden bg-cream" aria-label="<?php echo esc_attr( get_the_title( $medora_post ) ); ?>" tabindex="-1">
						<?php echo get_the_post_thumbnail( $medora_post, 'medora-banner', array( 'class' => 'h-full w-full object-cover' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core markup. ?>
					</a>

					<div class="flex flex-1 flex-col gap-2 p-5">
						<span class="text-[11.5px] text-muted">
							<?php echo esc_html( medora_to_fa( get_the_date( '', $medora_post ) ) ); ?>
						</span>
						<h3 class="text-[15px] font-bold leading-7 text-ink">
							<a href="<?php echo esc_url( get_permalink( $medora_post ) ); ?>" class="transition-colors hover:text-teal-800"><?php echo esc_html( get_the_title( $medora_post ) ); ?></a>
						</h3>
						<p class="text-[12.5px] leading-6 text-muted"><?php echo esc_html( wp_trim_words( wp_strip_all_tags( $medora_post->post_content ), 18 ) ); ?></p>
						<span class="mt-auto pt-2 text-[12.5px] font-medium text-teal-800">
							<?php esc_html_e( 'ادامهٔ مطلب', 'medora' ); ?>
						</span>
					</div>
				</article>
			</div>
		<?php endforeach; ?>
	</div>
</section>
