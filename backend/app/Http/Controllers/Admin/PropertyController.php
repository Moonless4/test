<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\PropertyImage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PropertyController extends Controller
{
    public function index(Request $request)
    {
        $query = Property::with('agent')->latest();

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
        }

        $perPage = min((int) $request->input('per_page', 15), 50);
        $properties = $query->paginate($perPage);

        return response()->json([
            'data' => $properties->items(),
            'meta' => [
                'current_page' => $properties->currentPage(),
                'last_page' => $properties->lastPage(),
                'total' => $properties->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string'],
            'region' => ['required', 'string'],
            'country' => ['nullable', 'string'],
            'price' => ['required', 'integer'],
            'type' => ['required', 'string'],
            'status' => ['required', 'string'],
            'beds' => ['nullable', 'integer'],
            'baths' => ['nullable', 'integer'],
            'area' => ['nullable', 'integer'],
            'land' => ['nullable', 'integer'],
            'year' => ['nullable', 'integer'],
            'featured' => ['boolean'],
            'summary' => ['required', 'string'],
            'description' => ['nullable', 'array'],
            'features' => ['nullable', 'array'],
            'amenities' => ['nullable', 'array'],
            'image_id' => ['required', 'string'],
            'agent_id' => ['nullable', 'exists:agents,id'],
            'gallery' => ['nullable', 'array'],
            'gallery.*.id' => ['string'],
            'gallery.*.alt' => ['nullable', 'string'],
        ]);

        $slug = $request->input('slug') ?: Str::slug($data['name']);
        // Ensure unique slug
        $originalSlug = $slug;
        $counter = 1;
        while (Property::where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-{$counter}";
            $counter++;
        }

        $gallery = $data['gallery'] ?? [];
        unset($data['gallery'], $data['slug']);

        $property = Property::create(array_merge($data, ['slug' => $slug]));

        foreach ($gallery as $index => $img) {
            PropertyImage::create([
                'property_id' => $property->id,
                'unsplash_id' => $img['id'],
                'alt' => $img['alt'] ?? null,
                'sort_order' => $index,
            ]);
        }

        return response()->json($property->load(['agent', 'images']), 201);
    }

    public function update(Request $request, Property $property)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'city' => ['sometimes', 'string'],
            'region' => ['sometimes', 'string'],
            'country' => ['nullable', 'string'],
            'price' => ['sometimes', 'integer'],
            'type' => ['sometimes', 'string'],
            'status' => ['sometimes', 'string'],
            'beds' => ['nullable', 'integer'],
            'baths' => ['nullable', 'integer'],
            'area' => ['nullable', 'integer'],
            'land' => ['nullable', 'integer'],
            'year' => ['nullable', 'integer'],
            'featured' => ['boolean'],
            'summary' => ['sometimes', 'string'],
            'description' => ['nullable', 'array'],
            'features' => ['nullable', 'array'],
            'amenities' => ['nullable', 'array'],
            'image_id' => ['sometimes', 'string'],
            'agent_id' => ['nullable', 'exists:agents,id'],
            'gallery' => ['nullable', 'array'],
            'gallery.*.id' => ['string'],
            'gallery.*.alt' => ['nullable', 'string'],
        ]);

        $gallery = $data['gallery'] ?? null;
        unset($data['gallery']);

        $property->update($data);

        if ($gallery !== null) {
            $property->images()->delete();
            foreach ($gallery as $index => $img) {
                PropertyImage::create([
                    'property_id' => $property->id,
                    'unsplash_id' => $img['id'],
                    'alt' => $img['alt'] ?? null,
                    'sort_order' => $index,
                ]);
            }
        }

        return response()->json($property->load(['agent', 'images']));
    }

    public function destroy(Property $property)
    {
        $property->delete();
        return response()->json(['message' => 'ملک حذف شد.']);
    }
}
