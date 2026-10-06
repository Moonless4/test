<?php
/**
 * Search results template.
 *
 * @package Ofogh
 */

get_header();
?>
<div class="search-results">
    <div class="of-container">
        <header style="margin-bottom:48px;">
            <h1 style="font-size:clamp(1.9rem,4.4vw,3.1rem); font-weight:700; color:var(--ink);">
                <?php printf( esc_html__( 'نتایج جست‌وجو برای: %s', 'ofogh' ), '<span style="color:var(--gold);">' . esc_html( get_search_query() ) . '</span>' ); ?>
            </h1>
        </header>

        <?php if ( have_posts() ) : ?>
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
                <?php echo paginate_links( array( 'prev_text' => __( 'قبلی', 'ofogh' ), 'next_text' => __( 'بعدی', 'ofogh' ) ) ); ?>
            </div>
        <?php else : ?>
            <div class="no-results">
                <h2 class="no-results__title"><?php esc_html_e( 'نتیجه‌ای یافت نشد', 'ofogh' ); ?></h2>
                <p class="no-results__desc"><?php esc_html_e( 'جست‌وجوی خود را با کلمات دیگری امتحان کنید.', 'ofogh' ); ?></p>
                <?php get_search_form(); ?>
            </div>
        <?php endif; ?>
    </div>
</div>
<?php get_footer(); ?>
