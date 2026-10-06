<?php
/**
 * Front page template (home page).
 *
 * @package Ofogh
 */

get_header();

// If Elementor has a custom front page, defer to it.
if ( did_action( 'elementor/loaded' ) && function_exists( 'elementor_theme_do_location' ) && elementor_theme_do_location( 'single' ) ) {
    get_footer();
    return;
}
?>

<!-- Hero -->
<section class="hero">
    <?php
    $hero_image = get_theme_mod( 'ofogh_hero_image_id', 'photo-1600585154340-be6161a56a0c' );
    $hero_url = ( strpos( $hero_image, 'http' ) === 0 ) ? $hero_image : ofogh_photo( $hero_image, 2000 );
    ?>
    <img src="<?php echo esc_url( $hero_url ); ?>"
         srcset="<?php echo esc_attr( ofogh_photo_srcset( $hero_image, array( 768, 1280, 1920, 2400 ), 80 ) ); ?>"
         sizes="100vw"
         alt="<?php esc_attr_e( 'ویلایی مدرن در ساعت آبی، با شیشه‌های تمام‌قد و فضای داخلی روشن', 'ofogh' ); ?>"
         decoding="async"
         class="hero__img">
    <div class="hero__overlay" aria-hidden="true"></div>

    <div class="of-container hero__content">
        <p class="hero__eyebrow"><?php echo esc_html( get_theme_mod( 'ofogh_hero_eyebrow', 'املاک لوکس · از سال ۱۳۸۴' ) ); ?></p>
        <h1 class="hero__title">
            <?php echo esc_html( get_theme_mod( 'ofogh_hero_title_1', 'خانه‌های استثنایی' ) ); ?>
            <br>
            <?php echo esc_html( get_theme_mod( 'ofogh_hero_title_2', 'برای زندگی و سرمایه‌گذاری' ) ); ?>
        </h1>
        <p class="hero__desc"><?php echo esc_html( get_theme_mod( 'ofogh_hero_desc', 'املاک ممتاز در بهترین موقعیت‌ها. خانهٔ رویایی یا سرمایه‌گذاری درست خود را با اطمینان پیدا کنید.' ) ); ?></p>
        <div class="hero__actions">
            <a href="<?php echo esc_url( get_post_type_archive_link( 'property' ) ?: home_url( '/properties/' ) ); ?>" class="of-btn of-btn--ivory of-btn--lg">
                <?php esc_html_e( 'مشاهدهٔ املاک', 'ofogh' ); ?>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </a>
            <a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>" class="of-btn of-btn--outline-light of-btn--lg">
                <?php esc_html_e( 'گفت‌وگو با مشاور', 'ofogh' ); ?>
            </a>
        </div>
    </div>

    <div class="hero__scroll">
        <span>
            <?php esc_html_e( 'اسکرول', 'ofogh' ); ?>
            <svg class="pulse" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
    </div>
</section>

<!-- About Section -->
<?php get_template_part( 'template-parts/section', 'about' ); ?>

<!-- Featured Properties -->
<?php get_template_part( 'template-parts/section', 'featured' ); ?>

<!-- Services Section -->
<?php get_template_part( 'template-parts/section', 'services' ); ?>

<!-- Why Choose Section -->
<?php get_template_part( 'template-parts/section', 'why-choose' ); ?>

<!-- Team Section -->
<?php get_template_part( 'template-parts/section', 'team' ); ?>

<!-- CTA Banner -->
<?php get_template_part( 'template-parts/section', 'cta' ); ?>

<?php get_footer(); ?>
