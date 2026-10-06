<?php
/**
 * Header template.
 *
 * @package Ofogh
 */
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?> dir="rtl">
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<?php
// Elementor header override.
if ( function_exists( 'ofogh_elementor_has_header' ) && ofogh_elementor_has_header() ) {
    return;
}
?>

<header class="site-header header--dark <?php echo is_front_page() ? 'is-home-header site-header--transparent' : 'site-header--navy'; ?>" id="masthead">
    <div class="of-container">
        <div class="site-header__inner">
            <!-- Logo -->
            <?php if ( has_custom_logo() ) : ?>
                <div class="of-logo">
                    <?php the_custom_logo(); ?>
                </div>
            <?php else : ?>
                <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="of-logo" aria-label="<?php echo esc_attr( ofogh_get_company_name() ); ?> — <?php esc_attr_e( 'صفحهٔ اصلی', 'ofogh' ); ?>">
                    <span class="of-logo__mark">
                        <svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M6 27V9l6.5-4.2V27" />
                            <path d="M19 27V14.6L25.5 10.4V27" />
                            <path d="M3.5 27h25" />
                        </svg>
                    </span>
                    <span class="flex flex-col">
                        <span class="of-logo__name">افق</span>
                        <span class="of-logo__sub">املاک ممتاز</span>
                    </span>
                </a>
            <?php endif; ?>

            <!-- Desktop nav -->
            <?php
            if ( has_nav_menu( 'primary' ) ) {
                wp_nav_menu( array(
                    'theme_location' => 'primary',
                    'container'      => false,
                    'menu_class'     => 'header-nav',
                    'menu_id'        => 'primary-nav',
                    'aria_label'     => __( 'فهرست اصلی', 'ofogh' ),
                    'fallback_cb'    => false,
                ) );
            } else {
                ofogh_default_menu();
            }
            ?>

            <!-- Actions -->
            <div class="header-actions">
                <!-- Favorites -->
                <a href="<?php echo esc_url( home_url( '/favorites/' ) ); ?>" class="header-icon-btn header-icon-btn--fav" aria-label="<?php esc_attr_e( 'املاک ذخیره‌شده', 'ofogh' ); ?>" style="position:relative;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    <span class="fav-badge fav-count-badge" style="display:none;"></span>
                </a>

                <!-- Phone button -->
                <a href="<?php echo esc_attr( ofogh_tel_href( ofogh_get_phone() ) ); ?>" class="of-btn of-btn--sm header-phone-btn <?php echo is_front_page() ? 'of-btn--outline-light' : 'of-btn--outline-light'; ?>">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span dir="ltr"><?php echo esc_html( ofogh_get_phone() ); ?></span>
                </a>

                <!-- Mobile menu toggle -->
                <button type="button" id="mobile-menu-toggle" class="header-icon-btn header-icon-btn--menu" aria-expanded="false" aria-controls="mobile-menu" aria-label="<?php esc_attr_e( 'باز کردن منو', 'ofogh' ); ?>">
                    <svg id="menu-icon-open" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                    <svg id="menu-icon-close" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
        </div>
    </div>

    <!-- Mobile menu -->
    <div id="mobile-menu" class="mobile-menu">
        <div class="of-container">
            <div class="mobile-menu__inner">
                <?php
                if ( has_nav_menu( 'mobile' ) ) {
                    wp_nav_menu( array(
                        'theme_location' => 'mobile',
                        'container'      => false,
                        'menu_class'     => '',
                        'fallback_cb'    => false,
                    ) );
                } else {
                    echo '<nav aria-label="' . esc_attr__( 'فهرست موبایل', 'ofogh' ) . '">';
                    $links = ofogh_default_nav_links();
                    foreach ( $links as $link ) {
                        echo '<a href="' . esc_url( $link['url'] ) . '">' . esc_html( $link['label'] ) . '</a>';
                    }
                    echo '</nav>';
                }
                ?>
                <div class="mobile-menu__actions">
                    <a href="<?php echo esc_attr( ofogh_tel_href( ofogh_get_phone() ) ); ?>" class="of-btn of-btn--ivory of-btn--lg">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        <span dir="ltr"><?php echo esc_html( ofogh_get_phone() ); ?></span>
                    </a>
                    <a href="<?php echo esc_url( home_url( '/favorites/' ) ); ?>" class="of-btn of-btn--outline-light of-btn--lg">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        <?php esc_html_e( 'املاک ذخیره‌شده', 'ofogh' ); ?>
                    </a>
                </div>
            </div>
        </div>
    </div>
</header>

<main id="main" class="site-main">
