<?php
/**
 * The storefront homepage.
 *
 * The order of the sections is the order the design uses. Each one reads WordPress or
 * WooCommerce, and each can be switched off on the theme's settings page. When the front page is
 * a real page with content (an Elementor page, say), that content is printed first — so the page
 * builder and the theme's own sections work together instead of competing.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="primary" class="medora-main flex-1">
	<?php
	// Content of the page WordPress is using as the front page, if any.
	if ( have_posts() ) :
		while ( have_posts() ) :
			the_post();

			$medora_content = trim( get_the_content() );

			if ( $medora_content ) :
				?>
				<div class="container mt-6">
					<div class="medora-prose"><?php the_content(); ?></div>
				</div>
				<?php
			endif;
		endwhile;
	endif;

	$medora_sections = array( 'hero', 'categories', 'sale', 'banners', 'featured', 'new', 'benefits', 'promo', 'testimonials', 'blog', 'newsletter' );

	foreach ( $medora_sections as $medora_section ) {
		if ( medora_section_enabled( $medora_section ) ) {
			get_template_part( 'template-parts/home/' . $medora_section );
		}
	}
	?>
</main>
<?php
get_footer();
