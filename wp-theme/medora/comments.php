<?php
/**
 * Comments, styled to the theme. WordPress owns the form and the list.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

if ( post_password_required() ) {
	return;
}
?>
<section id="comments" class="mx-auto mt-12 max-w-3xl">
	<?php if ( have_comments() ) : ?>
		<h2 class="mb-4 text-[17px] font-bold text-ink">
			<?php
			printf(
				/* translators: %s: comment count. */
				esc_html__( '%s دیدگاه', 'medora' ),
				esc_html( medora_to_fa( get_comments_number() ) )
			);
			?>
		</h2>

		<ol class="space-y-4">
			<?php
			wp_list_comments(
				array(
					'style'       => 'ol',
					'avatar_size' => 48,
					'short_ping'  => true,
					'callback'    => null,
				)
			);
			?>
		</ol>

		<?php
		the_comments_pagination(
			array(
				'prev_text' => medora_icon( 'chevron-right', 'h-4 w-4' ),
				'next_text' => medora_icon( 'chevron-left', 'h-4 w-4' ),
				'class'     => 'medora-pagination mt-6',
			)
		);
		?>
	<?php endif; ?>

	<?php
	comment_form(
		array(
			'title_reply'         => __( 'دیدگاه شما', 'medora' ),
			'label_submit'        => __( 'ارسال دیدگاه', 'medora' ),
			'class_submit'        => 'medora-button',
			'comment_notes_after' => '',
			'comment_field'       => '<p class="comment-form-comment"><label for="comment" class="mb-1.5 block text-[13px] font-medium text-ink">' . esc_html__( 'دیدگاه', 'medora' ) . '</label><textarea id="comment" name="comment" cols="45" rows="5" required class="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] outline-none focus:border-teal-300"></textarea></p>',
		)
	);
	?>
</section>
