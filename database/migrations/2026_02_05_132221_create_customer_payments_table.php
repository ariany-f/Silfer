<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('customer_payments', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->nullable();
            $table->unsignedBigInteger('customer_id');
            $table->string('reference_code')->nullable();
            $table->date('payment_date')->nullable();
            $table->date('due_date')->nullable();
            $table->double('amount');
            $table->enum('status', ['pending', 'completed'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')
                ->references('id')->on('tenants')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('customer_id')
                ->references('id')->on('customers')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_payments');
    }
};
