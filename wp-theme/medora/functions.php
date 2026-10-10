<?php
/**
 * Medora theme bootstrap.
 *
 * The theme carries the storefront design of the Medora shop and hands every piece of commerce
 * to WooCommerce: products, prices, cart, checkout, accounts, orders and reviews are rendered by
 * WooCommerce's own templates and functions, styled by the theme. Nothing here keeps a catalogue
 * of its own — WordPress and WooCommerce stay the source of truth.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

define( 'MEDORA_VERSION', '1.0.0' );
define( 'MEDORA_DIR', get_template_directory() );
define( 'MEDORA_URI', get_template_directory_uri() );

/**
 * Is WooCommerce active? The theme renders its commerce surfaces from WooCommerce, so the
 * templates ask this instead of assuming the plugin is there.
 *
 * @return bool
 */
function medora_has_woocommerce() {
	return class_exists( 'WooCommerce' );
}

require_once MEDORA_DIR . '/inc/setup.php';
require_once MEDORA_DIR . '/inc/template-tags.php';
require_once MEDORA_DIR . '/inc/enqueue.php';
require_once MEDORA_DIR . '/inc/post-types.php';
require_once MEDORA_DIR . '/inc/meta-boxes.php';
require_once MEDORA_DIR . '/inc/menu-meta.php';
require_once MEDORA_DIR . '/inc/customizer.php';
require_once MEDORA_DIR . '/inc/admin-settings.php';
require_once MEDORA_DIR . '/inc/ajax.php';
require_once MEDORA_DIR . '/inc/sections.php';

if ( medora_has_woocommerce() ) {
	require_once MEDORA_DIR . '/inc/woocommerce.php';
}
