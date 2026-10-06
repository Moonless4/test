<?php
/**
 * Single post template (blog posts).
 *
 * @package Ofogh
 */
get_header();
?>
<div class="page-content">
    <div class="of-container">
        <?php while ( have_posts() ) : the_post(); ?>
            <article id="post-<?php the_ID(); ?>" <?php post_class( 'wp-editor-content' ); ?>>
                <header style="margin-bottom:40px;">
                    <h1 style="font-size:clamp(1.7rem,3.6vw,2.6rem); font-weight:700; color:var(--ink);"><?php the_title(); ?></h1>
                    <p style="margin-top:12px; font-size:14px; color:var(--muted);">
                        <?php echo esc_html( get_the_date() ); ?>
                    </p>
                </header>

                <?php if ( has_post_thumbnail() ) : ?>
                    <div style="margin-bottom:40px; overflow:hidden; border-radius:var(--radius-card);">
                        <?php the_post_thumbnail( 'ofogh-hero' ); ?>
                    </div>
                <?php endif; ?>

                <?php the_content(); ?>

                <?php wp_link_pages( array( 'before' => '<div class="page-links">' . esc_html__( 'صفحات:', 'ofogh' ), 'after' => '</div>' ) ); ?>

                <?php if ( comments_open() || get_comments_number() ) comments_template(); ?>
            </article>
        <?php endwhile; ?>
    </div>
</div>
<?php get_footer(); ?>
