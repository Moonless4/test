<?php
/**
 * Template Name: صفحهٔ تماس
 * Template Post Type: page
 *
 * @package Ofogh
 */

get_header();

get_template_part( 'template-parts/page', 'hero', array(
    'label'       => __( 'تماس', 'ofogh' ),
    'title'       => __( 'بیایید نشانی بعدی شما را پیدا کنیم', 'ofogh' ),
    'description' => __( 'بگویید دنبال چه هستید. هر پیام شخصیاً توسط یک مشاور ارشد و ظرف یک روز کاری پاسخ داده می‌شود.', 'ofogh' ),
) );
?>

<section class="section section--white" style="padding-block:80px 96px;">
    <div class="of-container">
        <div class="contact-grid">
            <!-- Form -->
            <div class="of-reveal">
                <div class="contact-form-card" id="contact-form-section">
                    <div class="contact-success" style="display:none;">
                        <span class="contact-success-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                        <h2 class="contact-success-title"><?php esc_html_e( 'سپاسگزاریم — پیام شما به دست ما رسید', 'ofogh' ); ?></h2>
                        <p class="contact-success-desc"><?php esc_html_e( 'یک مشاور ارشد ظرف یک روز کاری با شما تماس می‌گیرد. اگر موضوع فوری است، مستقیماً تماس بگیرید.', 'ofogh' ); ?></p>
                        <button type="button" class="of-btn of-btn--primary of-btn--lg" onclick="document.querySelector('.contact-success').style.display='none';document.querySelector('.contact-form-fields').style.display='block';" style="margin-top:32px;">
                            <?php esc_html_e( 'ارسال پیام دیگر', 'ofogh' ); ?>
                        </button>
                    </div>

                    <div class="contact-form-fields">
                        <h2 style="font-size:20px; font-weight:700; color:var(--ink); margin-bottom:24px;"><?php esc_html_e( 'فرم تماس', 'ofogh' ); ?></h2>
                        <form data-ofogh-contact class="contact-form">
                            <input type="hidden" name="kind" value="contact">
                            <div class="contact-row">
                                <div>
                                    <label class="contact-label"><?php esc_html_e( 'نام و نام خانوادگی', 'ofogh' ); ?></label>
                                    <input type="text" name="name" class="field-input" placeholder="<?php esc_attr_e( 'نگار تهرانی', 'ofogh' ); ?>" autocomplete="name">
                                </div>
                                <div>
                                    <label class="contact-label"><?php esc_html_e( 'ایمیل', 'ofogh' ); ?></label>
                                    <input type="email" name="email" class="field-input" placeholder="name@example.com" autocomplete="email" dir="ltr">
                                </div>
                            </div>
                            <div class="contact-row">
                                <div>
                                    <label class="contact-label"><?php esc_html_e( 'شمارهٔ تماس', 'ofogh' ); ?> <span style="color:var(--gold-dark);">*</span></label>
                                    <input type="tel" name="phone" class="field-input" placeholder="۰۹۱۲۳۴۵۶۷۸۹" inputmode="tel" autocomplete="tel" required>
                                </div>
                                <div>
                                    <label class="contact-label"><?php esc_html_e( 'علاقه‌مندم به', 'ofogh' ); ?></label>
                                    <select name="interest" class="field-input">
                                        <?php foreach ( ofogh_get_interests() as $interest ) : ?>
                                            <option value="<?php echo esc_attr( $interest ); ?>"><?php echo esc_html( $interest ); ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label class="contact-label"><?php esc_html_e( 'پیام', 'ofogh' ); ?></label>
                                <textarea name="message" rows="5" class="field-input field-input--area" placeholder="<?php esc_attr_e( 'دربارهٔ خانه‌ای که می‌خواهید، زمان‌بندی و بودجه‌تان بنویسید.', 'ofogh' ); ?>"></textarea>
                            </div>
                            <p class="contact-error" data-contact-error></p>
                            <button type="submit" class="of-btn of-btn--primary of-btn--lg" style="width:100%;">
                                <?php esc_html_e( 'ارسال پیام', 'ofogh' ); ?>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                            </button>
                            <p class="contact-notice"><?php esc_html_e( 'از اطلاعات شما تنها برای پاسخ به همین پیام استفاده می‌کنیم. بدون فهرست تبلیغاتی، بدون اشتراک‌گذاری.', 'ofogh' ); ?></p>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Info sidebar -->
            <div class="of-reveal" style="transition-delay:120ms;">
                <div class="contact-info">
                    <div class="contact-info__item">
                        <span class="contact-info__icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        </span>
                        <div>
                            <p class="contact-info__label"><?php esc_html_e( 'تلفن', 'ofogh' ); ?></p>
                            <p class="contact-info__value"><a href="<?php echo esc_attr( ofogh_tel_href( ofogh_get_phone() ) ); ?>" dir="ltr"><?php echo esc_html( ofogh_get_phone() ); ?></a></p>
                        </div>
                    </div>
                    <div class="contact-info__item">
                        <span class="contact-info__icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        </span>
                        <div>
                            <p class="contact-info__label"><?php esc_html_e( 'ایمیل', 'ofogh' ); ?></p>
                            <p class="contact-info__value"><a href="mailto:<?php echo esc_attr( ofogh_get_email() ); ?>" dir="ltr"><?php echo esc_html( ofogh_get_email() ); ?></a></p>
                        </div>
                    </div>
                    <div class="contact-info__item">
                        <span class="contact-info__icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        </span>
                        <div>
                            <p class="contact-info__label"><?php esc_html_e( 'نشانی', 'ofogh' ); ?></p>
                            <p class="contact-info__value">
                                <?php
                                $address = ofogh_get_address();
                                echo esc_html( $address['line1'] ) . '<br>' . esc_html( $address['line2'] );
                                ?>
                            </p>
                        </div>
                    </div>
                    <div class="contact-info__item">
                        <span class="contact-info__icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </span>
                        <div>
                            <p class="contact-info__label"><?php esc_html_e( 'ساعات کاری', 'ofogh' ); ?></p>
                            <p class="contact-info__value"><?php echo esc_html( ofogh_get_hours() ); ?></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<?php get_footer(); ?>
