<?php
/**
 * The content types the homepage is built from.
 *
 * Every promotional surface — the slider, the banner tiles, the customer reviews and the FAQ —
 * is a real WordPress post type with its own admin screen, so the shop owner adds, edits,
 * reorders, disables and deletes them from wp-admin. Slides, banners and FAQ entries support
 * page attributes, which gives them WordPress's own ordering field (and, with the block editor,
 * drag ordering through a plugin); publishing state is what enables or disables an entry.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

/**
 * Register the promotional post types.
 */
function medora_register_post_types() {
	// Slides — the home hero.
	register_post_type(
		'medora_slide',
		array(
			'labels'          => array(
				'name'          => __( 'اسلایدر', 'medora' ),
				'singular_name' => __( 'اسلاید', 'medora' ),
				'add_new'       => __( 'افزودن اسلاید', 'medora' ),
				'add_new_item'  => __( 'افزودن اسلاید تازه', 'medora' ),
				'edit_item'     => __( 'ویرایش اسلاید', 'medora' ),
				'all_items'     => __( 'همهٔ اسلایدها', 'medora' ),
				'menu_name'     => __( 'اسلایدر', 'medora' ),
				'search_items'  => __( 'جستجوی اسلاید', 'medora' ),
				'not_found'     => __( 'اسلایدی پیدا نشد.', 'medora' ),
			),
			'public'          => false,
			'show_ui'         => true,
			'show_in_rest'    => true,
			'menu_icon'       => 'dashicons-images-alt2',
			'supports'        => array( 'title', 'editor', 'thumbnail', 'page-attributes' ),
			'capability_type' => 'post',
			'hierarchical'    => false,
			'has_archive'     => false,
			'rewrite'         => false,
		)
	);

	// Promotional banners — the two tiles under the slider and the wide promo block.
	register_post_type(
		'medora_banner',
		array(
			'labels'          => array(
				'name'          => __( 'بنرها', 'medora' ),
				'singular_name' => __( 'بنر', 'medora' ),
				'add_new'       => __( 'افزودن بنر', 'medora' ),
				'add_new_item'  => __( 'افزودن بنر تازه', 'medora' ),
				'edit_item'     => __( 'ویرایش بنر', 'medora' ),
				'all_items'     => __( 'همهٔ بنرها', 'medora' ),
				'menu_name'     => __( 'بنرها', 'medora' ),
			),
			'public'          => false,
			'show_ui'         => true,
			'show_in_rest'    => true,
			'menu_icon'       => 'dashicons-format-image',
			'supports'        => array( 'title', 'thumbnail', 'page-attributes' ),
			'capability_type' => 'post',
			'has_archive'     => false,
			'rewrite'         => false,
		)
	);

	// Customer reviews shown on the homepage (editorial quotes, not product reviews).
	register_post_type(
		'medora_review',
		array(
			'labels'          => array(
				'name'          => __( 'نظرات مشتریان', 'medora' ),
				'singular_name' => __( 'نظر مشتری', 'medora' ),
				'add_new'       => __( 'افزودن نظر', 'medora' ),
				'add_new_item'  => __( 'افزودن نظر تازه', 'medora' ),
				'edit_item'     => __( 'ویرایش نظر', 'medora' ),
				'all_items'     => __( 'همهٔ نظرات', 'medora' ),
				'menu_name'     => __( 'نظرات مشتریان', 'medora' ),
			),
			'public'          => false,
			'show_ui'         => true,
			'show_in_rest'    => true,
			'menu_icon'       => 'dashicons-format-quote',
			'supports'        => array( 'title', 'editor', 'thumbnail', 'page-attributes' ),
			'capability_type' => 'post',
			'has_archive'     => false,
			'rewrite'         => false,
		)
	);

	// FAQ entries.
	register_post_type(
		'medora_faq',
		array(
			'labels'          => array(
				'name'          => __( 'سوالات متداول', 'medora' ),
				'singular_name' => __( 'پرسش', 'medora' ),
				'add_new'       => __( 'افزودن پرسش', 'medora' ),
				'add_new_item'  => __( 'افزودن پرسش تازه', 'medora' ),
				'edit_item'     => __( 'ویرایش پرسش', 'medora' ),
				'all_items'     => __( 'همهٔ پرسش‌ها', 'medora' ),
				'menu_name'     => __( 'سوالات متداول', 'medora' ),
				'not_found'     => __( 'پرسشی پیدا نشد.', 'medora' ),
			),
			'public'          => true,
			'show_ui'         => true,
			'show_in_rest'    => true,
			'menu_icon'       => 'dashicons-editor-help',
			'supports'        => array( 'title', 'editor', 'page-attributes' ),
			'capability_type' => 'post',
			'has_archive'     => true,
			'rewrite'         => array( 'slug' => 'faq' ),
		)
	);
}
add_action( 'init', 'medora_register_post_types' );

/**
 * FAQ topics — the groups the FAQ page filters by.
 */
function medora_register_taxonomies() {
	register_taxonomy(
		'medora_faq_group',
		array( 'medora_faq' ),
		array(
			'labels'            => array(
				'name'          => __( 'موضوع‌های پرسش', 'medora' ),
				'singular_name' => __( 'موضوع', 'medora' ),
				'menu_name'     => __( 'موضوع‌ها', 'medora' ),
				'all_items'     => __( 'همهٔ موضوع‌ها', 'medora' ),
				'add_new_item'  => __( 'افزودن موضوع', 'medora' ),
				'edit_item'     => __( 'ویرایش موضوع', 'medora' ),
			),
			'hierarchical'      => true,
			'public'            => true,
			'show_ui'           => true,
			'show_in_rest'      => true,
			'show_admin_column' => true,
			'rewrite'           => array( 'slug' => 'faq-topic' ),
		)
	);
}
add_action( 'init', 'medora_register_taxonomies' );

/**
 * Order the promotional lists by the administrator's own ordering, everywhere including the
 * REST and the admin screens.
 *
 * @param WP_Query $query Query.
 */
function medora_order_promotional( $query ) {
	if ( is_admin() || ! $query->is_main_query() ) {
		return;
	}

	$type = $query->get( 'post_type' );

	if ( in_array( $type, array( 'medora_slide', 'medora_banner', 'medora_review', 'medora_faq' ), true ) ) {
		$query->set( 'orderby', array( 'menu_order' => 'ASC', 'date' => 'DESC' ) );
		$query->set( 'posts_per_page', -1 );
	}
}
add_action( 'pre_get_posts', 'medora_order_promotional' );

/**
 * Show the ordering field on the promotional lists and sort the admin list by it, so reordering
 * is visible straight away in wp-admin.
 */
function medora_admin_columns( $columns ) {
	$columns['menu_order'] = __( 'ترتیب', 'medora' );

	return $columns;
}
add_filter( 'manage_medora_slide_posts_columns', 'medora_admin_columns' );
add_filter( 'manage_medora_banner_posts_columns', 'medora_admin_columns' );
add_filter( 'manage_medora_review_posts_columns', 'medora_admin_columns' );
add_filter( 'manage_medora_faq_posts_columns', 'medora_admin_columns' );

/**
 * Print the ordering value in that column.
 *
 * @param string $column  Column key.
 * @param int    $post_id Post id.
 */
function medora_admin_column_content( $column, $post_id ) {
	if ( 'menu_order' === $column ) {
		echo esc_html( medora_to_fa( (int) get_post_field( 'menu_order', $post_id ) ) );
	}
}
add_action( 'manage_medora_slide_posts_custom_column', 'medora_admin_column_content', 10, 2 );
add_action( 'manage_medora_banner_posts_custom_column', 'medora_admin_column_content', 10, 2 );
add_action( 'manage_medora_review_posts_custom_column', 'medora_admin_column_content', 10, 2 );
add_action( 'manage_medora_faq_posts_custom_column', 'medora_admin_column_content', 10, 2 );

/**
 * The ordering column sorts on page attributes (menu_order).
 *
 * @param WP_Query $query Query.
 */
function medora_admin_orderby( $query ) {
	if ( ! is_admin() || ! $query->is_main_query() ) {
		return;
	}

	if ( in_array( $query->get( 'post_type' ), array( 'medora_slide', 'medora_banner', 'medora_review', 'medora_faq' ), true ) && 'menu_order' === $query->get( 'orderby' ) ) {
		$query->set( 'orderby', 'menu_order' );
		$query->set( 'order', 'ASC' );
	}
}
add_action( 'pre_get_posts', 'medora_admin_orderby' );

/**
 * Promotional entries are not public pages: no single view, so they never show up as a stray URL.
 *
 * @param array $args      Rewrite args.
 * @param string $post_type Post type.
 * @return array
 */
function medora_promotional_rewrites( $args, $post_type ) {
	if ( ! in_array( $post_type, array( 'medora_slide', 'medora_banner', 'medora_review' ), true ) ) {
		return $args;
	}

	$args['rewrite'] = false;

	return $args;
}
add_filter( 'register_post_type_args', 'medora_promotional_rewrites', 10, 2 );
