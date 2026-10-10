<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AgentResource;
use App\Http\Resources\PropertyResource;
use App\Models\Agent;
use App\Models\Property;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    public function index(Request $request)
    {
        $query = Property::query()->with('agent');

        // Filter by featured
        if ($request->boolean('featured')) {
            $query->where('featured', true);
        }

        // Filter by type
        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter by city
        if ($city = $request->input('city')) {
            $query->where('city', $city);
        }

        // Filter by min/max price
        if ($min = $request->input('min_price')) {
            $query->where('price', '>=', (int) $min);
        }
        if ($max = $request->input('max_price')) {
            $query->where('price', '<=', (int) $max);
        }

        // Filter by min beds
        if ($beds = $request->input('min_beds')) {
            $query->where('beds', '>=', (int) $beds);
        }

        // Search by name/city/region
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('region', 'like', "%{$search}%");
            });
        }

        // Sort
        $sort = $request->input('sort', 'newest');
        match ($sort) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'oldest' => $query->oldest(),
            default => $query->latest(),
        };

        $perPage = min((int) $request->input('per_page', 12), 50);
        $properties = $query->paginate($perPage);

        return response()->json([
            'data' => PropertyResource::collection($properties->items()),
            'meta' => [
                'current_page' => $properties->currentPage(),
                'last_page' => $properties->lastPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
            ],
        ]);
    }

    public function featured()
    {
        $properties = Property::with('agent')->where('featured', true)->latest()->get();
        return PropertyResource::collection($properties);
    }

    public function show(string $slug)
    {
        $property = Property::with(['agent', 'images'])->where('slug', $slug)->first();

        if (!$property) {
            return response()->json(['message' => 'ملک یافت نشد.'], 404);
        }

        return new PropertyResource($property);
    }

    public function agents()
    {
        return AgentResource::collection(Agent::all());
    }
}
