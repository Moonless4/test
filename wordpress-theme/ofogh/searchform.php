<?php
/**
 * Custom search form.
 *
 * @package Ofogh
 */
?>
<form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" style="display:flex; gap:8px; margin-top:24px;">
    <input type="search" class="field-input" placeholder="<?php esc_attr_e( 'جست‌وجو…', 'ofogh' ); ?>" value="<?php echo esc_attr( get_search_query() ); ?>" name="s">
    <button type="submit" class="of-btn of-btn--primary of-btn--md">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <?php esc_html_e( 'جست‌وجو', 'ofogh' ); ?>
    </button>
</form>
