<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\Property;
use Illuminate\Http\Request;

class InquiryController extends Controller
{
    public function store(Request $request)
    {
        $rules = [
            'kind' => ['required', 'in:contact,agent,viewing'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'message' => ['nullable', 'string'],
            'property_slug' => ['nullable', 'string'],
            'preferred_date' => ['nullable', 'date'],
            'preferred_time' => ['nullable', 'string'],
        ];

        // Viewing kind requires preferred_date
        if ($request->input('kind') === 'viewing') {
            $rules['preferred_date'] = ['required', 'date'];
        }

        $data = $request->validate($rules);

        $propertyId = null;
        if (!empty($data['property_slug'])) {
            $property = Property::where('slug', $data['property_slug'])->first();
            if ($property) {
                $propertyId = $property->id;
            }
        }

        $inquiry = Inquiry::create([
            'kind' => $data['kind'],
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'message' => $data['message'] ?? null,
            'property_id' => $propertyId,
            'preferred_date' => $data['preferred_date'] ?? null,
            'preferred_time' => $data['preferred_time'] ?? null,
            'status' => 'new',
        ]);

        return response()->json([
            'message' => 'درخواست شما با موفقیت ثبت شد.',
            'id' => $inquiry->id,
        ], 201);
    }
}
