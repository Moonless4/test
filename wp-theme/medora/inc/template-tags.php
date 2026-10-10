<?php
/**
 * Template helpers: Persian numbers, the Toman price rule, icons, logos and the shared
 * section header.
 *
 * The price rule is the same one the design carries: a discounted product always shows the
 * original price struck through above the discounted price, never the other way round and never
 * just the lower one. It is enforced in one place — medora_price_display() — so no template can
 * drift from it.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

/**
 * Convert every Latin digit to its Persian counterpart.
 *
 * @param string|int|float $value Value to convert.
 * @return string
 */
function medora_to_fa( $value ) {
	$digits = array(
		'0' => '۰',
		'1' => '۱',
		'2' => '۲',
		'3' => '۳',
		'4' => '۴',
		'5' => '۵',
		'6' => '۶',
		'7' => '۷',
		'8' => '۸',
		'9' => '۹',
	);

	return strtr( (string) $value, $digits );
}

/**
 * A grouped amount in Persian digits (1980000 → ۱,۹۸۰,۰۰۰).
 *
 * @param float|int|string $value Amount.
 * @return string
 */
function medora_format_number( $value ) {
	return medora_to_fa( number_format( (float) $value ) );
}

/**
 * The Toman glyph, inline so it takes the colour of the price beside it.
 *
 * @return string
 */
function medora_toman_icon() {
	return '<svg viewBox="0 0 14 14" role="img" aria-label="' . esc_attr__( 'تومان', 'medora' ) . '" fill="currentColor" class="shrink-0 h-[1.35em] w-auto"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.057 1.742L3.821 1l.78.75-.776.741-.768-.749zm3.23 2.48c0 .622-.16 1.111-.478 1.467-.201.221-.462.39-.783.505a3.251 3.251 0 01-1.083.163h-.555c-.421 0-.801-.074-1.139-.223a2.045 2.045 0 01-.9-.738A2.238 2.238 0 011 4.148c0-.059.001-.117.004-.176.03-.55.204-1.158.525-1.827l1.095.484c-.257.532-.397 1-.419 1.403-.002.04-.004.08-.004.12 0 .252.055.458.166.618a.887.887 0 00.5.354c.085.028.178.048.278.06.079.01.16.014.243.014h.555c.458 0 .769-.081.933-.244.14-.139.21-.383.21-.731V2.02h1.2v2.202zm5.433 3.184l-.72-.7.709-.706.735.707-.724.7zm-2.856.308c.542 0 .973.19 1.293.569.297.346.445.777.445 1.293v.364h.18v-.004h.41c.221 0 .377-.028.467-.084.093-.055.14-.14.14-.258v-.069c.004-.243.017-1.044 0-1.115L13 8.05v1.574a1.4 1.4 0 01-.287.863c-.306.405-.804.607-1.495.607h-.627c-.061.733-.434 1.257-1.117 1.573-.267.122-.58.21-.937.265a5.845 5.845 0 01-.914.067v-1.159c.612 0 1.072-.082 1.38-.247.25-.132.376-.298.376-.499h-.515c-.436 0-.807-.113-1.113-.339-.367-.273-.55-.667-.55-1.18 0-.488.122-.901.367-1.24.296-.415.728-.622 1.296-.622zm.533 2.226v-.364c0-.217-.048-.389-.143-.516a.464.464 0 00-.39-.187.478.478 0 00-.396.187.705.705 0 00-.136.449.65.65 0 00.003.067c.008.125.066.22.177.283.093.054.21.08.352.08h.533zM9.5 6.707l.72.7.724-.7L10.209 6l-.709.707zm-6.694 4.888h.03c.433-.01.745-.106.937-.29.024.012.065.035.12.068l.074.039.081.042c.135.073.261.133.379.18.345.146.67.22.977.22a1.216 1.216 0 00.87-.34c.3-.285.449-.714.449-1.286a2.19 2.19 0 00-.335-1.145c-.299-.457-.732-.685-1.3-.685-.502 0-.916.192-1.242.575-.113.132-.21.284-.294.456-.032.062-.06.125-.084.191a.504.504 0 00-.03.078 1.67 1.67 0 00-.022.06c-.103.309-.171.485-.205.53-.072.09-.214.14-.427.147-.123-.005-.209-.03-.256-.076-.057-.054-.085-.153-.085-.297V7l-1.201-.5v3.562c0 .261.048.496.143.703.071.158.168.296.29.413.123.118.266.211.43.28.198.084.42.13.665.136v.001h.036zm2.752-1.014a.778.778 0 00.044-.353.868.868 0 00-.165-.47c-.1-.134-.217-.201-.35-.201-.18 0-.33.103-.447.31-.042.071-.08.158-.114.262a2.434 2.434 0 00-.04.12l-.015.053-.015.046c.142.118.323.216.544.293.18.062.325.092.433.092.044 0 .086-.05.125-.152z"/></svg>';
}

/**
 * A Toman amount: Persian digits followed by the currency glyph.
 *
 * @param float|int|string $amount Amount in Toman.
 * @param string           $class  Extra classes for the wrapper.
 * @return string
 */
function medora_price( $amount, $class = '' ) {
	return sprintf(
		'<span class="inline-flex items-center gap-1 %1$s"><span>%2$s</span>%3$s</span>',
		esc_attr( $class ),
		esc_html( medora_format_number( $amount ) ),
		medora_toman_icon()
	);
}

/**
 * The discount percentage of a product, computed from the two prices the store publishes.
 *
 * @param WC_Product $product Product.
 * @return int
 */
function medora_discount_percent( $product ) {
	if ( ! $product instanceof WC_Product || ! $product->is_on_sale() ) {
		return 0;
	}

	$regular = (float) $product->get_regular_price();
	$sale    = (float) $product->get_sale_price();

	if ( $regular <= 0 || $sale <= 0 || $sale >= $regular ) {
		return 0;
	}

	return (int) round( ( ( $regular - $sale ) / $regular ) * 100 );
}

/**
 * The red percentage tag.
 *
 * @param int    $value Percentage.
 * @param string $size  xs|sm|md.
 * @return string
 */
function medora_discount_badge( $value, $size = 'md' ) {
	$value = (int) $value;

	if ( $value <= 0 ) {
		return '';
	}

	$box = 'xs' === $size ? 'h-5 rounded px-1.5 text-[10px]'
		: ( 'sm' === $size ? 'h-6 rounded-md px-2 text-[11px]' : 'h-7 rounded-lg px-2.5 text-[12px] sm:text-[13px]' );

	return sprintf(
		'<span dir="ltr" class="inline-flex items-center bg-sale font-bold text-white shadow-soft %1$s">-%2$s٪</span>',
		esc_attr( $box ),
		esc_html( medora_to_fa( $value ) )
	);
}

/**
 * The price block of a product, following the store's price rule.
 *
 * @param WC_Product $product Product.
 * @param array      $args    size (sm|md|lg), align (start|center|end), class.
 * @return string
 */
function medora_price_display( $product, $args = array() ) {
	if ( ! $product instanceof WC_Product ) {
		return '';
	}

	$args = wp_parse_args(
		$args,
		array(
			'size'  => 'md',
			'align' => 'start',
			'class' => '',
		)
	);

	$on_sale      = $product->is_on_sale();
	$regular      = (float) $product->get_regular_price();
	$current      = (float) $product->get_price();
	$is_discount  = $on_sale && $regular > $current && $current > 0;
	$percent      = medora_discount_percent( $product );

	if ( ! $current && ! $regular ) {
		// Variable products with no price: let WooCommerce phrase it (it localises the text).
		return sprintf(
			'<div class="flex flex-col gap-1 %s"><span class="text-[15px] font-bold text-ink">%s</span></div>',
			esc_attr( 'end' === $args['align'] ? 'items-end text-end' : ( 'center' === $args['align'] ? 'items-center text-center' : 'items-start' ) ),
			wp_kses_post( $product->get_price_html() )
		);
	}

	$current_size  = 'lg' === $args['size'] ? 'text-xl sm:text-2xl' : ( 'sm' === $args['size'] ? 'text-sm' : 'text-[15px] sm:text-base' );
	$original_size = 'lg' === $args['size'] ? 'text-sm sm:text-base' : 'text-[11px] sm:text-xs';
	$align_class   = 'end' === $args['align'] ? 'items-end text-end' : ( 'center' === $args['align'] ? 'items-center text-center' : 'items-start' );

	$html  = sprintf( '<div class="flex flex-col gap-1 %1$s %2$s">', esc_attr( $align_class ), esc_attr( $args['class'] ) );

	if ( $is_discount ) {
		$html .= '<span class="flex items-center gap-1.5">';
		$html .= medora_discount_badge( $percent, 'lg' === $args['size'] ? 'md' : ( 'sm' === $args['size'] ? 'xs' : 'sm' ) );
		// The struck original price carries no currency glyph — plain digits under a pale red line.
		$html .= sprintf(
			'<span class="%1$s text-muted line-through decoration-sale/50 decoration-[1.5px]">%2$s</span>',
			esc_attr( $original_size ),
			esc_html( medora_format_number( $regular ) )
		);
		$html .= '</span>';
	}

	$html .= sprintf(
		'<span class="%1$s font-bold %2$s">%3$s</span>',
		esc_attr( $current_size ),
		$is_discount ? 'text-black' : 'text-ink',
		medora_price( $current )
	);
	$html .= '</div>';

	return $html;
}

/**
 * Persian digits in every WooCommerce price and count, so no amount anywhere in the shop falls
 * back to Latin numerals. The currency symbol is dropped — the Toman glyph stands in for it.
 *
 * @param array $args Price format args.
 * @return array
 */
function medora_wc_price_args( $args ) {
	$args['currency_symbol'] = '';
	$args['decimals']        = 0;
	$args['trim_zeros']      = true;

	return $args;
}
add_filter( 'wc_price_args', 'medora_wc_price_args' );

/**
 * Wrap WooCommerce's formatted prices so their digits are Persian.
 *
 * @param string $html Formatted price.
 * @return string
 */
function medora_wc_price_digits( $html ) {
	return medora_to_fa( $html );
}
add_filter( 'wc_price', 'medora_wc_price_digits', 20 );

/**
 * Inline icon set — the same glyphs the original frontend drew with its icon library, so the
 * theme renders without any icon dependency.
 *
 * @param string $name  Icon name.
 * @param string $class Classes for the svg element.
 * @param float  $width Stroke width.
 * @return string
 */
function medora_icon( $name, $class = 'h-5 w-5', $width = 1.8 ) {
	$paths = array(
		'search'      => '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.4-3.4"/>',
		'heart'       => '<path d="M19 14.2 12.7 20a1 1 0 0 1-1.4 0L5 14.2A5.5 5.5 0 0 1 12 6.6a5.5 5.5 0 0 1 7 7.6Z"/>',
		'user'        => '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
		'bag'         => '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
		'chevron-down'  => '<path d="m6 9 6 6 6-6"/>',
		'chevron-left'  => '<path d="m15 18-6-6 6-6"/>',
		'chevron-right' => '<path d="m9 18 6-6-6-6"/>',
		'x'           => '<path d="M18 6 6 18M6 6l12 12"/>',
		'grid'        => '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
		'mail'        => '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2.5 7 9.5 6 9.5-6"/>',
		'phone'       => '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.7a2 2 0 0 1 1.9 2.1Z"/>',
		'map-pin'     => '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
		'instagram'   => '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>',
		'send'        => '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4Z"/>',
		'star'        => '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3 1.2-6.8-5-4.9 6.9-1Z"/>',
		'percent'     => '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
		'truck'       => '<path d="M14 17V6a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1"/><path d="M14 8h4l4 4.5V17a1 1 0 0 1-1 1h-1"/><circle cx="6.5" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/><path d="M8.5 17h6.5"/>',
		'shield'      => '<path d="M12 22s8-4 8-10V5.5L12 2 4 5.5V12c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
		'badge'       => '<path d="m9 12 2 2 4-4"/><path d="M12 2.5 20 6v6c0 5-3.6 8.4-8 9.5-4.4-1.1-8-4.5-8-9.5V6Z"/>',
		'refresh'     => '<path d="M21 12a9 9 0 0 1-15.4 6.3L3 16"/><path d="M3 12a9 9 0 0 1 15.4-6.3L21 8"/><path d="M21 4v4h-4"/><path d="M3 20v-4h4"/>',
		'check'       => '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>',
		'quote'       => '<path d="M9 6.5C6.5 7.5 5 9.7 5 12.4V17h5v-5H7.6c0-1.5.7-2.7 1.9-3.4Z"/><path d="M19 6.5c-2.5 1-4 3.2-4 5.9V17h5v-5h-2.4c0-1.5.7-2.7 1.9-3.4Z"/>',
		'filter'      => '<path d="M4 6h16M7 12h10M10 18h4"/>',
		'grid-view'   => '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>',
		'trash'       => '<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/>',
		'plus'        => '<path d="M12 5v14M5 12h14"/>',
		'minus'       => '<path d="M5 12h14"/>',
		'headset'     => '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z"/><path d="M20 14h-2a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1Z"/>',
	);

	if ( ! isset( $paths[ $name ] ) ) {
		return '';
	}

	return sprintf(
		'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="%1$s" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" class="%2$s">%3$s</svg>',
		esc_attr( $width ),
		esc_attr( $class ),
		$paths[ $name ]
	);
}

/**
 * The brand lockup. The administrator's own logo (Customizer → Site Identity) wins; the two
 * files shipped with the theme are the fallback artwork.
 *
 * @param string $variant dark|light.
 * @param string $class   Classes for the image.
 * @return string
 */
function medora_logo( $variant = 'dark', $class = 'h-9 w-auto lg:h-10' ) {
	if ( has_custom_logo() && 'dark' === $variant ) {
		$logo_id = get_theme_mod( 'custom_logo' );
		$image   = wp_get_attachment_image( $logo_id, 'full', false, array( 'class' => $class, 'alt' => get_bloginfo( 'name' ) ) );

		if ( $image ) {
			return $image;
		}
	}

	$file        = 'light' === $variant ? 'medora-logo-white.webp' : 'medora-logo.webp';
	$fallback_id = (int) get_theme_mod( 'light' === $variant ? 'medora_footer_light_logo' : 'medora_header_dark_logo', 0 );

	if ( $fallback_id ) {
		$image = wp_get_attachment_image( $fallback_id, 'full', false, array( 'class' => $class, 'alt' => get_bloginfo( 'name' ) ) );

		if ( $image ) {
			return $image;
		}
	}

	return sprintf(
		'<img src="%1$s" alt="%2$s" width="565" height="120" class="%3$s">',
		esc_url( MEDORA_URI . '/assets/images/' . $file ),
		esc_attr( get_bloginfo( 'name' ) ),
		esc_attr( $class )
	);
}

/**
 * A settings value from the theme's own settings page, with its default.
 *
 * @param string $key     Setting key.
 * @param mixed  $default Fallback.
 * @return mixed
 */
function medora_setting( $key, $default = null ) {
	$settings = get_option( 'medora_settings', array() );
	$defaults = medora_default_settings();
	$fallback = null !== $default ? $default : ( isset( $defaults[ $key ] ) ? $defaults[ $key ] : null );

	return isset( $settings[ $key ] ) && '' !== $settings[ $key ] ? $settings[ $key ] : $fallback;
}

/**
 * Is a homepage section switched on?
 *
 * @param string $key Section key.
 * @return bool
 */
function medora_section_enabled( $key ) {
	$sections = medora_setting( 'sections', array() );

	return ! is_array( $sections ) || ! isset( $sections[ $key ] ) || ! empty( $sections[ $key ] );
}

/**
 * The section header shared by every homepage rail: eyebrow, title, the teal rule and a link.
 *
 * @param array $args title, eyebrow, link_label, link_url.
 */
function medora_section_header( $args = array() ) {
	$args = wp_parse_args(
		$args,
		array(
			'title'      => '',
			'eyebrow'    => '',
			'link_label' => __( 'مشاهده همه', 'medora' ),
			'link_url'   => '',
			'class'      => '',
		)
	);

	if ( ! $args['title'] && ! $args['eyebrow'] ) {
		return;
	}
	?>
	<div class="reveal mb-6 flex items-end justify-between gap-4 sm:mb-8 <?php echo esc_attr( $args['class'] ); ?>">
		<div class="min-w-0">
			<?php if ( $args['eyebrow'] ) : ?>
				<span class="mb-2 block text-xs font-medium tracking-wide text-black sm:text-[13px]"><?php echo esc_html( $args['eyebrow'] ); ?></span>
			<?php endif; ?>
			<h2 class="text-xl font-bold text-ink sm:text-2xl lg:text-[28px]"><?php echo esc_html( $args['title'] ); ?></h2>
			<span class="mt-3 block h-1 w-12 rounded-full bg-teal-800"></span>
		</div>

		<?php if ( $args['link_url'] ) : ?>
			<a href="<?php echo esc_url( $args['link_url'] ); ?>" class="group flex shrink-0 items-center gap-1 pb-1 text-[13px] font-medium text-black transition-colors hover:text-black sm:text-sm">
				<?php echo esc_html( $args['link_label'] ); ?>
				<span class="transition-transform duration-300 group-hover:-translate-x-1"><?php echo medora_icon( 'chevron-left', 'h-4 w-4' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
			</a>
		<?php endif; ?>
	</div>
	<?php
}

/**
 * An attachment image, falling back to a neutral placeholder when nothing is set, so a section
 * never collapses while the administrator is still uploading artwork.
 *
 * @param int    $attachment_id Attachment id.
 * @param string $size          Image size.
 * @param array  $attr          Extra attributes.
 * @return string
 */
function medora_image( $attachment_id, $size = 'medora-card', $attr = array() ) {
	if ( $attachment_id ) {
		$attr = wp_parse_args( $attr, array( 'loading' => 'lazy', 'decoding' => 'async' ) );
		$html = wp_get_attachment_image( $attachment_id, $size, false, $attr );

		if ( $html ) {
			return $html;
		}
	}

	$class = isset( $attr['class'] ) ? $attr['class'] : 'h-full w-full object-cover';

	return sprintf(
		'<span class="flex items-center justify-center bg-cream text-muted %1$s" aria-hidden="true">%2$s</span>',
		esc_attr( $class ),
		medora_icon( 'bag', 'h-8 w-8 opacity-40' )
	);
}

/**
 * Render one product card. The markup is shared by the homepage rails and the shop loop, so a
 * product looks the same wherever it appears.
 *
 * @param WC_Product|int $product Product or id.
 * @param array          $args    Extra classes / laziness.
 */
function medora_product_card( $product, $args = array() ) {
	$product = is_a( $product, 'WC_Product' ) ? $product : wc_get_product( $product );

	if ( ! $product ) {
		return;
	}

	get_template_part( 'template-parts/product/card', null, array( 'product' => $product, 'args' => $args ) );
}

/**
 * A "new" tag: a product published in the last 30 days, which is what the design's badge marks.
 *
 * @param WC_Product $product Product.
 * @return bool
 */
function medora_is_new( $product ) {
	$created = $product->get_date_created();

	if ( ! $created ) {
		return false;
	}

	return ( time() - $created->getTimestamp() ) < 30 * DAY_IN_SECONDS;
}

/**
 * Persian digits for every count WooCommerce prints (cart badge, review count, pagination).
 *
 * @param string $text Text.
 * @return string
 */
function medora_digits_in_text( $text ) {
	return is_string( $text ) ? medora_to_fa( $text ) : $text;
}
add_filter( 'woocommerce_format_stock_quantity', 'medora_digits_in_text' );
