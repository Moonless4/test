<?php
/**
 * Sidebar template.
 *
 * @package Ofogh
 */
if ( ! is_active_sidebar( 'sidebar-1' ) ) return;
?>
<aside class="widget-area" id="secondary">
    <?php dynamic_sidebar( 'sidebar-1' ); ?>
</aside>
