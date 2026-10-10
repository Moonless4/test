<?php
/**
 * Customizer: the shop's branding and the text that surrounds it.
 *
 * Everything the shop owner would change without touching code lives here — logo and footer
 * copy, contact details, social links, trust badges — while the commerce settings (special offer,
 * minimum discount, section limits) sit on the theme's own settings page in inc/admin-settings.php.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

/**
 * Register the theme's Customizer settings.
 *
 * @param WP_Customize_Manager $wp_customize Customizer.
 */
function medora_customize_register( $wp_customize ) {
	$wp_customize->add_panel(
		'medora_panel',
		array(
			'title'       => __( 'تنظیمات مدورا', 'medora' ),
			'description' => __( 'لوگو، سربرگ، فوتر و بخش‌های صفحهٔ اصلی.', 'medora' ),
			'priority'    => 20,
		)
	);

	/* ---------------------------------------------------------------- *
	 * Header
	 * ---------------------------------------------------------------- */

	$wp_customize->add_section(
		'medora_header',
		array(
			'title' => __( 'سربرگ', 'medora' ),
			'panel' => 'medora_panel',
		)
	);

	$wp_customize->add_setting(
		'medora_header_note',
		array(
			'default'           => '',
			'sanitize_callback' => 'sanitize_text_field',
			'transport'         => 'refresh',
		)
	);

	$wp_customize->add_control(
		'medora_header_note',
		array(
			'label'       => __( 'نوار بالای سربرگ', 'medora' ),
			'description' => __( 'یک جملهٔ کوتاه مثل «ارسال رایگان برای خرید بالای دو میلیون». خالی بگذارید تا نوار نمایش داده نشود.', 'medora' ),
			'section'     => 'medora_header',
			'type'        => 'text',
		)
	);

	$wp_customize->add_setting(
		'medora_header_note_url',
		array(
			'default'           => '',
			'sanitize_callback' => 'esc_url_raw',
		)
	);

	$wp_customize->add_control(
		'medora_header_note_url',
		array(
			'label'   => __( 'نشانی نوار بالای سربرگ', 'medora' ),
			'section' => 'medora_header',
			'type'    => 'url',
		)
	);

	$wp_customize->add_setting(
		'medora_header_dark_logo',
		array(
			'default'           => 0,
			'sanitize_callback' => 'absint',
		)
	);

	$wp_customize->add_control(
		new WP_Customize_Media_Control(
			$wp_customize,
			'medora_header_dark_logo',
			array(
				'label'     => __( 'لوگوی سربرگ', 'medora' ),
				'section'   => 'medora_header',
				'mime_type' => 'image',
			)
		)
	);

	$wp_customize->add_setting(
		'medora_wishlist_url',
		array(
			'default'           => '',
			'sanitize_callback' => 'esc_url_raw',
		)
	);

	$wp_customize->add_control(
		'medora_wishlist_url',
		array(
			'label'       => __( 'نشانی علاقه‌مندی‌ها', 'medora' ),
			'description' => __( 'اگر افزونهٔ علاقه‌مندی‌ها دارید نشانی صفحهٔ آن را وارد کنید؛ خالی یعنی آیکن نمایش داده نمی‌شود.', 'medora' ),
			'section'     => 'medora_header',
			'type'        => 'url',
		)
	);

	/* ---------------------------------------------------------------- *
	 * Footer
	 * ---------------------------------------------------------------- */

	$wp_customize->add_section(
		'medora_footer',
		array(
			'title' => __( 'فوتر', 'medora' ),
			'panel' => 'medora_panel',
		)
	);

	$text_settings = array(
		'medora_footer_about'     => array(
			'label'   => __( 'دربارهٔ فروشگاه', 'medora' ),
			'type'    => 'textarea',
			'default' => 'مدورا، فروشگاه اینترنتی پوشاک و اکسسوری با تمرکز بر کیفیت دوخت، پارچهٔ درست و طراحی امروزی. از میان جدیدترین کالکشن‌ها انتخاب کنید و درب منزل تحویل بگیرید.',
		),
		'medora_footer_copyright' => array(
			'label'   => __( 'متن کپی‌رایت', 'medora' ),
			'type'    => 'text',
			'default' => '© ۲۰۲۵ مدورا. تمامی حقوق محفوظ است.',
		),
		'medora_contact_phone'    => array(
			'label' => __( 'تلفن تماس', 'medora' ),
			'type'  => 'text',
		),
		'medora_contact_email'    => array(
			'label' => __( 'ایمیل تماس', 'medora' ),
			'type'  => 'text',
		),
		'medora_contact_address'  => array(
			'label' => __( 'نشانی', 'medora' ),
			'type'  => 'textarea',
		),
	);

	foreach ( $text_settings as $id => $setting ) {
		$wp_customize->add_setting(
			$id,
			array(
				'default'           => isset( $setting['default'] ) ? $setting['default'] : '',
				'sanitize_callback' => 'textarea' === $setting['type'] ? 'wp_kses_post' : 'sanitize_text_field',
			)
		);

		$wp_customize->add_control(
			$id,
			array(
				'label'   => $setting['label'],
				'section' => 'medora_footer',
				'type'    => $setting['type'],
			)
		);
	}

	$wp_customize->add_setting(
		'medora_footer_light_logo',
		array(
			'default'           => 0,
			'sanitize_callback' => 'absint',
		)
	);

	$wp_customize->add_control(
		new WP_Customize_Media_Control(
			$wp_customize,
			'medora_footer_light_logo',
			array(
				'label'       => __( 'لوگوی فوتر (سفید)', 'medora' ),
				'description' => __( 'لوگوی سفید با پس‌زمینهٔ شفاف، تا مستقیم روی فوتر تیره بنشیند.', 'medora' ),
				'section'     => 'medora_footer',
				'mime_type'   => 'image',
			)
		)
	);

	// Social links: one setting per network, empty ones are not rendered.
	$socials = array(
		'medora_social_instagram' => __( 'اینستاگرام', 'medora' ),
		'medora_social_telegram'  => __( 'تلگرام', 'medora' ),
		'medora_social_whatsapp'  => __( 'واتس‌اپ', 'medora' ),
	);

	foreach ( $socials as $id => $label ) {
		$wp_customize->add_setting(
			$id,
			array(
				'default'           => '',
				'sanitize_callback' => 'esc_url_raw',
			)
		);

		$wp_customize->add_control(
			$id,
			array(
				'label'   => $label,
				'section' => 'medora_footer',
				'type'    => 'url',
			)
		);
	}

	// Trust badges (eNamad and friends): image + link, both optional.
	for ( $i = 1; $i <= 2; $i++ ) {
		$wp_customize->add_setting(
			'medora_trust_' . $i . '_image',
			array(
				'default'           => 0,
				'sanitize_callback' => 'absint',
			)
		);

		$wp_customize->add_control(
			new WP_Customize_Media_Control(
				$wp_customize,
				'medora_trust_' . $i . '_image',
				array(
					/* translators: %d: badge number. */
					'label'     => sprintf( __( 'نماد اعتماد %d', 'medora' ), $i ),
					'section'   => 'medora_footer',
					'mime_type' => 'image',
				)
			)
		);

		$wp_customize->add_setting(
			'medora_trust_' . $i . '_url',
			array(
				'default'           => '',
				'sanitize_callback' => 'esc_url_raw',
			)
		);

		$wp_customize->add_control(
			'medora_trust_' . $i . '_url',
			array(
				/* translators: %d: badge number. */
				'label'   => sprintf( __( 'نشانی نماد اعتماد %d', 'medora' ), $i ),
				'section' => 'medora_footer',
				'type'    => 'url',
			)
		);
	}

	/* ---------------------------------------------------------------- *
	 * Newsletter
	 * ---------------------------------------------------------------- */

	$wp_customize->add_section(
		'medora_newsletter',
		array(
			'title' => __( 'خبرنامه', 'medora' ),
			'panel' => 'medora_panel',
		)
	);

	$wp_customize->add_setting(
		'medora_newsletter_image',
		array(
			'default'           => 0,
			'sanitize_callback' => 'absint',
		)
	);

	$wp_customize->add_control(
		new WP_Customize_Media_Control(
			$wp_customize,
			'medora_newsletter_image',
			array(
				'label'     => __( 'تصویر خبرنامه', 'medora' ),
				'section'   => 'medora_newsletter',
				'mime_type' => 'image',
			)
		)
	);

	/* ---------------------------------------------------------------- *
	 * Front page toggles
	 * ---------------------------------------------------------------- */

	$wp_customize->add_section(
		'medora_front',
		array(
			'title'       => __( 'بخش‌های صفحهٔ اصلی', 'medora' ),
			'description' => __( 'روشن و خاموش کردن بخش‌ها و انتخاب صفحهٔ اصلی.', 'medora' ),
			'panel'       => 'medora_panel',
		)
	);

	$wp_customize->add_setting(
		'medora_hero_full',
		array(
			'default'           => 1,
			'sanitize_callback' => 'medora_sanitize_checkbox',
		)
	);

	$wp_customize->add_control(
		'medora_hero_full',
		array(
			'label'       => __( 'اسلایدر تمام‌عرض', 'medora' ),
			'description' => __( 'خاموش کردن، اسلایدر را در کادر وسط صفحه نمایش می‌دهد.', 'medora' ),
			'section'     => 'medora_front',
			'type'        => 'checkbox',
		)
	);

	$wp_customize->add_setting(
		'medora_testimonials_image',
		array(
			'default'           => 0,
			'sanitize_callback' => 'absint',
		)
	);

	$wp_customize->add_control(
		new WP_Customize_Media_Control(
			$wp_customize,
			'medora_testimonials_image',
			array(
				'label'       => __( 'تصویر بلوک نظرات مشتریان', 'medora' ),
				'description' => __( 'تصویر بلند کنار نظرات، فقط در نمایشگرهای بزرگ.', 'medora' ),
				'section'     => 'medora_front',
				'mime_type'   => 'image',
			)
		)
	);
}
add_action( 'customize_register', 'medora_customize_register' );

/**
 * Sanitise a checkbox setting.
 *
 * @param mixed $value Raw value.
 * @return int
 */
function medora_sanitize_checkbox( $value ) {
	return ( isset( $value ) && ( true === $value || 1 === (int) $value || '1' === $value ) ) ? 1 : 0;
}

/**
 * The social links the footer renders, in the order they appear.
 *
 * @return array[]
 */
function medora_social_links() {
	$networks = array(
		'instagram' => array(
			'label' => __( 'اینستاگرام', 'medora' ),
			'icon'  => 'instagram',
		),
		'telegram'  => array(
			'label' => __( 'تلگرام', 'medora' ),
			'icon'  => 'send',
		),
		'whatsapp'  => array(
			'label' => __( 'واتس‌اپ', 'medora' ),
			'icon'  => 'headset',
		),
	);

	$links = array();

	foreach ( $networks as $key => $network ) {
		$url = get_theme_mod( 'medora_social_' . $key, '' );

		if ( $url ) {
			$links[] = array(
				'label' => $network['label'],
				'icon'  => $network['icon'],
				'url'   => $url,
			);
		}
	}

	return $links;
}

/**
 * The trust badges the footer renders (image + link), skipping empty slots.
 *
 * @return array[]
 */
function medora_trust_badges() {
	$badges = array();

	for ( $i = 1; $i <= 2; $i++ ) {
		$image = (int) get_theme_mod( 'medora_trust_' . $i . '_image', 0 );

		if ( ! $image ) {
			continue;
		}

		$badges[] = array(
			'image' => $image,
			'url'   => get_theme_mod( 'medora_trust_' . $i . '_url', '' ),
			'title' => get_the_title( $image ),
		);
	}

	return $badges;
}
