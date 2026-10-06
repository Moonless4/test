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

/**
 * Sync a property to a WooCommerce product when the property is saved.
 * Each property gets a linked "simple" product with the property's price.
 * This lets site owners manage payments, deposits, or inquiries through WooCommerce.
 */
function ofogh_sync_property_to_product( $post_id ) {
    if ( get_post_type( $post_id ) !== 'property' ) return;
    if ( ! class_exists( 'WooCommerce' ) ) return;

    $price  = ofogh_get_property_meta( $post_id, '_property_price', '0' );
    $title  = get_the_title( $post_id );
    $linked_product_id = get_post_meta( $post_id, '_linked_product_id', true );

    // Build product data from property meta.
    $product_data = array(
        'post_title'   => $title,
        'post_content' => get_post_field( 'post_content', $post_id ),
        'post_status'  => 'publish',
        'post_type'    => 'product',
    );

    if ( $linked_product_id && get_post( $linked_product_id ) ) {
        // Update existing linked product.
        $product_data['ID'] = $linked_product_id;
        wp_update_post( $product_data );
    } else {
        // Create new product.
        $linked_product_id = wp_insert_post( $product_data );
        if ( $linked_product_id ) {
            update_post_meta( $post_id, '_linked_product_id', $linked_product_id );
            update_post_meta( $linked_product_id, '_linked_property_id', $post_id );
        }
    }

    if ( ! $linked_product_id ) return;

    // Set product type to "simple" and assign price.
    wp_set_object_terms( $linked_product_id, 'simple', 'product_type' );
    update_post_meta( $linked_product_id, '_price', $price );
    update_post_meta( $linked_product_id, '_regular_price', $price );
    update_post_meta( $linked_product_id, '_visibility', 'visible' );
    update_post_meta( $linked_product_id, '_virtual', 'no' );
    update_post_meta( $linked_product_id, '_downloadable', 'no' );
    update_post_meta( $linked_product_id, '_manage_stock', 'no' );
    update_post_meta( $linked_product_id, '_stock_status', 'instock' );

    // Sync featured image.
    if ( has_post_thumbnail( $post_id ) ) {
        $thumb_id = get_post_thumbnail_id( $post_id );
        set_post_thumbnail( $linked_product_id, $thumb_id );
    }
}
add_action( 'save_post_property', 'ofogh_sync_property_to_product', 20 );

/**
 * Get the add-to-cart URL for a property's linked WooCommerce product.
 *
 * @param int $property_id Property post ID.
 * @return string|false Add-to-cart URL or false if no product.
 */
function ofogh_property_add_to_cart_url( $property_id ) {
    if ( ! class_exists( 'WooCommerce' ) ) return false;

    $linked_product_id = get_post_meta( $property_id, '_linked_product_id', true );
    if ( ! $linked_product_id || ! get_post( $linked_product_id ) ) return false;

    $product = wc_get_product( $linked_product_id );
    if ( ! $product ) return false;

    return $product->add_to_cart_url();
}

/**
 * Get the WooCommerce product ID linked to a property.
 */
function ofogh_property_product_id( $property_id ) {
    if ( ! class_exists( 'WooCommerce' ) ) return false;

    $linked_product_id = get_post_meta( $property_id, '_linked_product_id', true );
    if ( ! $linked_product_id || ! get_post( $linked_product_id ) ) return false;

    return $linked_product_id;
}

/**
 * Redirect WooCommerce product single pages to their linked property page.
 * Properties are managed through the property CPT; WooCommerce is used only for
 * the checkout/cart/payment flow.
 */
function ofogh_redirect_product_to_property() {
    if ( ! class_exists( 'WooCommerce' ) ) return;
    if ( ! is_product() ) return;

    $product_id = get_the_ID();
    $property_id = get_post_meta( $product_id, '_linked_property_id', true );
    if ( $property_id && get_post( $property_id ) ) {
        wp_safe_redirect( get_permalink( $property_id ), 301 );
        exit;
    }
}
add_action( 'template_redirect', 'ofogh_redirect_product_to_property' );
