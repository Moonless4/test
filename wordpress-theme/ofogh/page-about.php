<?php
/**
 * Template Name: صفحهٔ درباره ما
 * Template Post Type: page
 *
 * @package Ofogh
 */

get_header();

$image_id = 'photo-1600566753190-17f0baa2a6c3';

get_template_part( 'template-parts/page', 'hero', array(
    'image_id'    => $image_id,
    'label'       => __( 'درباره ما', 'ofogh' ),
    'title'       => __( 'آژانسی بوتیک برای خانه‌های شاخص معماری', 'ofogh' ),
    'description' => __( 'املاک افق هر سال به شماری محدود از مشتریان، در خرید، فروش و نگهداری املاک مسکونی استثنایی مشاوره می‌دهد.', 'ofogh' ),
) );
?>

<section class="section section--white">
    <div class="of-container">
        <div class="about-grid">
            <div class="of-reveal">
                <p class="eyebrow"><?php esc_html_e( 'ما کی هستیم', 'ofogh' ); ?></p>
                <h2 style="margin-top:20px; font-size:clamp(1.6rem,3.2vw,2.4rem); font-weight:700; line-height:1.45;">
                    <?php esc_html_e( 'پیوندی آرام میان مردم و خانه‌های استثنایی', 'ofogh' ); ?>
                </h2>
                <div style="margin-top:28px; display:flex; flex-direction:column; gap:20px; font-size:15px; line-height:1.95; color:var(--muted);">
                    <p><?php esc_html_e( 'املاک افق بر یک باور ساده بنا شد: بهترین خانه‌ها فروخته نمی‌شوند، واگذار می‌شوند. کار ما این است که یک بنا، خیابانی که در آن نشسته و زندگی‌ای که برایش خریداری می‌شود را بشناسیم — و سپس خریداری را بیابیم که بیشترین ارزش را برای آن قائل است.', 'ofogh' ); ?></p>
                    <p><?php esc_html_e( 'آگاهانه پرتفویی کوچک را نمایندگی می‌کنیم. هر سفارش را مشاوری ارشد پیش می‌برد که بازار، املاک قابل مقایسه و پیشینهٔ مذاکره را می‌شناسد؛ نه اینکه کار را در زنجیره‌ای به پایین بسپارد.', 'ofogh' ); ?></p>
                    <p><?php esc_html_e( 'برای خریداران نیز همان نظم، در جهت معکوس کار می‌کند: مشاوره‌ای صبورانه و آگاهانه دربارهٔ اینکه ارزش کجاست، نگهداری یک ملک چه هزینه‌ای دارد و کجا باید از معامله گذشت.', 'ofogh' ); ?></p>
                </div>

                <!-- If there's WordPress editor content, show it here too -->
                <?php if ( get_the_content() ) : ?>
                <div class="wp-editor-content" style="margin-top:28px;">
                    <?php while ( have_posts() ) : the_post(); the_content(); endwhile; ?>
                </div>
                <?php endif; ?>

                <dl class="stats-grid stats-grid--lg" style="margin-top:48px;">
                    <?php foreach ( ofogh_get_stats() as $stat ) : ?>
                        <div>
                            <dd class="stat__value"><?php echo esc_html( $stat['value'] ); ?></dd>
                            <dt class="stat__label"><?php echo esc_html( $stat['label'] ); ?></dt>
                        </div>
                    <?php endforeach; ?>
                </dl>
            </div>

            <div class="of-reveal" style="transition-delay:120ms;">
                <div style="display:grid; gap:16px;">
                    <div class="about-photos__main" style="grid-column:auto; margin-top:0;">
                        <img src="<?php echo esc_url( ofogh_photo( 'photo-1600566753190-17f0baa2a6c3', 1200 ) ); ?>"
                             srcset="<?php echo esc_attr( ofogh_photo_srcset( 'photo-1600566753190-17f0baa2a6c3', array( 640, 960, 1280 ) ) ); ?>"
                             sizes="(min-width: 1024px) 42vw, 90vw"
                             alt="<?php esc_attr_e( 'اقامتگاهی مدرن با نمای چوبی و باغی محوطه‌سازی‌شده', 'ofogh' ); ?>"
                             loading="lazy" decoding="async" style="aspect-ratio:16/11;">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                        <div class="about-photos__sec" style="margin-top:0; grid-column:auto;">
                            <img src="<?php echo esc_url( ofogh_photo( 'photo-1600585154526-990dced4db0d', 800 ) ); ?>"
                                 srcset="<?php echo esc_attr( ofogh_photo_srcset( 'photo-1600585154526-990dced4db0d', array( 420, 640, 900 ) ) ); ?>"
                                 sizes="(min-width: 1024px) 20vw, 45vw"
                                 alt="<?php esc_attr_e( 'نمای تیره و پانل‌دار که در غروب از درون روشن است', 'ofogh' ); ?>"
                                 loading="lazy" decoding="async" style="aspect-ratio:4/3;">
                        </div>
                        <div class="about-photos__sec" style="margin-top:0; grid-column:auto;">
                            <img src="<?php echo esc_url( ofogh_photo( 'photo-1600585154340-be6161a56a0c', 800 ) ); ?>"
                                 srcset="<?php echo esc_attr( ofogh_photo_srcset( 'photo-1600585154340-be6161a56a0c', array( 420, 640, 900 ) ) ); ?>"
                                 sizes="(min-width: 1024px) 20vw, 45vw"
                                 alt="<?php esc_attr_e( 'خانه‌ای مدرن در ساعت آبی با شیشه‌های تمام‌قد', 'ofogh' ); ?>"
                                 loading="lazy" decoding="async" style="aspect-ratio:4/3;">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<?php get_template_part( 'template-parts/section', 'why-choose' ); ?>
<?php get_template_part( 'template-parts/section', 'team' ); ?>
<?php get_template_part( 'template-parts/section', 'cta', array( 'bg' => 'section--white' ) ); ?>

<?php get_footer(); ?>
