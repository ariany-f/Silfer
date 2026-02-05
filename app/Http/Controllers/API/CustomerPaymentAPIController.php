<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateCustomerPaymentRequest;
use App\Http\Requests\UpdateCustomerPaymentRequest;
use App\Http\Resources\CustomerPaymentCollection;
use App\Http\Resources\CustomerPaymentResource;
use App\Models\CustomerPayment;
use App\Repositories\CustomerPaymentRepository;
use Barryvdh\DomPDF\Facade\Pdf;
use Intervention\Image\Facades\Image;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Prettus\Validator\Exceptions\ValidatorException;

/**
 * Class CustomerPaymentAPIController
 */
class CustomerPaymentAPIController extends AppBaseController
{
    /** @var CustomerPaymentRepository */
    private $customerPaymentRepository;

    public function __construct(CustomerPaymentRepository $customerPaymentRepository)
    {
        $this->customerPaymentRepository = $customerPaymentRepository;
    }

    public function index(Request $request): CustomerPaymentCollection
    {
        $perPage = getPageSize($request);
        $customerPayments = $this->customerPaymentRepository->with('customer')->paginate($perPage);
        CustomerPaymentResource::usingWithCollection();

        return new CustomerPaymentCollection($customerPayments);
    }

    /**
     * @throws ValidatorException
     */
    public function store(CreateCustomerPaymentRequest $request): CustomerPaymentResource
    {
        $input = $request->all();
        $input['tenant_id'] = currentTenantId();
        
        // Se status é completed e não tem payment_date, preenche com data atual
        if (isset($input['status']) && $input['status'] === 'completed' && empty($input['payment_date'])) {
            $input['payment_date'] = now()->format('Y-m-d');
        }
        
        // Generate reference code
        $customerPayment = $this->customerPaymentRepository->create($input);
        $customerPayment->update([
            'reference_code' => 'CP_' . $customerPayment->id,
        ]);
        $customerPayment->load('customer');

        return new CustomerPaymentResource($customerPayment);
    }

    public function show($id): CustomerPaymentResource
    {
        CustomerPaymentResource::notUsingWithCollection();
        $customerPayment = $this->customerPaymentRepository->with('customer')->find($id);

        return new CustomerPaymentResource($customerPayment);
    }

    /**
     * @throws ValidatorException
     */
    public function update(UpdateCustomerPaymentRequest $request, $id): CustomerPaymentResource
    {
        $input = $request->all();
        
        // Se status é completed e não tem payment_date, preenche com data atual
        if (isset($input['status']) && $input['status'] === 'completed' && empty($input['payment_date'])) {
            $input['payment_date'] = now()->format('Y-m-d');
        }
        
        $customerPayment = $this->customerPaymentRepository->update($input, $id);
        $customerPayment->load('customer');

        return new CustomerPaymentResource($customerPayment);
    }

    public function destroy($id): JsonResponse
    {
        $this->customerPaymentRepository->delete($id);

        return $this->sendSuccess('Customer payment deleted successfully');
    }

    public function getByCustomer($customerId, Request $request): CustomerPaymentCollection
    {
        $perPage = getPageSize($request);
        $customerPayments = $this->customerPaymentRepository
            ->with('customer')
            ->where('customer_id', $customerId)
            ->paginate($perPage);
        CustomerPaymentResource::usingWithCollection();

        return new CustomerPaymentCollection($customerPayments);
    }

    public function pdfDownload(CustomerPayment $customerPayment): JsonResponse
    {
        ini_set('memory_limit', '-1');
        $customerPayment = $customerPayment->load('customer');

        $data = [];

        if (Storage::exists('pdf/customer-payment-' . $customerPayment->id . '.pdf')) {
            Storage::delete('pdf/customer-payment-' . $customerPayment->id . '.pdf');
        }

        $companyLogo = getStoreLogo();
        $companyLogo = (string) Image::make($companyLogo)->encode('data-url');

        $pdfViewPath = getLoginUserLanguage() == 'ar' ? 'pdf.ar.customer-payment-pdf' : 'pdf.customer-payment-pdf';
        
        // Use helper function for PDF generation with Arabic support
        $pdfContent = generatePDF($pdfViewPath, compact('customerPayment', 'companyLogo'));
        
        Storage::disk(config('app.media_disc'))->put('pdf/customer-payment-' . $customerPayment->id . '.pdf', $pdfContent);
        $data['customer_payment_pdf_url'] = Storage::url('pdf/customer-payment-' . $customerPayment->id . '.pdf');

        return $this->sendResponse($data, 'pdf retrieved Successfully');
    }
}
