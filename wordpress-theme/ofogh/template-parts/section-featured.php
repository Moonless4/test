<?php
/**
 * Featured properties carousel section.
 *
 * @package Ofogh
 */

$featured_query = new WP_Query( array(
    'post_type'      => 'property',
    'posts_per_page' => 8,
    'meta_key'       => '_property_featured',
    'meta_value'     => '1',
    'orderby'        => 'date',
    'order'          => 'DESC',
) );

// Fallback: if no featured properties, get latest.
if ( ! $featured_query->have_posts() ) {
    $featured_query = new WP_Query( array(
        'post_type'      => 'property',
        'posts_per_page' => 8,
        'orderby'        => 'date',
        'order'          => 'DESC',
    ) );
}
?>
<section class="section section--mist">
    <div class="of-container">
        <div class="of-reveal">
            <div class="section-heading section-heading--center" style="max-width:48rem;">
                <p class="section-heading__label eyebrow"><?php esc_html_e( 'ویژه', 'ofogh' ); ?></p>
                <h2 class="section-heading__title"><?php esc_html_e( 'املاک ویژه', 'ofogh' ); ?></h2>
                <p class="section-heading__desc"><?php esc_html_e( 'گزیده‌ای سنجیده از پرتفوی ما؛ خانه‌های شاخص معماری و نشانی‌های ممتاز برای سرمایه‌گذاری.', 'ofogh' ); ?></p>
            </div>
        </div>

        <div class="featured-carousel" style="margin-top:56px;">
            <?php if ( $featured_query->have_posts() ) : ?>
                <!-- Prev arrow -->
                <button class="carousel-arrow carousel-arrow--prev" aria-label="<?php esc_attr_e( 'قبلی', 'ofogh' ); ?>" disabled>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <!-- Next arrow -->
                <button class="carousel-arrow carousel-arrow--next" aria-label="<?php esc_attr_e( 'بعدی', 'ofogh' ); ?>">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                </button>

                <div class="carousel-scroller no-scrollbar" role="group" aria-label="<?php esc_attr_e( 'املاک ویژه — گالری قابل مرور', 'ofogh' ); ?>" tabindex="0">
                    <?php while ( $featured_query->have_posts() ) : $featured_query->the_post(); ?>
                        <div class="carousel-card" data-card>
                            <?php get_template_part( 'template-parts/property', 'card' ); ?>
                        </div>
                    <?php endwhile; ?>
                </div>

                <div class="carousel-progress">
                    <div class="carousel-progress__bar"></div>
                </div>
            <?php endif; ?>
            <?php wp_reset_postdata(); ?>
        </div>

        <div class="of-reveal" style="margin-top:56px; display:flex; justify-content:center;">
            <a href="<?php echo esc_url( get_post_type_archive_link( 'property' ) ?: home_url( '/properties/' ) ); ?>" class="of-btn of-btn--outline-dark of-btn--lg">
                <?php esc_html_e( 'مشاهدهٔ همهٔ املاک', 'ofogh' ); ?>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </a>
        </div>
    </div>
</section>
