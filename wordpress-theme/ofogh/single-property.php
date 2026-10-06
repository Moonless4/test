<?php
/**
 * Single property template.
 *
 * @package Ofogh
 */

get_header();

while ( have_posts() ) : the_post();
    $post_id = get_the_ID();
    $price   = ofogh_get_property_meta( $post_id, '_property_price', '0' );
    $beds    = ofogh_get_property_meta( $post_id, '_property_beds', '0' );
    $baths   = ofogh_get_property_meta( $post_id, '_property_baths', '0' );
    $area    = ofogh_get_property_meta( $post_id, '_property_area', '0' );
    $land    = ofogh_get_property_meta( $post_id, '_property_land', '0' );
    $year    = ofogh_get_property_meta( $post_id, '_property_year', '0' );
    $city    = ofogh_get_property_meta( $post_id, '_property_city', '' );
    $region  = ofogh_get_property_meta( $post_id, '_property_region', '' );
    $country = ofogh_get_property_meta( $post_id, '_property_country', 'ایران' );
    $type    = ofogh_get_property_meta( $post_id, '_property_type', 'ویلا' );
    $status  = ofogh_get_property_meta( $post_id, '_property_status', 'برای فروش' );
    $features_raw  = ofogh_get_property_meta( $post_id, '_property_features', '' );
    $amenities_raw = ofogh_get_property_meta( $post_id, '_property_amenities', '' );
    $features  = array_filter( array_map( 'trim', explode( "\n", $features_raw ) ) );
    $amenities = array_filter( array_map( 'trim', explode( ',', $amenities_raw ) ) );
    $gallery = ofogh_get_property_gallery( $post_id );
    $agent   = ofogh_get_property_agent( $post_id );
    $is_favorite = ofogh_is_favorite( $post_id );

    $facts = array(
        array( 'label' => __( 'اتاق خواب', 'ofogh' ), 'value' => ofogh_format_number( $beds ),
               'icon' => '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16M22 12H2M22 20v-7a3 3 0 0 0-3-3H2"/></svg>' ),
        array( 'label' => __( 'سرویس بهداشتی', 'ofogh' ), 'value' => ofogh_format_number( $baths ),
               'icon' => '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12V5a2 2 0 0 1 2-2h0M9 12V5M4 12h7M7 12v7a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V8a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v8"/></svg>' ),
        array( 'label' => __( 'متراژ', 'ofogh' ), 'value' => ofogh_format_number( $area ) . ' ' . __( 'متر مربع', 'ofogh' ),
               'icon' => '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3H3v18h18V3z"/><path d="M9 3v18M3 9h18"/></svg>' ),
        array( 'label' => __( 'سال ساخت', 'ofogh' ), 'value' => ofogh_format_number( $year ),
               'icon' => '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' ),
    );
    if ( $land > 0 ) {
        $facts[] = array(
            'label' => __( 'زمین', 'ofogh' ),
            'value' => ofogh_format_number( $land ) . ' ' . __( 'متر مربع', 'ofogh' ),
            'icon'  => '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M12 6l-4-4M12 6l4-4M12 18l-4 4M12 18l4 4M2 12h20M6 12l-4 4M6 12L2 8M18 12l4 4M18 12l4-4"/></svg>',
        );
    }
    $facts[] = array(
        'label' => __( 'نوع ملک', 'ofogh' ),
        'value' => $type,
        'icon'  => '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    );
    ?>

    <section class="property-detail">
        <div class="of-container">
            <!-- Breadcrumb -->
            <nav class="breadcrumb" aria-label="<?php esc_attr_e( 'مسیر صفحه', 'ofogh' ); ?>">
                <a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'خانه', 'ofogh' ); ?></a>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                <a href="<?php echo esc_url( get_post_type_archive_link( 'property' ) ?: home_url( '/properties/' ) ); ?>"><?php esc_html_e( 'املاک', 'ofogh' ); ?></a>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                <span style="color:var(--ink);"><?php the_title(); ?></span>
            </nav>

            <!-- Header -->
            <div class="property-detail__head">
                <div>
                    <div class="property-detail__badges">
                        <span class="property-detail__status"><?php echo esc_html( $status ); ?></span>
                        <span class="property-detail__type"><?php echo esc_html( $type ); ?></span>
                    </div>
                    <h1 class="property-detail__title"><?php the_title(); ?></h1>
                    <p class="property-detail__location">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        <?php echo esc_html( $city . '، ' . $region . '، ' . $country ); ?>
                    </p>
                </div>
                <div class="property-detail__head-actions">
                    <p class="property-detail__price-main"><?php echo esc_html( ofogh_format_price( $price ) ); ?></p>
                    <button type="button" class="fav-btn fav-btn--plain <?php echo $is_favorite ? 'is-saved' : ''; ?>"
                            aria-pressed="<?php echo $is_favorite ? 'true' : 'false'; ?>"
                            aria-label="<?php echo esc_attr( sprintf( __( 'ذخیرهٔ %s', 'ofogh' ), get_the_title() ) ); ?>"
                            data-property-id="<?php echo esc_attr( $post_id ); ?>"
                            style="height:44px; width:44px;">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="<?php echo $is_favorite ? 'currentColor' : 'none'; ?>" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </button>
                </div>
            </div>

            <!-- Body grid -->
            <div class="property-detail__grid">
                <div>
                    <!-- Gallery -->
                    <div data-gallery>
                        <div class="gallery-main">
                            <button type="button" class="gallery-main__btn" data-lightbox-trigger aria-label="<?php esc_attr_e( 'باز کردن تصویر در حالت تمام‌صفحه', 'ofogh' ); ?>">
                                <?php foreach ( $gallery as $i => $img ) : ?>
                                    <img src="<?php echo esc_url( $img['url'] ); ?>"
                                         data-gallery-img data-full="<?php echo esc_url( $img['url'] ); ?>"
                                         alt="<?php echo esc_attr( $img['alt'] ); ?>"
                                         class="gallery-main__img"
                                         style="<?php echo $i === 0 ? '' : 'display:none;'; ?>"
                                         decoding="async">
                                <?php endforeach; ?>
                                <span class="gallery-expand">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                                    <?php esc_html_e( 'نمای تمام‌صفحه', 'ofogh' ); ?>
                                </span>
                            </button>
                        </div>

                        <div class="gallery-thumbs no-scrollbar">
                            <?php foreach ( $gallery as $i => $img ) : ?>
                                <button type="button" class="gallery-thumb <?php echo $i === 0 ? 'gallery-thumb--active' : ''; ?>" aria-label="<?php echo esc_attr( sprintf( __( 'نمایش تصویر %s از %s', 'ofogh' ), ofogh_to_persian_digits( $i + 1 ), ofogh_to_persian_digits( count( $gallery ) ) ) ); ?>">
                                    <img src="<?php echo esc_url( ofogh_photo( ofogh_get_property_meta( $post_id, '_property_image_id', 'photo-1600596542815-ffad4c1539a9' ), 320 ) ); ?>" alt="" loading="lazy" decoding="async">
                                </button>
                            <?php endforeach; ?>
                        </div>

                        <!-- Lightbox -->
                        <div class="lightbox" style="display:none;">
                            <div class="lightbox__bar">
                                <span class="lightbox__count" dir="ltr">۱ / <?php echo esc_html( ofogh_to_persian_digits( count( $gallery ) ) ); ?></span>
                                <button type="button" class="lightbox__close" data-lightbox-close aria-label="<?php esc_attr_e( 'بستن نمایشگر تصویر', 'ofogh' ); ?>">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                            </div>
                            <div class="lightbox__stage">
                                <img class="lightbox__img" src="" alt="" decoding="async">
                            </div>
                            <div class="lightbox__nav">
                                <button type="button" data-lightbox-prev aria-label="<?php esc_attr_e( 'تصویر قبلی', 'ofogh' ); ?>">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                                </button>
                                <button type="button" data-lightbox-next aria-label="<?php esc_attr_e( 'تصویر بعدی', 'ofogh' ); ?>">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Description -->
                    <div class="property-desc">
                        <h2 class="eyebrow"><?php esc_html_e( 'دربارهٔ این خانه', 'ofogh' ); ?></h2>
                        <div class="property-desc__body">
                            <?php the_content(); ?>
                        </div>
                    </div>

                    <!-- Features -->
                    <?php if ( ! empty( $features ) ) : ?>
                    <div class="property-features">
                        <h2 class="eyebrow"><?php esc_html_e( 'ویژگی‌های کلیدی', 'ofogh' ); ?></h2>
                        <ul class="property-features__list">
                            <?php foreach ( $features as $feature ) : ?>
                                <li>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    <?php echo esc_html( $feature ); ?>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                    <?php endif; ?>

                    <!-- Amenities -->
                    <?php if ( ! empty( $amenities ) ) : ?>
                    <div class="property-amenities">
                        <h2 class="eyebrow"><?php esc_html_e( 'امکانات', 'ofogh' ); ?></h2>
                        <ul class="property-amenities__list">
                            <?php foreach ( $amenities as $amenity ) : ?>
                                <li><?php echo esc_html( trim( $amenity ) ); ?></li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                    <?php endif; ?>
                </div>

                <!-- Sidebar -->
                <aside class="property-sidebar">
                    <div class="property-sidebar__card">
                        <p class="property-sidebar__price-label eyebrow"><?php esc_html_e( 'قیمت درخواستی', 'ofogh' ); ?></p>
                        <p class="property-sidebar__price"><?php echo esc_html( ofogh_format_price( $price ) ); ?></p>

                        <dl class="property-sidebar__facts">
                            <?php foreach ( $facts as $fact ) : ?>
                                <div>
                                    <dt class="property-sidebar__fact-label"><?php echo $fact['icon']; // phpcs:ignore ?><?php echo esc_html( $fact['label'] ); ?></dt>
                                    <dd class="property-sidebar__fact-value"><?php echo esc_html( $fact['value'] ); ?></dd>
                                </div>
                            <?php endforeach; ?>
                        </dl>

                        <div class="property-sidebar__actions">
                            <button type="button" class="of-btn of-btn--primary of-btn--lg" data-modal-trigger="contact-modal" data-contact-kind="viewing">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 16l2 2 4-4"/></svg>
                                <?php esc_html_e( 'تعیین وقت بازدید', 'ofogh' ); ?>
                            </button>
                            <button type="button" class="of-btn of-btn--outline-dark of-btn--lg" data-modal-trigger="contact-modal" data-contact-kind="agent">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                <?php esc_html_e( 'تماس با مشاور', 'ofogh' ); ?>
                            </button>
                        </div>

                        <?php if ( $agent ) : ?>
                        <div class="property-sidebar__agent">
                            <div class="property-sidebar__agent-head">
                                <img src="<?php echo esc_url( ofogh_photo( $agent['photo'], 200 ) ); ?>" alt="<?php echo esc_attr( $agent['name'] ); ?>" loading="lazy" decoding="async">
                                <div>
                                    <p class="property-sidebar__agent-name"><?php echo esc_html( $agent['name'] ); ?></p>
                                    <p class="property-sidebar__agent-role"><?php echo esc_html( $agent['role'] ); ?></p>
                                </div>
                            </div>
                            <div class="property-sidebar__agent-contact">
                                <a href="<?php echo esc_attr( ofogh_tel_href( $agent['phone'] ) ); ?>" dir="ltr">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                    <?php echo esc_html( $agent['phone'] ); ?>
                                </a>
                                <a href="mailto:<?php echo esc_attr( $agent['email'] ); ?>" dir="ltr">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                                    <?php echo esc_html( $agent['email'] ); ?>
                                </a>
                            </div>
                        </div>
                        <?php endif; ?>

                        <p class="property-sidebar__note"><?php esc_html_e( 'بازدیدهای خصوصی ظرف ۲۴ ساعت هماهنگ می‌شوند. جزئیات را برای ما بفرستید تا بروشور کامل و نقشه‌های طبقات را ارسال کنیم.', 'ofogh' ); ?></p>
                    </div>
                </aside>
            </div>
        </div>
    </section>

    <!-- Similar properties -->
    <?php get_template_part( 'template-parts/similar', 'properties' ); ?>

    <!-- CTA -->
    <?php get_template_part( 'template-parts/section', 'cta', array( 'bg' => 'section--white' ) ); ?>

    <!-- Mobile sticky actions -->
    <div class="mobile-sticky-spacer" aria-hidden="true"></div>
    <div class="mobile-sticky-actions">
        <button type="button" class="of-btn of-btn--primary of-btn--md" data-modal-trigger="contact-modal" data-contact-kind="viewing">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <?php esc_html_e( 'تعیین بازدید', 'ofogh' ); ?>
        </button>
        <button type="button" class="of-btn of-btn--outline-dark of-btn--md" data-modal-trigger="contact-modal" data-contact-kind="agent">
            <?php esc_html_e( 'تماس با مشاور', 'ofogh' ); ?>
        </button>
    </div>

    <!-- Contact modal -->
    <div id="contact-modal" class="modal-overlay" style="display:none;">
        <div class="modal-panel modal-panel--lg" style="position:relative;" role="dialog" aria-modal="true" tabindex="-1">
            <button type="button" class="modal__close" data-modal-close aria-label="<?php esc_attr_e( 'بستن', 'ofogh' ); ?>">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div class="contact-success" style="display:none;">
                <span class="contact-success-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <h2 class="contact-success-title"><?php esc_html_e( 'سپاسگزاریم — درخواست شما ثبت شد', 'ofogh' ); ?></h2>
                <p class="contact-success-desc"><?php esc_html_e( 'یکی از اعضای تیم ما با شما تماس می‌گیرد تا ظرف یک روز کاری مرحلهٔ بعد را هماهنگ کند.', 'ofogh' ); ?></p>
            </div>
            <div class="contact-form-fields">
                <h2 class="modal__title"><?php esc_html_e( 'تماس با مشاور', 'ofogh' ); ?></h2>
                <p class="modal__desc"><?php echo esc_html( get_the_title() . ' · ' . $city . '، ' . $region ); ?></p>
                <form data-ofogh-contact class="contact-form" style="margin-top:24px;">
                    <input type="hidden" name="kind" value="contact">
                    <div class="contact-row">
                        <div>
                            <label class="contact-label"><?php esc_html_e( 'نام و نام خانوادگی', 'ofogh' ); ?></label>
                            <input type="text" name="name" class="field-input" placeholder="<?php esc_attr_e( 'نگار تهرانی', 'ofogh' ); ?>">
                        </div>
                        <div>
                            <label class="contact-label"><?php esc_html_e( 'ایمیل', 'ofogh' ); ?></label>
                            <input type="email" name="email" class="field-input" placeholder="name@example.com" dir="ltr">
                        </div>
                    </div>
                    <div>
                        <label class="contact-label"><?php esc_html_e( 'شمارهٔ تماس', 'ofogh' ); ?> <span style="color:rgba(91,102,114,0.6);">(<?php esc_html_e( 'اختیاری', 'ofogh' ); ?>)</span></label>
                        <input type="tel" name="phone" class="field-input" placeholder="۰۹۱۲۳۴۵۶۷۸۹">
                    </div>
                    <div>
                        <label class="contact-label"><?php esc_html_e( 'پیام', 'ofogh' ); ?></label>
                        <textarea name="message" rows="4" class="field-input field-input--area" placeholder="<?php esc_attr_e( 'می‌خواهم دربارهٔ این ملک اطلاعات بیشتری بگیرم.', 'ofogh' ); ?>"></textarea>
                    </div>
                    <p class="contact-error" data-contact-error></p>
                    <button type="submit" class="of-btn of-btn--primary of-btn--lg" style="width:100%;">
                        <?php esc_html_e( 'ارسال پیام', 'ofogh' ); ?>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                    </button>
                </form>
            </div>
        </div>
    </div>

<?php endwhile; ?>

<?php get_footer(); ?>
