<?php
/**
 * Elementor compatibility.
 *
 * @package Ofogh
 */

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Tell Elementor this theme supports it.
 */
function ofogh_setup_elementor() {
    add_theme_support( 'elementor' );
}
add_action( 'after_setup_theme', 'ofogh_setup_elementor' );

/**
 * Register Elementor locations (header, footer, single, archive).
 */
function ofogh_register_elementor_locations( $elementor_theme_manager ) {
    $elementor_theme_manager->register_location( 'header' );
    $elementor_theme_manager->register_location( 'footer' );
    $elementor_theme_manager->register_location( 'single' );
    $elementor_theme_manager->register_location( 'archive' );
}
add_action( 'elementor/theme/register_locations', 'ofogh_register_elementor_locations' );

/**
 * If Elementor Theme Builder has a header/footer template, skip the theme's own.
 */
function ofogh_elementor_has_header() {
    if ( ! class_exists( '\ElementorPro\Modules\ThemeBuilder\Module' ) ) return false;
    $locations = \ElementorPro\Modules\ThemeBuilder\Module::instance()->get_locations_manager();
    return $locations->get_location( 'header' ) && $locations->do_location( 'header' );
}

function ofogh_elementor_has_footer() {
    if ( ! class_exists( '\ElementorPro\Modules\ThemeBuilder\Module' ) ) return false;
    $locations = \ElementorPro\Modules\ThemeBuilder\Module::instance()->get_locations_manager();
    return $locations->get_location( 'footer' ) && $locations->do_location( 'footer' );
}
