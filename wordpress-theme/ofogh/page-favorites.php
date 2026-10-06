<?php
/**
 * Template Name: صفحهٔ املاک ذخیره‌شده
 * Template Post Type: page
 *
 * @package Ofogh
 */

get_header();

get_template_part( 'template-parts/page', 'hero', array(
    'label'       => __( 'ذخیره‌شده‌ها', 'ofogh' ),
    'title'       => __( 'املاک ذخیره‌شده', 'ofogh' ),
    'description' => __( 'املاکی که برای بعد نگه داشته‌اید.', 'ofogh' ),
) );
?>

<section class="section section--white" style="padding-block:80px 96px;">
    <div class="of-container">
        <div id="favorites-container">
            <p id="favorites-empty" style="text-align:center; padding:64px 20px; font-size:16px; color:var(--muted);">
                <?php esc_html_e( 'هنوز ملکی ذخیره نکرده‌اید. روی قلب هر ملک بزنید تا اینجا اضافه شود.', 'ofogh' ); ?>
            </p>
            <div id="favorites-grid" class="properties-grid" style="display:none;"></div>
        </div>
    </div>
</section>

<script>
(function() {
    var favs = [];
    try {
        var raw = document.cookie.match(/ofogh_favorites=([^;]+)/);
        if (raw) favs = raw[1].split(',').filter(function(v) { return v; }).map(function(v) { return parseInt(v, 10); });
    } catch(e) {}

    if (!favs.length) return;

    // The property cards are server-rendered with data-property-id attributes
    // only on the archive. For the favorites page, we'll need to fetch them.
    // Show the grids that contain favorite properties.
    var grid = document.getElementById('favorites-grid');
    var empty = document.getElementById('favorites-empty');

    if (favs.length) {
        empty.style.display = 'none';
        grid.style.display = 'grid';

        // Fetch each favorite property content via AJAX.
        favs.forEach(function(id) {
            fetch(ofoghData.ajaxUrl + '?action=ofogh_get_property_card&property_id=' + id + '&nonce=' + ofoghData.nonce)
                .then(function(r) { return r.json(); })
                .then(function(res) {
                    if (res.success && res.data.html) {
                        var wrapper = document.createElement('div');
                        wrapper.className = 'of-reveal of-revealed property-card-item';
                        wrapper.innerHTML = res.data.html;
                        grid.appendChild(wrapper);
                    }
                })
                .catch(function() {});
        });
    }
})();
</script>

<?php get_footer(); ?>
