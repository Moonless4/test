<?php
/**
 * WooCommerce compatibility.
 *
 * @package Ofogh
 */

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Declare WooCommerce support.
 */
function ofogh_woocommerce_setup() {
    add_theme_support( 'woocommerce', array(
        'thumbnail_image_width' => 400,
        'single_image_width'    => 800,
        'product_grid'          => array(
            'default_rows'    => 3,
            'min_rows'        => 1,
            'default_columns' => 3,
            'min_columns'     => 1,
            'max_columns'     => 6,
        ),
    ) );
    add_theme_support( 'wc-product-gallery-zoom' );
    add_theme_support( 'wc-product-gallery-lightbox' );
    add_theme_support( 'wc-product-gallery-slider' );
}
add_action( 'after_setup_theme', 'ofogh_woocommerce_setup' );

/**
 * Remove default WooCommerce wrappers and add our own.
 */
remove_action( 'woocommerce_before_main_content', 'woocommerce_output_content_wrapper', 10 );
remove_action( 'woocommerce_after_main_content', 'woocommerce_output_content_wrapper_end', 10 );

function ofogh_woocommerce_wrapper_start() {
    echo '<div class="of-container"><div class="page-content" style="padding-top:128px;">';
}
add_action( 'woocommerce_before_main_content', 'ofogh_woocommerce_wrapper_start', 10 );

function ofogh_woocommerce_wrapper_end() {
    echo '</div></div>';
}
add_action( 'woocommerce_after_main_content', 'ofogh_woocommerce_wrapper_end', 10 );

/**
 * Enqueue WooCommerce-specific styles conditionally.
 */
function ofogh_woocommerce_styles() {
    if ( ! class_exists( 'WooCommerce' ) ) return;
    if ( is_woocommerce() || is_shop() || is_product_category() || is_product_tag() || is_product() || is_cart() || is_checkout() || is_account_page() ) {
        wp_enqueue_style( 'ofogh-woo', OFOGH_URI . '/assets/css/woocommerce.css', array( 'ofogh-main' ), OFOGH_VERSION );
    }
}
add_action( 'wp_enqueue_scripts', 'ofogh_woocommerce_styles' );

/**
 * Change number of products per row.
 */
function ofogh_woo_columns() {
    return 3;
}
add_filter( 'loop_shop_columns', 'ofogh_woo_columns' );

/**
 * Change products per page.
 */
function ofogh_woo_per_page( $cols ) {
    $cols = 9;
    return $cols;
}
add_filter( 'loop_shop_per_page', 'ofogh_woo_per_page' );
