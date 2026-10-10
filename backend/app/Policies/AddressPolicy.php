<?php

namespace App\Policies;

use App\Models\Address;
use App\Models\User;

/**
 * An address belongs to exactly one account, and only that account may see or change it.
 *
 * There is no "staff can read every address" branch: support staff do not need a customer's saved
 * addresses to answer a question about an order, and the order carries its own copy of the address.
 */
class AddressPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Address $address): bool
    {
        return $this->owns($user, $address);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Address $address): bool
    {
        return $this->owns($user, $address);
    }

    public function delete(User $user, Address $address): bool
    {
        return $this->owns($user, $address);
    }

    private function owns(User $user, Address $address): bool
    {
        return $address->user_id !== null && $address->user_id === $user->getKey();
    }
}
