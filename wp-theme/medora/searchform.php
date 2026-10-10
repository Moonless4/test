<?php
/**
 * The generic search form (used for posts when the theme is running without WooCommerce).
 *
 * @package Medora
 */

defined( 'ABSPATH' ) || exit;

$medora_unique_id = wp_unique_id( 'search-form-' );
?>
<form role="search" method="get" class="medora-search flex h-11 items-center gap-2 rounded-xl bg-cream px-3.5 ring-1 ring-line transition-colors focus-within:ring-teal-300" action="<?php echo esc_url( home_url( '/' ) ); ?>">
	<label class="sr-only" for="<?php echo esc_attr( $medora_unique_id ); ?>"><?php esc_html_e( 'جستجو', 'medora' ); ?></label>
	<input id="<?php echo esc_attr( $medora_unique_id ); ?>" type="search" name="s" value="<?php echo esc_attr( get_search_query() ); ?>" placeholder="<?php esc_attr_e( 'جستجو…', 'medora' ); ?>" class="h-full w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-muted">
	<button type="submit" class="shrink-0 text-ink/60 transition-colors hover:text-teal-800" aria-label="<?php esc_attr_e( 'جستجو', 'medora' ); ?>">
		<?php echo medora_icon( 'search', 'h-4 w-4' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	</button>
</form>
