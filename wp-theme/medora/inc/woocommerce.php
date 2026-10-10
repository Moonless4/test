<?php
/**
 * WooCommerce integration.
 *
 * The theme never re-implements commerce. Products, prices, sale prices, stock, variations,
 * attributes, the cart, checkout, accounts, orders and reviews all come from WooCommerce's own
 * templates, functions and hooks; this file changes *where* they appear and *how* they are
 * wrapped, and switches off WooCommerce's default styling so the theme's stylesheet styles the
 * real markup instead.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

/* ------------------------------------------------------------------ *
 * Styling
 * ------------------------------------------------------------------ */

/**
 * WooCommerce ships its own layout/typography CSS. The theme styles every WooCommerce surface in
 * assets/css/woocommerce.css, so the defaults come off rather than fight it.
 *
 * @param array $styles Registered styles.
 * @return array
 */
function medora_disable_woocommerce_styles( $styles ) {
	return array();
}
add_filter( 'woocommerce_enqueue_styles', 'medora_disable_woocommerce_styles' );

/* ------------------------------------------------------------------ *
 * Page wrappers
 * ------------------------------------------------------------------ */

remove_action( 'woocommerce_before_main_content', 'woocommerce_output_content_wrapper', 10 );
remove_action( 'woocommerce_after_main_content', 'woocommerce_output_content_wrapper_end', 10 );
remove_action( 'woocommerce_before_main_content', 'woocommerce_breadcrumb', 20 );
remove_action( 'woocommerce_sidebar', 'woocommerce_get_sidebar', 10 );
remove_action( 'woocommerce_before_shop_loop', 'woocommerce_result_count', 20 );
remove_action( 'woocommerce_before_shop_loop', 'woocommerce_catalog_ordering', 30 );
remove_action( 'woocommerce_before_shop_loop', 'woocommerce_show_messages', 10 );
remove_action( 'woocommerce_show_page_title', 'woocommerce_page_title' );

/**
 * Open the shop content area, with the filter rail beside the loop when the sidebar has widgets.
 */
function medora_shop_wrapper_start() {
	$with_sidebar = is_active_sidebar( 'shop-sidebar' );

	echo '<main id="primary" class="medora-main container py-6 sm:py-8">';

	echo '<header class="mb-5">';
	echo '<h1 class="text-xl font-bold text-ink sm:text-2xl lg:text-[28px]">' . esc_html( medora_archive_heading() ) . '</h1>';

	if ( is_product_taxonomy() ) {
		the_archive_description( '<div class="mt-2 max-w-2xl text-[13px] leading-7 text-muted">', '</div>' );
	}

	echo '</header>';

	echo '<div class="medora-shop-layout ' . ( $with_sidebar ? 'has-sidebar' : '' ) . '">';

	if ( $with_sidebar ) {
		echo '<aside class="medora-shop-sidebar" aria-label="' . esc_attr__( 'فیلترها', 'medora' ) . '">';
		dynamic_sidebar( 'shop-sidebar' );
		echo '</aside>';
	}

	echo '<div class="medora-shop-content">';
}
add_action( 'woocommerce_before_main_content', 'medora_shop_wrapper_start', 10 );

/**
 * The heading a WooCommerce archive prints. WooCommerce's own `<h1>` is switched off below, so
 * this is the only one on the page and it is worded in the shop's language.
 *
 * @return string
 */
function medora_archive_heading() {
	if ( is_search() ) {
		return sprintf(
			/* translators: %s: search query. */
			__( 'نتایج جستجو برای «%s»', 'medora' ),
			get_search_query()
		);
	}

	if ( is_shop() ) {
		return __( 'همهٔ محصولات', 'medora' );
	}

	if ( is_product_taxonomy() ) {
		return single_term_title( '', false );
	}

	if ( is_home() || is_front_page() ) {
		return get_bloginfo( 'name' );
	}

	return wp_strip_all_tags( get_the_archive_title() );
}

/** WooCommerce's archive heading is replaced by the theme's own. */
add_filter( 'woocommerce_show_page_title', '__return_false' );

/**
 * Close the shop content area.
 */
function medora_shop_wrapper_end() {
	echo '</div></div></main>';
}
add_action( 'woocommerce_after_main_content', 'medora_shop_wrapper_end', 10 );

/**
 * The shop toolbar: how many products the store found, and the ordering select WooCommerce owns.
 */
function medora_shop_toolbar() {
	if ( ! woocommerce_product_loop() ) {
		return;
	}

	$total = (int) wc_get_loop_prop( 'total' );
	?>
	<div class="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-panel border border-line bg-cream px-4 py-3">
		<p class="text-[12.5px] text-muted">
			<?php
			printf(
				/* translators: %s: number of products. */
				esc_html__( '%s کالا', 'medora' ),
				esc_html( medora_to_fa( $total ) )
			);
			?>
		</p>
		<div class="flex items-center gap-2">
			<?php woocommerce_catalog_ordering(); ?>
		</div>
	</div>
	<?php
}
add_action( 'woocommerce_before_shop_loop', 'medora_shop_toolbar', 20 );

/* ------------------------------------------------------------------ *
 * Catalogue
 * ------------------------------------------------------------------ */

/**
 * Four products per row on the shop archive, matching the design's grid.
 *
 * @return int
 */
function medora_loop_columns() {
	return 4;
}
add_filter( 'loop_shop_columns', 'medora_loop_columns', 20 );

/**
 * The card in the loop renders the discount badge itself, so WooCommerce's own sale flash is not
 * printed twice.
 */
remove_action( 'woocommerce_before_shop_loop_item_title', 'woocommerce_show_product_loop_sale_flash', 10 );

/**
 * The loop card carries the theme's markup.
 *
 * @param string $template Template path.
 * @param string $template_name Template name.
 * @return string
 */
function medora_loop_template( $template, $template_name ) {
	if ( 'content-product.php' === $template_name ) {
		$override = MEDORA_DIR . '/woocommerce/content-product.php';

		if ( file_exists( $override ) ) {
			return $override;
		}
	}

	return $template;
}
add_filter( 'woocommerce_locate_template', 'medora_loop_template', 10, 2 );

/**
 * Pagination arrows and numbers, in the design's shape.
 */
function medora_pagination_args() {
	return array(
		'prev_text' => medora_icon( 'chevron-right', 'h-4 w-4' ),
		'next_text' => medora_icon( 'chevron-left', 'h-4 w-4' ),
		'type'      => 'plain',
		'class'     => 'medora-pagination',
	);
}
add_filter( 'woocommerce_pagination_args', 'medora_pagination_args' );

/**
 * Add a "discounted first" ordering option that lists the products currently on sale, and honour
 * the ?on_sale=1 link the special-offer section points at.
 *
 * @param array $options Ordering options.
 * @return array
 */
function medora_catalog_orderby( $options ) {
	$options['discount'] = __( 'تخفیف‌دارها', 'medora' );

	return $options;
}
add_filter( 'woocommerce_catalog_orderby', 'medora_catalog_orderby' );
add_filter( 'woocommerce_default_catalog_orderby_options', 'medora_catalog_orderby' );

/**
 * Apply the "discounted first" ordering, and the ?on_sale=1 filter, to the product query.
 *
 * @param array $args Ordering args.
 * @return array
 */
function medora_ordering_args( $args ) {
	$orderby = isset( $_GET['orderby'] ) ? sanitize_key( wp_unslash( $_GET['orderby'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only catalogue ordering.

	if ( 'discount' === $orderby ) {
		$args['orderby']  = 'post__in';
		$args['order']    = 'DESC';
		$args['post__in'] = wc_get_product_ids_on_sale();
	}

	return $args;
}
add_filter( 'woocommerce_get_catalog_ordering_args', 'medora_ordering_args' );

/**
 * The ?on_sale=1 filter the sale section links to.
 *
 * @param WP_Query $query Query.
 */
function medora_filter_on_sale( $query ) {
	if ( is_admin() || ! $query->is_main_query() ) {
		return;
	}

	if ( ! isset( $_GET['on_sale'] ) || '1' !== sanitize_key( wp_unslash( $_GET['on_sale'] ) ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only catalogue filter.
		return;
	}

	$ids = wc_get_product_ids_on_sale();

	if ( ! $ids ) {
		return;
	}

	if ( $query->is_post_type_archive( 'product' ) || $query->is_tax( get_object_taxonomies( 'product' ) ) ) {
		$query->set( 'post__in', $ids );
	}
}
add_action( 'pre_get_posts', 'medora_filter_on_sale' );

/**
 * Breadcrumbs in the design's tone.
 *
 * @param array $args Breadcrumb args.
 * @return array
 */
function medora_breadcrumb_defaults( $args ) {
	$args['delimiter']   = '<span class="mx-1.5 text-line">/</span>';
	$args['wrap_before'] = '<nav class="woocommerce-breadcrumb mb-4 flex flex-wrap items-center text-[12px] text-muted" aria-label="' . esc_attr__( 'مسیر صفحه', 'medora' ) . '">';
	$args['wrap_after']  = '</nav>';
	$args['home']        = __( 'خانه', 'medora' );

	return $args;
}
add_filter( 'woocommerce_breadcrumb_defaults', 'medora_breadcrumb_defaults' );

/**
 * Print the breadcrumb on the shop, category and single product views.
 */
function medora_print_breadcrumb() {
	if ( is_front_page() ) {
		return;
	}

	woocommerce_breadcrumb();
}
add_action( 'woocommerce_before_main_content', 'medora_print_breadcrumb', 15 );

/* ------------------------------------------------------------------ *
 * Single product
 * ------------------------------------------------------------------ */

remove_action( 'woocommerce_single_product_summary', 'woocommerce_template_single_price', 10 );
remove_action( 'woocommerce_before_single_product_summary', 'woocommerce_show_product_sale_flash', 10 );

/**
 * The single product price: the same rule as everywhere else — a struck original above the
 * discounted price, with the red percentage tag.
 */
function medora_single_price() {
	global $product;

	if ( ! $product instanceof WC_Product ) {
		return;
	}

	echo '<div class="medora-single-price">' . medora_price_display( $product, array( 'size' => 'lg', 'align' => 'start' ) ) . '</div>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped inside the helper.
}
add_action( 'woocommerce_single_product_summary', 'medora_single_price', 10 );

/**
 * Stock status in Persian, with the quantity WooCommerce publishes.
 */
function medora_stock_status() {
	global $product;

	if ( ! $product instanceof WC_Product ) {
		return;
	}

	if ( ! $product->is_in_stock() ) {
		echo '<p class="medora-stock medora-stock--out">' . esc_html__( 'ناموجود', 'medora' ) . '</p>';

		return;
	}

	$quantity = $product->get_stock_quantity();

	if ( $product->managing_stock() && null !== $quantity && $quantity > 0 && $quantity <= 5 ) {
		printf(
			'<p class="medora-stock medora-stock--low">%s</p>',
			esc_html(
				sprintf(
					/* translators: %s: remaining quantity. */
					__( 'تنها %s عدد در انبار باقی مانده', 'medora' ),
					medora_to_fa( $quantity )
				)
			)
		);
	}
}
add_action( 'woocommerce_single_product_summary', 'medora_stock_status', 11 );

/**
 * A short trust strip under the add-to-cart button on a product page — the same promises the
 * homepage shows, read from the same settings.
 */
function medora_single_trust() {
	$benefits = medora_setting( 'benefits' );

	if ( ! $benefits ) {
		return;
	}

	echo '<ul class="medora-single-trust">';

	foreach ( $benefits as $benefit ) {
		printf(
			'<li>%1$s<span>%2$s</span></li>',
			medora_icon( $benefit['icon'], 'h-4 w-4' ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static markup.
			esc_html( $benefit['title'] )
		);
	}

	echo '</ul>';
}
add_action( 'woocommerce_single_product_summary', 'medora_single_trust', 45 );

/**
 * Related products: four, in one row, with the theme's card.
 *
 * @param array $args Related args.
 * @return array
 */
function medora_related_products_args( $args ) {
	$args['posts_per_page'] = 4;
	$args['columns']        = 4;

	return $args;
}
add_filter( 'woocommerce_output_related_products_args', 'medora_related_products_args', 20 );

/**
 * The product page's own tabs are WooCommerce's; the description tab keeps the theme's prose
 * styling through this class.
 *
 * @param array $tabs Tabs.
 * @return array
 */
function medora_product_tabs( $tabs ) {
	if ( isset( $tabs['description'] ) ) {
		$tabs['description']['title'] = __( 'توضیحات', 'medora' );
	}

	if ( isset( $tabs['additional_information'] ) ) {
		$tabs['additional_information']['title'] = __( 'مشخصات', 'medora' );
	}

	if ( isset( $tabs['reviews'] ) ) {
		$tabs['reviews']['title'] = sprintf(
			/* translators: %s: review count. */
			__( 'نظرات (%s)', 'medora' ),
			medora_to_fa( isset( $tabs['reviews']['callback'] ) ? (int) get_comments_number() : 0 )
		);
	}

	return $tabs;
}
add_filter( 'woocommerce_product_tabs', 'medora_product_tabs' );

/* ------------------------------------------------------------------ *
 * Cart, checkout and accounts
 * ------------------------------------------------------------------ */

/**
 * Cart page title copy, matching the app's wording.
 *
 * @param string $title Title.
 * @return string
 */
function medora_page_title( $title ) {
	if ( is_cart() ) {
		return __( 'سبد خرید', 'medora' );
	}

	if ( is_checkout() && ! is_order_received_page() ) {
		return __( 'تسویه حساب', 'medora' );
	}

	if ( is_account_page() ) {
		return __( 'حساب کاربری', 'medora' );
	}

	return $title;
}
add_filter( 'the_title', 'medora_page_title', 5 );

/**
 * Persian labels for the account navigation.
 *
 * @param array $items Menu items.
 * @return array
 */
function medora_account_menu_items( $items ) {
	$labels = array(
		'dashboard'       => __( 'پیشخوان', 'medora' ),
		'orders'          => __( 'سفارش‌ها', 'medora' ),
		'downloads'       => __( 'دانلودها', 'medora' ),
		'edit-address'    => __( 'نشانی‌ها', 'medora' ),
		'payment-methods' => __( 'روش‌های پرداخت', 'medora' ),
		'edit-account'    => __( 'اطلاعات حساب', 'medora' ),
		'customer-logout' => __( 'خروج', 'medora' ),
	);

	foreach ( $labels as $key => $label ) {
		if ( isset( $items[ $key ] ) ) {
			$items[ $key ] = $label;
		}
	}

	return $items;
}
add_filter( 'woocommerce_account_menu_items', 'medora_account_menu_items' );

/**
 * "منتظر پرداخت" style order statuses in Persian, so the account and checkout never show a
 * status slug.
 *
 * @param array $statuses Statuses.
 * @return array
 */
function medora_order_statuses( $statuses ) {
	$labels = array(
		'pending'    => __( 'در انتظار پرداخت', 'medora' ),
		'processing' => __( 'در حال آماده‌سازی', 'medora' ),
		'on-hold'    => __( 'در انتظار بررسی', 'medora' ),
		'completed'  => __( 'تکمیل‌شده', 'medora' ),
		'cancelled'  => __( 'لغو‌شده', 'medora' ),
		'refunded'   => __( 'مرجوع‌شده', 'medora' ),
		'failed'     => __( 'ناموفق', 'medora' ),
	);

	foreach ( $labels as $key => $label ) {
		if ( isset( $statuses[ 'wc-' . $key ] ) ) {
			$statuses[ 'wc-' . $key ] = $label;
		}
	}

	return $statuses;
}
add_filter( 'wc_order_statuses', 'medora_order_statuses' );

/**
 * The cart count and the drawer body refresh themselves whenever WooCommerce adds a fragment —
 * that is how the header badge and the mini cart stay honest after an add-to-cart.
 *
 * @param array $fragments Fragments.
 * @return array
 */
function medora_cart_fragments( $fragments ) {
	ob_start();
	medora_cart_count();
	$fragments['span.medora-cart-count'] = ob_get_clean();

	ob_start();
	woocommerce_mini_cart();
	$fragments['div.medora-mini-cart-body'] = ob_get_clean();

	return $fragments;
}
add_filter( 'woocommerce_add_to_cart_fragments', 'medora_cart_fragments' );

/**
 * The header cart badge, in Persian digits, printed only when the cart has something in it.
 */
function medora_cart_count() {
	$count = ( function_exists( 'WC' ) && WC()->cart ) ? WC()->cart->get_cart_contents_count() : 0;

	if ( $count < 1 ) {
		return;
	}

	echo '<span class="medora-cart-count">' . esc_html( medora_to_fa( $count ) ) . '</span>';
}

/**
 * Products per page on the shop archive, in the design's grid rhythm.
 *
 * @return int
 */
function medora_products_per_page() {
	return 12;
}
add_filter( 'loop_shop_per_page', 'medora_products_per_page', 20 );

/**
 * Gallery thumbnails: four per row.
 *
 * @return int
 */
function medora_gallery_thumbnail_columns() {
	return 4;
}
add_filter( 'woocommerce_product_thumbnails_columns', 'medora_gallery_thumbnail_columns' );

/**
 * The "no products" state, in the theme's own words.
 */
remove_action( 'woocommerce_no_products_found', 'wc_no_products_found', 10 );

/**
 * The empty-catalogue message.
 */
function medora_no_products() {
	echo '<div class="medora-empty rounded-panel border border-line bg-cream px-6 py-12 text-center">';
	echo '<h2 class="text-lg font-bold text-ink">' . esc_html__( 'کالایی پیدا نشد', 'medora' ) . '</h2>';
	echo '<p class="mt-2 text-[13px] text-muted">' . esc_html__( 'فیلترها را تغییر دهید یا عبارت دیگری جستجو کنید.', 'medora' ) . '</p>';
	echo '</div>';
}
add_action( 'woocommerce_no_products_found', 'medora_no_products', 10 );

/**
 * A "store not ready" notice where WooCommerce pages are opened before any product exists —
 * which is exactly what a freshly activated theme looks like.
 */
function medora_setup_notice() {
	if ( ! current_user_can( 'manage_options' ) || ! is_shop() ) {
		return;
	}

	if ( wc_get_products( array( 'limit' => 1, 'return' => 'ids' ) ) ) {
		return;
	}

	printf(
		'<div class="medora-notice mb-6 rounded-panel border border-line bg-cream px-5 py-4 text-[13px] leading-7 text-ink">%s</div>',
		wp_kses_post(
			sprintf(
				/* translators: %s: admin products URL. */
				__( 'هنوز محصولی ثبت نشده است. برای پر شدن فروشگاه از <a href="%s">افزودن محصول</a> شروع کنید؛ همهٔ بخش‌های قالب از همین محصولات ساخته می‌شوند.', 'medora' ),
				esc_url( admin_url( 'post-new.php?post_type=product' ) )
			)
		)
	);
}
add_action( 'woocommerce_before_main_content', 'medora_setup_notice', 5 );
