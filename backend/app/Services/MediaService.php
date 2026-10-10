<?php

namespace App\Services;

use App\Models\Media;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Upload handling — the one place a file from the internet becomes part of the application.
 *
 * The safety rules, in order:
 *
 *  1. **The bytes decide the type.** The MIME type is read from the file itself with finfo, never
 *     from the client's `Content-Type` header and never from the filename. A "photo.jpg" that is
 *     really a PHP script fails here.
 *  2. **An image must really be an image.** `getimagesize()` has to agree, and the dimensions are
 *     capped, so a 40 000 px decompression bomb cannot be stored.
 *  3. **The stored name is generated.** A ULID plus an extension derived from the verified MIME
 *     type — the client's filename is kept only as a label in the database. Nothing a client
 *     types can influence the path, so path traversal is impossible by construction.
 *  4. **Executable types are never accepted**, and the extension is only ever jpg/jpeg/png/webp/
 *     avif/pdf (or png for icons), so nothing stored here can be served as PHP.
 *  5. **Private files live outside the web root** and are streamed by a controller after an
 *     authorization check; public media go to the `public` disk behind the /storage symlink.
 */
class MediaService
{
    /**
     * Extension chosen from the verified MIME type — never from the client's filename.
     *
     * @var array<string, string>
     */
    private const EXTENSIONS = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/avif' => 'avif',
        'application/pdf' => 'pdf',
    ];

    /**
     * @throws ValidationException
     */
    public function storeImage(UploadedFile $file, ?User $uploader = null): Media
    {
        return $this->store($file, true, $uploader);
    }

    /**
     * @throws ValidationException
     */
    public function storeDocument(UploadedFile $file, ?User $uploader = null): Media
    {
        return $this->store($file, false, $uploader);
    }

    /**
     * @throws ValidationException
     */
    private function store(UploadedFile $file, bool $public, ?User $uploader): Media
    {
        if (! $file->isValid()) {
            throw ValidationException::withMessages([
                'file' => ['The upload did not complete. Please try again.'],
            ]);
        }

        $maxBytes = (int) config('security.uploads.max_kb') * 1024;

        if ($file->getSize() > $maxBytes) {
            throw ValidationException::withMessages([
                'file' => ['The file is larger than the allowed size.'],
            ]);
        }

        $mime = $this->detectMime($file);
        $allowed = $public
            ? (array) config('security.uploads.image_mimes')
            : (array) config('security.uploads.private_mimes');

        if (! in_array($mime, $allowed, true) || ! isset(self::EXTENSIONS[$mime])) {
            throw ValidationException::withMessages([
                'file' => ['This file type is not allowed.'],
            ]);
        }

        $dimensions = null;

        if (str_starts_with($mime, 'image/')) {
            $dimensions = @getimagesize($file->getRealPath());

            if ($dimensions === false || $dimensions[0] < 1 || $dimensions[1] < 1) {
                throw ValidationException::withMessages([
                    'file' => ['The file is not a readable image.'],
                ]);
            }

            $maxDimension = (int) config('security.uploads.max_dimension');

            if ($dimensions[0] > $maxDimension || $dimensions[1] > $maxDimension) {
                throw ValidationException::withMessages([
                    'file' => ['The image dimensions are too large.'],
                ]);
            }
        }

        $disk = (string) ($public ? config('media.public_disk', 'public') : config('media.private_disk', 'local'));
        $extension = self::EXTENSIONS[$mime];
        $directory = $public ? 'media/public' : 'media/private';
        $name = Str::ulid()->toBase32().'.'.$extension;

        $checksum = hash_file('sha256', $file->getRealPath());

        if ($checksum === false) {
            throw new RuntimeException('The uploaded file could not be read.');
        }

        $stored = $file->storeAs($directory, $name, ['disk' => $disk]);

        if ($stored === false || $stored === null) {
            throw new RuntimeException('The uploaded file could not be stored.');
        }

        $media = new Media;

        $media->disk = $disk;
        $media->path = $stored;
        // Kept as a label for the operator only; it never becomes part of the path.
        $media->original_name = mb_substr($file->getClientOriginalName(), 0, 255);
        $media->mime_type = $mime;
        $media->size_bytes = (int) $file->getSize();
        $media->width = $dimensions[0] ?? null;
        $media->height = $dimensions[1] ?? null;
        $media->checksum = $checksum;
        $media->is_public = $public;
        $media->uploaded_by = $uploader?->getKey();
        $media->save();

        return $media;
    }

    /**
     * Removes the file and then the row. The database is the record of truth: if the filesystem
     * call fails, the row is left alone so the operator can see what happened.
     */
    public function delete(Media $media): void
    {
        $disk = \Illuminate\Support\Facades\Storage::disk($media->disk);

        if ($disk->exists($media->path) && ! $disk->delete($media->path)) {
            throw new RuntimeException('The file could not be removed.');
        }

        $media->delete();
    }

    /**
     * Streams a private file. The caller is responsible for authorization — MediaController does
     * it through MediaPolicy before this is reached.
     */
    public function stream(Media $media): StreamedResponse
    {
        return \Illuminate\Support\Facades\Storage::disk($media->disk)->download(
            $media->path,
            $media->original_name,
        );
    }

    /**
     * The MIME type from the file's own bytes. finfo is used directly rather than Laravel's
     * guesser so the extension can never influence the answer.
     */
    private function detectMime(UploadedFile $file): string
    {
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file->getRealPath());

        return is_string($mime) ? strtolower($mime) : '';
    }
}
