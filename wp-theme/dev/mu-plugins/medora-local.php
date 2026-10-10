<?php
/**
 * Plugin Name: Medora local development
 * Description: Local-only helpers for the throwaway WordPress stack in wp-theme/. Never ship this.
 *
 * The sandbox preview proxy forwards a Host header that differs from the site's canonical URL, so
 * WordPress's canonical redirect would bounce every request between the two. Standing it down is
 * the whole point of this file; everything else in it is convenience for seed data.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

// Let the proxy's Host header through instead of redirecting to the canonical URL.
remove_filter( 'template_redirect', 'redirect_canonical' );

// Persian digit rendering in the admin is not needed; keep the shop front-end locale Persian.
add_filter(
	'locale',
	function ( $locale ) {
		return is_admin() ? $locale : 'fa_IR';
	}
);
