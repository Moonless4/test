<?php
/**
 * Small server-side actions: the newsletter form and the sale countdown data.
 *
 * The newsletter handler is deliberately plain — it validates the address, throttles by IP and
 * tells the shop owner. A store that outgrows it can hand the address to a mailing plugin through
 * the medora_newsletter_subscribed action.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

/**
 * Store a newsletter address and drop the shop owner a line.
 */
function medora_newsletter_subscribe() {
	check_ajax_referer( 'medora_newsletter', 'nonce' );

	$email = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';

	if ( ! $email || ! is_email( $email ) ) {
		wp_send_json_error( array( 'message' => __( 'ایمیل معتبر نیست.', 'medora' ) ), 400 );
	}

	// Throttle: six attempts per hour from one address, counted on the server.
	$key   = 'medora_nl_' . md5( $email . '|' . medora_client_ip() );
	$count = (int) get_transient( $key );

	if ( $count >= 6 ) {
		wp_send_json_error( array( 'message' => __( 'تعداد تلاش‌ها زیاد است؛ کمی بعد امتحان کنید.', 'medora' ) ), 429 );
	}

	set_transient( $key, $count + 1, HOUR_IN_SECONDS );

	$subscribers = get_option( 'medora_subscribers', array() );
	$subscribers = is_array( $subscribers ) ? $subscribers : array();

	if ( ! in_array( $email, $subscribers, true ) ) {
		$subscribers[] = $email;
		update_option( 'medora_subscribers', array_slice( $subscribers, -2000 ), false );

		wp_mail(
			get_option( 'admin_email' ),
			sprintf(
				/* translators: %s: site name. */
				__( 'عضویت تازه در خبرنامهٔ %s', 'medora' ),
				wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES )
			),
			sprintf(
				/* translators: %s: subscriber email. */
				__( 'این نشانی در خبرنامه ثبت شد: %s', 'medora' ),
				$email
			)
		);

		/**
		 * Fires once a newsletter address has been stored, so a mailing plugin can take over.
		 *
		 * @param string $email Subscriber address.
		 */
		do_action( 'medora_newsletter_subscribed', $email );
	}

	wp_send_json_success(
		array(
			'message' => __( 'عضویت شما ثبت شد. اولین خبر زودتر از همه به شما می‌رسد.', 'medora' ),
		)
	);
}
add_action( 'wp_ajax_medora_newsletter', 'medora_newsletter_subscribe' );
add_action( 'wp_ajax_nopriv_medora_newsletter', 'medora_newsletter_subscribe' );

/**
 * The caller's IP, from the forwarded chain the host proxy sets.
 *
 * @return string
 */
function medora_client_ip() {
	$forwarded = isset( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) : '';

	if ( $forwarded ) {
		$hops = explode( ',', $forwarded );

		return trim( end( $hops ) );
	}

	return isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : 'unknown';
}
