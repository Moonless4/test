<?php
/**
 * CTA banner template part.
 *
 * @package Ofogh
 */

$cta_title = get_theme_mod( 'ofogh_cta_title', __( 'آماده‌اید ملک مناسب خود را پیدا کنید؟', 'ofogh' ) );
$cta_desc  = get_theme_mod( 'ofogh_cta_desc', __( 'بگذارید کارشناسان ما شما را به خانه یا سرمایه‌گذاری درست راهنمایی کنند.', 'ofogh' ) );
$bg_class  = isset( $args['bg'] ) ? $args['bg'] : 'section--white';
?>
<section class="section <?php echo esc_attr( $bg_class ); ?>">
    <div class="of-container">
        <div class="of-reveal">
            <div class="cta-banner__inner">
                <div class="cta-banner__content">
                    <span class="cta-banner__icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>
                    </span>
                    <div>
                        <h2 class="cta-banner__title"><?php echo esc_html( $cta_title ); ?></h2>
                        <p class="cta-banner__desc"><?php echo esc_html( $cta_desc ); ?></p>
                    </div>
                </div>
                <a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>" class="of-btn of-btn--primary of-btn--lg" style="flex-shrink:0;">
                    <?php esc_html_e( 'تماس بگیرید', 'ofogh' ); ?>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                </a>
            </div>
        </div>
    </div>
</section>
