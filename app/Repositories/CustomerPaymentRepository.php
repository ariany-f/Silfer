<?php

namespace App\Repositories;

use App\Models\CustomerPayment;

/**
 * Class CustomerPaymentRepository
 */
class CustomerPaymentRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'reference_code',
        'payment_date',
        'due_date',
        'amount',
        'status',
        'notes',
        'created_at',
    ];

    /**
     * Return searchable fields
     */
    public function getFieldsSearchable(): array
    {
        return $this->fieldSearchable;
    }

    /**
     * Configure the Model
     **/
    public function model()
    {
        return CustomerPayment::class;
    }
}
