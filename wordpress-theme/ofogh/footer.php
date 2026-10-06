<?php
/**
 * Footer template.
 *
 * @package Ofogh
 */
?>
</main><!-- #main -->

<?php
// Elementor footer override.
if ( function_exists( 'ofogh_elementor_has_footer' ) && ofogh_elementor_has_footer() ) {
    return;
}
?>

<footer class="site-footer" id="colophon">
    <div class="of-container" style="padding-block: 64px;">
        <div class="footer-grid">
            <!-- About -->
            <div class="footer-about">
                <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="of-logo" aria-label="<?php echo esc_attr( ofogh_get_company_name() ); ?>">
                    <span class="of-logo__mark">
                        <svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="color:var(--gold);">
                            <path d="M6 27V9l6.5-4.2V27" />
                            <path d="M19 27V14.6L25.5 10.4V27" />
                            <path d="M3.5 27h25" />
                        </svg>
                    </span>
                    <span class="flex flex-col">
                        <span class="of-logo__name" style="color:#fff;">افق</span>
                        <span class="of-logo__sub" style="color:rgba(255,255,255,0.6);">املاک ممتاز</span>
                    </span>
                </a>
                <p><?php esc_html_e( 'آژانسی بوتیک که خانه‌های شاخص معماری و سرمایه‌گذاری‌های مسکونی ممتاز را در سراسر ایران نمایندگی می‌کند.', 'ofogh' ); ?></p>
                <div class="footer-socials">
                    <?php foreach ( ofogh_get_socials() as $social ) : ?>
                        <?php
                        $icons = array(
                            'instagram' => '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>',
                            'linkedin'  => '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
                            'facebook'  => '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
                        );
                        $icon_svg = isset( $icons[ $social['network'] ] ) ? $icons[ $social['network'] ] : '';
                        ?>
                        <a href="<?php echo esc_url( $social['href'] ); ?>" aria-label="<?php echo esc_attr( $social['label'] ); ?>" target="_blank" rel="noreferrer">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><?php echo $icon_svg; // phpcs:ignore ?></svg>
                        </a>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- Quick links -->
            <nav class="footer-col" aria-label="<?php esc_attr_e( 'فهرست پانوشت', 'ofogh' ); ?>">
                <h2 class="eyebrow"><?php esc_html_e( 'دسترسی سریع', 'ofogh' ); ?></h2>
                <?php
                if ( has_nav_menu( 'footer' ) ) {
                    wp_nav_menu( array(
                        'theme_location' => 'footer',
                        'container'      => false,
                        'menu_class'     => '',
                        'fallback_cb'    => 'ofogh_default_footer_menu',
                    ) );
                } else {
                    ofogh_default_footer_menu();
                }
                ?>
            </nav>

            <!-- Services -->
            <div class="footer-col">
                <h2 class="eyebrow"><?php esc_html_e( 'خدمات', 'ofogh' ); ?></h2>
                <ul>
                    <?php
                    $services = ofogh_get_services();
                    for ( $i = 0; $i < min( 5, count( $services ) ); $i++ ) :
                    ?>
                        <li><a href="<?php echo esc_url( home_url( '/services/' ) ); ?>"><?php echo esc_html( $services[ $i ]['title'] ); ?></a></li>
                    <?php endfor; ?>
                </ul>
            </div>

            <!-- Contact + Newsletter -->
            <div class="footer-col">
                <h2 class="eyebrow"><?php esc_html_e( 'تماس با ما', 'ofogh' ); ?></h2>
                <ul class="footer-contact-list">
                    <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        <a href="<?php echo esc_attr( ofogh_tel_href( ofogh_get_phone() ) ); ?>" dir="ltr"><?php echo esc_html( ofogh_get_phone() ); ?></a>
                    </li>
                    <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        <a href="mailto:<?php echo esc_attr( ofogh_get_email() ); ?>" dir="ltr"><?php echo esc_html( ofogh_get_email() ); ?></a>
                    </li>
                    <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        <span>
                            <?php
                            $address = ofogh_get_address();
                            echo esc_html( $address['line1'] ) . '<br>' . esc_html( $address['line2'] );
                            ?>
                        </span>
                    </li>
                </ul>

                <!-- Newsletter -->
                <form class="newsletter-form" data-ofogh-newsletter>
                    <span class="newsletter-label eyebrow"><?php esc_html_e( 'لیستینگ‌های خصوصی', 'ofogh' ); ?></span>
                    <div class="newsletter-input-row">
                        <input type="email" class="newsletter-input" placeholder="<?php esc_attr_e( 'ایمیل شما', 'ofogh' ); ?>" aria-label="<?php esc_attr_e( 'ایمیل خبرنامه', 'ofogh' ); ?>" required>
                        <button type="submit" class="newsletter-submit" aria-label="<?php esc_attr_e( 'عضویت در خبرنامه', 'ofogh' ); ?>">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                        </button>
                    </div>
                    <p class="newsletter-msg" aria-live="polite"><?php esc_html_e( 'خانه‌های خارج از فهرست، ماهانه برای شما.', 'ofogh' ); ?></p>
                </form>
            </div>
        </div>

        <div class="footer-bottom">
            <p>© <?php echo esc_html( ofogh_copyright_year() ); ?> <?php echo esc_html( ofogh_get_company_name() ); ?>. <?php esc_html_e( 'تمامی حقوق محفوظ است.', 'ofogh' ); ?></p>
            <p class="footer-bottom__meta">
                <span><?php echo esc_html( ofogh_get_hours() ); ?></span>
                <a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>"><?php esc_html_e( 'حریم خصوصی و شرایط', 'ofogh' ); ?></a>
            </p>
        </div>
    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
