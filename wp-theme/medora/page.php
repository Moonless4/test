<?php
/**
 * A standard page. The content is whatever the administrator wrote — the block editor, classic
 * editor or Elementor, which is why nothing here is wrapped in a layout Elementor cannot escape.
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
		<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
			<?php if ( ! is_front_page() ) : ?>
				<?php woocommerce_breadcrumb(); ?>
			<?php endif; ?>

			<header class="mb-6">
				<h1 class="text-xl font-bold text-ink sm:text-2xl lg:text-[28px]"><?php the_title(); ?></h1>
				<span class="mt-3 block h-1 w-12 rounded-full bg-teal-800"></span>
			</header>

			<?php if ( has_post_thumbnail() ) : ?>
				<div class="mb-6 overflow-hidden rounded-panel">
					<?php the_post_thumbnail( 'medora-hero', array( 'class' => 'h-auto w-full object-cover' ) ); ?>
				</div>
			<?php endif; ?>

			<div class="medora-prose">
				<?php
				the_content();

				wp_link_pages(
					array(
						'before' => '<nav class="mt-6 flex flex-wrap gap-2 text-[13px]">',
						'after'  => '</nav>',
					)
				);
				?>
			</div>
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
