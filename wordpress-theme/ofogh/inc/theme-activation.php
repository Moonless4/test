<?php
/**
 * Theme activation — creates default pages and sets up reading settings.
 *
 * @package Ofogh
 */

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * On theme activation: create default pages and set front page.
 */
function ofogh_after_switch_theme() {
    // Default page definitions.
    $pages = array(
        'properties' => array(
            'title'   => __( 'املاک', 'ofogh' ),
            'content' => '',
            'template' => '', // Uses archive-property.php via CPT.
        ),
        'about' => array(
            'title'   => __( 'درباره ما', 'ofogh' ),
            'content' => '<!-- wp:paragraph --><p>املاک افق بر یک باور ساده بنا شد: بهترین خانه‌ها فروخته نمی‌شوند، واگذار می‌شوند. کار ما این است که یک بنا، خیابانی که در آن نشسته و زندگی‌ای که برایش خریداری می‌شود را بشناسیم — و سپس خریداری را بیابیم که بیشترین ارزش را برای آن قائل است.</p><!-- /wp:paragraph -->',
        ),
        'services' => array(
            'title'   => __( 'خدمات', 'ofogh' ),
            'content' => '',
        ),
        'team' => array(
            'title'   => __( 'تیم ما', 'ofogh' ),
            'content' => '',
        ),
        'contact' => array(
            'title'   => __( 'تماس', 'ofogh' ),
            'content' => '',
        ),
        'favorites' => array(
            'title'   => __( 'املاک ذخیره‌شده', 'ofogh' ),
            'content' => '',
        ),
    );

    $created_pages = array();

    foreach ( $pages as $slug => $page_data ) {
        // Check if page already exists.
        $existing = get_page_by_path( $slug );
        if ( $existing ) {
            $created_pages[ $slug ] = $existing->ID;
            continue;
        }

        $page_id = wp_insert_post( array(
            'post_title'   => $page_data['title'],
            'post_name'    => $slug,
            'post_content' => $page_data['content'],
            'post_status'  => 'publish',
            'post_type'    => 'page',
            'post_author'  => 1,
        ) );

        if ( $page_id && ! is_wp_error( $page_id ) ) {
            $created_pages[ $slug ] = $page_id;
        }
    }

    // Set front page to home page, posts page to blog.
    $home_page = get_page_by_path( 'properties' );
    if ( $home_page ) {
        update_option( 'show_on_front', 'page' );
        // Use the front-page.php template for the homepage.
        // Create a "home" page for the front page.
        $home = get_page_by_path( 'home' );
        if ( ! $home ) {
            $home_id = wp_insert_post( array(
                'post_title'  => __( 'خانه', 'ofogh' ),
                'post_name'   => 'home',
                'post_status' => 'publish',
                'post_type'   => 'page',
                'post_author' => 1,
            ) );
            if ( $home_id && ! is_wp_error( $home_id ) ) {
                update_option( 'page_on_front', $home_id );
            }
        } else {
            update_option( 'page_on_front', $home->ID );
        }
    }

    // Set permalink structure for pretty URLs (property CPT needs this).
    if ( ! get_option( 'permalink_structure' ) ) {
        update_option( 'permalink_structure', '/%postname%/' );
    }

    // Flush rewrite rules so the property CPT URLs work.
    flush_rewrite_rules();
}
add_action( 'after_switch_theme', 'ofogh_after_switch_theme' );
