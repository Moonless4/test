<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Imagery the catalogue imports instead of uploading.
 *
 * The seeded catalogue — and the import of the old shop that follows it — publishes each photo at
 * its own address rather than re-uploading the bytes, so a media row can describe an asset that
 * lives at its source. `Media::url()` prefers `source_url`; anything actually uploaded here leaves
 * it null and keeps its file on disk exactly as before, which is still the only way an
 * administrator's upload is stored.
 *
 * An imported asset has no bytes on our disk at all, so the two integrity figures become nullable
 * with it: a row may honestly say "this file is not here".
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->string('source_url', 500)->nullable()->after('path');
            $table->unsignedBigInteger('size_bytes')->nullable()->change();
            $table->char('checksum', 64)->nullable()->change();
        });
    }

    public function down(): void
    {
        // Reverting the feature removes the rows only the feature could have created: a row with no
        // `source_url` is an uploaded file and must survive untouched.
        DB::table('media')->whereNotNull('source_url')->delete();

        Schema::table('media', function (Blueprint $table) {
            $table->dropColumn('source_url');
            $table->unsignedBigInteger('size_bytes')->nullable(false)->change();
            $table->char('checksum', 64)->nullable(false)->change();
        });
    }
};
