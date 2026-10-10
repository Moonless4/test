<?php

/*
 * Password hashing.
 *
 * bcrypt is the default because every DirectAdmin PHP build has it. Argon2id is the stronger
 * choice *when the host's PHP was compiled with libargon2*, which is not guaranteed on shared
 * hosting — `php artisan app:preflight` reports whether PASSWORD_ARGON2ID exists, and switching
 * is then a one-line env change (HASH_DRIVER=argon2id). Existing hashes keep verifying after a
 * switch, because Laravel records the algorithm in the hash itself.
 */
return [

    'driver' => env('HASH_DRIVER', 'bcrypt'),

    'bcrypt' => [
        'rounds' => (int) env('BCRYPT_ROUNDS', 12),
        'verify' => true,
    ],

    'argon' => [
        'memory' => (int) env('ARGON_MEMORY', 65536),
        'threads' => (int) env('ARGON_THREADS', 1),
        'time' => (int) env('ARGON_TIME', 4),
        'verify' => true,
    ],

    'rehash_on_login' => true,

];
