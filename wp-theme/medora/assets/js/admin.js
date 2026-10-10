/*
 * Medora — admin helpers.
 *
 * The promotional screens need an image field; this wires WordPress's own media frame to it
 * rather than shipping a second uploader.
 */

(function ($) {
  'use strict';

  $(document).on('click', '.medora-pick-image', function (event) {
    event.preventDefault();

    var field = $(this).closest('.medora-image-field');
    var input = field.find('input[type="hidden"]');
    var preview = field.find('img');

    var frame = wp.media({
      title: 'انتخاب تصویر',
      button: { text: 'استفاده از این تصویر' },
      library: { type: 'image' },
      multiple: false,
    });

    frame.on('select', function () {
      var attachment = frame.state().get('selection').first().toJSON();
      input.val(attachment.id);

      var url = attachment.sizes && attachment.sizes.medium ? attachment.sizes.medium.url : attachment.url;
      preview.attr('src', url).show();
    });

    frame.open();
  });

  $(document).on('click', '.medora-clear-image', function (event) {
    event.preventDefault();

    var field = $(this).closest('.medora-image-field');
    field.find('input[type="hidden"]').val('');
    field.find('img').attr('src', '').hide();
  });
})(jQuery);
