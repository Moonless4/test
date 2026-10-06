<?php
/**
 * About section template part (home page).
 *
 * @package Ofogh
 */
?>
<section class="section section--white">
    <div class="of-container">
        <div class="about-grid">
            <div class="of-reveal">
                <p class="eyebrow"><?php esc_html_e( 'درباره ما', 'ofogh' ); ?></p>
                <h2 style="margin-top:20px; font-size:clamp(1.7rem,3.6vw,2.6rem); font-weight:700; line-height:1.45;">
                    <?php esc_html_e( 'ما کی هستیم', 'ofogh' ); ?>
                </h2>
                <p class="body">
                    <?php esc_html_e( 'در املاک افق، مردم را به خانه‌های استثنایی و سرمایه‌گذاری‌های هوشمند پیوند می‌زنیم. درستکاری، شفافیت و رضایت مشتری، جانِ هر کاری است که انجام می‌دهیم.', 'ofogh' ); ?>
                </p>
                <a href="<?php echo esc_url( home_url( '/about/' ) ); ?>" class="of-btn of-btn--primary of-btn--lg" style="margin-top:36px;">
                    <?php esc_html_e( 'بیشتر بدانید', 'ofogh' ); ?>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                </a>
                <dl class="stats-grid">
                    <?php foreach ( ofogh_get_stats() as $stat ) : ?>
                        <div>
                            <dt class="stat__label"><?php echo esc_html( $stat['label'] ); ?></dt>
                            <dd class="stat__value"><?php echo esc_html( $stat['value'] ); ?></dd>
                        </div>
                    <?php endforeach; ?>
                </dl>
            </div>

            <div class="of-reveal" style="transition-delay:120ms;">
                <div class="about-photos about-photos__group">
                    <div class="about-photos__main">
                        <img src="<?php echo esc_url( ofogh_photo( 'photo-1600566753190-17f0baa2a6c3', 1200 ) ); ?>"
                             srcset="<?php echo esc_attr( ofogh_photo_srcset( 'photo-1600566753190-17f0baa2a6c3', array( 640, 960, 1280 ) ) ); ?>"
                             sizes="(min-width: 1024px) 32vw, 58vw"
                             alt="<?php esc_attr_e( 'خانه‌ای مدرن و دوطبقه با نمای چوبی و باغی محوطه‌سازی‌شده', 'ofogh' ); ?>"
                             loading="lazy" decoding="async">
                    </div>
                    <div class="about-photos__sec">
                        <img src="<?php echo esc_url( ofogh_photo( 'photo-1600585154526-990dced4db0d', 800 ) ); ?>"
                             srcset="<?php echo esc_attr( ofogh_photo_srcset( 'photo-1600585154526-990dced4db0d', array( 420, 640, 900 ) ) ); ?>"
                             sizes="(min-width: 1024px) 20vw, 36vw"
                             alt="<?php esc_attr_e( 'نمای تیره و پانل‌دار در غروب که از درون روشن است', 'ofogh' ); ?>"
                             loading="lazy" decoding="async">
                    </div>
                    <a href="<?php echo esc_url( home_url( '/about/' ) ); ?>" class="about-photos__link" aria-label="<?php esc_attr_e( 'اطلاعات بیشتر دربارهٔ املاک افق', 'ofogh' ); ?>">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                    </a>
                </div>
            </div>
        </div>
    </div>
</section>
