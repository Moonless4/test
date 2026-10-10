<?php
/**
 * Newest products, by publish date.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

get_template_part(
	'template-parts/product/rail',
	null,
	array(
		'products'   => medora_new_products( (int) medora_setting( 'new_limit', 8 ) ),
		'title'      => medora_setting( 'new_title' ),
		'eyebrow'    => medora_setting( 'new_eyebrow' ),
		'link_url'   => add_query_arg( 'orderby', 'date', medora_shop_url() ),
		'link_label' => __( 'مشاهده همه', 'medora' ),
	)
);
