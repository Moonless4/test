<?php
/**
 * Ofogh Properties theme functions.
 *
 * @package Ofogh
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'OFOGH_VERSION', '1.0.0' );
define( 'OFOGH_DIR', get_template_directory() );
define( 'OFOGH_URI', get_template_directory_uri() );

require_once OFOGH_DIR . '/inc/theme-functions.php';
require_once OFOGH_DIR . '/inc/cpt-property.php';
require_once OFOGH_DIR . '/inc/meta-boxes.php';
require_once OFOGH_DIR . '/inc/customizer.php';
require_once OFOGH_DIR . '/inc/elementor.php';
require_once OFOGH_DIR . '/inc/woocommerce.php';
require_once OFOGH_DIR . '/inc/theme-activation.php';

/**
 * Theme setup: theme support, image sizes, nav menus.
 */
function ofogh_setup() {
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'automatic-feed-links' );
    add_theme_support( 'custom-logo', array(
        'height'      => 40,
        'width'       => 160,
        'flex-height' => true,
        'flex-width'  => true,
    ) );
    add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
    add_theme_support( 'responsive-embeds' );
    add_theme_support( 'align-wide' );
    add_theme_support( 'editor-styles' );

    // Image sizes for properties.
    add_image_size( 'ofogh-card', 1280, 960, true );
    add_image_size( 'ofogh-wide', 1280, 880, true );
    add_image_size( 'ofogh-portrait', 640, 853, true );
    add_image_size( 'ofogh-hero', 2000, 1333, true );

    register_nav_menus( array(
        'primary' => __( 'فهرست اصلی', 'ofogh' ),
        'footer'  => __( 'فهرست پانوشت', 'ofogh' ),
        'mobile'  => __( 'فهرست موبایل', 'ofogh' ),
    ) );

    // Make Persian the default text domain.
    load_theme_textdomain( 'ofogh', OFOGH_DIR . '/languages' );
}
add_action( 'after_setup_theme', 'ofogh_setup' );

/**
 * Set content width.
 */
function ofogh_content_width() {
    $GLOBALS['content_width'] = 1280;
}
add_action( 'after_setup_theme', 'ofogh_content_width', 0 );

/**
 * Enqueue styles and scripts.
 */
function ofogh_enqueue_assets() {
    // Vazirmatn font.
    wp_enqueue_style( 'ofogh-fonts', 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap', array(), null );

    // Main stylesheet.
    wp_enqueue_style( 'ofogh-style', get_stylesheet_uri(), array(), OFOGH_VERSION );
    wp_enqueue_style( 'ofogh-main', OFOGH_URI . '/assets/css/main.css', array( 'ofogh-style' ), OFOGH_VERSION );

    // RTL stylesheet (WordPress auto-loads rtl.css; we also load ours explicitly).
    if ( is_rtl() ) {
        wp_enqueue_style( 'ofogh-rtl', OFOGH_URI . '/assets/css/rtl.css', array( 'ofogh-main' ), OFOGH_VERSION );
    }

    // Main script.
    wp_enqueue_script( 'ofogh-main', OFOGH_URI . '/assets/js/main.js', array(), OFOGH_VERSION, true );

    // Property filters (only on property archive).
    if ( is_post_type_archive( 'property' ) ) {
        wp_enqueue_script( 'ofogh-filters', OFOGH_URI . '/assets/js/filters.js', array( 'ofogh-main' ), OFOGH_VERSION, true );
    }

    // Pass data to JS.
    wp_localize_script( 'ofogh-main', 'ofoghData', array(
        'ajaxUrl'   => admin_url( 'admin-ajax.php' ),
        'nonce'     => wp_create_nonce( 'ofogh-nonce' ),
        'favorites' => isset( $_COOKIE['ofogh_favorites'] ) ? explode( ',', $_COOKIE['ofogh_favorites'] ) : array(),
    ) );

    // Threaded comments.
    if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
        wp_enqueue_script( 'comment-reply' );
    }
}
add_action( 'wp_enqueue_scripts', 'ofogh_enqueue_assets' );

/**
 * Add preconnect for Google Fonts.
 */
function ofogh_resource_hints( $hints, $relation_type ) {
    if ( 'preconnect' === $relation_type ) {
        $hints[] = array( 'href' => 'https://fonts.gstatic.com', 'crossorigin' );
        $hints[] = array( 'href' => 'https://images.unsplash.com', 'crossorigin' );
    }
    return $hints;
}
add_filter( 'wp_resource_hints', 'ofogh_resource_hints', 10, 2 );

/**
 * Body classes.
 */
function ofogh_body_classes( $classes ) {
    $classes[] = 'ofogh-theme';
    if ( is_front_page() ) {
        $classes[] = 'is-front-page';
    }
    if ( ! is_front_page() ) {
        $classes[] = 'is-interior';
    }
    return $classes;
}
add_filter( 'body_class', 'ofogh_body_classes' );

/**
 * Default menu fallback — show the nav links if no menu is assigned.
 */
function ofogh_default_menu() {
    $links = ofogh_default_nav_links();
    echo '<nav class="header-nav" aria-label="' . esc_attr__( 'فهرست اصلی', 'ofogh' ) . '">';
    foreach ( $links as $link ) {
        echo '<a href="' . esc_url( $link['url'] ) . '">' . esc_html( $link['label'] ) . '</a>';
    }
    echo '</nav>';
}

/**
 * Fallback for footer menu.
 */
function ofogh_default_footer_menu() {
    $links = ofogh_default_nav_links();
    echo '<ul>';
    foreach ( $links as $link ) {
        echo '<li><a href="' . esc_url( $link['url'] ) . '">' . esc_html( $link['label'] ) . '</a></li>';
    }
    echo '</ul>';
}

/**
 * Register widget areas.
 */
function ofogh_widgets_init() {
    register_sidebar( array(
        'name'          => __( 'نوار کنونی 博客', 'ofogh' ),
        'id'            => 'sidebar-1',
        'description'   => __( 'ابزارک‌های نوار کنونی.', 'ofogh' ),
        'before_widget' => '<section id="%1$s" class="widget %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h2 class="widget-title eyebrow">',
        'after_title'   => '</h2>',
    ) );
}
add_action( 'widgets_init', 'ofogh_widgets_init' );

/**
 * Custom excerpt length.
 */
function ofogh_excerpt_length( $length ) {
    return 30;
}
add_filter( 'excerpt_length', 'ofogh_excerpt_length' );

/**
 * Custom excerpt more.
 */
function ofogh_excerpt_more( $more ) {
    return '…';
}
add_filter( 'excerpt_more', 'ofogh_excerpt_more' );

/**
 * AJAX: handle contact form submission.
 */
function ofogh_handle_contact_form() {
    check_ajax_referer( 'ofogh-nonce', 'nonce' );

    $name    = isset( $_POST['name'] ) ? sanitize_text_field( wp_unslash( $_POST['name'] ) ) : '';
    $email   = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
    $phone   = isset( $_POST['phone'] ) ? sanitize_text_field( wp_unslash( $_POST['phone'] ) ) : '';
    $message = isset( $_POST['message'] ) ? sanitize_textarea_field( wp_unslash( $_POST['message'] ) ) : '';
    $kind    = isset( $_POST['kind'] ) ? sanitize_text_field( wp_unslash( $_POST['kind'] ) ) : 'contact';

    if ( empty( $name ) || empty( $email ) || empty( $message ) ) {
        wp_send_json_error( array( 'message' => __( 'لطفاً نام، ایمیل و متن پیام را کامل کنید.', 'ofogh' ) ) );
    }
    if ( ! is_email( $email ) ) {
        wp_send_json_error( array( 'message' => __( 'این نشانی ایمیل درست به نظر نمی‌رسد.', 'ofogh' ) ) );
    }

    // Save as a private inquiry post (or email admin).
    $inquiry_id = wp_insert_post( array(
        'post_type'   => 'ofogh_inquiry',
        'post_status' => 'private',
        'post_title'  => sprintf( '[%s] %s', $kind, $name ),
        'post_content' => $message,
    ) );

    if ( $inquiry_id ) {
        update_post_meta( $inquiry_id, '_inquiry_name', $name );
        update_post_meta( $inquiry_id, '_inquiry_email', $email );
        update_post_meta( $inquiry_id, '_inquiry_phone', $phone );
        update_post_meta( $inquiry_id, '_inquiry_kind', $kind );
    }

    // Email admin.
    $to      = get_option( 'admin_email' );
    $subject = sprintf( __( 'پیام جدید از %s', 'ofogh' ), $name );
    $headers = array( 'Content-Type: text/html; charset=UTF-8', 'From: ' . $email );
    $body    = "<p><strong>نوع:</strong> {$kind}</p>";
    $body   .= "<p><strong>نام:</strong> {$name}</p>";
    $body   .= "<p><strong>ایمیل:</strong> {$email}</p>";
    if ( $phone ) {
        $body .= "<p><strong>تلفن:</strong> {$phone}</p>";
    }
    $body .= "<p><strong>پیام:</strong><br>" . nl2br( esc_html( $message ) ) . "</p>";
    wp_mail( $to, $subject, $body, $headers );

    wp_send_json_success( array( 'message' => __( 'سپاسگزاریم — پیام شما به دست ما رسید', 'ofogh' ) ) );
}
add_action( 'wp_ajax_ofogh_contact', 'ofogh_handle_contact_form' );
add_action( 'wp_ajax_nopriv_ofogh_contact', 'ofogh_handle_contact_form' );

/**
 * AJAX: toggle favorite (stores in cookie).
 */
function ofogh_toggle_favorite() {
    check_ajax_referer( 'ofogh-nonce', 'nonce' );
    $property_id = isset( $_POST['property_id'] ) ? absint( $_POST['property_id'] ) : 0;
    if ( ! $property_id ) {
        wp_send_json_error();
    }
    $favorites = isset( $_COOKIE['ofogh_favorites'] ) ? array_filter( explode( ',', $_COOKIE['ofogh_favorites'] ) ) : array();
    $favorites = array_map( 'absint', $favorites );
    $key = array_search( $property_id, $favorites, true );
    if ( false !== $key ) {
        unset( $favorites[ $key ] );
        $state = 'removed';
    } else {
        $favorites[] = $property_id;
        $state = 'added';
    }
    setcookie( 'ofogh_favorites', implode( ',', $favorites ), time() + ( 30 * DAY_IN_SECONDS ), '/' );
    wp_send_json_success( array( 'state' => $state, 'count' => count( $favorites ) ) );
}
add_action( 'wp_ajax_ofogh_favorite', 'ofogh_toggle_favorite' );
add_action( 'wp_ajax_nopriv_ofogh_favorite', 'ofogh_toggle_favorite' );

/**
 * AJAX: get property card HTML (for favorites page).
 */
function ofogh_get_property_card_ajax() {
    check_ajax_referer( 'ofogh-nonce', 'nonce' );
    $property_id = isset( $_GET['property_id'] ) ? absint( $_GET['property_id'] ) : 0;
    if ( ! $property_id ) wp_send_json_error();

    $post = get_post( $property_id );
    if ( ! $post || $post->post_type !== 'property' ) wp_send_json_error();

    setup_postdata( $post );
    ob_start();
    get_template_part( 'template-parts/property', 'card' );
    $html = ob_get_clean();
    wp_reset_postdata();

    wp_send_json_success( array( 'html' => $html ) );
}
add_action( 'wp_ajax_ofogh_get_property_card', 'ofogh_get_property_card_ajax' );
add_action( 'wp_ajax_nopriv_ofogh_get_property_card', 'ofogh_get_property_card_ajax' );

/**
 * Register inquiry CPT (private, used to store form submissions).
 */
function ofogh_register_inquiry_cpt() {
    register_post_type( 'ofogh_inquiry', array(
        'labels'          => array( 'name' => __( 'درخواست‌ها', 'ofogh' ), 'singular_name' => __( 'درخواست', 'ofogh' ) ),
        'public'          => false,
        'show_ui'         => true,
        'show_in_menu'    => true,
        'capability_type' => 'post',
        'supports'        => array( 'title', 'editor' ),
    ) );
}
add_action( 'init', 'ofogh_register_inquiry_cpt' );

/**
 * Add ARIA current class to nav menu items.
 */
function ofogh_nav_menu_css_class( $classes, $item, $args, $depth ) {
    if ( in_array( 'current-menu-item', $classes, true ) || in_array( 'current_page_item', $classes, true ) ) {
        $classes[] = 'active';
    }
    return $classes;
}
add_filter( 'nav_menu_css_class', 'ofogh_nav_menu_css_class', 10, 4 );

/**
 * Login page styling.
 */
function ofogh_login_logo_url() {
    return home_url( '/' );
}
add_filter( 'login_headerurl', 'ofogh_login_logo_url' );
