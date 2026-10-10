<?php
/**
 * The WooCommerce loop item.
 *
 * WooCommerce's own loop calls this template for every product, so the shop archive, the
 * category archives, search results (when they include products) and any shortcode list render
 * the theme's card. The <li> and its product classes stay, because WooCommerce's loop classes are
 * what the theme's grid and its own JS hook onto.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

global $product;

if ( empty( $product ) || ! $product->is_visible() ) {
	return;
}
?>
<li <?php wc_product_class( 'medora-card-cell', $product ); ?>>
	<?php
	get_template_part(
		'template-parts/product/card',
		null,
		array(
			'product' => $product,
			'args'    => array( 'context' => 'loop' ),
		)
	);
	?>
</li>
