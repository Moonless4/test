<?php
/**
 * Property archive template (properties listing page).
 *
 * @package Ofogh
 */

get_header();

$label = __( 'پرتفوی', 'ofogh' );
$title = __( 'املاک', 'ofogh' );
$desc  = __( 'مجموعهٔ کنونی ما از ویلاها، عمارت‌ها و اقامتگاه‌ها را مرور کنید — بر پایهٔ موقعیت، نوع، قیمت و متراژ جست‌وجو را دقیق‌تر کنید.', 'ofogh' );

get_template_part( 'template-parts/page', 'hero', array(
    'label'       => $label,
    'title'       => $title,
    'description' => $desc,
) );
?>

<section class="section section--white" style="padding-block: 56px 80px;">
    <div class="of-container">
        <div class="properties-layout">
            <!-- Filters -->
            <div>
                <button type="button" id="filters-toggle" class="filters-toggle">
                    <span style="display:flex; align-items:center; gap:10px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="4" x2="14" y2="4"/><line x1="10" y1="4" x2="3" y2="4"/><line x1="21" y1="12" x2="12" y2="12"/><line x1="8" y1="12" x2="3" y2="12"/><line x1="21" y1="20" x2="16" y2="20"/><line x1="12" y1="20" x2="3" y2="20"/><line x1="14" y1="2" x2="14" y2="6"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="16" y1="18" x2="16" y2="22"/></svg>
                        <?php esc_html_e( 'فیلترها', 'ofogh' ); ?>
                    </span>
                    <span style="font-size:12px; color:var(--muted);"><?php esc_html_e( 'نمایش', 'ofogh' ); ?></span>
                </button>

                <div id="filters-panel" class="filters-panel">
                    <form id="ofogh-filter-form" class="filter-box">
                        <div class="filter-box__head">
                            <h2 class="filter-box__title">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="4" x2="14" y2="4"/><line x1="10" y1="4" x2="3" y2="4"/><line x1="21" y1="12" x2="12" y2="12"/><line x1="8" y1="12" x2="3" y2="12"/><line x1="21" y1="20" x2="16" y2="20"/><line x1="12" y1="20" x2="3" y2="20"/><line x1="14" y1="2" x2="14" y2="6"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="16" y1="18" x2="16" y2="22"/></svg>
                                <?php esc_html_e( 'جست‌وجوی دقیق‌تر', 'ofogh' ); ?>
                            </h2>
                            <button type="button" id="filter-reset" class="filter-box__reset">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                <?php esc_html_e( 'پاک کردن', 'ofogh' ); ?>
                            </button>
                        </div>

                        <div class="filter-group">
                            <label class="filter-label"><?php esc_html_e( 'جست‌وجو', 'ofogh' ); ?></label>
                            <div class="filter-search-wrap">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                <input type="text" name="search" class="filter-control" placeholder="<?php esc_attr_e( 'نام، شهر یا کلیدواژه', 'ofogh' ); ?>">
                            </div>
                        </div>

                        <div class="filter-group">
                            <label class="filter-label"><?php esc_html_e( 'موقعیت', 'ofogh' ); ?></label>
                            <select name="location" class="filter-control">
                                <option value="all"><?php esc_html_e( 'همهٔ موقعیت‌ها', 'ofogh' ); ?></option>
                                <?php
                                $all_props = get_posts( array( 'post_type' => 'property', 'posts_per_page' => -1 ) );
                                $locations = array();
                                foreach ( $all_props as $p ) {
                                    $loc = ofogh_get_property_meta( $p->ID, '_property_city', '' ) . '، ' . ofogh_get_property_meta( $p->ID, '_property_region', '' );
                                    if ( $loc !== '، ' ) $locations[ $loc ] = true;
                                }
                                ksort( $locations );
                                foreach ( array_keys( $locations ) as $loc ) :
                                ?>
                                    <option value="<?php echo esc_attr( strtolower( $loc ) ); ?>"><?php echo esc_html( $loc ); ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <div class="filter-group">
                            <label class="filter-label"><?php esc_html_e( 'نوع ملک', 'ofogh' ); ?></label>
                            <select name="type" class="filter-control">
                                <option value="all"><?php esc_html_e( 'همهٔ انواع', 'ofogh' ); ?></option>
                                <?php
                                $types = array( 'ویلا', 'عمارت', 'خانه', 'پنت‌هاوس', 'اقامتگاه', 'ویلای ساحلی' );
                                foreach ( $types as $t ) :
                                ?>
                                    <option value="<?php echo esc_attr( $t ); ?>"><?php echo esc_html( $t ); ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <div class="filter-group">
                            <label class="filter-label"><?php esc_html_e( 'بازهٔ قیمت', 'ofogh' ); ?></label>
                            <select name="price" class="filter-control">
                                <option value="all"><?php esc_html_e( 'هر قیمتی', 'ofogh' ); ?></option>
                                <option value="0-60000000000"><?php esc_html_e( 'زیر ۶۰ میلیارد تومان', 'ofogh' ); ?></option>
                                <option value="60000000000-120000000000"><?php esc_html_e( '۶۰ تا ۱۲۰ میلیارد تومان', 'ofogh' ); ?></option>
                                <option value="120000000000-200000000000"><?php esc_html_e( '۱۲۰ تا ۲۰۰ میلیارد تومان', 'ofogh' ); ?></option>
                                <option value="200000000000-999999999999"><?php esc_html_e( 'بیش از ۲۰۰ میلیارد تومان', 'ofogh' ); ?></option>
                            </select>
                        </div>

                        <div class="filter-row">
                            <div class="filter-group">
                                <label class="filter-label">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display:inline; vertical-align:middle; color:var(--gold);"><path d="M2 4v16M22 12H2M22 20v-7a3 3 0 0 0-3-3H2"/></svg>
                                    <?php esc_html_e( 'اتاق خواب', 'ofogh' ); ?>
                                </label>
                                <select name="beds" class="filter-control">
                                    <option value="all"><?php esc_html_e( 'همه', 'ofogh' ); ?></option>
                                    <option value="3"><?php esc_html_e( '۳ خواب و بیشتر', 'ofogh' ); ?></option>
                                    <option value="4"><?php esc_html_e( '۴ خواب و بیشتر', 'ofogh' ); ?></option>
                                    <option value="5"><?php esc_html_e( '۵ خواب و بیشتر', 'ofogh' ); ?></option>
                                    <option value="6"><?php esc_html_e( '۶ خواب و بیشتر', 'ofogh' ); ?></option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label class="filter-label">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display:inline; vertical-align:middle; color:var(--gold);"><path d="M4 12V5a2 2 0 0 1 2-2h0M9 12V5M4 12h7M7 12v7a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V8a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v8"/></svg>
                                    <?php esc_html_e( 'سرویس', 'ofogh' ); ?>
                                </label>
                                <select name="baths" class="filter-control">
                                    <option value="all"><?php esc_html_e( 'همه', 'ofogh' ); ?></option>
                                    <option value="3"><?php esc_html_e( '۳ سرویس و بیشتر', 'ofogh' ); ?></option>
                                    <option value="4"><?php esc_html_e( '۴ سرویس و بیشتر', 'ofogh' ); ?></option>
                                    <option value="5"><?php esc_html_e( '۵ سرویس و بیشتر', 'ofogh' ); ?></option>
                                    <option value="6"><?php esc_html_e( '۶ سرویس و بیشتر', 'ofogh' ); ?></option>
                                </select>
                            </div>
                        </div>

                        <div class="filter-divider">
                            <label class="filter-label"><?php esc_html_e( 'مرتب‌سازی', 'ofogh' ); ?></label>
                            <select name="sort" class="filter-control">
                                <option value="featured"><?php esc_html_e( 'پیشنهادهای ویژه در ابتدا', 'ofogh' ); ?></option>
                                <option value="price-asc"><?php esc_html_e( 'ارزان‌ترین به گران‌ترین', 'ofogh' ); ?></option>
                                <option value="price-desc"><?php esc_html_e( 'گران‌ترین به ارزان‌ترین', 'ofogh' ); ?></option>
                                <option value="size-desc"><?php esc_html_e( 'بزرگ‌ترین متراژ', 'ofogh' ); ?></option>
                                <option value="newest"><?php esc_html_e( 'جدیدترین سال ساخت', 'ofogh' ); ?></option>
                            </select>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Results -->
            <div>
                <div class="properties-toolbar">
                    <div class="filter-chips">
                        <span class="filter-chip filter-chip--active" data-featured-toggle="0"><?php esc_html_e( 'همهٔ خانه‌ها', 'ofogh' ); ?></span>
                        <span class="filter-chip filter-chip--inactive" data-featured-toggle="1"><?php esc_html_e( 'فقط ویژه', 'ofogh' ); ?></span>
                    </div>
                    <p class="properties-count"><?php echo esc_html( ofogh_to_persian_digits( $wp_query->found_posts ) ); ?> <?php esc_html_e( 'ملک در دسترس', 'ofogh' ); ?></p>
                </div>

                <?php if ( have_posts() ) : ?>
                    <div class="properties-grid">
                        <?php while ( have_posts() ) : the_post(); ?>
                            <?php
                            $post_id = get_the_ID();
                            $price   = ofogh_get_property_meta( $post_id, '_property_price', '0' );
                            $beds    = ofogh_get_property_meta( $post_id, '_property_beds', '0' );
                            $baths   = ofogh_get_property_meta( $post_id, '_property_baths', '0' );
                            $area    = ofogh_get_property_meta( $post_id, '_property_area', '0' );
                            $year    = ofogh_get_property_meta( $post_id, '_property_year', '0' );
                            $type    = ofogh_get_property_meta( $post_id, '_property_type', 'ویلا' );
                            $city    = ofogh_get_property_meta( $post_id, '_property_city', '' );
                            $region  = ofogh_get_property_meta( $post_id, '_property_region', '' );
                            $featured = ofogh_get_property_meta( $post_id, '_property_featured', '0' );
                            $summary = get_the_excerpt();
                            $location_str = $city . '، ' . $region;
                            ?>
                            <div class="property-card-item of-reveal"
                                 data-name="<?php echo esc_attr( get_the_title() ); ?>"
                                 data-city="<?php echo esc_attr( $city ); ?>"
                                 data-region="<?php echo esc_attr( $region ); ?>"
                                 data-location="<?php echo esc_attr( strtolower( $location_str ) ); ?>"
                                 data-type="<?php echo esc_attr( $type ); ?>"
                                 data-price="<?php echo esc_attr( $price ); ?>"
                                 data-beds="<?php echo esc_attr( $beds ); ?>"
                                 data-baths="<?php echo esc_attr( $baths ); ?>"
                                 data-area="<?php echo esc_attr( $area ); ?>"
                                 data-year="<?php echo esc_attr( $year ); ?>"
                                 data-featured="<?php echo esc_attr( $featured ); ?>"
                                 data-summary="<?php echo esc_attr( $summary ); ?>">
                                <?php get_template_part( 'template-parts/property', 'card' ); ?>
                            </div>
                        <?php endwhile; ?>
                    </div>
                <?php else : ?>
                    <div class="no-results">
                        <h2 class="no-results__title"><?php esc_html_e( 'هیچ ملکی با این فیلترها همخوانی ندارد', 'ofogh' ); ?></h2>
                        <p class="no-results__desc"><?php esc_html_e( 'بازهٔ قیمت را گسترده‌تر کنید یا فیلتری را بردارید — یا بگذارید یکی از مشاوران ما به‌جای شما در فهرست‌های خارج از نمایش عمومی جست‌وجو کند.', 'ofogh' ); ?></p>
                        <div class="no-results__actions">
                            <button type="button" id="filter-reset-btn" class="of-btn of-btn--primary of-btn--md"><?php esc_html_e( 'پاک کردن فیلترها', 'ofogh' ); ?></button>
                            <a href="<?php echo esc_url( home_url( '/contact/' ) ); ?>" class="of-btn of-btn--outline-dark of-btn--md"><?php esc_html_e( 'گفت‌وگو با مشاور', 'ofogh' ); ?></a>
                        </div>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</section>

<?php get_footer(); ?>
