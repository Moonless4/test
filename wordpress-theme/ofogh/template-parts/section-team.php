<?php
/**
 * Team section template part.
 *
 * @package Ofogh
 */
$agents = ofogh_get_team_data();
?>
<section class="section <?php echo is_front_page() ? 'section--ivory' : 'section--white'; ?>">
    <div class="of-container">
        <?php if ( is_front_page() ) : ?>
            <div style="display:flex; flex-direction:column; gap:32px;">
                <div class="of-reveal">
                    <div class="section-heading" style="max-width:36rem;">
                        <p class="section-heading__label eyebrow"><?php esc_html_e( 'تیم ما', 'ofogh' ); ?></p>
                        <h2 class="section-heading__title"><?php esc_html_e( 'افراد پشت املاک افق', 'ofogh' ); ?></h2>
                        <p class="section-heading__desc"><?php esc_html_e( 'مشاورانی که هر خیابان، هر معمار و هر پیشینهٔ معامله را در بازارهایی که پوشش می‌دهند می‌شناسند.', 'ofogh' ); ?></p>
                    </div>
                </div>
                <div class="of-reveal" style="transition-delay:100ms;">
                    <a href="<?php echo esc_url( home_url( '/team/' ) ); ?>" class="of-btn of-btn--outline-dark of-btn--md">
                        <?php esc_html_e( 'آشنایی با کل تیم', 'ofogh' ); ?>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                    </a>
                </div>
            </div>
        <?php else : ?>
            <div class="of-reveal">
                <div class="section-heading" style="max-width:36rem;">
                    <p class="section-heading__label eyebrow"><?php esc_html_e( 'رهبری', 'ofogh' ); ?></p>
                    <h2 class="section-heading__title"><?php esc_html_e( 'با تیم آشنا شوید', 'ofogh' ); ?></h2>
                    <p class="section-heading__desc"><?php esc_html_e( 'به هر مشاور مستقیماً دسترسی دارید — تماس‌ها را خودشان پاسخ می‌دهند، نه یک میز کار.', 'ofogh' ); ?></p>
                </div>
            </div>
        <?php endif; ?>

        <div class="team-grid" style="margin-top:56px;">
            <?php foreach ( $agents as $index => $agent ) : ?>
                <div class="of-reveal" style="transition-delay:<?php echo esc_attr( $index * 80 ); ?>ms;">
                    <article class="team-card group">
                        <div class="team-card__photo">
                            <img src="<?php echo esc_url( ofogh_photo( $agent['photo'], 640 ) ); ?>"
                                 srcset="<?php echo esc_attr( ofogh_photo_srcset( $agent['photo'], array( 320, 480, 640, 900 ) ) ); ?>"
                                 sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
                                 alt="<?php echo esc_attr( $agent['name'] . '، ' . $agent['role'] . ' در املاک افق' ); ?>"
                                 loading="lazy" decoding="async">
                            <div class="team-card__overlay">
                                <div class="team-card__actions">
                                    <a href="<?php echo esc_attr( ofogh_tel_href( $agent['phone'] ) ); ?>" class="team-card__action" aria-label="<?php echo esc_attr( sprintf( __( 'تماس با %s', 'ofogh' ), $agent['name'] ) ); ?>">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                    </a>
                                    <a href="mailto:<?php echo esc_attr( $agent['email'] ); ?>" class="team-card__action" aria-label="<?php echo esc_attr( sprintf( __( 'ارسال ایمیل به %s', 'ofogh' ), $agent['name'] ) ); ?>">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <h3 class="team-card__name"><?php echo esc_html( $agent['name'] ); ?></h3>
                        <p class="team-card__role <?php echo ! is_front_page() ? 'team-card__role--gold' : ''; ?>"><?php echo esc_html( $agent['role'] ); ?></p>
                        <?php if ( ! is_front_page() ) : ?>
                            <p class="team-card__specialty"><?php echo esc_html( $agent['specialty'] ); ?></p>
                            <div class="team-card__contact">
                                <a href="<?php echo esc_attr( ofogh_tel_href( $agent['phone'] ) ); ?>" dir="ltr">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                    <?php echo esc_html( $agent['phone'] ); ?>
                                </a>
                                <a href="mailto:<?php echo esc_attr( $agent['email'] ); ?>" dir="ltr" style="word-break:break-all;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                    <?php echo esc_html( $agent['email'] ); ?>
                                </a>
                            </div>
                        <?php endif; ?>
                    </article>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>
