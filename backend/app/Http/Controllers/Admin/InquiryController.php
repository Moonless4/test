<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use Illuminate\Http\Request;

class InquiryController extends Controller
{
    public function index(Request $request)
    {
        $query = Inquiry::with('property:id,name,slug')->latest();

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($kind = $request->input('kind')) {
            $query->where('kind', $kind);
        }

        $perPage = min((int) $request->input('per_page', 20), 50);
        $inquiries = $query->paginate($perPage);

        return response()->json([
            'data' => $inquiries->items(),
            'meta' => [
                'current_page' => $inquiries->currentPage(),
                'last_page' => $inquiries->lastPage(),
                'total' => $inquiries->total(),
            ],
        ]);
    }

    public function update(Request $request, Inquiry $inquiry)
    {
        $data = $request->validate([
            'status' => ['required', 'in:new,contacted,closed'],
        ]);

        $inquiry->update($data);

        return response()->json($inquiry->load('property:id,name,slug'));
    }

    public function destroy(Inquiry $inquiry)
    {
        $inquiry->delete();
        return response()->json(['message' => 'درخواست حذف شد.']);
    }
}
