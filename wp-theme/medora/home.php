<?php
/**
 * The posts page (the archive of blog posts when the front page is a static page).
 *
 * It renders the same loop the index does, so the blog looks identical whether WordPress routes
 * to this template or to index.php.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

get_header();

$medora_sidebar = is_active_sidebar( 'blog-sidebar' );
?>
<main id="primary" class="medora-main container flex-1 py-8">
	<header class="mb-6">
		<h1 class="text-xl font-bold text-ink sm:text-2xl lg:text-[28px]"><?php single_post_title(); ?></h1>
		<span class="mt-3 block h-1 w-12 rounded-full bg-teal-800"></span>
	</header>

	<div class="medora-archive-layout <?php echo $medora_sidebar ? 'has-sidebar' : ''; ?>">
		<div class="medora-archive-content">
			<?php
			get_template_part( 'template-parts/content/archive-loop' );

			the_posts_pagination(
				array(
					'mid_size'  => 1,
					'prev_text' => medora_icon( 'chevron-right', 'h-4 w-4' ),
					'next_text' => medora_icon( 'chevron-left', 'h-4 w-4' ),
					'class'     => 'medora-pagination mt-8',
				)
			);
			?>
		</div>

		<?php if ( $medora_sidebar ) : ?>
			<aside class="medora-archive-sidebar" aria-label="<?php esc_attr_e( 'ابزارها', 'medora' ); ?>">
				<?php dynamic_sidebar( 'blog-sidebar' ); ?>
			</aside>
		<?php endif; ?>
	</div>
</main>
<?php
get_footer();
