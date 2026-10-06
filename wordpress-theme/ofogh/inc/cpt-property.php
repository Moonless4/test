<?php
/**
 * Register the Property custom post type and taxonomies.
 *
 * @package Ofogh
 */

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Register 'property' CPT and taxonomies.
 */
function ofogh_register_property_cpt() {

    $labels = array(
        'name'               => __( 'املاک', 'ofogh' ),
        'singular_name'      => __( 'ملک', 'ofogh' ),
        'add_new'            => __( 'افزودن ملک', 'ofogh' ),
        'add_new_item'       => __( 'افزودن ملک جدید', 'ofogh' ),
        'edit_item'          => __( 'ویرایش ملک', 'ofogh' ),
        'new_item'           => __( 'ملک جدید', 'ofogh' ),
        'view_item'          => __( 'مشاهدهٔ ملک', 'ofogh' ),
        'search_items'       => __( 'جست‌وجوی املاک', 'ofogh' ),
        'not_found'          => __( 'ملکی یافت نشد', 'ofogh' ),
        'not_found_in_trash' => __( 'در زباله‌دان ملکی یافت نشد', 'ofogh' ),
        'menu_name'          => __( 'املاک', 'ofogh' ),
    );

    register_post_type( 'property', array(
        'labels'        => $labels,
        'public'        => true,
        'has_archive'   => true,
        'rewrite'       => array( 'slug' => 'properties', 'with_front' => false ),
        'menu_icon'     => 'dashicons-building',
        'menu_position' => 5,
        'supports'      => array( 'title', 'editor', 'thumbnail', 'excerpt', 'comments' ),
        'show_in_rest'  => true, // Gutenberg + REST API.
    ) );

    // Property type taxonomy.
    register_taxonomy( 'property_type', 'property', array(
        'labels'            => array(
            'name'          => __( 'انواع ملک', 'ofogh' ),
            'singular_name' => __( 'نوع ملک', 'ofogh' ),
            'add_new_item'  => __( 'افزودن نوع ملک', 'ofogh' ),
        ),
        'public'            => true,
        'hierarchical'      => false,
        'show_admin_column' => true,
        'rewrite'           => array( 'slug' => 'property-type' ),
        'show_in_rest'      => true,
    ) );

    // Property city taxonomy.
    register_taxonomy( 'property_city', 'property', array(
        'labels'            => array(
            'name'          => __( 'شهرها', 'ofogh' ),
            'singular_name' => __( 'شهر', 'ofogh' ),
        ),
        'public'            => true,
        'hierarchical'      => false,
        'show_admin_column' => true,
        'rewrite'           => array( 'slug' => 'property-city' ),
        'show_in_rest'      => true,
    ) );

    // Property status taxonomy.
    register_taxonomy( 'property_status', 'property', array(
        'labels'            => array(
            'name'          => __( 'وضعیت‌ها', 'ofogh' ),
            'singular_name' => __( 'وضعیت', 'ofogh' ),
        ),
        'public'            => true,
        'hierarchical'      => false,
        'show_admin_column' => true,
        'rewrite'           => array( 'slug' => 'property-status' ),
        'show_in_rest'      => true,
    ) );
}
add_action( 'init', 'ofogh_register_property_cpt' );
