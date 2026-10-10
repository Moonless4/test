<?php
/**
 * Search results.
 *
 * A product search (the header's search box) renders the WooCommerce loop with the theme's card;
 * a content search renders post cards. Whichever it is, the results are the query WordPress and
 * WooCommerce built — no second search of the theme's own.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

get_header();

$medora_is_products = false;

if ( have_posts() ) {
	$medora_first       = get_post();
	$medora_is_products = $medora_first && 'product' === $medora_first->post_type;
}
?>
<main id="primary" class="medora-main container flex-1 py-8">
	<header class="mb-6">
		<h1 class="text-xl font-bold text-ink sm:text-2xl lg:text-[28px]">
			<?php
			printf(
				/* translators: %s: search query. */
				esc_html__( 'نتایج جستجو برای «%s»', 'medora' ),
				esc_html( get_search_query() )
			);
			?>
		</h1>
		<span class="mt-3 block h-1 w-12 rounded-full bg-teal-800"></span>
		<p class="mt-3 text-[13px] text-muted">
			<?php
			printf(
				/* translators: %s: result count. */
				esc_html__( '%s نتیجه', 'medora' ),
				esc_html( medora_to_fa( (int) $GLOBALS['wp_query']->found_posts ) )
			);
			?>
		</p>
	</header>

	<?php if ( have_posts() ) : ?>
		<?php if ( $medora_is_products && function_exists( 'woocommerce_product_loop_start' ) ) : ?>
			<?php
			woocommerce_product_loop_start();

			while ( have_posts() ) :
				the_post();
				wc_get_template_part( 'content', 'product' );
			endwhile;

			woocommerce_product_loop_end();
			woocommerce_pagination();
			?>
		<?php else : ?>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
				<?php
				while ( have_posts() ) :
					the_post();
					get_template_part( 'template-parts/content/card' );
				endwhile;
				?>
			</div>

			<?php
			the_posts_pagination(
				array(
					'mid_size'  => 1,
					'prev_text' => medora_icon( 'chevron-right', 'h-4 w-4' ),
					'next_text' => medora_icon( 'chevron-left', 'h-4 w-4' ),
					'class'     => 'medora-pagination mt-8',
				)
			);
			?>
		<?php endif; ?>
	<?php else : ?>
		<?php get_template_part( 'template-parts/content/none' ); ?>
	<?php endif; ?>
</main>
<?php
get_footer();
