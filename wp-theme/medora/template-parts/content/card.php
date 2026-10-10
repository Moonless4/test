<?php
/**
 * One post card in a listing.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;
?>
<article id="post-<?php the_ID(); ?>" <?php post_class( 'flex h-full flex-col overflow-hidden rounded-panel border border-line bg-white shadow-soft' ); ?>>
	<?php if ( has_post_thumbnail() ) : ?>
		<a href="<?php the_permalink(); ?>" class="block aspect-[16/10] w-full overflow-hidden bg-cream" aria-label="<?php the_title_attribute(); ?>" tabindex="-1">
			<?php the_post_thumbnail( 'medora-banner', array( 'class' => 'h-full w-full object-cover' ) ); ?>
		</a>
	<?php endif; ?>

	<div class="flex flex-1 flex-col gap-2 p-5">
		<div class="flex flex-wrap items-center gap-2 text-[11.5px] text-muted">
			<time datetime="<?php echo esc_attr( get_the_date( DATE_W3C ) ); ?>"><?php echo esc_html( medora_to_fa( get_the_date() ) ); ?></time>
			<span aria-hidden="true">•</span>
			<?php the_category( '، ' ); ?>
		</div>

		<h2 class="text-[15px] font-bold leading-7 text-ink">
			<a href="<?php the_permalink(); ?>" class="transition-colors hover:text-teal-800"><?php the_title(); ?></a>
		</h2>

		<p class="text-[12.5px] leading-6 text-muted"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 20 ) ); ?></p>

		<a href="<?php the_permalink(); ?>" class="mt-auto pt-2 text-[12.5px] font-medium text-teal-800">
			<?php esc_html_e( 'ادامهٔ مطلب', 'medora' ); ?>
		</a>
	</div>
</article>
