<?php
/**
 * The blog sidebar, printed by any template that wants it.
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;
?>
<aside class="medora-archive-sidebar" aria-label="<?php esc_attr_e( 'ابزارها', 'medora' ); ?>">
	<?php
	if ( is_active_sidebar( 'blog-sidebar' ) ) {
		dynamic_sidebar( 'blog-sidebar' );
	}
	?>
</aside>
