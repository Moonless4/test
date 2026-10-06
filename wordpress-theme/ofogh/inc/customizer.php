<?php
/**
 * WordPress Customizer settings for Ofogh theme.
 *
 * @package Ofogh
 */

if ( ! defined( 'ABSPATH' ) ) exit;

function ofogh_customize_register( $wp_customize ) {

    // ---- Section: Site Identity (extended) ----
    $wp_customize->add_section( 'ofogh_company', array(
        'title'    => __( 'اطلاعات شرکت', 'ofogh' ),
        'priority' => 30,
    ) );

    $company_fields = array(
        'ofogh_company_name' => array( 'شرکت', 'املاک افق', 'text' ),
        'ofogh_phone'        => array( 'تلفن', '۰۹۱۲۳۴۵۶۷۸۹', 'text' ),
        'ofogh_email'        => array( 'ایمیل', 'info@ofogh.ir', 'text' ),
        'ofogh_address_1'    => array( 'نشانی (خط ۱)', 'خیابان فرشته، نبش کوچه بوعلی، پلاک ۱۴', 'text' ),
        'ofogh_address_2'    => array( 'نشانی (خط ۲)', 'تهران، کدپستی ۱۹۶۸۷', 'text' ),
        'ofogh_hours'        => array( 'ساعات کاری', 'شنبه تا پنجشنبه، ۹:۰۰ تا ۱۸:۰۰', 'text' ),
        'ofogh_social_instagram' => array( 'اینستاگرام', 'https://instagram.com', 'url' ),
        'ofogh_social_linkedin'  => array( 'لینکدین', 'https://linkedin.com', 'url' ),
        'ofogh_social_facebook'  => array( 'فیسبوک', 'https://facebook.com', 'url' ),
    );

    foreach ( $company_fields as $id => $config ) {
        $wp_customize->add_setting( $id, array(
            'default'           => $config[1],
            'sanitize_callback' => $config[2] === 'url' ? 'esc_url_raw' : 'sanitize_text_field',
            'transport'         => 'refresh',
        ) );
        $wp_customize->add_control( $id, array(
            'label'   => $config[0],
            'section' => 'ofogh_company',
            'type'    => $config[2] === 'url' ? 'url' : 'text',
        ) );
    }

    // ---- Section: Colors ----
    $wp_customize->add_section( 'ofogh_colors', array(
        'title'    => __( 'رنگ‌بندی', 'ofogh' ),
        'priority' => 40,
    ) );

    $color_fields = array(
        'ofogh_color_navy' => array( 'سرمه‌ای', '#0A192F' ),
        'ofogh_color_gold' => array( 'طلایی', '#C5A069' ),
        'ofogh_color_ink'  => array( 'مشکی جوهر', '#0B1B31' ),
        'ofogh_color_muted'=> array( 'خاکستری متن', '#5B6672' ),
    );

    foreach ( $color_fields as $id => $config ) {
        $wp_customize->add_setting( $id, array(
            'default'           => $config[1],
            'sanitize_callback' => 'sanitize_hex_color',
            'transport'         => 'refresh',
        ) );
        $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, $id, array(
            'label'   => $config[0],
            'section' => 'ofogh_colors',
        ) ) );
    }

    // ---- Section: Hero ----
    $wp_customize->add_section( 'ofogh_hero', array(
        'title'    => __( 'بخش هیرو', 'ofogh' ),
        'priority' => 50,
    ) );

    $wp_customize->add_setting( 'ofogh_hero_eyebrow', array(
        'default'           => 'املاک لوکس · از سال ۱۳۸۴',
        'sanitize_callback' => 'sanitize_text_field',
    ) );
    $wp_customize->add_control( 'ofogh_hero_eyebrow', array(
        'label'   => __( 'متن بالای عنوان', 'ofogh' ),
        'section' => 'ofogh_hero',
        'type'    => 'text',
    ) );

    $wp_customize->add_setting( 'ofogh_hero_title_1', array(
        'default'           => 'خانه‌های استثنایی',
        'sanitize_callback' => 'sanitize_text_field',
    ) );
    $wp_customize->add_control( 'ofogh_hero_title_1', array(
        'label'   => __( 'عنوان (خط ۱)', 'ofogh' ),
        'section' => 'ofogh_hero',
        'type'    => 'text',
    ) );

    $wp_customize->add_setting( 'ofogh_hero_title_2', array(
        'default'           => 'برای زندگی و سرمایه‌گذاری',
        'sanitize_callback' => 'sanitize_text_field',
    ) );
    $wp_customize->add_control( 'ofogh_hero_title_2', array(
        'label'   => __( 'عنوان (خط ۲)', 'ofogh' ),
        'section' => 'ofogh_hero',
        'type'    => 'text',
    ) );

    $wp_customize->add_setting( 'ofogh_hero_desc', array(
        'default'           => 'املاک ممتاز در بهترین موقعیت‌ها. خانهٔ رویایی یا سرمایه‌گذاری درست خود را با اطمینان پیدا کنید.',
        'sanitize_callback' => 'sanitize_text_field',
    ) );
    $wp_customize->add_control( 'ofogh_hero_desc', array(
        'label'   => __( 'توضیح', 'ofogh' ),
        'section' => 'ofogh_hero',
        'type'    => 'textarea',
    ) );

    $wp_customize->add_setting( 'ofogh_hero_image_id', array(
        'default'           => 'photo-1600585154340-be6161a56a0c',
        'sanitize_callback' => 'sanitize_text_field',
    ) );
    $wp_customize->add_control( 'ofogh_hero_image_id', array(
        'label'       => __( 'تصویر پس‌زمینه (شناسه Unsplash یا URL)', 'ofogh' ),
        'description' => __( 'شناسه عکس Unsplash (مثل photo-1600585154340-be6161a56a0c) یا یک URL کامل.', 'ofogh' ),
        'section'     => 'ofogh_hero',
        'type'        => 'text',
    ) );

    // ---- Section: CTA ----
    $wp_customize->add_section( 'ofogh_cta', array(
        'title'    => __( 'بخش فراخوان (CTA)', 'ofogh' ),
        'priority' => 60,
    ) );

    $wp_customize->add_setting( 'ofogh_cta_title', array(
        'default'           => 'آماده‌اید ملک مناسب خود را پیدا کنید؟',
        'sanitize_callback' => 'sanitize_text_field',
    ) );
    $wp_customize->add_control( 'ofogh_cta_title', array(
        'label'   => __( 'عنوان', 'ofogh' ),
        'section' => 'ofogh_cta',
        'type'    => 'text',
    ) );

    $wp_customize->add_setting( 'ofogh_cta_desc', array(
        'default'           => 'بگذارید کارشناسان ما شما را به خانه یا سرمایه‌گذاری درست راهنمایی کنند.',
        'sanitize_callback' => 'sanitize_text_field',
    ) );
    $wp_customize->add_control( 'ofogh_cta_desc', array(
        'label'   => __( 'توضیح', 'ofogh' ),
        'section' => 'ofogh_cta',
        'type'    => 'textarea',
    ) );
}
add_action( 'customize_register', 'ofogh_customize_register' );

/**
 * Output custom colors as CSS variables.
 */
function ofogh_custom_colors_css() {
    $navy  = get_theme_mod( 'ofogh_color_navy', '#0A192F' );
    $gold  = get_theme_mod( 'ofogh_color_gold', '#C5A069' );
    $ink   = get_theme_mod( 'ofogh_color_ink', '#0B1B31' );
    $muted = get_theme_mod( 'ofogh_color_muted', '#5B6672' );

    // Only output if different from defaults.
    if ( $navy === '#0A192F' && $gold === '#C5A069' && $ink === '#0B1B31' && $muted === '#5B6672' ) {
        return;
    }

    echo '<style id="ofogh-custom-colors">';
    echo ':root {';
    echo '--navy:' . esc_attr( $navy ) . ';';
    echo '--gold:' . esc_attr( $gold ) . ';';
    echo '--ink:' . esc_attr( $ink ) . ';';
    echo '--muted:' . esc_attr( $muted ) . ';';
    echo '}';
    echo '</style>' . "\n";
}
add_action( 'wp_head', 'ofogh_custom_colors_css', 20 );
