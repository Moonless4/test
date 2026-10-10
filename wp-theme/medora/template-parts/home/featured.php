<?php
/**
 * Featured products — WooCommerce's own "featured" flag, falling back to the newest products so
 * a fresh store still shows a rail.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

get_template_part(
	'template-parts/product/rail',
	null,
	array(
		'products'   => medora_featured_products( (int) medora_setting( 'featured_limit', 8 ) ),
		'title'      => medora_setting( 'featured_title' ),
		'eyebrow'    => medora_setting( 'featured_eyebrow' ),
		'link_url'   => medora_shop_url(),
		'link_label' => __( 'مشاهده همه', 'medora' ),
	)
);
