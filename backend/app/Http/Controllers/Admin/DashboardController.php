<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        return response()->json([
            'properties_count' => Property::count(),
            'featured_count' => Property::where('featured', true)->count(),
            'inquiries_count' => Inquiry::count(),
            'new_inquiries' => Inquiry::where('status', 'new')->count(),
            'agents_count' => Agent::count(),
            'users_count' => User::count(),
            'total_value' => Property::sum('price'),
            'recent_inquiries' => Inquiry::with('property:id,name,slug')
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn ($i) => [
                    'id' => $i->id,
                    'kind' => $i->kind,
                    'name' => $i->name,
                    'phone' => $i->phone,
                    'status' => $i->status,
                    'property_name' => $i->property?->name,
                    'created_at' => $i->created_at?->toIso8601String(),
                ]),
        ]);
    }
}
