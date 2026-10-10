<?php

/*
 * Which filesystem disks uploaded media uses. Public images must be reachable by the storefront
 * (the `public` disk behind the /storage symlink); private documents must not be (the `local`
 * disk lives under storage/app and is outside the document root).
 */
return [

    'public_disk' => env('MEDIA_PUBLIC_DISK', 'public'),

    'private_disk' => env('MEDIA_PRIVATE_DISK', 'local'),

];
