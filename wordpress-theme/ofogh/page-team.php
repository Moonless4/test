<?php
/**
 * Template Name: صفحهٔ تیم ما
 * Template Post Type: page
 *
 * @package Ofogh
 */

get_header();

get_template_part( 'template-parts/page', 'hero', array(
    'label'       => __( 'تیم ما', 'ofogh' ),
    'title'       => __( 'مشاورانی که خیابان‌های خود را می‌شناسند', 'ofogh' ),
    'description' => __( 'چهار متخصص ارشد، هرکدام پاسخگوی همهٔ مراحل یک معامله — بدون مرکز تماس و بدون واسپاری.', 'ofogh' ),
) );
?>

<?php get_template_part( 'template-parts/section', 'team' ); ?>

<?php get_template_part( 'template-parts/section', 'cta', array(
    'bg' => 'section--white',
) ); ?>

<?php get_footer(); ?>
