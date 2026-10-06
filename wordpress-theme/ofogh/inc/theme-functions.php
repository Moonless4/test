<?php
/**
 * Theme helper functions — Persian formatting, image helpers, data access.
 *
 * @package Ofogh
 */

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Default navigation links (used as menu fallback).
 */
function ofogh_default_nav_links() {
    $links = array(
        array( 'label' => __( 'خانه', 'ofogh' ), 'url' => home_url( '/' ) ),
        array( 'label' => __( 'املاک', 'ofogh' ), 'url' => get_post_type_archive_link( 'property' ) ?: home_url( '/properties/' ) ),
        array( 'label' => __( 'درباره ما', 'ofogh' ), 'url' => home_url( '/about/' ) ),
        array( 'label' => __( 'خدمات', 'ofogh' ), 'url' => home_url( '/services/' ) ),
        array( 'label' => __( 'تیم ما', 'ofogh' ), 'url' => home_url( '/team/' ) ),
        array( 'label' => __( 'تماس', 'ofogh' ), 'url' => home_url( '/contact/' ) ),
    );

    // If pages with matching slugs exist, use their permalinks.
    foreach ( $links as &$link ) {
        $slug = trim( wp_parse_url( $link['url'], PHP_URL_PATH ), '/' );
        if ( $page = get_page_by_path( $slug ) ) {
            $link['url'] = get_permalink( $page );
        }
    }
    return $links;
}

/**
 * Convert Latin digits in a string to Persian digits.
 */
function ofogh_to_persian_digits( $value ) {
    $persian = array( '۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹' );
    $latin   = array( '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' );
    return str_replace( $latin, $persian, (string) $value );
}

/**
 * Convert Persian digits back to Latin.
 */
function ofogh_to_latin_digits( $value ) {
    $persian = array( '۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹' );
    $latin   = array( '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' );
    return str_replace( $persian, $latin, (string) $value );
}

/**
 * Format a number with Persian thousands separators.
 */
function ofogh_format_number( $value ) {
    $formatted = number_format( (int) $value );
    return ofogh_to_persian_digits( $formatted );
}

/**
 * Format a price in Iranian Toman.
 * Values >= 1 billion → «XX میلیارد تومان»
 * Values >= 1 million → «XX میلیون تومان»
 */
function ofogh_format_price( $value ) {
    $value = (int) $value;
    if ( $value >= 1000000000 ) {
        $billions = $value / 1000000000;
        $rounded  = ( floor( $billions ) == $billions ) ? number_format( $billions, 0 ) : number_format( $billions, 1 );
        return ofogh_to_persian_digits( $rounded ) . ' میلیارد تومان';
    }
    if ( $value >= 1000000 ) {
        $millions = $value / 1000000;
        $rounded  = ( floor( $millions ) == $millions ) ? number_format( $millions, 0 ) : number_format( $millions, 1 );
        return ofogh_to_persian_digits( $rounded ) . ' میلیون تومان';
    }
    return ofogh_format_number( $value ) . ' تومان';
}

/**
 * Build a dial-safe tel: link from a Persian-formatted phone number.
 */
function ofogh_tel_href( $phone ) {
    $digits = ofogh_to_latin_digits( $phone );
    $digits = preg_replace( '/[^\d+]/', '', $digits );
    if ( preg_match( '/^09\d{9}$/', $digits ) ) {
        return 'tel:+98' . substr( $digits, 1 );
    }
    return 'tel:' . $digits;
}

/**
 * Build an Unsplash photo URL from a photo ID.
 */
function ofogh_photo( $id, $width = 1600, $quality = 78 ) {
    return 'https://images.unsplash.com/' . $id . '?auto=format&fit=crop&w=' . $width . '&q=' . $quality;
}

/**
 * Build an Unsplash srcset from a photo ID.
 */
function ofogh_photo_srcset( $id, $widths = array( 640, 960, 1280, 1600, 2000 ), $quality = 78 ) {
    $parts = array();
    foreach ( $widths as $w ) {
        $parts[] = ofogh_photo( $id, $w, $quality ) . ' ' . $w . 'w';
    }
    return implode( ', ', $parts );
}

/**
 * Get the site phone number (Customizer or default).
 */
function ofogh_get_phone() {
    return get_theme_mod( 'ofogh_phone', '۰۹۱۲۳۴۵۶۷۸۹' );
}

/**
 * Get the site email (Customizer or default).
 */
function ofogh_get_email() {
    return get_theme_mod( 'ofogh_email', 'info@ofogh.ir' );
}

/**
 * Get the site address lines.
 */
function ofogh_get_address() {
    return array(
        'line1' => get_theme_mod( 'ofogh_address_1', 'خیابان فرشته، نبش کوچه بوعلی، پلاک ۱۴' ),
        'line2' => get_theme_mod( 'ofogh_address_2', 'تهران، کدپستی ۱۹۶۸۷' ),
    );
}

/**
 * Get working hours.
 */
function ofogh_get_hours() {
    return get_theme_mod( 'ofogh_hours', 'شنبه تا پنجشنبه، ۹:۰۰ تا ۱۸:۰۰' );
}

/**
 * Get social links.
 */
function ofogh_get_socials() {
    $socials = array();
    $networks = array( 'instagram', 'linkedin', 'facebook' );
    foreach ( $networks as $net ) {
        $url = get_theme_mod( 'ofogh_social_' . $net, 'https://' . $net . '.com' );
        if ( $url ) {
            $socials[] = array(
                'label'   => ucfirst( $net ),
                'network' => $net,
                'href'    => $url,
            );
        }
    }
    return $socials;
}

/**
 * Get the company name.
 */
function ofogh_get_company_name() {
    return get_theme_mod( 'ofogh_company_name', 'املاک افق' );
}

/**
 * Get the copyright year in Persian (Gregorian → Jalali approximation).
 */
function ofogh_copyright_year() {
    $year = (int) current_time( 'Y' ) - 621;
    return ofogh_to_persian_digits( $year );
}

/**
 * Get property meta value with fallback.
 */
function ofogh_get_property_meta( $post_id, $key, $default = '' ) {
    $value = get_post_meta( $post_id, $key, true );
    return $value !== '' ? $value : $default;
}

/**
 * Get the featured image URL (or Unsplash fallback).
 */
function ofogh_get_property_image( $post_id, $size = 'ofogh-card' ) {
    if ( has_post_thumbnail( $post_id ) ) {
        return get_the_post_thumbnail_url( $post_id, $size );
    }
    $fallback = ofogh_get_property_meta( $post_id, '_property_image_id', 'photo-1600596542815-ffad4c1539a9' );
    $widths = array(
        'ofogh-card'     => 1280,
        'ofogh-wide'     => 1280,
        'ofogh-portrait' => 640,
        'ofogh-hero'     => 2000,
        'full'           => 2000,
    );
    $w = isset( $widths[ $size ] ) ? $widths[ $size ] : 1280;
    return ofogh_photo( $fallback, $w );
}

/**
 * Get the property gallery images (array of [url, alt]).
 */
function ofogh_get_property_gallery( $post_id ) {
    $gallery_meta = ofogh_get_property_meta( $post_id, '_property_gallery', '' );
    $images = array();

    if ( $gallery_meta ) {
        $ids = explode( ',', $gallery_meta );
        foreach ( $ids as $id ) {
            $id = trim( $id );
            if ( empty( $id ) ) continue;
            if ( is_numeric( $id ) ) {
                $attachment = get_post( $id );
                if ( $attachment ) {
                    $images[] = array(
                        'url' => wp_get_attachment_image_url( $id, 'ofogh-hero' ),
                        'alt' => $attachment->post_excerpt ?: $attachment->post_title,
                    );
                }
            } else {
                // Unsplash photo ID.
                $images[] = array(
                    'url' => ofogh_photo( $id, 2000 ),
                    'alt' => '',
                );
            }
        }
    }

    // Fallback: use the featured image or default photo.
    if ( empty( $images ) ) {
        $fallback = ofogh_get_property_meta( $post_id, '_property_image_id', 'photo-1600596542815-ffad4c1539a9' );
        $images[] = array(
            'url' => ofogh_photo( $fallback, 2000 ),
            'alt' => get_the_title( $post_id ),
        );
    }

    return $images;
}

/**
 * Get an agent's details by slug.
 */
function ofogh_get_agent_by_slug( $slug ) {
    $agents = ofogh_get_team_data();
    foreach ( $agents as $agent ) {
        if ( $agent['slug'] === $slug ) {
            return $agent;
        }
    }
    return $agents[0] ?? false;
}

/**
 * Get the agent assigned to a property.
 */
function ofogh_get_property_agent( $post_id ) {
    $agent_slug = ofogh_get_property_meta( $post_id, '_property_agent', 'arash-rostegar' );
    return ofogh_get_agent_by_slug( $agent_slug );
}

/**
 * Default services data (can be overridden by Customizer or a CPT later).
 */
function ofogh_get_services() {
    return array(
        array( 'title' => __( 'فروش خانه‌های لوکس', 'ofogh' ), 'description' => __( 'نمایندگی محرمانه برای خانه‌های شاخص معماری؛ از بازدیدهای خصوصی تا امضای قرارداد.', 'ofogh' ) ),
        array( 'title' => __( 'سرمایه‌گذاری ملکی', 'ofogh' ), 'description' => __( 'راهبرد خرید مبتنی بر بازدهی، برای خریدارانی که پرتفویی از املاک ممتاز می‌سازند.', 'ofogh' ) ),
        array( 'title' => __( 'بازاریابی املاک', 'ofogh' ), 'description' => __( 'عکاسی ادیتوریال، فیلم و کمپین‌های هدفمند که هر خانه را در برابر خریدار درست قرار می‌دهد.', 'ofogh' ) ),
        array( 'title' => __( 'مشاورهٔ املاک', 'ofogh' ), 'description' => __( 'تحلیل بازار، راهنمایی در ارزیابی و پشتیبانی مذاکره برای معاملات پیچیده.', 'ofogh' ) ),
        array( 'title' => __( 'ارزیابی ملک', 'ofogh' ), 'description' => __( 'کارشناسی دقیق بر پایهٔ معاملات مشابه، کیفیت ساخت و ارزش بلندمدت موقعیت.', 'ofogh' ) ),
        array( 'title' => __( 'خدمات جابه‌جایی', 'ofogh' ), 'description' => __( 'پشتیبانی کامل برای مشتریان داخلی و خارجی؛ از انتخاب اولیه تا استقرار نهایی.', 'ofogh' ) ),
    );
}

/**
 * Default values data.
 */
function ofogh_get_values() {
    return array(
        array( 'title' => __( 'گزینشی، نه فهرستی', 'ofogh' ), 'description' => __( 'پرتفویی آگاهانه کوچک را نمایندگی می‌کنیم تا هر خانه توجهی را بگیرد که معماری‌اش سزاوار آن است.', 'ofogh' ) ),
        array( 'title' => __( 'محرمانه، به‌صورت پیش‌فرض', 'ofogh' ), 'description' => __( 'معرفی‌های خارج از فهرست عمومی، مذاکرهٔ محرمانه و حفظ رازداری در همهٔ مراحل.', 'ofogh' ) ),
        array( 'title' => __( 'هوش سرمایه‌گذاری', 'ofogh' ), 'description' => __( 'بیست سال دادهٔ معاملات و شناخت محلی، پشت هر توصیه‌ای که ارائه می‌دهیم.', 'ofogh' ) ),
        array( 'title' => __( 'یک تیم، تا پایان کار', 'ofogh' ), 'description' => __( 'مشاوره، بازاریابی، هماهنگی حقوقی و جابه‌جایی، همه بر عهدهٔ یک مشاور پاسخگو.', 'ofogh' ) ),
    );
}

/**
 * Default stats data.
 */
function ofogh_get_stats() {
    return array(
        array( 'value' => '۱٬۴۰۰ میلیارد', 'label' => __( 'ارزش معاملات (تومان)', 'ofogh' ) ),
        array( 'value' => '+۶۲۰', 'label' => __( 'خانهٔ واگذارشده', 'ofogh' ) ),
        array( 'value' => '۲۰', 'label' => __( 'سال تجربه', 'ofogh' ) ),
        array( 'value' => '٪۹۶', 'label' => __( 'مشتریان تکراری', 'ofogh' ) ),
    );
}

/**
 * Default team data (can be replaced by a 'team' CPT later).
 */
function ofogh_get_team_data() {
    return array(
        array(
            'slug'    => 'arash-rostegar',
            'name'    => 'آرش رستگار',
            'role'    => 'مدیرعامل',
            'photo'   => 'photo-1507003211169-0a1dd7228f2d',
            'phone'   => '۰۹۱۲۳۴۵۶۷۸۹',
            'email'   => 'arash@ofogh.ir',
            'specialty' => 'املاک ممتاز، فروش خارج از نمایش عمومی، خریداران بین‌المللی',
        ),
        array(
            'slug'    => 'negar-tehrani',
            'name'    => 'نگار تهرانی',
            'role'    => 'مشاور املاک لوکس',
            'photo'   => 'photo-1573496359142-b8d87734a5a2',
            'phone'   => '۰۹۱۲۳۴۵۶۷۹۰',
            'email'   => 'negar@ofogh.ir',
            'specialty' => 'خانه‌های لوکس، فروش مجدد شاخص‌های معماری، بازدیدهای خصوصی',
        ),
        array(
            'slug'    => 'kaveh-amini',
            'name'    => 'کاوه امینی',
            'role'    => 'مشاور سرمایه‌گذاری',
            'photo'   => 'photo-1519085360753-af0119f7cbe7',
            'phone'   => '۰۹۱۲۳۴۵۶۷۹۱',
            'email'   => 'kaveh@ofogh.ir',
            'specialty' => 'خریدهای سرمایه‌گذاری، تحلیل بازدهی، راهبرد پرتفوی',
        ),
        array(
            'slug'    => 'sara-bahrami',
            'name'    => 'سارا بهرامی',
            'role'    => 'کارشناس ارشد املاک',
            'photo'   => 'photo-1580489944761-15a19d654956',
            'phone'   => '۰۹۱۲۳۴۵۶۷۹۲',
            'email'   => 'sara@ofogh.ir',
            'specialty' => 'خانه‌های خانوادگی، جابه‌جایی، مشاورهٔ محله',
        ),
    );
}

/**
 * Process steps for the services page.
 */
function ofogh_get_process_steps() {
    return array(
        array( 'title' => __( 'آشنایی', 'ofogh' ), 'description' => __( 'گفت‌وگویی دربارهٔ خواسته، بودجه و زندگی‌ای که ملک باید از آن پشتیبانی کند.', 'ofogh' ) ),
        array( 'title' => __( 'فهرست کوتاه', 'ofogh' ), 'description' => __( 'گزیده‌ای سنجیده، همراه با خانه‌های خارج از نمایش عمومی که هرگز به پورتال عمومی نمی‌رسند.', 'ofogh' ) ),
        array( 'title' => __( 'بازدیدهای خصوصی', 'ofogh' ), 'description' => __( 'دسترسی همراهی‌شده در زمان دلخواه شما، با ارزیابی صادقانه از هر خانه.', 'ofogh' ) ),
        array( 'title' => __( 'مذاکره', 'ofogh' ), 'description' => __( 'تحلیل املاک قابل مقایسه و راهبرد روشن مذاکره، به دست مشاور شما.', 'ofogh' ) ),
        array( 'title' => __( 'نهایی‌سازی', 'ofogh' ), 'description' => __( 'هماهنگی امور حقوقی، کارشناسی و جابه‌جایی تا خودِ اسباب‌کشی بی‌دغدغه پیش برود.', 'ofogh' ) ),
    );
}

/**
 * Get contact interests for the contact form.
 */
function ofogh_get_interests() {
    return array(
        __( 'خرید خانه', 'ofogh' ),
        __( 'فروش خانه', 'ofogh' ),
        __( 'سرمایه‌گذاری ملکی', 'ofogh' ),
        __( 'ارزیابی و مشاوره', 'ofogh' ),
        __( 'جابه‌جایی', 'ofogh' ),
    );
}

/**
 * Check if a property is in favorites (cookie-based).
 */
function ofogh_is_favorite( $post_id ) {
    $favorites = isset( $_COOKIE['ofogh_favorites'] ) ? array_map( 'absint', explode( ',', $_COOKIE['ofogh_favorites'] ) ) : array();
    return in_array( $post_id, $favorites, true );
}

/**
 * Get favorite count.
 */
function ofogh_favorite_count() {
    if ( ! isset( $_COOKIE['ofogh_favorites'] ) || empty( $_COOKIE['ofogh_favorites'] ) ) {
        return 0;
    }
    $favorites = array_filter( explode( ',', $_COOKIE['ofogh_favorites'] ) );
    return count( $favorites );
}
