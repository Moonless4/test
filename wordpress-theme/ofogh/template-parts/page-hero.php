<?php
/**
 * Page hero template part for interior pages.
 *
 * @package Ofogh
 */

$label      = isset( $args['label'] ) ? $args['label'] : '';
$title      = isset( $args['title'] ) ? $args['title'] : '';
$desc       = isset( $args['description'] ) ? $args['description'] : '';
$image_id   = isset( $args['image_id'] ) ? $args['image_id'] : '';
$has_image  = ! empty( $image_id );

$image_url = $has_image ? ( strpos( $image_id, 'http' ) === 0 ? $image_id : ofogh_photo( $image_id, 2000 ) ) : '';
?>
<section class="page-hero <?php echo ! $has_image ? 'page-hero--no-img' : ''; ?>">
    <?php if ( $has_image ) : ?>
        <img src="<?php echo esc_url( $image_url ); ?>" alt="" aria-hidden="true" class="page-hero__img" loading="eager" decoding="async">
        <div class="page-hero__overlay" aria-hidden="true"></div>
    <?php else : ?>
        <div class="page-hero__overlay" aria-hidden="true"></div>
    <?php endif; ?>

    <div class="of-container page-hero__content">
        <p class="page-hero__label eyebrow"><?php echo esc_html( $label ); ?></p>
        <h1 class="page-hero__title"><?php echo esc_html( $title ); ?></h1>
        <?php if ( $desc ) : ?>
            <p class="page-hero__desc"><?php echo esc_html( $desc ); ?></p>
        <?php endif; ?>
    </div>
</section>
