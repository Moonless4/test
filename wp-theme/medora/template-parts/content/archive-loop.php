<?php
/**
 * The shared archive loop: a grid of post cards, with the empty state when nothing matched.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;
?>
<?php if ( have_posts() ) : ?>
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
		<?php
		while ( have_posts() ) :
			the_post();
			get_template_part( 'template-parts/content/card' );
		endwhile;
		?>
	</div>
<?php else : ?>
	<?php get_template_part( 'template-parts/content/none' ); ?>
<?php endif; ?>
