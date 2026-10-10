<?php
/**
 * Section data: the queries the homepage sections render from.
 *
 * Every list here reads WordPress or WooCommerce. Nothing is hard-coded: an empty result makes
 * its section disappear rather than print filler.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

/**
 * The slides the hero renders, in the administrator's order, published only.
 *
 * @param int $limit Maximum slides (0 = all).
 * @return WP_Post[]
 */
function medora_slides( $limit = 0 ) {
	return get_posts(
		array(
			'post_type'           => 'medora_slide',
			'post_status'         => 'publish',
			'posts_per_page'      => $limit > 0 ? $limit : 10,
			'orderby'             => array( 'menu_order' => 'ASC', 'date' => 'DESC' ),
			'ignore_sticky_posts' => true,
			'no_found_rows'       => true,
		)
	);
}

/**
 * One slide as the template needs it.
 *
 * @param WP_Post $post Slide.
 * @return array
 */
function medora_slide_data( $post ) {
	$image_id       = (int) get_post_thumbnail_id( $post );
	$phone_image_id = (int) get_post_meta( $post->ID, '_medora_phone_image', true );

	return array(
		'id'             => $post->ID,
		'eyebrow'        => (string) get_post_meta( $post->ID, '_medora_eyebrow', true ),
		'subtitle'       => (string) get_post_meta( $post->ID, '_medora_text', true ),
		'title'          => get_the_title( $post ),
		'description'    => $post->post_content,
		'image_id'       => $image_id,
		'phone_image_id' => $phone_image_id ? $phone_image_id : $image_id,
		'button_label'   => (string) get_post_meta( $post->ID, '_medora_button_label', true ),
		'button_url'     => (string) get_post_meta( $post->ID, '_medora_button_url', true ),
		'overlay'        => (string) get_post_meta( $post->ID, '_medora_overlay', true ),
	);
}

/**
 * The first slide, for the preload hint.
 *
 * @return array|false
 */
function medora_first_slide() {
	$slides = medora_slides( 1 );

	if ( ! $slides ) {
		return false;
	}

	return medora_slide_data( $slides[0] );
}

/**
 * Banner entries by position, in the administrator's order.
 *
 * @param string $position grid|promo.
 * @param int    $limit    Maximum entries.
 * @return WP_Post[]
 */
function medora_banners( $position = 'grid', $limit = 4 ) {
	return get_posts(
		array(
			'post_type'      => 'medora_banner',
			'post_status'    => 'publish',
			'posts_per_page' => $limit,
			'meta_key'       => '_medora_position',
			'meta_value'     => $position,
			'orderby'        => array( 'menu_order' => 'ASC', 'date' => 'DESC' ),
			'no_found_rows'  => true,
		)
	);
}

/**
 * Customer reviews for the homepage, in the administrator's order.
 *
 * @param int $limit Maximum entries.
 * @return WP_Post[]
 */
function medora_reviews( $limit = 6 ) {
	return get_posts(
		array(
			'post_type'      => 'medora_review',
			'post_status'    => 'publish',
			'posts_per_page' => $limit,
			'orderby'        => array( 'menu_order' => 'ASC', 'date' => 'DESC' ),
			'no_found_rows'  => true,
		)
	);
}

/**
 * FAQ groups with their published questions, ordered by the administrator's ordering.
 *
 * @return array[] Each entry: term, questions (WP_Post[]).
 */
function medora_faq_groups() {
	$terms = get_terms(
		array(
			'taxonomy'   => 'medora_faq_group',
			'hide_empty' => true,
		)
	);

	$groups = array();

	if ( ! is_wp_error( $terms ) ) {
		foreach ( $terms as $term ) {
			$questions = get_posts(
				array(
					'post_type'      => 'medora_faq',
					'post_status'    => 'publish',
					'posts_per_page' => 50,
					'orderby'        => array( 'menu_order' => 'ASC', 'date' => 'DESC' ),
					'tax_query'      => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
						array(
							'taxonomy' => 'medora_faq_group',
							'field'    => 'term_id',
							'terms'    => $term->term_id,
						),
					),
					'no_found_rows'  => true,
				)
			);

			if ( $questions ) {
				$groups[] = array(
					'term'      => $term,
					'questions' => $questions,
				);
			}
		}
	}

	// Questions that carry no topic still belong on the page.
	$ungrouped = get_posts(
		array(
			'post_type'      => 'medora_faq',
			'post_status'    => 'publish',
			'posts_per_page' => 50,
			'orderby'        => array( 'menu_order' => 'ASC', 'date' => 'DESC' ),
			'tax_query'      => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
				array(
					'taxonomy' => 'medora_faq_group',
					'operator' => 'NOT EXISTS',
				),
			),
			'no_found_rows'  => true,
		)
	);

	if ( $ungrouped ) {
		$groups[] = array(
			'term'      => null,
			'questions' => $ungrouped,
		);
	}

	return $groups;
}

/**
 * The top-level product categories, in WooCommerce's own ordering.
 *
 * @param int $limit Maximum categories.
 * @return array[] Each entry: term, image id.
 */
function medora_top_categories( $limit = 6 ) {
	if ( ! medora_has_woocommerce() ) {
		return array();
	}

	$terms = get_terms(
		array(
			'taxonomy'   => 'product_cat',
			'hide_empty' => true,
			'parent'     => 0,
			'number'     => $limit,
			'orderby'    => 'menu_order',
			'order'      => 'ASC',
		)
	);

	if ( is_wp_error( $terms ) ) {
		return array();
	}

	$categories = array();

	foreach ( $terms as $term ) {
		$categories[] = array(
			'term'     => $term,
			'image_id' => (int) get_term_meta( $term->term_id, 'thumbnail_id', true ),
			'url'      => get_term_link( $term ),
		);
	}

	return $categories;
}

/**
 * Products on sale that meet the configured minimum discount, cheapest loss first.
 *
 * WooCommerce publishes both prices, so the discount is computed, never stored: a product only
 * enters this list while its sale price actually is below its regular price by the configured
 * percentage.
 *
 * @param int $min_discount Minimum discount percentage.
 * @param int $limit        Maximum products.
 * @return WC_Product[]
 */
function medora_sale_products( $min_discount = null, $limit = null ) {
	if ( ! medora_has_woocommerce() ) {
		return array();
	}

	$min_discount = null === $min_discount ? (int) medora_setting( 'min_discount' ) : (int) $min_discount;
	$limit        = null === $limit ? (int) medora_setting( 'sale_limit' ) : (int) $limit;

	if ( $min_discount < 1 ) {
		$min_discount = 1;
	}

	$ids = wc_get_product_ids_on_sale();

	if ( ! $ids ) {
		return array();
	}

	$products = array();

	foreach ( $ids as $id ) {
		$product = wc_get_product( $id );

		if ( ! $product || ! $product->is_visible() ) {
			continue;
		}

		// Only products whose discount we can prove from the two published prices.
		if ( medora_discount_percent( $product ) < $min_discount ) {
			continue;
		}

		$products[] = $product;
	}

	usort(
		$products,
		function ( $a, $b ) {
			return medora_discount_percent( $b ) <=> medora_discount_percent( $a );
		}
	);

	return $limit > 0 ? array_slice( $products, 0, $limit ) : $products;
}

/**
 * The moment the sale section counts down to: the soonest real sale end date among the products
 * on show. WooCommerce stores those dates with the product's sale schedule, so the countdown is
 * never a number written into the theme.
 *
 * @param WC_Product[] $products Products in the section.
 * @return int Unix timestamp, or 0 when no product carries an end date.
 */
function medora_sale_end_timestamp( $products ) {
	$soonest = 0;

	foreach ( $products as $product ) {
		if ( ! $product->is_on_sale() ) {
			continue;
		}

		// Variations can carry their own schedule; the parent's date covers the common case.
		$end = $product->get_date_on_sale_to();

		if ( ! $end ) {
			continue;
		}

		$timestamp = $end->getTimestamp();

		if ( $timestamp > time() && ( 0 === $soonest || $timestamp < $soonest ) ) {
			$soonest = $timestamp;
		}
	}

	return $soonest;
}

/**
 * Featured products (the WooCommerce "featured" star).
 *
 * @param int $limit Maximum products.
 * @return WC_Product[]
 */
function medora_featured_products( $limit = 8 ) {
	if ( ! medora_has_woocommerce() ) {
		return array();
	}

	$args = array(
		'status'   => 'publish',
		'featured' => true,
		'limit'    => $limit,
		'orderby'  => 'date',
		'order'    => 'DESC',
	);

	$products = wc_get_products( $args );

	if ( ! $products ) {
		// No product has been starred yet: fall back to the newest, so the rail is never empty.
		$products = wc_get_products(
			array(
				'status'  => 'publish',
				'limit'   => $limit,
				'orderby' => 'date',
				'order'   => 'DESC',
			)
		);
	}

	return $products;
}

/**
 * Newest products.
 *
 * @param int $limit Maximum products.
 * @return WC_Product[]
 */
function medora_new_products( $limit = 8 ) {
	if ( ! medora_has_woocommerce() ) {
		return array();
	}

	return wc_get_products(
		array(
			'status'  => 'publish',
			'limit'   => $limit,
			'orderby' => 'date',
			'order'   => 'DESC',
		)
	);
}

/**
 * Best selling products, for the "popular" rail.
 *
 * @param int $limit Maximum products.
 * @return WC_Product[]
 */
function medora_best_sellers( $limit = 8 ) {
	if ( ! medora_has_woocommerce() ) {
		return array();
	}

	return wc_get_products(
		array(
			'status'   => 'publish',
			'limit'    => $limit,
			'orderby'  => 'meta_value_num',
			'meta_key' => 'total_sales', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
		)
	);
}

/**
 * The latest posts for the homepage blog rail.
 *
 * @param int $limit Maximum posts.
 * @return WP_Post[]
 */
function medora_latest_posts( $limit = 3 ) {
	return get_posts(
		array(
			'post_type'      => 'post',
			'post_status'    => 'publish',
			'posts_per_page' => $limit,
			'no_found_rows'  => true,
		)
	);
}

/**
 * The shop URL, wherever WooCommerce put it.
 *
 * @return string
 */
function medora_shop_url() {
	return medora_has_woocommerce() ? get_permalink( wc_get_page_id( 'shop' ) ) : home_url( '/' );
}

/**
 * The URL of the discounted catalogue (the shop ordered by discount), used by the sale section.
 *
 * @return string
 */
function medora_sale_url() {
	return medora_has_woocommerce() ? add_query_arg( 'on_sale', '1', medora_shop_url() ) : medora_shop_url();
}
