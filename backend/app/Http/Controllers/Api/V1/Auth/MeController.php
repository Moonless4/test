<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;

class MeController extends Controller
{
    /**
     * Who am I, and what am I allowed to do. The client uses this to decide what to render — never
     * to decide what is permitted: every protected route checks again on the server.
     */
    public function show(Request $request): UserResource
    {
        return new UserResource(
            $request->user()->load('roles', 'permissions'),
        );
    }
}
