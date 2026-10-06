<?php
/**
 * 404 template.
 *
 * @package Ofogh
 */
get_header();
?>
<div class="error-404">
    <div class="of-container">
        <p class="eyebrow"><?php esc_html_e( 'خطا ۴۰۴', 'ofogh' ); ?></p>
        <h1 class="error-404__title">۴۰۴</h1>
        <p class="error-404__desc"><?php esc_html_e( 'صفحه‌ای که دنبال آن بودید پیدا نشد. ممکن است منتقل شده یا حذف شده باشد.', 'ofogh' ); ?></p>
        <div style="margin-top:32px; display:flex; gap:12px;">
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="of-btn of-btn--primary of-btn--lg">
                <?php esc_html_e( 'بازگشت به خانه', 'ofogh' ); ?>
            </a>
            <a href="<?php echo esc_url( get_post_type_archive_link( 'property' ) ?: home_url( '/properties/' ) ); ?>" class="of-btn of-btn--outline-dark of-btn--lg">
                <?php esc_html_e( 'مشاهدهٔ املاک', 'ofogh' ); ?>
            </a>
        </div>
    </div>
</div>
<?php get_footer(); ?>
