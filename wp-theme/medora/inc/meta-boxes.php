<?php
/**
 * Editable fields for the promotional post types.
 *
 * The fields are registered as post meta (so they are reachable from the REST API and by
 * Elementor/Blocks) and edited through classic meta boxes on the post screen, with a nonce and
 * per-field sanitising on save.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

/**
 * The field map: post type → fields, each with its type, label, help text and sanitiser.
 *
 * @return array
 */
function medora_meta_fields() {
	return array(
		'medora_slide' => array(
			array(
				'key'   => '_medora_eyebrow',
				'label' => __( 'متن کوچک بالای عنوان', 'medora' ),
				'type'  => 'text',
				'help'  => __( 'مثلاً: کالکشن پاییز و زمستان', 'medora' ),
			),
			array(
				'key'   => '_medora_text',
				'label' => __( 'توضیح کوتاه', 'medora' ),
				'type'  => 'textarea',
			),
			array(
				'key'   => '_medora_phone_image',
				'label' => __( 'تصویر موبایل', 'medora' ),
				'type'  => 'image',
				'help'  => __( 'کادر اسلایدر روی موبایل شکل دیگری دارد؛ اگر تصویر جداگانه‌ای دارید اینجا انتخاب کنید.', 'medora' ),
			),
			array(
				'key'   => '_medora_button_label',
				'label' => __( 'متن دکمه', 'medora' ),
				'type'  => 'text',
			),
			array(
				'key'   => '_medora_button_url',
				'label' => __( 'نشانی دکمه', 'medora' ),
				'type'  => 'url',
				'help'  => __( 'نشانی مقصد دکمه یا خالی برای بدون دکمه.', 'medora' ),
			),
			array(
				'key'   => '_medora_overlay',
				'label' => __( 'شدت پوشش تیره روی تصویر', 'medora' ),
				'type'  => 'select',
				'options' => array(
					'none'   => __( 'بدون پوشش', 'medora' ),
					'light'  => __( 'ملایم', 'medora' ),
					'medium' => __( 'متوسط', 'medora' ),
					'dark'   => __( 'تیره', 'medora' ),
				),
			),
		),
		'medora_banner' => array(
			array(
				'key'   => '_medora_link_url',
				'label' => __( 'نشانی مقصد بنر', 'medora' ),
				'type'  => 'url',
			),
			array(
				'key'   => '_medora_position',
				'label' => __( 'جای بنر در صفحهٔ اصلی', 'medora' ),
				'type'  => 'select',
				'options' => array(
					'grid'   => __( 'دو بنر کنار هم (زیر اسلایدر)', 'medora' ),
					'promo'  => __( 'بنر پهن پیشنهاد ویژه', 'medora' ),
				),
			),
			array(
				'key'   => '_medora_badge',
				'label' => __( 'برچسب روی بنر (اختیاری)', 'medora' ),
				'type'  => 'text',
			),
		),
		'medora_review' => array(
			array(
				'key'   => '_medora_rating',
				'label' => __( 'امتیاز (۱ تا ۵)', 'medora' ),
				'type'  => 'number',
				'min'   => 1,
				'max'   => 5,
			),
			array(
				'key'   => '_medora_city',
				'label' => __( 'شهر یا توضیح زیر نام', 'medora' ),
				'type'  => 'text',
			),
		),
	);
}

/**
 * Register the meta so it is sanitised on write and available to the REST API.
 */
function medora_register_meta() {
	foreach ( medora_meta_fields() as $post_type => $fields ) {
		foreach ( $fields as $field ) {
			$args = array(
				'type'              => in_array( $field['type'], array( 'number' ), true ) ? 'integer' : 'string',
				'single'            => true,
				'show_in_rest'      => true,
				'sanitize_callback' => 'medora_sanitize_meta_value',
				'auth_callback'     => function () {
					return current_user_can( 'edit_posts' );
				},
			);

			register_post_meta( $post_type, $field['key'], $args );
		}
	}
}
add_action( 'init', 'medora_register_meta' );

/**
 * Sanitise a submitted meta value by field type.
 *
 * @param mixed $value Raw value.
 * @return string
 */
function medora_sanitize_meta_value( $value ) {
	if ( is_array( $value ) ) {
		return '';
	}

	return wp_kses_post( wp_unslash( $value ) );
}

/**
 * Add the meta boxes.
 */
function medora_add_meta_boxes() {
	foreach ( medora_meta_fields() as $post_type => $fields ) {
		add_meta_box(
			'medora_fields',
			__( 'تنظیمات مدورا', 'medora' ),
			'medora_render_meta_box',
			$post_type,
			'normal',
			'high',
			array( 'fields' => $fields )
		);
	}
}
add_action( 'add_meta_boxes', 'medora_add_meta_boxes' );

/**
 * Render a meta box.
 *
 * @param WP_Post $post Post being edited.
 * @param array   $box  Box args.
 */
function medora_render_meta_box( $post, $box ) {
	wp_nonce_field( 'medora_save_meta', 'medora_meta_nonce' );

	echo '<div class="medora-fields">';

	foreach ( $box['args']['fields'] as $field ) {
		$value = get_post_meta( $post->ID, $field['key'], true );
		$id    = esc_attr( $field['key'] );

		echo '<p><label for="' . $id . '" style="display:block;font-weight:600;margin-bottom:4px">' . esc_html( $field['label'] ) . '</label>';

		switch ( $field['type'] ) {
			case 'textarea':
				printf(
					'<textarea id="%1$s" name="%1$s" rows="3" class="widefat">%2$s</textarea>',
					$id,
					esc_textarea( $value )
				);
				break;

			case 'select':
				printf( '<select id="%1$s" name="%1$s" class="widefat">', $id );
				foreach ( $field['options'] as $option_value => $option_label ) {
					printf(
						'<option value="%1$s" %2$s>%3$s</option>',
						esc_attr( $option_value ),
						selected( $value, $option_value, false ),
						esc_html( $option_label )
					);
				}
				echo '</select>';
				break;

			case 'number':
				printf(
					'<input type="number" id="%1$s" name="%1$s" value="%2$s" min="%3$s" max="%4$s" class="small-text">',
					$id,
					esc_attr( $value ),
					esc_attr( isset( $field['min'] ) ? $field['min'] : '' ),
					esc_attr( isset( $field['max'] ) ? $field['max'] : '' )
				);
				break;

			case 'image':
				$preview = $value ? wp_get_attachment_image_url( (int) $value, 'medium' ) : '';
				printf(
					'<span class="medora-image-field" data-target="%1$s">
						<img src="%2$s" alt="" style="max-width:160px;height:auto;display:%3$s;border-radius:8px;margin-bottom:6px">
						<input type="hidden" id="%1$s" name="%1$s" value="%4$s">
						<button type="button" class="button medora-pick-image">%5$s</button>
						<button type="button" class="button-link medora-clear-image" style="margin-inline-start:8px">%6$s</button>
					</span>',
					$id,
					esc_url( $preview ),
					$preview ? 'block' : 'none',
					esc_attr( $value ),
					esc_html__( 'انتخاب تصویر', 'medora' ),
					esc_html__( 'حذف', 'medora' )
				);
				break;

			default:
				printf(
					'<input type="%3$s" id="%1$s" name="%1$s" value="%2$s" class="widefat">',
					$id,
					esc_attr( $value ),
					esc_attr( in_array( $field['type'], array( 'url' ), true ) ? 'url' : 'text' )
				);
		}

		if ( ! empty( $field['help'] ) ) {
			echo '<span class="description" style="display:block;margin-top:4px">' . esc_html( $field['help'] ) . '</span>';
		}

		echo '</p>';
	}

	echo '</div>';
}

/**
 * Save the meta boxes.
 *
 * @param int $post_id Post id.
 */
function medora_save_meta( $post_id ) {
	if ( ! isset( $_POST['medora_meta_nonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['medora_meta_nonce'] ) ), 'medora_save_meta' ) ) {
		return;
	}

	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	$post_type = get_post_type( $post_id );
	$fields    = medora_meta_fields();

	if ( ! isset( $fields[ $post_type ] ) ) {
		return;
	}

	foreach ( $fields[ $post_type ] as $field ) {
		$key = $field['key'];

		if ( ! isset( $_POST[ $key ] ) ) {
			continue;
		}

		$raw = wp_unslash( $_POST[ $key ] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- sanitised per field type below.

		if ( in_array( $field['type'], array( 'number', 'image' ), true ) ) {
			$value = (string) absint( $raw );
		} elseif ( 'url' === $field['type'] ) {
			$value = esc_url_raw( $raw );
		} elseif ( 'textarea' === $field['type'] ) {
			$value = wp_kses_post( $raw );
		} else {
			$value = sanitize_text_field( $raw );
		}

		if ( '' === $value ) {
			delete_post_meta( $post_id, $key );
		} else {
			update_post_meta( $post_id, $key, $value );
		}
	}
}
add_action( 'save_post', 'medora_save_meta' );

/**
 * The media picker on the promotional screens (WordPress's own media frame, no bundled library).
 *
 * @param string $hook Current admin page.
 */
function medora_admin_assets( $hook ) {
	$screen = get_current_screen();

	if ( ! $screen || ! in_array( $screen->post_type, array( 'medora_slide', 'medora_banner', 'medora_review', 'medora_faq' ), true ) ) {
		return;
	}

	wp_enqueue_media();
	wp_enqueue_script( 'medora-admin', MEDORA_URI . '/assets/js/admin.js', array( 'jquery' ), MEDORA_VERSION, true );
}
add_action( 'admin_enqueue_scripts', 'medora_admin_assets' );
