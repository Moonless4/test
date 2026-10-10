<?php
/**
 * A single blog post.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="primary" class="medora-main container flex-1 py-8">
	<?php
	while ( have_posts() ) :
		the_post();
		?>
		<article id="post-<?php the_ID(); ?>" <?php post_class( 'mx-auto max-w-3xl' ); ?>>
			<header class="mb-6">
				<div class="flex flex-wrap items-center gap-2 text-[12px] text-muted">
					<time datetime="<?php echo esc_attr( get_the_date( DATE_W3C ) ); ?>"><?php echo esc_html( medora_to_fa( get_the_date() ) ); ?></time>
					<span aria-hidden="true">•</span>
					<span><?php echo esc_html( get_the_author() ); ?></span>
					<?php if ( has_category() ) : ?>
						<span aria-hidden="true">•</span>
						<?php the_category( '، ' ); ?>
					<?php endif; ?>
				</div>

				<h1 class="mt-3 text-2xl font-bold leading-tight text-ink sm:text-3xl lg:text-[36px]"><?php the_title(); ?></h1>
				<span class="mt-4 block h-1 w-12 rounded-full bg-teal-800"></span>
			</header>

			<?php if ( has_post_thumbnail() ) : ?>
				<div class="mb-7 overflow-hidden rounded-panel">
					<?php the_post_thumbnail( 'medora-hero', array( 'class' => 'h-auto w-full object-cover' ) ); ?>
				</div>
			<?php endif; ?>

			<div class="medora-prose">
				<?php the_content(); ?>
			</div>

			<?php if ( has_tag() ) : ?>
				<div class="mt-6 flex flex-wrap gap-2">
					<?php foreach ( get_the_tags() as $medora_tag ) : ?>
						<a href="<?php echo esc_url( get_tag_link( $medora_tag ) ); ?>" class="rounded-full border border-line bg-white px-3 py-1.5 text-[12px] text-ink transition-colors hover:border-teal-300">
							<?php echo esc_html( $medora_tag->name ); ?>
						</a>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>

			<nav class="mt-10 grid gap-3 border-t border-line pt-6 sm:grid-cols-2" aria-label="<?php esc_attr_e( 'نوشته‌های دیگر', 'medora' ); ?>">
				<?php
				$medora_prev = get_previous_post();
				$medora_next = get_next_post();

				if ( $medora_prev ) :
					?>
					<a href="<?php echo esc_url( get_permalink( $medora_prev ) ); ?>" class="rounded-panel border border-line bg-white p-4 transition-colors hover:border-teal-300">
						<span class="block text-[11.5px] text-muted"><?php esc_html_e( 'نوشتهٔ پیشین', 'medora' ); ?></span>
						<span class="mt-1 block text-[13.5px] font-bold text-ink"><?php echo esc_html( get_the_title( $medora_prev ) ); ?></span>
					</a>
				<?php endif; ?>

				<?php if ( $medora_next ) : ?>
					<a href="<?php echo esc_url( get_permalink( $medora_next ) ); ?>" class="rounded-panel border border-line bg-white p-4 text-end transition-colors hover:border-teal-300 sm:col-start-2">
						<span class="block text-[11.5px] text-muted"><?php esc_html_e( 'نوشتهٔ بعدی', 'medora' ); ?></span>
						<span class="mt-1 block text-[13.5px] font-bold text-ink"><?php echo esc_html( get_the_title( $medora_next ) ); ?></span>
					</a>
				<?php endif; ?>
			</nav>
		</article>
		<?php
		if ( comments_open() || get_comments_number() ) {
			comments_template();
		}
	endwhile;
	?>
</main>
<?php
get_footer();
