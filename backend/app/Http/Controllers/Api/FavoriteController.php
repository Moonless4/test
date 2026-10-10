<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $properties = $request->user()
            ->favorites()
            ->with('agent')
            ->latest('favorites.created_at')
            ->get();

        return response()->json([
            'data' => $properties->map(fn ($p) => [
                'id' => $p->id,
                'slug' => $p->slug,
                'name' => $p->name,
                'city' => $p->city,
                'region' => $p->region,
                'price' => $p->price,
                'type' => $p->type,
                'status' => $p->status,
                'imageId' => $p->image_id,
                'beds' => $p->beds,
                'baths' => $p->baths,
                'area' => $p->area,
                'agent' => $p->agent ? [
                    'id' => $p->agent->slug,
                    'name' => $p->agent->name,
                ] : null,
            ]),
        ]);
    }

    public function toggle(Request $request, Property $property)
    {
        $user = $request->user();
        $isFavorite = $user->favorites()->where('property_id', $property->id)->exists();

        if ($isFavorite) {
            $user->favorites()->detach($property->id);
            $isFavorite = false;
        } else {
            $user->favorites()->attach($property->id);
            $isFavorite = true;
        }

        return response()->json([
            'property_id' => $property->id,
            'is_favorite' => $isFavorite,
        ]);
    }
}
