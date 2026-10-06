<?php
/**
 * Comments template.
 *
 * @package Ofogh
 */
if ( post_password_required() ) return;
?>
<div id="comments" class="comments-area" style="max-width:48rem; margin-top:56px;">
    <?php if ( have_comments() ) : ?>
        <h2 class="comments-title eyebrow" style="margin-bottom:24px;">
            <?php
            printf(
                esc_html( _n( '%s نظر', '%s نظر', get_comments_number(), 'ofogh' ) ),
                esc_html( ofogh_to_persian_digits( get_comments_number() ) )
            );
            ?>
        </h2>
        <ol class="comment-list" style="display:flex; flex-direction:column; gap:24px;">
            <?php
            wp_list_comments( array(
                'style'      => 'ol',
                'short_ping' => true,
                'avatar_size'=> 48,
            ) );
            ?>
        </ol>
    <?php endif; ?>

    <?php
    comment_form( array(
        'title_reply'        => __( 'نظر خود را بنویسید', 'ofogh' ),
        'class_submit'       => 'of-btn of-btn--primary of-btn--md',
        'comment_field'      => '<p class="comment-form-comment"><label class="contact-label">' . __( 'نظر', 'ofogh' ) . '</label><textarea id="comment" name="comment" cols="45" rows="5" class="field-input field-input--area" required></textarea></p>',
        'fields'             => array(
            'author' => '<p class="comment-form-author"><label class="contact-label">' . __( 'نام', 'ofogh' ) . '</label><input id="author" name="author" type="text" class="field-input" required></p>',
            'email'  => '<p class="comment-form-email"><label class="contact-label">' . __( 'ایمیل', 'ofogh' ) . '</label><input id="email" name="email" type="email" class="field-input" dir="ltr" required></p>',
        ),
    ) );
    ?>
</div>
