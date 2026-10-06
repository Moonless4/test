<?php
/**
 * Why choose section (dark band).
 *
 * @package Ofogh
 */
?>
<section class="section section--navy">
    <div class="of-container">
        <div class="why-grid">
            <div class="of-reveal why-sticky" style="position:relative;">
                <div class="section-heading section-heading--light" style="max-width:32rem;">
                    <p class="section-heading__label eyebrow"><?php esc_html_e( 'چرا افق', 'ofogh' ); ?></p>
                    <h2 class="section-heading__title"><?php esc_html_e( 'چرا افق را انتخاب کنید', 'ofogh' ); ?></h2>
                    <p class="section-heading__desc"><?php esc_html_e( 'بیست سال مشاوره به خریداران و فروشندگان خانه‌های شاخص، روشی از کار را شکل داده است: آرام، دقیق و کاملاً در خدمت مشتری.', 'ofogh' ); ?></p>
                </div>
            </div>

            <div>
                <div class="why-values">
                    <?php foreach ( ofogh_get_values() as $index => $value ) : ?>
                        <div class="of-reveal" style="transition-delay:<?php echo esc_attr( $index * 90 ); ?>ms;">
                            <div class="why-value">
                                <span class="why-value__num"><?php echo esc_html( ofogh_to_persian_digits( str_pad( $index + 1, 2, '0', STR_PAD_LEFT ) ) ); ?></span>
                                <h3 class="why-value__title"><?php echo esc_html( $value['title'] ); ?></h3>
                                <p class="why-value__desc"><?php echo esc_html( $value['description'] ); ?></p>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>

                <div class="of-reveal" style="transition-delay:140ms;">
                    <dl class="stats-grid stats-grid--dark" style="margin-top:56px;">
                        <?php foreach ( ofogh_get_stats() as $stat ) : ?>
                            <div>
                                <dd class="stat__value"><?php echo esc_html( $stat['value'] ); ?></dd>
                                <dt class="stat__label"><?php echo esc_html( $stat['label'] ); ?></dt>
                            </div>
                        <?php endforeach; ?>
                    </dl>
                </div>
            </div>
        </div>
    </div>
</section>
