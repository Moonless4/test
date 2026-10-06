<?php
/**
 * Template Name: صفحهٔ خدمات
 * Template Post Type: page
 *
 * @package Ofogh
 */

get_header();

get_template_part( 'template-parts/page', 'hero', array(
    'image_id'    => 'photo-1600573472550-8090b5e0745e',
    'label'       => __( 'خدمات', 'ofogh' ),
    'title'       => __( 'مشاوره، بازاریابی و خرید برای املاک ممتاز', 'ofogh' ),
    'description' => __( 'خدمتی کامل برای خریداران، فروشندگان و سرمایه‌گذاران — از نخستین گفت‌وگو تا پایان کار، با یک مشاور پاسخگو.', 'ofogh' ),
) );
?>

<!-- Services grid -->
<section class="section section--white" style="padding-block: 80px 96px;">
    <div class="of-container">
        <div class="of-reveal">
            <div class="section-heading" style="max-width:48rem;">
                <p class="section-heading__label eyebrow"><?php esc_html_e( 'کار ما', 'ofogh' ); ?></p>
                <h2 class="section-heading__title"><?php esc_html_e( 'شش تخصص، یک تیم', 'ofogh' ); ?></h2>
                <p class="section-heading__desc"><?php esc_html_e( 'هر همکاری از توان کامل مجموعه بهره می‌برد، نه یک مشاور که تنها کار می‌کند.', 'ofogh' ); ?></p>
            </div>
        </div>

        <div class="properties-grid" style="margin-top:56px;">
            <?php foreach ( ofogh_get_services() as $index => $service ) : ?>
                <div class="of-reveal" style="transition-delay:<?php echo esc_attr( $index * 70 ); ?>ms;">
                    <article class="services-card" style="display:flex; flex-direction:column; border-top:1px solid var(--line); padding-top:28px; height:100%;">
                        <span class="why-value__num"><?php echo esc_html( ofogh_to_persian_digits( str_pad( $index + 1, 2, '0', STR_PAD_LEFT ) ) ); ?></span>
                        <h3 style="margin-top:20px; font-size:18px; font-weight:700; color:var(--ink);"><?php echo esc_html( $service['title'] ); ?></h3>
                        <p style="margin-top:14px; flex:1; font-size:14px; line-height:1.95; color:var(--muted);"><?php echo esc_html( $service['description'] ); ?></p>
                        <a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>" class="group" style="margin-top:24px; display:inline-flex; align-items:center; gap:8px; font-size:13px; font-weight:500; color:var(--navy); transition: color 0.3s var(--ease-premium);">
                            <?php esc_html_e( 'دربارهٔ این خدمت گفت‌وگو کنیم', 'ofogh' ); ?>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.5s var(--ease-premium);"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                        </a>
                    </article>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- Process steps -->
<section class="section section--navy">
    <div class="of-container">
        <div class="of-reveal">
            <div class="section-heading section-heading--light" style="max-width:48rem;">
                <p class="section-heading__label eyebrow"><?php esc_html_e( 'فرایند', 'ofogh' ); ?></p>
                <h2 class="section-heading__title"><?php esc_html_e( 'چگونه با شما کار می‌کنیم', 'ofogh' ); ?></h2>
                <p class="section-heading__desc"><?php esc_html_e( 'پنج مرحلهٔ آرام، از نخستین گفت‌وگو تا جابه‌جایی نهایی.', 'ofogh' ); ?></p>
            </div>
        </div>
        <div class="why-values" style="margin-top:56px;">
            <?php foreach ( ofogh_get_process_steps() as $index => $step ) : ?>
                <div class="of-reveal" style="transition-delay:<?php echo esc_attr( $index * 80 ); ?>ms;">
                    <div class="why-value">
                        <span class="why-value__num"><?php echo esc_html( ofogh_to_persian_digits( str_pad( $index + 1, 2, '0', STR_PAD_LEFT ) ) ); ?></span>
                        <h3 class="why-value__title"><?php echo esc_html( $step['title'] ); ?></h3>
                        <p class="why-value__desc"><?php echo esc_html( $step['description'] ); ?></p>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<?php get_template_part( 'template-parts/section', 'cta', array( 'bg' => 'section--white' ) ); ?>

<?php get_footer(); ?>
