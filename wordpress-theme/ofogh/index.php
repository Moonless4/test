<?php
/**
 * Main fallback template.
 *
 * @package Ofogh
 */

get_header();
?>
<div class="page-content">
    <div class="of-container">
        <?php if ( have_posts() ) : ?>
            <?php if ( is_home() && ! is_front_page() ) : ?>
                <header style="margin-bottom:40px;">
                    <h1 class="page-hero__title" style="color:var(--ink); font-size:clamp(1.7rem,3.6vw,2.6rem);">
                        <?php single_post_title(); ?>
                    </h1>
                </header>
            <?php endif; ?>

            <div class="blog-grid" style="display:grid; gap:48px 24px; grid-template-columns:repeat(auto-fill,minmax(300px,1fr));">
                <?php while ( have_posts() ) : the_post(); ?>
                    <article <?php post_class(); ?>>
                        <?php if ( has_post_thumbnail() ) : ?>
                            <a href="<?php the_permalink(); ?>" style="display:block; overflow:hidden; border-radius:var(--radius-card); margin-bottom:20px;">
                                <?php the_post_thumbnail( 'ofogh-card' ); ?>
                            </a>
                        <?php endif; ?>
                        <h2 class="property-card__title" style="font-size:17px;">
                            <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                        </h2>
                        <p style="margin-top:8px; font-size:14px; line-height:1.95; color:var(--muted);">
                            <?php echo esc_html( wp_trim_words( get_the_excerpt(), 25 ) ); ?>
                        </p>
                    </article>
                <?php endwhile; ?>
            </div>

            <div class="pagination">
                <?php
                echo paginate_links( array(
                    'prev_text' => __( 'قبلی', 'ofogh' ),
                    'next_text' => __( 'بعدی', 'ofogh' ),
                ) );
                ?>
            </div>
        <?php else : ?>
            <p><?php esc_html_e( 'مطلبی یافت نشد.', 'ofogh' ); ?></p>
        <?php endif; ?>
    </div>
</div>

<?php get_footer(); ?>
