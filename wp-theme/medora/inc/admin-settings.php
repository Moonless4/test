<?php
/**
 * The theme's own settings page: everything commercial about the homepage.
 *
 * The Customizer carries branding (logo, footer copy, contact, socials, trust badges, newsletter
 * image). This page carries the shop logic: how deep a discount has to be to reach the special
 * offer, how many products each rail shows, the section headings, the trust promises and which
 * sections are on. Nothing here needs a code change to adjust.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

/**
 * Every setting the theme reads, with the value a fresh install starts from.
 *
 * @return array
 */
function medora_default_settings() {
	return array(
		// Special offer (dynamic: real WooCommerce sale products, real sale end date).
		'sale_eyebrow'        => 'تخفیف‌های ویژه',
		'sale_title'          => 'تخفیف شگفت‌انگیز',
		'sale_subtitle'       => 'تخفیف‌های ویژه در مدورا',
		'min_discount'        => 15,
		'sale_limit'          => 8,

		// Rails.
		'featured_eyebrow'    => 'انتخاب مدورا',
		'featured_title'      => 'پیشنهادهای ویژه',
		'featured_limit'      => 8,
		'new_eyebrow'         => 'تازه رسیده‌ها',
		'new_title'           => 'جدیدترین‌ها',
		'new_limit'           => 8,
		'categories_eyebrow'  => 'خرید بر اساس دسته',
		'categories_title'    => 'دسته‌بندی‌ها',
		'categories_limit'    => 6,
		'blog_eyebrow'        => 'مجلهٔ مدورا',
		'blog_title'          => 'از وبلاگ',
		'blog_limit'          => 3,

		// Editorial blocks.
		'testimonials_eyebrow' => 'رضایت شما',
		'testimonials_title'   => 'نظرات مشتریان',
		'testimonials_text'    => 'بیش از ۱۲٬۰۰۰ مشتری تا امروز از مدورا خرید کرده‌اند. اینها بخشی از نظرات ثبت‌شده در مورد کیفیت کالا و تجربهٔ خرید است.',
		'newsletter_eyebrow'   => 'خبرنامهٔ مدورا',
		'newsletter_title'     => 'عضویت در خبرنامه',
		'newsletter_text'      => 'از جدیدترین تخفیف‌ها و محصولات جدید باخبر شوید.',

		// Trust promises (the four tiles above the promo banner).
		'benefits'            => array(
			array(
				'icon'  => 'truck',
				'title' => 'ارسال سریع',
				'text'  => 'به سراسر کشور',
			),
			array(
				'icon'  => 'shield',
				'title' => 'پرداخت امن',
				'text'  => 'با تمامی کارت‌ها',
			),
			array(
				'icon'  => 'badge',
				'title' => 'کیفیت تضمین‌شده',
				'text'  => 'ضمانت اصالت کالا',
			),
			array(
				'icon'  => 'refresh',
				'title' => 'بازگشت کالا',
				'text'  => 'تا ۷ روز',
			),
		),

		// Section switches.
		'sections'            => array(
			'hero'         => 1,
			'categories'   => 1,
			'banners'      => 1,
			'sale'         => 1,
			'featured'     => 1,
			'new'          => 1,
			'benefits'     => 1,
			'promo'        => 1,
			'testimonials' => 1,
			'blog'         => 1,
			'newsletter'   => 1,
		),
	);
}

/**
 * The section switches, with their Persian labels.
 *
 * @return array
 */
function medora_section_labels() {
	return array(
		'hero'         => __( 'اسلایدر', 'medora' ),
		'categories'   => __( 'دسته‌بندی‌ها', 'medora' ),
		'banners'      => __( 'دو بنر کنار هم', 'medora' ),
		'sale'         => __( 'تخفیف شگفت‌انگیز', 'medora' ),
		'featured'     => __( 'پیشنهادهای ویژه', 'medora' ),
		'new'          => __( 'جدیدترین‌ها', 'medora' ),
		'benefits'     => __( 'مزایای خرید', 'medora' ),
		'promo'        => __( 'بنر پهن تبلیغاتی', 'medora' ),
		'testimonials' => __( 'نظرات مشتریان', 'medora' ),
		'blog'         => __( 'آخرین نوشته‌ها', 'medora' ),
		'newsletter'   => __( 'خبرنامه', 'medora' ),
	);
}

/**
 * The icons the trust tiles may use.
 *
 * @return array
 */
function medora_benefit_icons() {
	return array(
		'truck'   => __( 'ارسال', 'medora' ),
		'shield'  => __( 'سپر امنیت', 'medora' ),
		'badge'   => __( 'نشان کیفیت', 'medora' ),
		'refresh' => __( 'بازگشت کالا', 'medora' ),
		'headset' => __( 'پشتیبانی', 'medora' ),
		'star'    => __( 'ستاره', 'medora' ),
	);
}

/**
 * Register the setting.
 */
function medora_register_settings() {
	register_setting(
		'medora_settings_group',
		'medora_settings',
		array(
			'type'              => 'array',
			'sanitize_callback' => 'medora_sanitize_settings',
			'default'           => medora_default_settings(),
		)
	);
}
add_action( 'admin_init', 'medora_register_settings' );

/**
 * Sanitise the submitted settings.
 *
 * @param array $input Raw input.
 * @return array
 */
function medora_sanitize_settings( $input ) {
	$defaults = medora_default_settings();
	$clean    = array();

	if ( ! is_array( $input ) ) {
		return $defaults;
	}

	$numbers = array( 'min_discount', 'sale_limit', 'featured_limit', 'new_limit', 'categories_limit', 'blog_limit' );
	$texts   = array(
		'sale_eyebrow',
		'sale_title',
		'sale_subtitle',
		'featured_eyebrow',
		'featured_title',
		'new_eyebrow',
		'new_title',
		'categories_eyebrow',
		'categories_title',
		'blog_eyebrow',
		'blog_title',
		'testimonials_eyebrow',
		'testimonials_title',
		'newsletter_eyebrow',
		'newsletter_title',
	);

	foreach ( $numbers as $key ) {
		$value = isset( $input[ $key ] ) ? absint( $input[ $key ] ) : $defaults[ $key ];

		if ( 'min_discount' === $key ) {
			$value = min( 90, max( 0, $value ) );
		} else {
			$value = min( 24, max( 1, $value ) );
		}

		$clean[ $key ] = $value;
	}

	foreach ( $texts as $key ) {
		$clean[ $key ] = isset( $input[ $key ] ) ? sanitize_text_field( wp_unslash( $input[ $key ] ) ) : $defaults[ $key ];
	}

	foreach ( array( 'testimonials_text', 'newsletter_text' ) as $key ) {
		$clean[ $key ] = isset( $input[ $key ] ) ? wp_kses_post( wp_unslash( $input[ $key ] ) ) : $defaults[ $key ];
	}

	// Section switches: unchecked boxes are absent from the POST, which is what turns them off.
	$clean['sections'] = array();

	foreach ( array_keys( medora_section_labels() ) as $key ) {
		$clean['sections'][ $key ] = ! empty( $input['sections'][ $key ] ) ? 1 : 0;
	}

	// Trust tiles: four fixed rows, each with an icon, a title and a line of text.
	$icons            = array_keys( medora_benefit_icons() );
	$clean['benefits'] = array();

	for ( $i = 0; $i < 4; $i++ ) {
		$icon  = isset( $input['benefits'][ $i ]['icon'] ) ? sanitize_key( $input['benefits'][ $i ]['icon'] ) : '';
		$title = isset( $input['benefits'][ $i ]['title'] ) ? sanitize_text_field( wp_unslash( $input['benefits'][ $i ]['title'] ) ) : '';
		$text  = isset( $input['benefits'][ $i ]['text'] ) ? sanitize_text_field( wp_unslash( $input['benefits'][ $i ]['text'] ) ) : '';

		if ( ! in_array( $icon, $icons, true ) ) {
			$icon = $defaults['benefits'][ $i ]['icon'];
		}

		$clean['benefits'][ $i ] = array(
			'icon'  => $icon,
			'title' => $title ? $title : $defaults['benefits'][ $i ]['title'],
			'text'  => $text ? $text : $defaults['benefits'][ $i ]['text'],
		);
	}

	return $clean;
}

/**
 * Add the settings page under Settings.
 */
function medora_settings_menu() {
	add_options_page(
		__( 'تنظیمات مدورا', 'medora' ),
		__( 'تنظیمات مدورا', 'medora' ),
		'manage_options',
		'medora-settings',
		'medora_render_settings_page'
	);
}
add_action( 'admin_menu', 'medora_settings_menu' );

/**
 * A text/number/textarea field on the settings page.
 *
 * @param string $key         Setting key.
 * @param string $label       Label.
 * @param string $description Help text.
 * @param string $type        text|number|textarea.
 */
function medora_settings_field( $key, $label, $description = '', $type = 'text' ) {
	$settings = wp_parse_args( get_option( 'medora_settings', array() ), medora_default_settings() );
	$value    = isset( $settings[ $key ] ) ? $settings[ $key ] : '';
	$name     = 'medora_settings[' . $key . ']';

	echo '<tr><th scope="row"><label for="medora-' . esc_attr( $key ) . '">' . esc_html( $label ) . '</label></th><td>';

	if ( 'textarea' === $type ) {
		printf(
			'<textarea id="medora-%1$s" name="%2$s" rows="3" class="large-text">%3$s</textarea>',
			esc_attr( $key ),
			esc_attr( $name ),
			esc_textarea( $value )
		);
	} else {
		printf(
			'<input type="%3$s" id="medora-%1$s" name="%2$s" value="%4$s" class="small-text" %5$s>',
			esc_attr( $key ),
			esc_attr( $name ),
			esc_attr( $type ),
			esc_attr( $value ),
			'number' === $type ? 'min="0" max="90" step="1"' : ''
		);
	}

	if ( $description ) {
		echo '<p class="description">' . esc_html( $description ) . '</p>';
	}

	echo '</td></tr>';
}

/**
 * Render the settings page.
 */
function medora_render_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$settings = wp_parse_args( get_option( 'medora_settings', array() ), medora_default_settings() );
	$benefits = isset( $settings['benefits'] ) ? $settings['benefits'] : medora_default_settings()['benefits'];
	$icons    = medora_benefit_icons();
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'تنظیمات مدورا', 'medora' ); ?></h1>

		<p class="description">
			<?php esc_html_e( 'بخش فروشگاهی صفحهٔ اصلی از همین‌جا کنترل می‌شود. لوگو، متن فوتر، اطلاعات تماس، شبکه‌های اجتماعی و نمادهای اعتماد در «سفارشی‌سازی» هستند.', 'medora' ); ?>
		</p>

		<form action="options.php" method="post">
			<?php settings_fields( 'medora_settings_group' ); ?>

			<h2><?php esc_html_e( 'بخش تخفیف شگفت‌انگیز', 'medora' ); ?></h2>
			<p class="description">
				<?php esc_html_e( 'این بخش از محصولات تخفیف‌دار واقعی ووکامرس ساخته می‌شود و شمارش معکوس از تاریخ پایان تخفیف همان محصولات می‌آید؛ اگر هیچ محصولی شرایط را نداشته باشد، بخش نمایش داده نمی‌شود.', 'medora' ); ?>
			</p>
			<table class="form-table" role="presentation">
				<?php
				medora_settings_field( 'sale_eyebrow', __( 'متن کوچک بالای عنوان', 'medora' ) );
				medora_settings_field( 'sale_title', __( 'عنوان بخش', 'medora' ) );
				medora_settings_field( 'sale_subtitle', __( 'توضیح کوتاه', 'medora' ) );
				medora_settings_field( 'min_discount', __( 'حداقل درصد تخفیف', 'medora' ), __( 'فقط محصولاتی نمایش داده می‌شوند که درصد تخفیفشان از این عدد کمتر نباشد. مثلاً ۲۰ یعنی تخفیف‌های ۲۰٪ و بالاتر.', 'medora' ), 'number' );
				medora_settings_field( 'sale_limit', __( 'تعداد محصول در این بخش', 'medora' ), '', 'number' );
				?>
			</table>

			<h2><?php esc_html_e( 'ریل‌های محصولات', 'medora' ); ?></h2>
			<table class="form-table" role="presentation">
				<?php
				medora_settings_field( 'featured_eyebrow', __( 'پیشنهادها — متن کوچک', 'medora' ) );
				medora_settings_field( 'featured_title', __( 'پیشنهادها — عنوان', 'medora' ) );
				medora_settings_field( 'featured_limit', __( 'پیشنهادها — تعداد', 'medora' ), __( 'محصولات ستاره‌دار ووکامرس. اگر هیچ محصولی ستاره نداشته باشد، جدیدترین‌ها نمایش داده می‌شوند.', 'medora' ), 'number' );
				medora_settings_field( 'new_eyebrow', __( 'جدیدترین‌ها — متن کوچک', 'medora' ) );
				medora_settings_field( 'new_title', __( 'جدیدترین‌ها — عنوان', 'medora' ) );
				medora_settings_field( 'new_limit', __( 'جدیدترین‌ها — تعداد', 'medora' ), '', 'number' );
				medora_settings_field( 'categories_eyebrow', __( 'دسته‌بندی‌ها — متن کوچک', 'medora' ) );
				medora_settings_field( 'categories_title', __( 'دسته‌بندی‌ها — عنوان', 'medora' ) );
				medora_settings_field( 'categories_limit', __( 'دسته‌بندی‌ها — تعداد', 'medora' ), __( 'دسته‌های اصلی ووکامرس، با تصویر دسته.', 'medora' ), 'number' );
				medora_settings_field( 'blog_eyebrow', __( 'وبلاگ — متن کوچک', 'medora' ) );
				medora_settings_field( 'blog_title', __( 'وبلاگ — عنوان', 'medora' ) );
				medora_settings_field( 'blog_limit', __( 'وبلاگ — تعداد نوشته', 'medora' ), '', 'number' );
				?>
			</table>

			<h2><?php esc_html_e( 'نظرات مشتریان و خبرنامه', 'medora' ); ?></h2>
			<table class="form-table" role="presentation">
				<?php
				medora_settings_field( 'testimonials_eyebrow', __( 'نظرات — متن کوچک', 'medora' ) );
				medora_settings_field( 'testimonials_title', __( 'نظرات — عنوان', 'medora' ) );
				medora_settings_field( 'testimonials_text', __( 'نظرات — توضیح', 'medora' ), '', 'textarea' );
				medora_settings_field( 'newsletter_eyebrow', __( 'خبرنامه — متن کوچک', 'medora' ) );
				medora_settings_field( 'newsletter_title', __( 'خبرنامه — عنوان', 'medora' ) );
				medora_settings_field( 'newsletter_text', __( 'خبرنامه — توضیح', 'medora' ), '', 'textarea' );
				?>
			</table>

			<h2><?php esc_html_e( 'مزایای خرید', 'medora' ); ?></h2>
			<table class="form-table" role="presentation">
				<?php foreach ( $benefits as $index => $benefit ) : ?>
					<tr>
						<th scope="row"><?php echo esc_html( medora_to_fa( $index + 1 ) ); ?></th>
						<td>
							<select name="medora_settings[benefits][<?php echo esc_attr( $index ); ?>][icon]">
								<?php foreach ( $icons as $icon => $label ) : ?>
									<option value="<?php echo esc_attr( $icon ); ?>" <?php selected( $benefit['icon'], $icon ); ?>><?php echo esc_html( $label ); ?></option>
								<?php endforeach; ?>
							</select>
							<input type="text" name="medora_settings[benefits][<?php echo esc_attr( $index ); ?>][title]" value="<?php echo esc_attr( $benefit['title'] ); ?>" class="regular-text" placeholder="<?php esc_attr_e( 'عنوان', 'medora' ); ?>">
							<input type="text" name="medora_settings[benefits][<?php echo esc_attr( $index ); ?>][text]" value="<?php echo esc_attr( $benefit['text'] ); ?>" class="regular-text" placeholder="<?php esc_attr_e( 'توضیح', 'medora' ); ?>">
						</td>
					</tr>
				<?php endforeach; ?>
			</table>

			<h2><?php esc_html_e( 'بخش‌های صفحهٔ اصلی', 'medora' ); ?></h2>
			<fieldset>
				<?php foreach ( medora_section_labels() as $key => $label ) : ?>
					<label style="display:inline-block;min-width:220px;margin-bottom:8px">
						<input type="checkbox" name="medora_settings[sections][<?php echo esc_attr( $key ); ?>]" value="1" <?php checked( ! empty( $settings['sections'][ $key ] ) ); ?>>
						<?php echo esc_html( $label ); ?>
					</label>
				<?php endforeach; ?>
			</fieldset>

			<?php submit_button(); ?>
		</form>
	</div>
	<?php
}
