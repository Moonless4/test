<?php
/**
 * Template Name: سوالات متداول (مدورا)
 * Template Post Type: page
 *
 * A page template that prints the shop's FAQ entries — grouped by topic, filterable — so the FAQ
 * can live on any page the administrator chooses instead of only at the archive URL.
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
		<header class="mb-8 max-w-2xl">
			<h1 class="text-xl font-bold text-ink sm:text-2xl lg:text-[28px]"><?php the_title(); ?></h1>
			<span class="mt-3 block h-1 w-12 rounded-full bg-teal-800"></span>
			<?php if ( get_the_content() ) : ?>
				<div class="medora-prose mt-4 text-[13px] leading-7 text-muted"><?php the_content(); ?></div>
			<?php endif; ?>
		</header>

		<?php get_template_part( 'template-parts/faq/page' ); ?>
	<?php endwhile; ?>
</main>
<?php
get_footer();
