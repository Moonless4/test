<?php
/**
 * Mega menu data.
 *
 * The menu itself is a WordPress menu: the administrator builds it under Appearance → Menus, so
 * the links, their order and their nesting are WordPress's. Each top-level item may also carry a
 * small promo (image, badge, text, link), edited on the menu item itself, which is what the
 * design shows inside the mega panel.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

/**
 * Add the promo fields to each menu item in the admin.
 *
 * @param int     $item_id Menu item id.
 * @param WP_Post $item    Menu item.
 * @param array   $args    Item args.
 * @param int     $depth   Depth.
 */
function medora_menu_item_fields( $item_id, $item, $args, $depth ) {
	if ( 0 !== $depth ) {
		return;
	}

	wp_nonce_field( 'medora_menu_item', 'medora_menu_nonce' );

	$image  = (int) get_post_meta( $item_id, '_medora_menu_image', true );
	$badge  = (string) get_post_meta( $item_id, '_medora_menu_badge', true );
	$text   = (string) get_post_meta( $item_id, '_medora_menu_text', true );
	$url    = (string) get_post_meta( $item_id, '_medora_menu_url', true );
	$preview = $image ? wp_get_attachment_image_url( $image, 'thumbnail' ) : '';
	?>
	<div class="medora-menu-fields" style="padding:8px 0 4px;border-top:1px solid #eee;margin-top:8px">
		<p style="margin:0 0 6px;font-weight:600"><?php esc_html_e( 'مگا منو (مدورا)', 'medora' ); ?></p>

		<p>
			<label for="medora_menu_image_<?php echo esc_attr( $item_id ); ?>"><?php esc_html_e( 'تصویر آیتم', 'medora' ); ?></label><br>
			<span class="medora-image-field" data-target="medora_menu_image_<?php echo esc_attr( $item_id ); ?>">
				<img src="<?php echo esc_url( $preview ); ?>" alt="" style="max-width:80px;height:auto;display:<?php echo $preview ? 'block' : 'none'; ?>;border-radius:6px;margin:4px 0">
				<input type="hidden" id="medora_menu_image_<?php echo esc_attr( $item_id ); ?>" name="medora_menu_image[<?php echo esc_attr( $item_id ); ?>]" value="<?php echo esc_attr( $image ); ?>">
				<button type="button" class="button medora-pick-image"><?php esc_html_e( 'انتخاب تصویر', 'medora' ); ?></button>
				<button type="button" class="button-link medora-clear-image"><?php esc_html_e( 'حذف', 'medora' ); ?></button>
			</span>
		</p>

		<p>
			<label for="medora_menu_badge_<?php echo esc_attr( $item_id ); ?>"><?php esc_html_e( 'برچسب (مثلاً جدید)', 'medora' ); ?></label><br>
			<input type="text" class="widefat" id="medora_menu_badge_<?php echo esc_attr( $item_id ); ?>" name="medora_menu_badge[<?php echo esc_attr( $item_id ); ?>]" value="<?php echo esc_attr( $badge ); ?>">
		</p>

		<p>
			<label for="medora_menu_text_<?php echo esc_attr( $item_id ); ?>"><?php esc_html_e( 'متن تبلیغاتی پنل', 'medora' ); ?></label><br>
			<textarea class="widefat" rows="2" id="medora_menu_text_<?php echo esc_attr( $item_id ); ?>" name="medora_menu_text[<?php echo esc_attr( $item_id ); ?>]"><?php echo esc_textarea( $text ); ?></textarea>
		</p>

		<p>
			<label for="medora_menu_url_<?php echo esc_attr( $item_id ); ?>"><?php esc_html_e( 'نشانی دکمهٔ پنل', 'medora' ); ?></label><br>
			<input type="url" class="widefat" id="medora_menu_url_<?php echo esc_attr( $item_id ); ?>" name="medora_menu_url[<?php echo esc_attr( $item_id ); ?>]" value="<?php echo esc_attr( $url ); ?>">
		</p>
	</div>
	<?php
}
add_action( 'wp_nav_menu_item_custom_fields', 'medora_menu_item_fields', 10, 4 );

/**
 * Save the promo fields when the menu is saved.
 *
 * @param int $menu_id  Menu id.
 * @param int $item_id  Menu item id.
 */
function medora_save_menu_item_fields( $menu_id, $item_id ) {
	if ( ! isset( $_POST['medora_menu_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['medora_menu_nonce'] ) ), 'medora_menu_item' ) ) {
		return;
	}

	if ( ! current_user_can( 'edit_theme_options' ) ) {
		return;
	}

	$fields = array(
		'_medora_menu_image' => 'absint',
		'_medora_menu_badge' => 'sanitize_text_field',
		'_medora_menu_text'  => 'wp_kses_post',
		'_medora_menu_url'   => 'esc_url_raw',
	);

	$input = array(
		'_medora_menu_image' => 'medora_menu_image',
		'_medora_menu_badge' => 'medora_menu_badge',
		'_medora_menu_text'  => 'medora_menu_text',
		'_medora_menu_url'   => 'medora_menu_url',
	);

	foreach ( $fields as $meta_key => $sanitizer ) {
		$field = $input[ $meta_key ];

		if ( ! isset( $_POST[ $field ][ $item_id ] ) ) {
			continue;
		}

		$value = call_user_func( $sanitizer, wp_unslash( $_POST[ $field ][ $item_id ] ) ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- sanitised by the callable above.

		if ( '' === $value || 0 === $value ) {
			delete_post_meta( $item_id, $meta_key );
		} else {
			update_post_meta( $item_id, $meta_key, $value );
		}
	}
}
add_action( 'wp_update_nav_menu_item', 'medora_save_menu_item_fields', 10, 2 );

/**
 * A menu location as a tree this theme can render: top-level items, their children (the mega
 * panel's columns) and grandchildren (the links inside a column).
 *
 * @param string $location Menu location.
 * @return array[] Each entry: item, children (array of item/children pairs), promo.
 */
function medora_menu_tree( $location = 'primary' ) {
	$locations = get_nav_menu_locations();

	if ( empty( $locations[ $location ] ) ) {
		return array();
	}

	$items = wp_get_nav_menu_items( $locations[ $location ] );

	if ( ! $items ) {
		return array();
	}

	$by_parent = array();

	foreach ( $items as $item ) {
		$by_parent[ (int) $item->menu_item_parent ][] = $item;
	}

	$tree = array();

	foreach ( $by_parent[0] as $item ) {
		$children = array();

		if ( isset( $by_parent[ $item->ID ] ) ) {
			foreach ( $by_parent[ $item->ID ] as $child ) {
				$children[] = array(
					'item'     => $child,
					'children' => isset( $by_parent[ $child->ID ] ) ? $by_parent[ $child->ID ] : array(),
				);
			}
		}

		$tree[] = array(
			'item'     => $item,
			'children' => $children,
			'promo'    => array(
				'image' => (int) get_post_meta( $item->ID, '_medora_menu_image', true ),
				'badge' => (string) get_post_meta( $item->ID, '_medora_menu_badge', true ),
				'text'  => (string) get_post_meta( $item->ID, '_medora_menu_text', true ),
				'url'   => (string) get_post_meta( $item->ID, '_medora_menu_url', true ),
			),
			'active'   => medora_menu_item_is_active( $item ),
		);
	}

	return $tree;
}

/**
 * Is this menu item the page the shopper is on?
 *
 * @param WP_Post $item Menu item.
 * @return bool
 */
function medora_menu_item_is_active( $item ) {
	$current = trailingslashit( home_url( add_query_arg( array() ) ) );
	$url     = trailingslashit( $item->url );

	if ( $current === $url ) {
		return true;
	}

	// A product category link lights up on the category and its children.
	if ( 'product_cat' === $item->object ) {
		return is_tax( 'product_cat', (int) $item->object_id ) || ( function_exists( 'is_product_category' ) && is_product_category() && has_term( (int) $item->object_id, 'product_cat' ) );
	}

	return false;
}

/**
 * Fallback menu for a fresh install: the shop's own categories, so the header is never empty
 * and never contains a list written into the theme.
 *
 * @return array[] Same shape as a shallow medora_menu_tree().
 */
function medora_menu_fallback_tree() {
	$tree = array(
		array(
			'item'     => (object) array(
				'ID'    => 0,
				'title' => __( 'خانه', 'medora' ),
				'url'   => home_url( '/' ),
				'object' => '',
			),
			'children' => array(),
			'promo'    => array(
				'image' => 0,
				'badge' => '',
				'text'  => '',
				'url'   => '',
			),
			'active'   => is_front_page(),
		),
	);

	foreach ( medora_top_categories( 6 ) as $category ) {
		$children = array();
		$subs     = get_terms(
			array(
				'taxonomy'   => 'product_cat',
				'hide_empty' => true,
				'parent'     => $category['term']->term_id,
			)
		);

		if ( ! is_wp_error( $subs ) ) {
			foreach ( $subs as $sub ) {
				$children[] = array(
					'item'     => (object) array(
						'ID'     => 0,
						'title'  => $sub->name,
						'url'    => get_term_link( $sub ),
						'object' => '',
					),
					'children' => array(),
				);
			}
		}

		$tree[] = array(
			'item'     => (object) array(
				'ID'     => 0,
				'title'  => $category['term']->name,
				'url'    => $category['url'],
				'object' => '',
			),
			'children' => $children,
			'promo'    => array(
				'image' => $category['image_id'],
				'badge' => '',
				'text'  => '',
				'url'   => '',
			),
			'active'   => is_tax( 'product_cat', $category['term']->term_id ),
		);
	}

	if ( get_option( 'show_on_front' ) === 'page' && get_option( 'page_for_posts' ) ) {
		$tree[] = array(
			'item'     => (object) array(
				'ID'     => 0,
				'title'  => get_the_title( get_option( 'page_for_posts' ) ),
				'url'    => get_permalink( get_option( 'page_for_posts' ) ),
				'object' => '',
			),
			'children' => array(),
			'promo'    => array(
				'image' => 0,
				'badge' => '',
				'text'  => '',
				'url'   => '',
			),
			'active'   => is_home(),
		);
	}

	return $tree;
}
