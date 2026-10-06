<?php
/**
 * Similar properties template part.
 *
 * @package Ofogh
 */

global $post;
$current_id = get_the_ID();
$city  = ofogh_get_property_meta( $current_id, '_property_city', '' );
$region = ofogh_get_property_meta( $current_id, '_property_region', '' );
$type  = ofogh_get_property_meta( $current_id, '_property_type', 'ویلا' );
$price = (int) ofogh_get_property_meta( $current_id, '_property_price', '0' );

$similar_query = new WP_Query( array(
    'post_type'      => 'property',
    'posts_per_page' => 3,
    'post__not_in'   => array( $current_id ),
    'tax_query'      => array(
        array(
            'taxonomy' => 'property_type',
            'field'    => 'slug',
            'terms'    => sanitize_title( $type ),
        ),
    ),
) );

// Fallback: if no same-type properties, get by city, then latest.
if ( ! $similar_query->have_posts() ) {
    $similar_query = new WP_Query( array(
        'post_type'      => 'property',
        'posts_per_page' => 3,
        'post__not_in'   => array( $current_id ),
        'meta_query'     => array(
            array( 'key' => '_property_city', 'value' => $city ),
        ),
    ) );
}
if ( ! $similar_query->have_posts() ) {
    $similar_query = new WP_Query( array(
        'post_type'      => 'property',
        'posts_per_page' => 3,
        'post__not_in'   => array( $current_id ),
        'orderby'        => 'date',
        'order'          => 'DESC',
    ) );
}

if ( ! $similar_query->have_posts() ) return;
?>
<section class="section" style="border-top:1px solid var(--line); background:rgba(244,245,247,0.6);">
    <div class="of-container">
        <div class="of-reveal">
            <div class="section-heading" style="max-width:48rem;">
                <p class="section-heading__label eyebrow"><?php esc_html_e( 'شاید بپسندید', 'ofogh' ); ?></p>
                <h2 class="section-heading__title"><?php esc_html_e( 'املاک مشابه', 'ofogh' ); ?></h2>
                <p class="section-heading__desc"><?php esc_html_e( 'خانه‌های قابل مقایسه در پرتفوی کنونی ما، بر پایهٔ موقعیت، نوع و قیمت.', 'ofogh' ); ?></p>
            </div>
        </div>
        <div class="properties-grid" style="margin-top:48px;">
            <?php while ( $similar_query->have_posts() ) : $similar_query->the_post(); ?>
                <div class="of-reveal">
                    <?php get_template_part( 'template-parts/property', 'card' ); ?>
                </div>
            <?php endwhile; ?>
        </div>
    </div>
</section>
<?php wp_reset_postdata(); ?>
