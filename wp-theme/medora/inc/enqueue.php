<?php
/**
 * Front-end assets.
 *
 * Stylesheet order matters: the compiled design sheet first, WooCommerce's own styling on top of
 * it (WooCommerce's defaults are switched off in inc/woocommerce.php, so our sheet is the whole
 * styling), then the RTL corrections.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

/**
 * Enqueue the front-end styles and scripts.
 */
function medora_enqueue_assets() {
	$version = MEDORA_VERSION;

	wp_enqueue_style( 'medora', MEDORA_URI . '/assets/css/medora.css', array(), $version );

	if ( medora_has_woocommerce() ) {
		wp_enqueue_style( 'medora-woocommerce', MEDORA_URI . '/assets/css/woocommerce.css', array( 'medora' ), $version );
	}

	// WordPress loads rtl.css automatically for core sheets; the theme's own sheets are asked for
	// explicitly so the swap is predictable — and from the same test that sets the document
	// direction (a Persian locale without translation files still renders RTL).
	if ( medora_is_rtl_locale() ) {
		wp_enqueue_style( 'medora-rtl', MEDORA_URI . '/rtl.css', array( 'medora' ), $version );
	}

	wp_enqueue_script(
		'medora',
		MEDORA_URI . '/assets/js/medora.js',
		array(),
		$version,
		array(
			'strategy'  => 'defer',
			'in_footer' => true,
		)
	);

	wp_localize_script(
		'medora',
		'medoraData',
		array(
			'ajaxUrl'   => admin_url( 'admin-ajax.php' ),
			'cartUrl'   => medora_has_woocommerce() ? wc_get_cart_url() : home_url( '/' ),
			'isRtl'     => is_rtl(),
			'nonce'     => wp_create_nonce( 'medora_newsletter' ),
			'i18n'      => array(
				'added'      => __( 'به سبد خرید اضافه شد.', 'medora' ),
				'error'      => __( 'مشکلی پیش آمد؛ دوباره تلاش کنید.', 'medora' ),
				'subscribed' => __( 'عضویت شما ثبت شد.', 'medora' ),
				'copied'     => __( 'کد تخفیف کپی شد.', 'medora' ),
			),
		)
	);

	// The Persian UI font is on the critical path: preload both weights instead of waiting for
	// the stylesheet.
	add_action( 'wp_head', 'medora_preload_fonts', 1 );

	if ( is_front_page() ) {
		add_action( 'wp_head', 'medora_preload_hero', 2 );
	}
}
add_action( 'wp_enqueue_scripts', 'medora_enqueue_assets' );

/**
 * Preload the two font weights the first screen uses.
 */
function medora_preload_fonts() {
	foreach ( array( 'Regular', 'Bold' ) as $weight ) {
		printf(
			'<link rel="preload" as="font" type="font/woff2" href="%s" crossorigin>' . "\n",
			esc_url( MEDORA_URI . '/assets/fonts/iranyekanx/IRANYekanX-' . $weight . '.woff2' )
		);
	}
}

/**
 * Preload the first hero slide, per breakpoint, so the largest paint starts before the markup
 * finishes parsing. The slide itself is a WordPress image, chosen by the same order the slider
 * renders with.
 */
function medora_preload_hero() {
	$slide = medora_first_slide();

	if ( ! $slide || ! $slide['image_id'] ) {
		return;
	}

	$desktop = wp_get_attachment_image_url( $slide['image_id'], 'medora-hero' );
	$phone   = wp_get_attachment_image_url( $slide['phone_image_id'] ? $slide['phone_image_id'] : $slide['image_id'], 'medora-hero-phone' );

	if ( $desktop ) {
		printf(
			'<link rel="preload" as="image" media="(min-width: 640px)" href="%s" fetchpriority="high">' . "\n",
			esc_url( $desktop )
		);
	}

	if ( $phone ) {
		printf(
			'<link rel="preload" as="image" media="(max-width: 639px)" href="%s" fetchpriority="high">' . "\n",
			esc_url( $phone )
		);
	}
}
