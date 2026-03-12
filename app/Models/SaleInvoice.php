<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

/**
 * App\Models\SaleInvoice
 *
 * @property int $id
 * @property string|null $tenant_id
 * @property int $sale_id
 * @property string|null $nfe_io_id
 * @property string $status
 * @property string|null $invoice_number
 * @property string|null $invoice_key
 * @property string|null $pdf_url
 * @property string|null $xml_url
 * @property string|null $error_message
 * @property \Illuminate\Support\Carbon|null $requested_at
 * @property \Illuminate\Support\Carbon|null $authorized_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class SaleInvoice extends Model
{
    use BelongsToTenant, Multitenantable;

    protected $table = 'sale_invoices';

    public const STATUS_PENDING = 'pending';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_AUTHORIZED = 'authorized';
    public const STATUS_ERROR = 'error';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'tenant_id',
        'sale_id',
        'nfe_io_id',
        'status',
        'invoice_number',
        'invoice_key',
        'pdf_url',
        'xml_url',
        'error_message',
        'requested_at',
        'authorized_at',
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'authorized_at' => 'datetime',
    ];

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class, 'sale_id', 'id');
    }

    public function isAuthorized(): bool
    {
        return $this->status === self::STATUS_AUTHORIZED;
    }

    public function isPending(): bool
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_PROCESSING], true);
    }

    public function isError(): bool
    {
        return $this->status === self::STATUS_ERROR;
    }
}
