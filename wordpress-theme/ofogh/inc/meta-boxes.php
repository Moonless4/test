<?php
/**
 * Property meta boxes.
 *
 * @package Ofogh
 */

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Register meta boxes for the property CPT.
 */
function ofogh_add_property_meta_boxes() {
    add_meta_box(
        'ofogh-property-details',
        __( 'جزئیات ملک', 'ofogh' ),
        'ofogh_property_meta_box_html',
        'property',
        'normal',
        'high'
    );
}
add_action( 'add_meta_boxes', 'ofogh_add_property_meta_boxes' );

/**
 * Meta box HTML.
 */
function ofogh_property_meta_box_html( $post ) {
    wp_nonce_field( 'ofogh_property_meta', 'ofogh_property_meta_nonce' );

    $price       = ofogh_get_property_meta( $post->ID, '_property_price', '' );
    $beds        = ofogh_get_property_meta( $post->ID, '_property_beds', '' );
    $baths       = ofogh_get_property_meta( $post->ID, '_property_baths', '' );
    $area        = ofogh_get_property_meta( $post->ID, '_property_area', '' );
    $land        = ofogh_get_property_meta( $post->ID, '_property_land', '0' );
    $year        = ofogh_get_property_meta( $post->ID, '_property_year', '' );
    $city        = ofogh_get_property_meta( $post->ID, '_property_city', '' );
    $region      = ofogh_get_property_meta( $post->ID, '_property_region', '' );
    $country     = ofogh_get_property_meta( $post->ID, '_property_country', 'ایران' );
    $status      = ofogh_get_property_meta( $post->ID, '_property_status', 'برای فروش' );
    $type        = ofogh_get_property_meta( $post->ID, '_property_type', 'ویلا' );
    $featured    = ofogh_get_property_meta( $post->ID, '_property_featured', '0' );
    $features    = ofogh_get_property_meta( $post->ID, '_property_features', '' );
    $amenities   = ofogh_get_property_meta( $post->ID, '_property_amenities', '' );
    $image_id    = ofogh_get_property_meta( $post->ID, '_property_image_id', '' );
    $gallery     = ofogh_get_property_meta( $post->ID, '_property_gallery', '' );
    $agent       = ofogh_get_property_meta( $post->ID, '_property_agent', 'arash-rostegar' );

    $types = array( 'ویلا', 'عمارت', 'خانه', 'پنت‌هاوس', 'اقامتگاه', 'ویلای ساحلی' );
    $statuses = array( 'برای فروش', 'لیستینگ جدید', 'اختصاصی', 'ویژه' );
    $agents = ofogh_get_team_data();
    ?>
    <style>
        .ofogh-meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .ofogh-meta-grid .full { grid-column: 1 / -1; }
        .ofogh-meta-grid label { display: block; font-weight: 600; margin-bottom: 4px; }
        .ofogh-meta-grid input, .ofogh-meta-grid select, .ofogh-meta-grid textarea { width: 100%; }
        .ofogh-meta-area textarea { width: 100%; }
    </style>

    <div class="ofogh-meta-grid">
        <div>
            <label for="ofogh_price"><?php esc_html_e( 'قیمت (تومان)', 'ofogh' ); ?></label>
            <input type="number" id="ofogh_price" name="ofogh_price" value="<?php echo esc_attr( $price ); ?>" style="width:100%;" />
        </div>
        <div>
            <label for="ofogh_beds"><?php esc_html_e( 'اتاق خواب', 'ofogh' ); ?></label>
            <input type="number" id="ofogh_beds" name="ofogh_beds" value="<?php echo esc_attr( $beds ); ?>" style="width:100%;" />
        </div>
        <div>
            <label for="ofogh_baths"><?php esc_html_e( 'سرویس بهداشتی', 'ofogh' ); ?></label>
            <input type="number" id="ofogh_baths" name="ofogh_baths" value="<?php echo esc_attr( $baths ); ?>" style="width:100%;" />
        </div>
        <div>
            <label for="ofogh_area"><?php esc_html_e( 'متراژ (متر مربع)', 'ofogh' ); ?></label>
            <input type="number" id="ofogh_area" name="ofogh_area" value="<?php echo esc_attr( $area ); ?>" style="width:100%;" />
        </div>
        <div>
            <label for="ofogh_land"><?php esc_html_e( 'زمین (متر مربع)', 'ofogh' ); ?></label>
            <input type="number" id="ofogh_land" name="ofogh_land" value="<?php echo esc_attr( $land ); ?>" style="width:100%;" />
        </div>
        <div>
            <label for="ofogh_year"><?php esc_html_e( 'سال ساخت (شمسی)', 'ofogh' ); ?></label>
            <input type="number" id="ofogh_year" name="ofogh_year" value="<?php echo esc_attr( $year ); ?>" style="width:100%;" />
        </div>
        <div>
            <label for="ofogh_city"><?php esc_html_e( 'شهر', 'ofogh' ); ?></label>
            <input type="text" id="ofogh_city" name="ofogh_city" value="<?php echo esc_attr( $city ); ?>" style="width:100%;" />
        </div>
        <div>
            <label for="ofogh_region"><?php esc_html_e( 'منطقه', 'ofogh' ); ?></label>
            <input type="text" id="ofogh_region" name="ofogh_region" value="<?php echo esc_attr( $region ); ?>" style="width:100%;" />
        </div>
        <div>
            <label for="ofogh_country"><?php esc_html_e( 'کشور', 'ofogh' ); ?></label>
            <input type="text" id="ofogh_country" name="ofogh_country" value="<?php echo esc_attr( $country ); ?>" style="width:100%;" />
        </div>
        <div>
            <label for="ofogh_status"><?php esc_html_e( 'وضعیت', 'ofogh' ); ?></label>
            <select id="ofogh_status" name="ofogh_status" style="width:100%;">
                <?php foreach ( $statuses as $s ) : ?>
                    <option value="<?php echo esc_attr( $s ); ?>" <?php selected( $status, $s ); ?>><?php echo esc_html( $s ); ?></option>
                <?php endforeach; ?>
            </select>
        </div>
        <div>
            <label for="ofogh_type"><?php esc_html_e( 'نوع ملک', 'ofogh' ); ?></label>
            <select id="ofogh_type" name="ofogh_type" style="width:100%;">
                <?php foreach ( $types as $t ) : ?>
                    <option value="<?php echo esc_attr( $t ); ?>" <?php selected( $type, $t ); ?>><?php echo esc_html( $t ); ?></option>
                <?php endforeach; ?>
            </select>
        </div>
        <div>
            <label for="ofogh_agent"><?php esc_html_e( 'مشاور', 'ofogh' ); ?></label>
            <select id="ofogh_agent" name="ofogh_agent" style="width:100%;">
                <?php foreach ( $agents as $a ) : ?>
                    <option value="<?php echo esc_attr( $a['slug'] ); ?>" <?php selected( $agent, $a['slug'] ); ?>><?php echo esc_html( $a['name'] ); ?></option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="full">
            <label>
                <input type="checkbox" name="ofogh_featured" value="1" <?php checked( $featured, '1' ); ?> />
                <?php esc_html_e( 'ملک ویژه', 'ofogh' ); ?>
            </label>
        </div>
    </div>

    <p class="ofogh-meta-area">
        <label for="ofogh_features"><strong><?php esc_html_e( 'ویژگی‌های کلیدی (هر خط یک ویژگی)', 'ofogh' ); ?></strong></label>
        <textarea id="ofogh_features" name="ofogh_features" rows="6"><?php echo esc_textarea( $features ); ?></textarea>
    </p>

    <p class="ofogh-meta-area">
        <label for="ofogh_amenities"><strong><?php esc_html_e( 'امکانات (با کاما جدا کنید)', 'ofogh' ); ?></strong></label>
        <textarea id="ofogh_amenities" name="ofogh_amenities" rows="3"><?php echo esc_textarea( $amenities ); ?></textarea>
    </p>

    <p class="ofogh-meta-area">
        <label for="ofogh_image_id"><strong><?php esc_html_e( 'شناسه تصویر Unsplash (پیش‌فرض در صورت نبود تصویر شاخص)', 'ofogh' ); ?></strong></label>
        <input type="text" id="ofogh_image_id" name="ofogh_image_id" value="<?php echo esc_attr( $image_id ); ?>" style="width:100%;" />
    </p>

    <p class="ofogh-meta-area">
        <label for="ofogh_gallery"><strong><?php esc_html_e( 'گالری (شناسه‌های Unsplash یا شناسه‌های افزونه رسانه، با کاما)', 'ofogh' ); ?></strong></label>
        <input type="text" id="ofogh_gallery" name="ofogh_gallery" value="<?php echo esc_attr( $gallery ); ?>" style="width:100%;" />
    </p>

    <p class="description"><?php esc_html_e( 'محتوای ویرایشگر بالا به‌عنوان توضیحات کامل ملک نمایش داده می‌شود.', 'ofogh' ); ?></p>
    <?php
}

/**
 * Save property meta.
 */
function ofogh_save_property_meta( $post_id ) {
    if ( ! isset( $_POST['ofogh_property_meta_nonce'] ) || ! wp_verify_nonce( $_POST['ofogh_property_meta_nonce'], 'ofogh_property_meta' ) ) {
        return;
    }
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
    if ( ! current_user_can( 'edit_post', $post_id ) ) return;
    if ( get_post_type( $post_id ) !== 'property' ) return;

    $fields = array(
        '_property_price'     => 'ofogh_price',
        '_property_beds'      => 'ofogh_beds',
        '_property_baths'     => 'ofogh_baths',
        '_property_area'      => 'ofogh_area',
        '_property_land'      => 'ofogh_land',
        '_property_year'      => 'ofogh_year',
        '_property_city'      => 'ofogh_city',
        '_property_region'    => 'ofogh_region',
        '_property_country'   => 'ofogh_country',
        '_property_status'    => 'ofogh_status',
        '_property_type'      => 'ofogh_type',
        '_property_features'  => 'ofogh_features',
        '_property_amenities' => 'ofogh_amenities',
        '_property_image_id'  => 'ofogh_image_id',
        '_property_gallery'   => 'ofogh_gallery',
        '_property_agent'     => 'ofogh_agent',
    );

    foreach ( $fields as $meta_key => $field_name ) {
        if ( isset( $_POST[ $field_name ] ) ) {
            $value = wp_unslash( $_POST[ $field_name ] );
            if ( in_array( $field_name, array( 'ofogh_price', 'ofogh_beds', 'ofogh_baths', 'ofogh_area', 'ofogh_land', 'ofogh_year' ), true ) ) {
                $value = absint( $value );
            } else {
                $value = sanitize_text_field( $value );
                if ( in_array( $field_name, array( 'ofogh_features', 'ofogh_amenities' ), true ) ) {
                    $value = sanitize_textarea_field( $value );
                }
            }
            update_post_meta( $post_id, $meta_key, $value );
        }
    }

    update_post_meta( $post_id, '_property_featured', isset( $_POST['ofogh_featured'] ) ? '1' : '0' );
}
add_action( 'save_post_property', 'ofogh_save_property_meta' );

/**
 * Register meta fields for REST API (Gutenberg + Elementor).
 */
function ofogh_register_property_meta_rest() {
    $fields = array(
        '_property_price', '_property_beds', '_property_baths', '_property_area', '_property_land',
        '_property_year', '_property_city', '_property_region', '_property_country',
        '_property_status', '_property_type', '_property_featured', '_property_features',
        '_property_amenities', '_property_image_id', '_property_gallery', '_property_agent',
    );

    foreach ( $fields as $field ) {
        register_post_meta( 'property', $field, array(
            'type'         => 'string',
            'single'       => true,
            'show_in_rest' => true,
            'auth_callback' => function() {
                return current_user_can( 'edit_posts' );
            },
        ) );
    }
}
add_action( 'init', 'ofogh_register_property_meta_rest' );
