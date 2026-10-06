<?php
/**
 * Services section template part (home page).
 *
 * @package Ofogh
 */
?>
<section class="section section--white">
    <div class="of-container">
        <div class="services-grid">
            <div class="of-reveal services-sticky">
                <div class="section-heading" style="max-width:36rem;">
                    <p class="section-heading__label eyebrow"><?php esc_html_e( 'خدمات', 'ofogh' ); ?></p>
                    <h2 class="section-heading__title"><?php esc_html_e( 'خدمات مشاوره‌ای کامل برای املاک ممتاز', 'ofogh' ); ?></h2>
                    <p class="section-heading__desc"><?php esc_html_e( 'از نخستین بازدید تا امضای نهایی؛ یک تیم، مسئول ارزیابی، مذاکره، بازاریابی و جابه‌جایی.', 'ofogh' ); ?></p>
                </div>
                <div class="services-img">
                    <img src="<?php echo esc_url( ofogh_photo( 'photo-1600573472550-8090b5e0745e', 1200 ) ); ?>"
                         srcset="<?php echo esc_attr( ofogh_photo_srcset( 'photo-1600573472550-8090b5e0745e', array( 640, 960, 1280 ) ) ); ?>"
                         sizes="(min-width: 1024px) 42vw, 90vw"
                         alt="<?php esc_attr_e( 'فضای داخلی که از میان دیوار شیشه‌ای به تراس استخر باز می‌شود', 'ofogh' ); ?>"
                         loading="lazy" decoding="async">
                </div>
            </div>

            <div>
                <ul class="services-list">
                    <?php foreach ( ofogh_get_services() as $index => $service ) : ?>
                        <li class="services-list__item">
                            <a href="<?php echo esc_url( home_url( '/services/' ) ); ?>" class="services-list__link">
                                <span class="services-list__num"><?php echo esc_html( ofogh_to_persian_digits( str_pad( $index + 1, 2, '0', STR_PAD_LEFT ) ) ); ?></span>
                                <span style="flex:1;">
                                    <span class="services-list__title">
                                        <?php echo esc_html( $service['title'] ); ?>
                                        <svg class="services-list__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                                    </span>
                                    <span class="services-list__desc"><?php echo esc_html( $service['description'] ); ?></span>
                                </span>
                            </a>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
        </div>
    </div>
</section>
