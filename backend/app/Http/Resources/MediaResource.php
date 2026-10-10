<?php

namespace App\Http\Resources;

use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * An uploaded file.
 *
 * `path` and `disk` are never exposed: the client only ever learns the URL of a public file (which
 * the server built) or the id it must ask for to stream a private one. A storage path in a response
 * is an invitation to probe the filesystem.
 *
 * @mixin Media
 */
class MediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'url' => $this->url(),
            'mime_type' => $this->mime_type,
            'width' => $this->width,
            'height' => $this->height,
            'size_bytes' => $this->size_bytes,
            'is_public' => $this->is_public,
            // The stored filename is a label for operators; the client never needs it.
            'alt_source' => $this->original_name,
        ];
    }
}
