<?php
/**
 * Theme setup: supports, menus, image sizes and the WooCommerce feature flags.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

/**
 * Register everything the theme supports.
 */
function medora_setup() {
	load_theme_textdomain( 'medora', MEDORA_DIR . '/languages' );

	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'customize-selective-refresh-widgets' );
	add_theme_support( 'align-wide' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'editor-styles' );

	add_theme_support(
		'html5',
		array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script', 'navigation-widgets' )
	);

	add_theme_support(
		'custom-logo',
		array(
			'height'      => 120,
			'width'       => 565,
			'flex-height' => true,
			'flex-width'  => true,
			'header-text' => array( 'site-title', 'site-description' ),
		)
	);

	// Card photography is 4:5 in the design; the hero and banners keep their own crops.
	add_image_size( 'medora-card', 800, 1000, true );
	add_image_size( 'medora-hero', 1800, 780, true );
	add_image_size( 'medora-hero-phone', 1100, 1000, true );
	add_image_size( 'medora-banner', 1200, 600, true );
	add_image_size( 'medora-square', 600, 600, true );
	add_image_size( 'medora-avatar', 160, 160, true );

	register_nav_menus(
		array(
			'primary'  => __( 'منوی اصلی (سربرگ)', 'medora' ),
			'mobile'   => __( 'منوی موبایل', 'medora' ),
			'footer-1' => __( 'فوتر — ستون ۱', 'medora' ),
			'footer-2' => __( 'فوتر — ستون ۲', 'medora' ),
			'footer-3' => __( 'فوتر — ستون ۳', 'medora' ),
			'footer-4' => __( 'فوتر — ستون ۴', 'medora' ),
		)
	);

	/*
	 * WooCommerce. The gallery features are what the design's product page needs: a slider with
	 * its own thumbnails, zoom and a lightbox. Declaring them lets WooCommerce own the markup.
	 */
	add_theme_support( 'woocommerce', array(
		'thumbnail_image_width' => 800,
		'single_image_width'    => 1200,
		'product_grid'          => array(
			'default_columns' => 4,
			'default_rows'    => 3,
			'min_columns'     => 2,
			'max_columns'     => 6,
		),
	) );
	add_theme_support( 'wc-product-gallery-zoom' );
	add_theme_support( 'wc-product-gallery-lightbox' );
	add_theme_support( 'wc-product-gallery-slider' );
}
add_action( 'after_setup_theme', 'medora_setup' );

/**
 * Content width, used by oEmbeds and wide images.
 */
function medora_content_width() {
	$GLOBALS['content_width'] = apply_filters( 'medora_content_width', 820 );
}
add_action( 'after_setup_theme', 'medora_content_width', 0 );

/**
 * Widget areas: the shop filter rail and the blog sidebar. Both are ordinary sidebars, so the
 * shop filters stay whatever the administrator drops in them (WooCommerce filter widgets, or a
 * plugin's), instead of a filter list written into the theme.
 */
function medora_widgets_init() {
	register_sidebar(
		array(
			'name'          => __( 'ستون کنار فروشگاه', 'medora' ),
			'id'            => 'shop-sidebar',
			'description'   => __( 'فیلترها و ابزارهای کنار صفحهٔ فروشگاه.', 'medora' ),
			'before_widget' => '<section id="%1$s" class="widget %2$s mb-6 rounded-panel border border-line bg-white p-4">',
			'after_widget'  => '</section>',
			'before_title'  => '<h2 class="mb-3 text-[14px] font-bold text-ink">',
			'after_title'   => '</h2>',
		)
	);

	register_sidebar(
		array(
			'name'          => __( 'ستون کنار وبلاگ', 'medora' ),
			'id'            => 'blog-sidebar',
			'description'   => __( 'ابزارهای کنار نوشته‌ها و آرشیو.', 'medora' ),
			'before_widget' => '<section id="%1$s" class="widget %2$s mb-6 rounded-panel border border-line bg-white p-5">',
			'after_widget'  => '</section>',
			'before_title'  => '<h2 class="mb-3 text-[15px] font-bold text-ink">',
			'after_title'   => '</h2>',
		)
	);
}
add_action( 'widgets_init', 'medora_widgets_init' );

/**
 * Persian-family locales are right-to-left. WordPress only learns the direction from an installed
 * translation file, so a fresh WordPress with no language pack would render this theme
 * left-to-right and flip the whole design — the direction is decided here instead, from the
 * locale WordPress is actually running.
 *
 * @param string $output The attributes WordPress built.
 * @return string
 */
function medora_language_attributes( $output ) {
	if ( ! medora_is_rtl_locale() ) {
		return $output;
	}

	return str_replace( 'dir="ltr"', 'dir="rtl"', $output );
}
add_filter( 'language_attributes', 'medora_language_attributes' );

/**
 * Is this WordPress running an RTL locale (or a Persian-family one that has no translation files
 * installed yet)?
 *
 * @return bool
 */
function medora_is_rtl_locale() {
	$locale = get_locale();

	if ( is_rtl() ) {
		return true;
	}

	return (bool) preg_match( '/^(fa|ar|he_IL|ur|ckb|ps)/', $locale );
}

/**
 * Body classes the styling relies on (RTL, the shop layout, the sticky header offset).
 *
 * @param array $classes Existing classes.
 * @return array
 */
function medora_body_class( $classes ) {
	$classes[] = 'medora';

	if ( medora_is_rtl_locale() ) {
		$classes[] = 'medora-rtl';
	}

	if ( medora_has_woocommerce() && ( is_woocommerce() || is_cart() || is_checkout() || is_account_page() ) ) {
		$classes[] = 'medora-shop-page';
	}

	if ( is_front_page() ) {
		$classes[] = 'medora-front';
	}

	return $classes;
}
add_filter( 'body_class', 'medora_body_class' );

/**
 * Declare compatibility with WooCommerce's high-performance order storage, so the shop does not
 * fall back to the legacy post tables on stores that have switched.
 */
function medora_declare_wc_compatibility() {
	if ( ! class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
		return;
	}

	\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', MEDORA_DIR . '/functions.php', true );
}
add_action( 'before_woocommerce_init', 'medora_declare_wc_compatibility' );

/**
 * The theme ships a compiled stylesheet; the editor should use the same design tokens.
 */
function medora_editor_styles() {
	add_editor_style( 'assets/css/medora.css' );
}
add_action( 'after_setup_theme', 'medora_editor_styles' );
