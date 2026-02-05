<?php

namespace App\Models;

use App\Traits\HasJsonResourcefulData;
use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

/**
 * App\Models\CustomerPayment
 *
 * @property int $id
 * @property string|null $tenant_id
 * @property int $customer_id
 * @property string|null $reference_code
 * @property \Illuminate\Support\Carbon $payment_date
 * @property \Illuminate\Support\Carbon|null $due_date
 * @property float $amount
 * @property string $status
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 *
 * @property-read \App\Models\Customer $customer
 *
 * @mixin \Eloquent
 */
class CustomerPayment extends BaseModel
{
    use HasFactory, HasJsonResourcefulData, BelongsToTenant, Multitenantable;

    protected $table = 'customer_payments';

    const JSON_API_TYPE = 'customer_payments';

    const STATUS_PENDING = 'pending';
    const STATUS_COMPLETED = 'completed';

    protected $fillable = [
        'tenant_id',
        'customer_id',
        'reference_code',
        'payment_date',
        'due_date',
        'amount',
        'status',
        'notes',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'due_date' => 'date',
        'amount' => 'double',
    ];

    public static function rules(): array
    {
        return [
            'customer_id' => 'required|exists:customers,id',
            'payment_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:today',
            'amount' => 'required|numeric|min:0',
            'status' => 'required|in:pending,completed',
            'notes' => 'nullable|string',
        ];
    }

    public function prepareLinks(): array
    {
        return [
            'self' => route('customer-payments.show', $this->id),
        ];
    }

    public function prepareAttributes(): array
    {
        $fields = [
            'customer_id' => $this->customer_id,
            'customer' => $this->customer ? [
                'id' => $this->customer->id,
                'name' => $this->customer->name,
                'phone' => $this->customer->phone,
                'email' => $this->customer->email,
            ] : null,
            'reference_code' => $this->reference_code,
            'payment_date' => $this->payment_date ? $this->payment_date->format('Y-m-d') : null,
            'due_date' => $this->due_date ? $this->due_date->format('Y-m-d') : null,
            'amount' => $this->amount,
            'status' => $this->status,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];

        return $fields;
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }
}
