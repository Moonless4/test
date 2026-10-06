<?php
/**
 * Property card template part.
 *
 * Used in carousel, grid, similar properties, etc.
 *
 * @package Ofogh
 */

global $post;
$post_id = get_the_ID();
$price   = ofogh_get_property_meta( $post_id, '_property_price', '0' );
$beds    = ofogh_get_property_meta( $post_id, '_property_beds', '0' );
$baths   = ofogh_get_property_meta( $post_id, '_property_baths', '0' );
$area    = ofogh_get_property_meta( $post_id, '_property_area', '0' );
$type    = ofogh_get_property_meta( $post_id, '_property_type', 'ویلا' );
$status  = ofogh_get_property_meta( $post_id, '_property_status', 'برای فروش' );
$city    = ofogh_get_property_meta( $post_id, '_property_city', '' );
$region  = ofogh_get_property_meta( $post_id, '_property_region', '' );
$image_url = ofogh_get_property_image( $post_id, 'ofogh-card' );
$is_favorite = ofogh_is_favorite( $post_id );
?>
<article class="property-card" data-card>
    <div class="property-card__media-wrap">
        <a href="<?php the_permalink(); ?>" aria-label="<?php echo esc_attr( get_the_title() . ' — ' . ofogh_format_price( $price ) ); ?>">
            <div class="property-card__media">
                <img src="<?php echo esc_url( $image_url ); ?>"
                     srcset="<?php echo esc_attr( ofogh_photo_srcset( ofogh_get_property_meta( $post_id, '_property_image_id', 'photo-1600596542815-ffad4c1539a9' ), array( 640, 960, 1280, 1600 ) ) ); ?>"
                     sizes="(min-width: 1280px) 30vw, (min-width: 1024px) 38vw, (min-width: 640px) 60vw, 86vw"
                     alt="<?php echo esc_attr( get_the_title() . ' در ' . $city . '، ' . $region ); ?>"
                     loading="lazy" decoding="async" class="drag-none">
                <span class="property-card__overlay" aria-hidden="true"></span>
            </div>
        </a>
        <button type="button" class="fav-btn property-card__fav <?php echo $is_favorite ? 'is-saved' : ''; ?>"
                aria-pressed="<?php echo $is_favorite ? 'true' : 'false'; ?>"
                aria-label="<?php echo esc_attr( $is_favorite ? sprintf( __( 'حذف %s از ذخیره‌شده‌ها', 'ofogh' ), get_the_title() ) : sprintf( __( 'ذخیرهٔ %s', 'ofogh' ), get_the_title() ) ); ?>"
                title="<?php echo esc_attr( $is_favorite ? __( 'ذخیره شده', 'ofogh' ) : __( 'ذخیرهٔ ملک', 'ofogh' ) ); ?>"
                data-property-id="<?php echo esc_attr( $post_id ); ?>">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="<?php echo $is_favorite ? 'currentColor' : 'none'; ?>" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
    </div>
    <div class="property-card__body">
        <div class="property-card__top">
            <span class="property-card__status"><?php echo esc_html( $status ); ?></span>
            <span class="property-card__type"><?php echo esc_html( $type ); ?></span>
        </div>
        <h3 class="property-card__title">
            <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
        </h3>
        <p class="property-card__location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span><?php echo esc_html( $city . '، ' . $region ); ?></span>
        </p>
        <p class="property-card__price"><?php echo esc_html( ofogh_format_price( $price ) ); ?></p>
    </div>
</article>
