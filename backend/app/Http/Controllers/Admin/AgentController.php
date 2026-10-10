<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AgentController extends Controller
{
    public function index()
    {
        return response()->json(Agent::latest()->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'role' => ['required', 'string'],
            'photo_id' => ['required', 'string'],
            'phone' => ['required', 'string'],
            'email' => ['required', 'email'],
            'specialty' => ['nullable', 'string'],
        ]);

        $data['slug'] = Str::slug($data['name']);

        $agent = Agent::create($data);
        return response()->json($agent, 201);
    }

    public function update(Request $request, Agent $agent)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'role' => ['sometimes', 'string'],
            'photo_id' => ['sometimes', 'string'],
            'phone' => ['sometimes', 'string'],
            'email' => ['sometimes', 'email'],
            'specialty' => ['nullable', 'string'],
        ]);

        $agent->update($data);
        return response()->json($agent);
    }

    public function destroy(Agent $agent)
    {
        $agent->delete();
        return response()->json(['message' => 'مشاور حذف شد.']);
    }
}
