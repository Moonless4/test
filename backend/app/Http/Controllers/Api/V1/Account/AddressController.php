<?php

namespace App\Http\Controllers\Api\V1\Account;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Account\AddressRequest;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use App\Services\AuditLogger;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

/**
 * Saved addresses.
 *
 * An address id belonging to another account is answered as if it did not exist — a 404, never a
 * 403, because a 403 would confirm that the id is real and belongs to somebody. AddressPolicy still
 * runs after that check and the queries are scoped by user_id as well, so an IDOR here is a double
 * failure rather than a single one.
 */
class AddressController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Address::class);

        return AddressResource::collection(
            Address::query()
                ->where('user_id', $request->user()->getKey())
                ->orderByDesc('is_default')
                ->orderByDesc('id')
                ->get(),
        );
    }

    public function store(AddressRequest $request): JsonResponse
    {
        $user = $request->user();

        $address = DB::transaction(function () use ($request, $user): Address {
            $address = new Address;

            $address->user_id = $user->getKey();
            $address->label = $request->string('label')->value() ?: null;
            $address->receiver_first_name = (string) $request->string('receiver_first_name');
            $address->receiver_last_name = (string) $request->string('receiver_last_name');
            $address->phone = (string) $request->string('phone');
            $address->province = (string) $request->string('province');
            $address->city = (string) $request->string('city');
            $address->postal_code = (string) $request->string('postal_code');
            $address->line1 = (string) $request->string('line1');
            $address->line2 = $request->string('line2')->value() ?: null;
            $address->is_default = $request->boolean('is_default');
            $address->save();

            if ($address->is_default) {
                $this->clearOtherDefaults($user->getKey(), $address->getKey());
            }

            return $address;
        });

        $this->audit->log('address.created', $address, [], $user);

        return response()->json(['data' => ['address' => new AddressResource($address)]], 201);
    }

    public function update(AddressRequest $request, Address $address): JsonResponse
    {
        $this->addressFor($request, $address);

        $this->authorize('update', $address);

        DB::transaction(function () use ($request, $address): void {
            $address->label = $request->string('label')->value() ?: null;
            $address->receiver_first_name = (string) $request->string('receiver_first_name');
            $address->receiver_last_name = (string) $request->string('receiver_last_name');
            $address->phone = (string) $request->string('phone');
            $address->province = (string) $request->string('province');
            $address->city = (string) $request->string('city');
            $address->postal_code = (string) $request->string('postal_code');
            $address->line1 = (string) $request->string('line1');
            $address->line2 = $request->string('line2')->value() ?: null;
            $address->is_default = $request->boolean('is_default');
            $address->save();

            if ($address->is_default) {
                $this->clearOtherDefaults((int) $address->user_id, $address->getKey());
            }
        });

        $this->audit->log('address.updated', $address, [], $request->user());

        return response()->json(['data' => ['address' => new AddressResource($address)]]);
    }

    public function destroy(Request $request, Address $address): JsonResponse
    {
        $this->addressFor($request, $address);

        $this->authorize('delete', $address);

        $address->delete();

        $this->audit->log('address.deleted', null, ['address_id' => $address->getKey()], $request->user());

        return response()->json(['message' => 'آدرس حذف شد.']);
    }

    public function makeDefault(Request $request, Address $address): JsonResponse
    {
        $this->addressFor($request, $address);

        $this->authorize('update', $address);

        DB::transaction(function () use ($address): void {
            $address->is_default = true;
            $address->save();

            $this->clearOtherDefaults((int) $address->user_id, $address->getKey());
        });

        return response()->json(['data' => ['address' => new AddressResource($address)]]);
    }

    /**
     * An address id belonging to somebody else must look like it does not exist. `apiResource`
     * binds by id alone, so AddressPolicy would answer 403 — an oracle telling the caller the row
     * is real and belongs to another account. A 404 keeps the id unguessable in effect as well as
     * in name; the policy and the `user_id` scoped queries remain as the second and third checks.
     */
    private function addressFor(Request $request, Address $address): void
    {
        if ((int) $address->user_id !== (int) $request->user()->getKey()) {
            throw (new ModelNotFoundException)->setModel(Address::class, [$address->getKey()]);
        }
    }

    /**
     * Exactly one default address per account: the others are cleared inside the same transaction,
     * so a crash cannot leave two.
     */
    private function clearOtherDefaults(int $userId, int $keepId): void
    {
        Address::query()
            ->where('user_id', $userId)
            ->whereKeyNot($keepId)
            ->where('is_default', true)
            ->update(['is_default' => false]);
    }
}
